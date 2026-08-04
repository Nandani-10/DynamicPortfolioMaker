"use client";

import { useRef, useState } from "react";
import { FileText, Loader2, Trash2, UploadCloud } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary/client";
import type { UploadFolder } from "@/lib/cloudinary/server";

interface FileUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder: UploadFolder;
  label: string;
  accept?: string;
}

export function FileUploader({
  value,
  onChange,
  folder,
  label,
  accept = "application/pdf",
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const result = await uploadToCloudinary(file, folder);
      onChange(result.secureUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </span>
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3">
        {value ? (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="flex min-w-0 flex-1 items-center gap-2 text-sm hover:underline"
          >
            <FileText className="h-4 w-4 shrink-0 text-[var(--accent-3)]" />
            <span className="truncate">View current file</span>
          </a>
        ) : (
          <span className="flex flex-1 items-center gap-2 text-sm text-[var(--text-muted)]">
            <FileText className="h-4 w-4" /> No file uploaded
          </span>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium hover:border-[var(--accent-2)]"
        >
          {uploading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <UploadCloud className="h-3.5 w-3.5" />
          )}
          {value ? "Replace" : "Upload"}
        </button>

        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="shrink-0 rounded-full p-1.5 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400"
            aria-label="Remove file"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  );
}
