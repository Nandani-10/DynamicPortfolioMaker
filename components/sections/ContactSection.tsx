"use client";

import { useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
} from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { Button } from "@/components/ui/Button";
import { ParticleRing } from "@/components/effects/ParticleRing";
import type { ContactContent } from "@/types/portfolio";

type SubmitState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "sent" }
  | { status: "error"; message: string };

export function ContactSection({
  contact,
  ringPalette,
  title,
}: {
  contact: ContactContent;
  ringPalette: string[];
  title?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  // Bots fill in every field they find; humans never see this one.
  const [botField, setBotField] = useState("");
  const [submit, setSubmit] = useState<SubmitState>({ status: "idle" });
  const hasInfo = contact.email || contact.phone || contact.location;
  const accessKey = contact.formAccessKey?.trim();

  if (!hasInfo && !contact.formEnabled && !contact.mapEmbedUrl && !contact.calendlyUrl) {
    return null;
  }

  /**
   * With an access key the message is delivered by Web3Forms — the static
   * export has no server of its own to post to. Without one we fall back to
   * handing off to the visitor's mail client, which is better than nothing
   * but silently does nothing on devices with no mail app configured.
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (botField) return;

    if (!accessKey) {
      if (!contact.email) return;
      const subject = encodeURIComponent(`Portfolio message from ${name || "a visitor"}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
      window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`;
      return;
    }

    setSubmit({ status: "sending" });
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          subject: `Portfolio message from ${name || "a visitor"}`,
          from_name: name,
          name,
          email,
          message,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Your message couldn't be sent.");
      }
      setSubmit({ status: "sent" });
      setName("");
      setEmail("");
      setMessage("");
    } catch (err) {
      setSubmit({
        status: "error",
        message: err instanceof Error ? err.message : "Your message couldn't be sent.",
      });
    }
  }

  return (
    <section id="contact" className="relative overflow-hidden px-6 py-24">
      {/* 3D particle ring sits behind the form, letting the section close the
          page on the same note the hero opened it. */}
      <ParticleRing
        palette={ringPalette}
        className="pointer-events-none absolute inset-0 opacity-70"
      />
      <div className="relative mx-auto max-w-4xl">
      <SectionHeading
        eyebrow="Let's talk"
        title={title ?? "Contact"}
        description="Have a project in mind or just want to say hi? Reach out."
      />

      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <ScrollReveal direction="left" className="space-y-4">
          {contact.email && (
            <a
              href={`mailto:${contact.email}`}
              className="card-surface flex items-center gap-3 p-4 transition-transform hover:-translate-y-0.5"
            >
              <Mail className="h-4 w-4 text-[var(--accent-2)]" />
              <span className="text-sm">{contact.email}</span>
            </a>
          )}
          {contact.phone && (
            <a
              href={`tel:${contact.phone}`}
              className="card-surface flex items-center gap-3 p-4 transition-transform hover:-translate-y-0.5"
            >
              <Phone className="h-4 w-4 text-[var(--accent-2)]" />
              <span className="text-sm">{contact.phone}</span>
            </a>
          )}
          {contact.location && (
            <div className="card-surface flex items-center gap-3 p-4">
              <MapPin className="h-4 w-4 text-[var(--accent-2)]" />
              <span className="text-sm">{contact.location}</span>
            </div>
          )}
          {contact.calendlyUrl && (
            <a
              href={contact.calendlyUrl}
              target="_blank"
              rel="noreferrer"
              className="card-surface flex items-center gap-3 p-4 transition-transform hover:-translate-y-0.5"
            >
              <Calendar className="h-4 w-4 text-[var(--accent-2)]" />
              <span className="text-sm">Book a time on my calendar</span>
            </a>
          )}
          {contact.mapEmbedUrl && (
            <div className="card-surface overflow-hidden">
              <iframe
                src={contact.mapEmbedUrl}
                loading="lazy"
                className="h-48 w-full border-0"
                title="Location map"
              />
            </div>
          )}
        </ScrollReveal>

        {contact.formEnabled && (contact.email || accessKey) && (
          <ScrollReveal direction="right">
            <form onSubmit={handleSubmit} className="card-surface relative space-y-3 p-5">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--accent-2)]"
              />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--accent-2)]"
              />
              <textarea
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message"
                className="w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--accent-2)]"
              />
              {/* Honeypot: off-screen rather than display:none, which some
                  bots specifically skip. Never announced to screen readers. */}
              <input
                type="text"
                name="botcheck"
                value={botField}
                onChange={(e) => setBotField(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="absolute left-[-9999px] h-0 w-0 opacity-0"
              />

              <Button
                type="submit"
                className="w-full"
                disabled={submit.status === "sending"}
              >
                {submit.status === "sending" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Send message
                  </>
                )}
              </Button>

              <p aria-live="polite" className="min-h-5 text-center text-xs">
                {submit.status === "sent" && (
                  <span className="inline-flex items-center gap-1.5 text-[var(--accent-3)]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Thanks — your message is on its way.
                  </span>
                )}
                {submit.status === "error" && (
                  <span className="inline-flex items-center gap-1.5 text-red-400">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {submit.message}
                  </span>
                )}
              </p>
            </form>
          </ScrollReveal>
        )}
        </div>
      </div>
    </section>
  );
}
