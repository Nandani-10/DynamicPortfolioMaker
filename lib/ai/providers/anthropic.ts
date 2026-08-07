"use client";

import { AiError, type ProviderAdapter } from "@/lib/ai/types";

/**
 * Anthropic Claude, via the official SDK.
 *
 * The SDK is ~200KB and only some owners pick this provider, so it's imported
 * on first use rather than in the main bundle.
 */

const MODEL = "claude-opus-5";

/**
 * Opus runs safety classifiers that can decline a request, returning a normal
 * 200 with `stop_reason: "refusal"` and empty or partial content. Reading the
 * content blocks without checking would surface that as a blank result.
 */
const REFUSAL_MESSAGE =
  "Claude declined this request. Try rephrasing what you're asking for.";

async function toAiError(error: unknown): Promise<AiError> {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");

  if (error instanceof Anthropic.AuthenticationError) {
    return new AiError("That API key was rejected. Check it in Dashboard → AI settings.");
  }
  if (error instanceof Anthropic.PermissionDeniedError) {
    return new AiError(
      "This API key doesn't have access to the model. Check your Anthropic Console workspace."
    );
  }
  if (error instanceof Anthropic.RateLimitError) {
    return new AiError("Anthropic is rate-limiting this key. Wait a moment and try again.");
  }
  if (error instanceof Anthropic.APIConnectionError) {
    return new AiError("Couldn't reach the Anthropic API. Check your connection and try again.");
  }
  if (error instanceof Anthropic.APIError) {
    return new AiError(error.message || "The request to Claude failed.");
  }
  return new AiError(error instanceof Error ? error.message : "Something went wrong.");
}

async function createClient(apiKey: string) {
  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  return new Anthropic({
    apiKey,
    // Required to call the API from a browser. Normally a guard against
    // shipping a shared secret to every visitor — here the key belongs to the
    // person who typed it and never leaves their machine.
    dangerouslyAllowBrowser: true,
  });
}

export const anthropicAdapter: ProviderAdapter = {
  async streamChat({ apiKey, system, messages, onDelta, signal }) {
    try {
      const client = await createClient(apiKey);
      const stream = client.messages.stream(
        {
          model: MODEL,
          max_tokens: 32000,
          // Thinking stays on. Turning it off is the cheaper-looking option and
          // the wrong one — on this model it can leak internal tags into the
          // visible answer — and a medium-effort run is fast enough for a
          // question about phrasing a bullet point.
          output_config: { effort: "medium" },
          system,
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
        },
        { signal }
      );

      stream.on("text", onDelta);
      const final = await stream.finalMessage();
      if (final.stop_reason === "refusal") onDelta(REFUSAL_MESSAGE);
    } catch (error) {
      if (signal?.aborted) return;
      throw await toAiError(error);
    }
  },

  async complete({ apiKey, system, prompt, signal }) {
    try {
      const client = await createClient(apiKey);
      const response = await client.messages.create(
        {
          model: MODEL,
          // Short output, but thinking counts against this too — enough
          // headroom that a long bio can't be truncated mid-sentence.
          max_tokens: 8192,
          // A single-field rewrite is short and scoped; low effort handles it
          // at a fraction of the latency.
          output_config: { effort: "low" },
          system,
          messages: [{ role: "user", content: prompt }],
        },
        { signal }
      );

      if (response.stop_reason === "refusal") throw new AiError(REFUSAL_MESSAGE);

      const text = response.content
        .filter((block) => block.type === "text")
        .map((block) => block.text)
        .join("")
        .trim();

      if (!text) throw new AiError("Claude returned an empty rewrite.");
      return text;
    } catch (error) {
      if (error instanceof AiError) throw error;
      throw await toAiError(error);
    }
  },
};
