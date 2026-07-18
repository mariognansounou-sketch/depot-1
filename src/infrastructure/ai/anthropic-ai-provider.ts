import Anthropic from "@anthropic-ai/sdk";
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
        logger.error("AI structured output failed twice", { error: String(secondError) });
        throw new ExternalProviderError(
          "anthropic",
          `Failed to produce a valid structured response: ${String(secondError)}`,
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

/** Lazily instantiated singleton so build/test steps without an API key don't crash at import time. */
export function getAIProvider(): AIPort {
  if (!cachedProvider) {
    cachedProvider = new AnthropicAIProvider();
  }
  return cachedProvider;
}
