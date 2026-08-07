"use client";

import { useState } from "react";
import { ChevronDown, GripVertical, Plus, Trash2 } from "lucide-react";
import { Field, TextArea, TextInput } from "@/components/dashboard/fields";
import { ImageUploader } from "@/components/dashboard/ImageUploader";
import { RewriteWithAi } from "@/components/dashboard/RewriteWithAi";
import type { UploadFolder } from "@/lib/cloudinary/folders";

export type FieldType =
  | "text"
  | "textarea"
  | "url"
  | "date"
  | "number"
  | "tags"
  | "image"
  | "select"
  | "boolean";

export interface ItemFieldSchema {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: { value: string; label: string }[];
  uploadFolder?: UploadFolder;
  fullWidth?: boolean;
}

interface RepeatingItemsEditorProps<T extends { id: string }> {
  items: T[];
  onChange: (items: T[]) => void;
  fields: ItemFieldSchema[];
  createItem: () => T;
  itemTitle: (item: T) => string;
  itemSubtitle?: (item: T) => string | undefined;
  addLabel?: string;
  emptyLabel?: string;
  /**
   * What one of these items is, in a few words ("a project on a developer's
   * portfolio"). Free-text fields offer an AI rewrite, and this is the only
   * thing telling the model what register the text should be in.
   */
  aiContext?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyItem = Record<string, any>;

export function RepeatingItemsEditor<T extends { id: string }>({
  items,
  onChange,
  fields,
  createItem,
  itemTitle,
  itemSubtitle,
  addLabel = "Add item",
  emptyLabel = "Nothing added yet.",
  aiContext,
}: RepeatingItemsEditorProps<T>) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function updateItem(id: string, patch: AnyItem) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeItem(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  function addItem() {
    const item = createItem();
    onChange([...items, item]);
    setExpandedId(item.id);
  }

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="rounded-xl border border-dashed border-[var(--border)] px-4 py-6 text-center text-sm text-[var(--text-muted)]">
          {emptyLabel}
        </p>
      )}

      {items.map((item, index) => {
        const expanded = expandedId === item.id;
        const record = item as unknown as AnyItem;
        return (
          <div key={item.id} className="card-surface overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3">
              <GripVertical className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : item.id)}
                className="flex min-w-0 flex-1 items-center justify-between gap-2 text-left"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {itemTitle(item) || "Untitled"}
                  </span>
                  {itemSubtitle?.(item) && (
                    <span className="block truncate text-xs text-[var(--text-muted)]">
                      {itemSubtitle(item)}
                    </span>
                  )}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform ${
                    expanded ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveItem(index, -1)}
                  disabled={index === 0}
                  className="rounded-lg px-1.5 py-1 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-alt)] disabled:opacity-30"
                  aria-label="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveItem(index, 1)}
                  disabled={index === items.length - 1}
                  className="rounded-lg px-1.5 py-1 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-alt)] disabled:opacity-30"
                  aria-label="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-red-500/10 hover:text-red-400"
                  aria-label="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {expanded && (
              <div className="grid grid-cols-1 gap-4 border-t border-[var(--border)] p-4 sm:grid-cols-2">
                {fields.map((field) => {
                  const value = record[field.key];
                  const wrapperClass = field.fullWidth ? "sm:col-span-2" : "";

                  if (field.type === "image") {
                    return (
                      <div key={field.key} className={wrapperClass}>
                        <ImageUploader
                          label={field.label}
                          value={value}
                          folder={field.uploadFolder ?? "projects"}
                          onChange={(url) => updateItem(item.id, { [field.key]: url })}
                          aspect="wide"
                        />
                      </div>
                    );
                  }

                  if (field.type === "boolean") {
                    return (
                      <label
                        key={field.key}
                        className={`flex items-center gap-2 text-sm ${wrapperClass}`}
                      >
                        <input
                          type="checkbox"
                          checked={!!value}
                          onChange={(e) =>
                            updateItem(item.id, { [field.key]: e.target.checked })
                          }
                          className="h-4 w-4 rounded border-[var(--border)] accent-[var(--accent-2)]"
                        />
                        {field.label}
                      </label>
                    );
                  }

                  if (field.type === "select") {
                    return (
                      <div key={field.key} className={wrapperClass}>
                        <Field label={field.label}>
                          <select
                            value={value ?? ""}
                            onChange={(e) =>
                              updateItem(item.id, { [field.key]: e.target.value })
                            }
                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--accent-2)]"
                          >
                            {field.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        </Field>
                      </div>
                    );
                  }

                  if (field.type === "textarea") {
                    return (
                      <div key={field.key} className={wrapperClass}>
                        <Field label={field.label}>
                          <TextArea
                            rows={3}
                            value={value ?? ""}
                            placeholder={field.placeholder}
                            onChange={(e) =>
                              updateItem(item.id, { [field.key]: e.target.value })
                            }
                          />
                        </Field>
                        {aiContext && (
                          <RewriteWithAi
                            label={field.label}
                            description={`The "${field.label}" of ${aiContext}.`}
                            value={typeof value === "string" ? value : ""}
                            onApply={(text) =>
                              updateItem(item.id, { [field.key]: text })
                            }
                          />
                        )}
                      </div>
                    );
                  }

                  if (field.type === "tags") {
                    const arrValue: string[] = Array.isArray(value) ? value : [];
                    return (
                      <div key={field.key} className={wrapperClass}>
                        <Field label={field.label} hint="Comma-separated">
                          <TextInput
                            value={arrValue.join(", ")}
                            placeholder={field.placeholder}
                            onChange={(e) =>
                              updateItem(item.id, {
                                [field.key]: e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              })
                            }
                          />
                        </Field>
                      </div>
                    );
                  }

                  if (field.type === "number") {
                    return (
                      <div key={field.key} className={wrapperClass}>
                        <Field label={field.label}>
                          <TextInput
                            type="number"
                            value={value ?? 0}
                            placeholder={field.placeholder}
                            onChange={(e) =>
                              updateItem(item.id, { [field.key]: Number(e.target.value) })
                            }
                          />
                        </Field>
                      </div>
                    );
                  }

                  return (
                    <div key={field.key} className={wrapperClass}>
                      <Field label={field.label}>
                        <TextInput
                          value={value ?? ""}
                          placeholder={field.placeholder}
                          onChange={(e) =>
                            updateItem(item.id, { [field.key]: e.target.value })
                          }
                        />
                      </Field>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addItem}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] py-3 text-sm text-[var(--text-muted)] transition-colors hover:border-[var(--accent-2)] hover:text-[var(--text)]"
      >
        <Plus className="h-4 w-4" />
        {addLabel}
      </button>
    </div>
  );
}
