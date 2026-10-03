import Anthropic, { APIError } from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { AIPort, ImageInput } from "@/core/ports/ai.port";
import { ExternalProviderError } from "@/core/errors";
import { logger } from "@/infrastructure/logging/logger";

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";
const TOOL_NAME = "emit_result";

/**
 * Claude-backed implementation of AIPort.
 *
 * Structured output strategy: we expose a single tool ("emit_result") whose
 * input_schema is generated from the caller's Zod schema, and force the
 * model to call it via `tool_choice`. This is Anthropic's recommended
 * pattern for reliable JSON extraction — far more robust than asking the
 * model to "reply with JSON" in prose. The tool's arguments are then
 * re-validated with the original Zod schema (defense in depth: a schema
 * mismatch triggers exactly one retry with the validation error appended
 * to the prompt before we give up).
 */
export class AnthropicAIProvider implements AIPort {
  readonly name = "anthropic";
  private client: Anthropic;

  constructor(apiKey: string = process.env.ANTHROPIC_API_KEY ?? "") {
    if (!apiKey) {
      logger.error("ANTHROPIC_API_KEY is not configured — AI features are unavailable");
      throw new ExternalProviderError(
        "IA",
        "Le moteur d'intelligence artificielle n'est pas encore configuré sur cet environnement. Contactez l'administrateur pour activer ANTHROPIC_API_KEY.",
      );
    }
    this.client = new Anthropic({ apiKey });
  }

  async generateStructured<T extends z.ZodTypeAny>(args: {
    system: string;
    prompt: string;
    schema: T;
    maxTokens?: number;
    images?: ImageInput[];
  }): Promise<z.infer<T>> {
    const jsonSchema = zodToJsonSchema(args.schema, "schema").definitions?.schema ?? {};

    const attempt = async (extraNote?: string): Promise<z.infer<T>> => {
      const text = extraNote ? `${args.prompt}\n\n${extraNote}` : args.prompt;
      const content: Anthropic.MessageParam["content"] = args.images?.length
        ? [
            ...args.images.map(
              (image): Anthropic.ImageBlockParam => ({
                type: "image",
                source: { type: "base64", media_type: image.mediaType, data: image.base64 },
              }),
            ),
            { type: "text", text },
          ]
        : text;

      const message = await this.client.messages.create({
        model: DEFAULT_MODEL,
        max_tokens: args.maxTokens ?? 4096,
        system: args.system,
        tools: [
          {
            name: TOOL_NAME,
            description: "Emit the final structured result. Always call this tool exactly once.",
            input_schema: jsonSchema as Anthropic.Tool.InputSchema,
          },
        ],
        tool_choice: { type: "tool", name: TOOL_NAME },
        messages: [{ role: "user", content }],
      });

      const toolUse = message.content.find(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use",
      );
      if (!toolUse) {
        throw new ExternalProviderError("anthropic", "Model did not return a tool_use block");
      }
      return args.schema.parse(toolUse.input);
    };

    try {
      return await attempt();
    } catch (firstError) {
      if (firstError instanceof APIError) {
        // A real API-level failure (billing, auth, rate limit, outage...) is
        // not something retrying with "fix your schema" feedback can solve —
        // retrying would just burn a second call for the same failure, and
        // the raw SDK error (status code, nested JSON) is not fit to show a
        // user. Fail fast with one clean, translated message instead.
        logger.error("Anthropic API call failed", {
          status: firstError.status,
          error: String(firstError),
          cause: firstError.cause ? String(firstError.cause) : undefined,
        });
        throw new ExternalProviderError("IA", translateAnthropicApiError(firstError));
      }

      logger.warn("AI structured output failed validation, retrying once", {
        error: String(firstError),
      });
      try {
        return await attempt(
          `Your previous answer failed schema validation with this error, fix it and call ${TOOL_NAME} again: ${String(
            firstError,
          )}`,
        );
      } catch (secondError) {
        if (secondError instanceof APIError) {
          logger.error("Anthropic API call failed on retry", {
            status: secondError.status,
            error: String(secondError),
          });
          throw new ExternalProviderError("IA", translateAnthropicApiError(secondError));
        }
        logger.error("AI structured output failed twice", { error: String(secondError) });
        throw new ExternalProviderError(
          "IA",
          "La réponse de l'IA n'a pas pu être validée après deux tentatives. Réessayez, et si le problème persiste, contactez le support.",
        );
      }
    }
  }

  async generateText(args: { system: string; prompt: string; maxTokens?: number }): Promise<string> {
    const message = await this.client.messages.create({
      model: DEFAULT_MODEL,
      max_tokens: args.maxTokens ?? 2048,
      system: args.system,
      messages: [{ role: "user", content: args.prompt }],
    });
    const textBlock = message.content.find(
      (block): block is Anthropic.TextBlock => block.type === "text",
    );
    return textBlock?.text ?? "";
  }
}

let cachedProvider: AnthropicAIProvider | null = null;

/**
 * Maps an Anthropic SDK error to a clean, French, actionable message —
 * never the raw status code or nested JSON body. Falls back to a generic
 * message for anything not explicitly handled below (e.g. a genuinely
 * malformed request), so we never leak SDK internals either way.
 */
function translateAnthropicApiError(error: APIError): string {
  if (error instanceof Anthropic.APIConnectionError || error.status === undefined) {
    // No HTTP status at all means the request never reached Anthropic's
    // servers — a local network problem (firewall rule scoped to node.exe,
    // antivirus HTTPS/SSL interception with an untrusted certificate, a
    // corporate proxy Node isn't configured for), not an Anthropic outage.
    return "Impossible de joindre les serveurs d'Anthropic depuis cette machine (erreur réseau). Vérifiez le pare-feu Windows pour Node.js, et si un antivirus fait de l'inspection HTTPS (Avast, Kaspersky, Bitdefender...), désactivez temporairement cette fonction pour tester.";
  }
  if (error.status === 400 && /credit balance/i.test(error.message)) {
    return "Le compte Anthropic associé à cette clé API n'a plus de crédit disponible. Rechargez-le sur console.anthropic.com (Plans & Billing) pour réactiver les fonctionnalités IA.";
  }
  if (error.status === 401) {
    return "La clé API Anthropic configurée est invalide ou a été révoquée. Vérifiez ANTHROPIC_API_KEY.";
  }
  if (error.status === 429) {
    return "Trop de requêtes envoyées à l'IA en peu de temps (limite de débit Anthropic atteinte). Réessayez dans quelques instants.";
  }
  if (error.status && error.status >= 500) {
    return "Le service Anthropic est temporairement indisponible. Réessayez dans quelques instants.";
  }
  return "Le moteur d'intelligence artificielle n'a pas pu traiter cette demande. Réessayez, et si le problème persiste, contactez le support.";
}

/** Lazily instantiated singleton so build/test steps without an API key don't crash at import time. */
export function getAIProvider(): AIPort {
  if (!cachedProvider) {
    cachedProvider = new AnthropicAIProvider();
  }
  return cachedProvider;
}
