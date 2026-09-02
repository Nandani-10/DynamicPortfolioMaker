export const ALLOWED_UPLOAD_FOLDERS = [
  "profile",
  "banner",
  "projects",
  "certifications",
  "resume",
  "testimonials",
  "blogs",
  "companies",
  // The private couple space at /us.
  "us-photos",
  "us-voice",
  "us-memories",
] as const;

export type UploadFolder = (typeof ALLOWED_UPLOAD_FOLDERS)[number];
