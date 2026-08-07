"use client";

import { AiError, type ProviderAdapter } from "@/lib/ai/types";

/**
 * Google Gemini over the REST API, called straight from the browser.
 *
 * No SDK: the whole surface used here is two endpoints and an SSE parser, and
 * the official client is a large dependency to carry for that. Raw fetch also
 * means nothing extra lands in the bundle for owners who never turn AI on.
 */

/**
 * The floating alias, not a pinned version.
 *
 * Google retires older models to new API keys — `gemini-2.5-flash` still
 * appears in ListModels but answers `generateContent` with a 404 saying it's
 * "no longer available to new users". A pinned version would strand every
 * portfolio already deployed, since this is a static site that owners publish
 * once and don't rebuild. The alias moves with Google instead.
 *
 * Flash rather than Pro: it's what the free tier is generous with, and the
 * work here (rewriting a paragraph, answering a question about wording)
 * doesn't need more.
 */
const MODEL = "gemini-flash-latest";
const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

interface GeminiPart {
  text?: string;
  /** Set on reasoning parts, which should never reach the user. */
  thought?: boolean;
}

interface GeminiChunk {
  candidates?: {
    content?: { parts?: GeminiPart[] };
    finishReason?: string;
  }[];
  error?: { message?: string };
}

/** Reasoning parts are marked; everything else is the answer. */
function visibleText(parts: GeminiPart[] | undefined): string {
  if (!parts) return "";
  return parts
    .filter((part) => !part.thought && typeof part.text === "string")
    .map((part) => part.text)
    .join("");
}

/**
 * `finishReason` carries the failure modes that arrive with a 200: a safety
 * block, or an answer cut off at the token ceiling. Both look like a short or
 * empty reply unless they're checked.
 */
function messageForFinishReason(reason: string | undefined): string | null {
  switch (reason) {
    case "SAFETY":
    case "PROHIBITED_CONTENT":
    case "BLOCKLIST":
      return "Gemini blocked this request. Try rephrasing what you're asking for.";
    case "RECITATION":
      return "Gemini stopped because the reply looked like copied text. Try rephrasing.";
    case "MAX_TOKENS":
      return "The reply hit its length limit and was cut short.";
    default:
      return null;
  }
}

async function describeHttpError(response: Response): Promise<AiError> {
  let detail = "";
  try {
    const body = (await response.json()) as { error?: { message?: string } };
    detail = body.error?.message ?? "";
  } catch {
    // A non-JSON error body tells us nothing useful; the status still does.
  }

  switch (response.status) {
    case 400:
      // Gemini returns 400, not 401, for a malformed or unknown key.
      return new AiError(
        detail.toLowerCase().includes("api key")
          ? "That API key was rejected. Check it in Dashboard → AI settings."
          : detail || "Gemini rejected the request."
      );
    case 401:
    case 403:
      return new AiError(
        "That API key was rejected, or it doesn't have access to the Gemini API. Check it at aistudio.google.com/apikey."
      );
    case 404:
      // Google retiring the model behind the alias. Nothing the owner can fix
      // by changing their key, so say so rather than sending them to check it.
      return new AiError(
        "Gemini couldn't find the model this app asks for — Google may have retired it. This needs a fix in the app, not your key."
      );
    case 429:
      return new AiError(
        "You've hit the free-tier rate limit. Wait a minute and try again."
      );
    case 503:
      return new AiError("Gemini is overloaded right now. Try again in a moment.");
    default:
      return new AiError(detail || `Gemini returned an error (${response.status}).`);
  }
}

async function post(
  path: string,
  apiKey: string,
  body: unknown,
  signal?: AbortSignal
): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(`${BASE}/${MODEL}:${path}`, {
      method: "POST",
      // The key goes in a header rather than the query string so it can't be
      // captured in a proxy or browser URL log.
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify(body),
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new AiError("Couldn't reach Gemini. Check your connection and try again.");
  }

  if (!response.ok) throw await describeHttpError(response);
  return response;
}

/**
 * Reads an SSE body and yields each `data:` payload.
 *
 * Chunks arrive on arbitrary byte boundaries, so a partial line has to be held
 * back until the rest of it turns up in the next read.
 */
async function* sseEvents(response: Response): AsyncGenerator<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new AiError("Gemini returned an empty response.");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newline: number;
    while ((newline = buffer.indexOf("\n")) !== -1) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (line.startsWith("data:")) yield line.slice(5).trim();
    }
  }
}

export const geminiAdapter: ProviderAdapter = {
  async streamChat({ apiKey, system, messages, onDelta, signal }) {
    const response = await post(
      "streamGenerateContent?alt=sse",
      apiKey,
      {
        system_instruction: { parts: [{ text: system }] },
        contents: messages.map((message) => ({
          // Gemini calls the assistant turn "model".
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
        generationConfig: {
          maxOutputTokens: 4096,
          temperature: 0.7,
          // `thinkingLevel`, not the older `thinkingBudget` — current Flash
          // rejects the numeric form outright with a 400.
          //
          // Chat answers here are short and factual; a little thinking helps
          // structure them without adding noticeable latency.
          thinkingConfig: { thinkingLevel: "low" },
        },
      },
      signal
    );

    let sawText = false;
    let finishReason: string | undefined;

    for await (const payload of sseEvents(response)) {
      let chunk: GeminiChunk;
      try {
        chunk = JSON.parse(payload) as GeminiChunk;
      } catch {
        // A keepalive or a truncated frame — nothing to render.
        continue;
      }
      if (chunk.error?.message) throw new AiError(chunk.error.message);

      const candidate = chunk.candidates?.[0];
      const text = visibleText(candidate?.content?.parts);
      if (text) {
        sawText = true;
        onDelta(text);
      }
      if (candidate?.finishReason) finishReason = candidate.finishReason;
    }

    const problem = messageForFinishReason(finishReason);
    // MAX_TOKENS after real text is a truncated answer, not a failure — say so
    // inline rather than throwing away what did arrive.
    if (problem && (!sawText || finishReason === "MAX_TOKENS")) {
      if (sawText) onDelta(`\n\n_${problem}_`);
      else throw new AiError(problem);
    }
  },

  async complete({ apiKey, system, prompt, signal }) {
    const response = await post(
      "generateContent",
      apiKey,
      {
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          // Generous for an 18-token answer, because reasoning tokens count
          // against this ceiling too — a tight limit truncates the rewrite
          // before it starts.
          maxOutputTokens: 2048,
          // Low temperature: a rewrite should stay close to the facts it was
          // given, not wander off inventing new ones.
          temperature: 0.4,
          // The least reasoning on offer. Rewriting one field doesn't need it,
          // and it's the difference between a snappy button and a slow one.
          thinkingConfig: { thinkingLevel: "minimal" },
        },
      },
      signal
    );

    const body = (await response.json()) as GeminiChunk;
    const candidate = body.candidates?.[0];
    const text = visibleText(candidate?.content?.parts).trim();

    if (!text) {
      throw new AiError(
        messageForFinishReason(candidate?.finishReason) ??
          "Gemini returned an empty rewrite."
      );
    }
    return text;
  },
};
