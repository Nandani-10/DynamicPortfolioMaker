export const ALLOWED_UPLOAD_FOLDERS = [
  "profile",
  "banner",
  "projects",
  "certifications",
  "resume",
  "testimonials",
  "blogs",
  "companies",
] as const;

export type UploadFolder = (typeof ALLOWED_UPLOAD_FOLDERS)[number];
