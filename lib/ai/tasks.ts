"use client";

import { anthropicAdapter } from "@/lib/ai/providers/anthropic";
import { geminiAdapter } from "@/lib/ai/providers/gemini";
import type { AiProvider, AiSettings } from "@/lib/ai/settings";
import { AiError, type ChatMessage, type ProviderAdapter } from "@/lib/ai/types";

export type { ChatMessage } from "@/lib/ai/types";

/**
 * The two things the assistant does: answer questions about building the
 * portfolio, and rewrite a single field's text. Which model runs them is the
 * owner's choice — everything below is written against the adapter interface.
 */

const ADAPTERS: Record<AiProvider, ProviderAdapter> = {
  gemini: geminiAdapter,
  anthropic: anthropicAdapter,
};

const ASSISTANT_SYSTEM = `You are a writing and career-portfolio assistant built into a portfolio builder. The person you're helping is filling in their own portfolio: hero intro, about bio, work experience, projects, skills, education.

Help with what they ask: wording, structure, what belongs in a section, how to describe a project or a role, what a hiring reader looks for. Answer general questions too — you don't have to steer everything back to the portfolio.

You cannot see or edit their portfolio, and you cannot save anything. If they ask you to change something, give them the text to paste and say where it goes.

Never invent facts about them — no job titles, dates, employers, metrics, or achievements they haven't given you. If a rewrite needs a detail you don't have, leave a clear placeholder like [years] and say what's missing.

Keep answers short and usable. Give the text, not an essay about the text.`;

const REWRITE_SYSTEM = `You rewrite one field of someone's portfolio. You'll get the field's name, what it is, and the current text.

Return ONLY the rewritten text. No preamble, no quotes around it, no explanation, no markdown formatting unless the field already used it.

Rules:
- Keep every fact. Don't add achievements, numbers, dates, employers, or skills that aren't in the original.
- Keep roughly the original length unless it's obviously padded.
- Write in first person if the original does, third if it does.
- Plain, specific, confident. No buzzword stacking, no "passionate about leveraging synergies".
- If the original is empty or too vague to improve, return it unchanged.`;

function adapterFor(settings: AiSettings): ProviderAdapter {
  if (!settings.apiKey) {
    throw new AiError("Add an API key in Dashboard → AI settings first.");
  }
  return ADAPTERS[settings.provider];
}

/**
 * Streams an answer token by token. `onDelta` receives each chunk of text as
 * it arrives so the panel can render progressively.
 */
export async function streamAssistantReply(
  settings: AiSettings,
  history: ChatMessage[],
  onDelta: (text: string) => void,
  signal?: AbortSignal
): Promise<void> {
  await adapterFor(settings).streamChat({
    apiKey: settings.apiKey,
    system: ASSISTANT_SYSTEM,
    messages: history,
    onDelta,
    signal,
  });
}

export interface RewriteRequest {
  /** What the field is called in the dashboard, e.g. "About — bio". */
  label: string;
  /** One line on what the field is for, so the model knows the register. */
  description: string;
  text: string;
  /** Optional free-text steer from the owner, e.g. "make it shorter". */
  instruction?: string;
}

/** Rewrites one field and returns the replacement text. */
export async function rewriteField(
  settings: AiSettings,
  request: RewriteRequest,
  signal?: AbortSignal
): Promise<string> {
  const prompt = [
    `Field: ${request.label}`,
    `What it is: ${request.description}`,
    request.instruction ? `Extra instruction: ${request.instruction}` : "",
    "",
    "Current text:",
    request.text,
  ]
    .filter(Boolean)
    .join("\n");

  return adapterFor(settings).complete({
    apiKey: settings.apiKey,
    system: REWRITE_SYSTEM,
    prompt,
    signal,
  });
}
