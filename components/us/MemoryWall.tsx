"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUs } from "@/components/us/UsProvider";
import { addMemory, deleteMemory } from "@/lib/us/store";
import { uploadToCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary/client";
import { dayKey } from "@/lib/us/format";

/** An elegant timeline of the things worth keeping. */
export function MemoryWall() {
  const { memories, uid, nameFor } = useUs();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: "",
    date: dayKey(),
    caption: "",
    location: "",
    note: "",
  });

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      let photoUrl: string | undefined;
      const file = fileRef.current?.files?.[0];
      if (file) {
        if (!isCloudinaryConfigured) {
          throw new Error("Photos need the two NEXT_PUBLIC_CLOUDINARY_* values.");
        }
        photoUrl = (await uploadToCloudinary(file, "us-memories")).secureUrl;
      }
      await addMemory({
        authorUid: uid,
        title: form.title.trim(),
        date: form.date,
        caption: form.caption.trim() || undefined,
        location: form.location.trim() || undefined,
        note: form.note.trim() || undefined,
        photoUrl,
      });
      setForm({ title: "", date: dayKey(), caption: "", location: "", note: "" });
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn't save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="us-card p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="us-title text-base font-medium">Memory wall</h2>
        <button
          type="button"
          className="us-chip text-xs"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Add a memory"}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
            onSubmit={save}
          >
            <div className="mt-4 space-y-2">
              <input
                className="us-input"
                placeholder="What happened?"
                value={form.title}
                maxLength={80}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  className="us-input sm:w-44"
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm({ ...form, date: event.target.value })}
                />
                <input
                  className="us-input flex-1"
                  placeholder="Where? (optional)"
                  value={form.location}
                  maxLength={60}
                  onChange={(event) => setForm({ ...form, location: event.target.value })}
                />
              </div>
              <input
                className="us-input"
                placeholder="A short caption (optional)"
                value={form.caption}
                maxLength={140}
                onChange={(event) => setForm({ ...form, caption: event.target.value })}
              />
              <textarea
                className="us-input min-h-20 resize-none"
                placeholder="Anything you want to remember about it…"
                value={form.note}
                maxLength={600}
                onChange={(event) => setForm({ ...form, note: event.target.value })}
              />
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="us-input text-xs"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  setPreview(file ? URL.createObjectURL(file) : null);
                }}
              />
              {preview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="max-h-40 rounded-xl object-cover" />
              )}
              {error && <p className="text-xs text-[var(--us-accent-2)]">{error}</p>}
              <button
                type="submit"
                className="us-primary text-sm"
                disabled={saving || !form.title.trim()}
              >
                {saving ? "Keeping it…" : "Keep this"}
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {memories.length === 0 ? (
        <p className="us-muted mt-4 text-sm leading-relaxed">
          Nothing kept yet. The first one can be small — a photo of an ordinary day
          counts.
        </p>
      ) : (
        <ol className="mt-5 space-y-4">
          {memories.map((memory, index) => {
            const isOpen = expanded === memory.id;
            return (
              <motion.li layout key={memory.id} className="relative pl-6">
                <span
                  aria-hidden
                  className="absolute left-1.5 top-2 h-2 w-2 rounded-full"
                  style={{ background: "var(--us-accent)" }}
                />
                {index < memories.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute bottom-[-1rem] left-[0.6rem] top-5 w-px"
                    style={{ background: "var(--us-border)" }}
                  />
                )}
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => setExpanded(isOpen ? null : memory.id)}
                >
                  <p className="us-muted text-[0.68rem] uppercase tracking-[0.18em]">
                    {new Date(`${memory.date}T00:00:00`).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                    {memory.location ? ` · ${memory.location}` : ""}
                  </p>
                  <p className="us-title mt-1 text-[0.98rem] font-medium">{memory.title}</p>
                  {memory.caption && (
                    <p className="us-muted mt-0.5 text-sm">{memory.caption}</p>
                  )}
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 space-y-2">
                        {memory.photoUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={memory.photoUrl}
                            alt={memory.title}
                            className="w-full rounded-2xl object-cover"
                            loading="lazy"
                          />
                        )}
                        {memory.note && (
                          <p className="text-sm leading-relaxed">{memory.note}</p>
                        )}
                        <p className="us-muted text-[0.68rem]">
                          Kept by {nameFor(memory.authorUid)}
                          {memory.authorUid === uid && (
                            <>
                              {" · "}
                              <button
                                type="button"
                                className="underline-offset-4 hover:underline"
                                onClick={() => deleteMemory(memory.id).catch(() => {})}
                              >
                                remove
                              </button>
                            </>
                          )}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
