"use client";

import { useState } from "react";
import { Calendar, Mail, MapPin, Phone, Send } from "lucide-react";
import { SectionHeading } from "@/components/sections/SectionHeading";
import { ScrollReveal } from "@/components/effects/ScrollReveal";
import { Button } from "@/components/ui/Button";
import type { ContactContent } from "@/types/portfolio";

export function ContactSection({ contact }: { contact: ContactContent }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const hasInfo = contact.email || contact.phone || contact.location;

  if (!hasInfo && !contact.formEnabled && !contact.mapEmbedUrl && !contact.calendlyUrl) {
    return null;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contact.email) return;
    const subject = encodeURIComponent(`Portfolio message from ${name || "a visitor"}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`;
  }

  return (
    <section id="contact" className="mx-auto max-w-4xl px-6 py-24">
      <SectionHeading
        eyebrow="Let's talk"
        title="Contact"
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

        {contact.formEnabled && contact.email && (
          <ScrollReveal direction="right">
            <form onSubmit={handleSubmit} className="card-surface space-y-3 p-5">
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
              <Button type="submit" className="w-full">
                <Send className="h-4 w-4" /> Send message
              </Button>
            </form>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
