/**
 * The shape every provider has to satisfy.
 *
 * Two very different APIs sit behind this (an SDK with streaming helpers, and
 * raw SSE over fetch), so keeping the surface this small is what lets the rest
 * of the app stay provider-agnostic.
 */

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface StreamChatOptions {
  apiKey: string;
  system: string;
  messages: ChatMessage[];
  /** Called with each chunk of text as it arrives. */
  onDelta: (text: string) => void;
  signal?: AbortSignal;
}

export interface CompleteOptions {
  apiKey: string;
  system: string;
  prompt: string;
  signal?: AbortSignal;
}

export interface ProviderAdapter {
  /** Streams a conversational reply. Resolves when the turn is finished. */
  streamChat(options: StreamChatOptions): Promise<void>;
  /** One short, scoped completion — used for field rewrites. */
  complete(options: CompleteOptions): Promise<string>;
}

/**
 * Thrown for anything an owner could act on: a rejected key, a rate limit, a
 * refusal. The message is written to be shown directly in the UI.
 */
export class AiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiError";
  }
}
