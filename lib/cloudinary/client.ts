"use client";

import type { UploadFolder } from "@/lib/cloudinary/folders";

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  format: string;
  width?: number;
  height?: number;
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const isCloudinaryConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

/**
 * Uploads directly from the browser using an *unsigned* Cloudinary upload
 * preset. The app is deployed as a static site (Firebase Hosting free tier
 * has no server), so there is nowhere to keep an API secret — the preset is
 * the supported way to upload without one.
 *
 * Lock the preset down in the Cloudinary console (Settings → Upload → the
 * preset): restrict allowed formats, set a max file size, and pin the folder.
 */
export async function uploadToCloudinary(
  file: File,
  folder: UploadFolder,
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary isn't configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", `dynamic-portfolio-maker/${folder}`);

  const resourceType = file.type === "application/pdf" ? "raw" : "image";
  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  return new Promise<CloudinaryUploadResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadUrl);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          secureUrl: data.secure_url,
          publicId: data.public_id,
          resourceType: data.resource_type,
          format: data.format,
          width: data.width,
          height: data.height,
        });
      } else {
        let message = "Upload to Cloudinary failed.";
        try {
          const parsed = JSON.parse(xhr.responseText);
          if (parsed?.error?.message) message = parsed.error.message;
        } catch {
          // keep the generic message
        }
        reject(new Error(message));
      }
    };

    xhr.onerror = () => reject(new Error("Upload to Cloudinary failed."));
    xhr.send(formData);
  });
}
