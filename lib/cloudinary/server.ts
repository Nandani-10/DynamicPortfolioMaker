import "server-only";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

export function isAllowedFolder(folder: string): folder is UploadFolder {
  return (ALLOWED_UPLOAD_FOLDERS as readonly string[]).includes(folder);
}

interface SignUploadParams {
  uid: string;
  folder: UploadFolder;
}

export function signUpload({ uid, folder }: SignUploadParams) {
  const timestamp = Math.round(Date.now() / 1000);
  const cloudinaryFolder = `dynamic-portfolio-maker/${uid}/${folder}`;

  const paramsToSign = {
    timestamp,
    folder: cloudinaryFolder,
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET as string
  );

  return {
    signature,
    timestamp,
    folder: cloudinaryFolder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  };
}
