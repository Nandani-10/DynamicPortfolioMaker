"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary/client";
import type { UploadFolder } from "@/lib/cloudinary/server";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder: UploadFolder;
  label: string;
  aspect?: "square" | "wide";
  accept?: string;
}

export function ImageUploader({
  value,
  onChange,
  folder,
  label,
  aspect = "square",
  accept = "image/*",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    setProgress(0);
    try {
      const result = await uploadToCloudinary(file, folder, setProgress);
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
      <div
        className={`group relative flex items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-alt)] transition-colors hover:border-[var(--accent-2)] ${
          aspect === "square" ? "h-32 w-32" : "aspect-[3/1] w-full"
        }`}
      >
        {value ? (
          <Image src={value} alt={label} fill className="object-cover" sizes="256px" />
        ) : (
          <div className="flex flex-col items-center gap-1 text-[var(--text-muted)]">
            <ImagePlus className="h-5 w-5" />
            <span className="text-xs">Upload</span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 text-white">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-xs">{progress}%</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 opacity-0"
          aria-label={`Upload ${label}`}
        />

        {value && !uploading && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
            }}
            className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
            aria-label={`Remove ${label}`}
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
