import { z } from "zod";

/**
 * AIPort — the single contract every AI-powered module talks to.
 *
 * Every module (Competitor Analyzer, Angle Finder, Script Generator,
 * Copywriter, Offer Builder, Audience Finder, Product Validator...) asks
 * this port for a JSON object matching a Zod schema, instead of talking to
 * a specific vendor SDK directly. This keeps the AI vendor an
 * implementation detail (`AnthropicAIProvider` today, swappable later)
 * behind one seam, and guarantees every AI response is validated before it
 * reaches the database or the UI.
 */
export interface AIPort {
  readonly name: string;

  /**
   * Ask the model to produce structured JSON matching `schema`.
   * Implementations must retry once on a schema-validation failure by
   * feeding the validation error back to the model.
   */
  generateStructured<T extends z.ZodTypeAny>(args: {
    system: string;
    prompt: string;
    schema: T;
    maxTokens?: number;
  }): Promise<z.infer<T>>;

  /** Free-form generation for cases that don't need a strict schema. */
  generateText(args: { system: string; prompt: string; maxTokens?: number }): Promise<string>;
}
