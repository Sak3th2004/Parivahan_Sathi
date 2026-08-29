import { generateText, streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

/** Free/advanced daily quota first */
export const PRIMARY_MODEL = process.env.OPENAI_PRIMARY_MODEL || "gpt-5.6-luna";
export const SECONDARY_MODEL = process.env.OPENAI_SECONDARY_MODEL || "gpt-5.6";
/** Paid wallet — cheapest capable model to protect $5 */
export const FALLBACK_MODEL = process.env.OPENAI_FALLBACK_MODEL || "gpt-4o-mini";

/** GPT-5 family needs max_completion_tokens (not max_tokens) and usually no temperature */
function isGpt5Family(modelId: string) {
  return /^gpt-5/i.test(modelId);
}

/**
 * Patch outgoing Chat Completions bodies so GPT-5 models work with AI SDK v4.
 */
export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  fetch: async (input, init) => {
    if (!init?.body || typeof init.body !== "string") {
      return fetch(input, init);
    }
    try {
      const body = JSON.parse(init.body) as Record<string, unknown>;
      const modelId = String(body.model || "");
      if (isGpt5Family(modelId)) {
        if (body.max_tokens != null && body.max_completion_tokens == null) {
          body.max_completion_tokens = body.max_tokens;
        }
        delete body.max_tokens;
        // GPT-5 chat models reject temperature in many accounts
        delete body.temperature;
        // Tool calling on /v1/chat/completions requires reasoning_effort=none
        // (otherwise: "Function tools with reasoning_effort are not supported")
        const hasTools = Array.isArray(body.tools) && body.tools.length > 0;
        if (hasTools) {
          body.reasoning_effort = "none";
        }
      }
      return fetch(input, { ...init, body: JSON.stringify(body) });
    } catch {
      return fetch(input, init);
    }
  },
});

function modelChain(): string[] {
  const chain = [PRIMARY_MODEL];
  if (SECONDARY_MODEL && !chain.includes(SECONDARY_MODEL)) chain.push(SECONDARY_MODEL);
  // Mid paid tier before mini — still cheaper than flagship if primary fails
  for (const mid of ["gpt-4.1-mini", FALLBACK_MODEL]) {
    if (mid && !chain.includes(mid)) chain.push(mid);
  }
  return chain;
}

export function getModelChain() {
  return modelChain();
}

let cachedModel: string | null = null;
let cacheAt = 0;
const CACHE_MS = 5 * 60 * 1000;

/** Tiny non-stream probe so we know a model works before opening a chat stream */
export async function resolveWorkingModel(force = false): Promise<string> {
  if (!force && cachedModel && Date.now() - cacheAt < CACHE_MS) {
    return cachedModel;
  }

  const chain = modelChain();
  let lastError: unknown;

  for (const modelId of chain) {
    try {
      await generateText({
        model: openai(modelId),
        prompt: "Reply with OK",
        maxTokens: 8,
        ...(isGpt5Family(modelId) ? {} : { temperature: 0 }),
      });
      cachedModel = modelId;
      cacheAt = Date.now();
      console.warn(`[aiClient] resolved model: ${modelId}`);
      return modelId;
    } catch (err) {
      lastError = err;
      console.warn(
        `[aiClient] probe failed for ${modelId}:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("All models in fallback chain failed");
}

/**
 * Round-robin fallback for eligibility sub-agent (non-streaming).
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
        maxTokens: options?.maxTokens ?? 400,
        ...(isGpt5Family(modelId)
          ? {}
          : { temperature: options?.temperature ?? 0.2 }),
      });
      if (i > 0) console.warn(`[aiClient] used fallback model: ${modelId}`);
      cachedModel = modelId;
      cacheAt = Date.now();
      return { ...result, modelUsed: modelId };
    } catch (err) {
      lastError = err;
      console.warn(
        `[aiClient] model ${modelId} failed:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("All models in fallback chain failed");
}

export async function streamWithResolvedModel(
  messages: Parameters<typeof streamText>[0]["messages"],
  system: string,
  tools: Parameters<typeof streamText>[0]["tools"]
) {
  const modelId = await resolveWorkingModel();
  return {
    modelId,
    result: streamText({
      model: openai(modelId),
      system,
      messages: messages!,
      tools,
      maxSteps: 8,
      ...(isGpt5Family(modelId) ? {} : { temperature: 0.3 }),
    }),
  };
}
