import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

/** Free/advanced daily quota first — override via env if your offer uses another ID */
export const PRIMARY_MODEL = process.env.OPENAI_PRIMARY_MODEL || "gpt-5.6-luna";
export const SECONDARY_MODEL = process.env.OPENAI_SECONDARY_MODEL || "";
/** Paid wallet — cheapest capable model to protect $5 credits */
export const FALLBACK_MODEL = process.env.OPENAI_FALLBACK_MODEL || "gpt-4o-mini";

function modelChain(): string[] {
  const chain = [PRIMARY_MODEL];
  if (SECONDARY_MODEL && !chain.includes(SECONDARY_MODEL)) chain.push(SECONDARY_MODEL);
  if (!chain.includes(FALLBACK_MODEL)) chain.push(FALLBACK_MODEL);
  return chain;
}

function isRetryable(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();
  return (
    lower.includes("rate") ||
    lower.includes("quota") ||
    lower.includes("429") ||
    lower.includes("404") ||
    lower.includes("model") ||
    lower.includes("not found") ||
    lower.includes("does not exist") ||
    lower.includes("insufficient") ||
    lower.includes("billing") ||
    lower.includes("503") ||
    lower.includes("500") ||
    lower.includes("timeout")
  );
}

/**
 * Round-robin fallback: try free/advanced primary, then secondary, then paid mini.
 * Used for eligibility sub-agent (non-streaming).
 */
export async function generateWithFallback(
  prompt: string,
  options?: { temperature?: number; maxTokens?: number }
) {
  const chain = modelChain();
  let lastError: unknown;

  for (let i = 0; i < chain.length; i++) {
    const modelId = chain[i];
    try {
      const result = await generateText({
        model: openai(modelId),
        prompt,
        temperature: options?.temperature ?? 0.2,
        maxTokens: options?.maxTokens ?? 400,
      });
      if (i > 0) {
        console.warn(`[aiClient] used fallback model: ${modelId}`);
      }
      return { ...result, modelUsed: modelId };
    } catch (err) {
      lastError = err;
      console.warn(`[aiClient] model ${modelId} failed:`, err instanceof Error ? err.message : err);
      if (!isRetryable(err) && i === 0) {
        // still try fallbacks for unknown errors on primary
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("All models in fallback chain failed");
}

export function getModelChain() {
  return modelChain();
}
