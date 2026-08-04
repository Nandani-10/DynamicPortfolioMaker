"use client";

import { auth } from "@/lib/firebase/client";
import type { UploadFolder } from "@/lib/cloudinary/server";

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  format: string;
  width?: number;
  height?: number;
}

interface SignResponse {
  signature: string;
  timestamp: number;
  folder: string;
  apiKey: string;
  cloudName: string;
}

export async function uploadToCloudinary(
  file: File,
  folder: UploadFolder,
  onProgress?: (percent: number) => void
): Promise<CloudinaryUploadResult> {
  const idToken = await auth.currentUser?.getIdToken();
  if (!idToken) {
    throw new Error("You must be signed in to upload files.");
  }

  const signRes = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ folder }),
  });

  if (!signRes.ok) {
    const err = await signRes.json().catch(() => ({}));
    throw new Error(err.error || "Could not get upload authorization.");
  }

  const sign: SignResponse = await signRes.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sign.apiKey);
  formData.append("timestamp", String(sign.timestamp));
  formData.append("signature", sign.signature);
  formData.append("folder", sign.folder);

  const resourceType = file.type === "application/pdf" ? "raw" : "image";
  const uploadUrl = `https://api.cloudinary.com/v1_1/${sign.cloudName}/${resourceType}/upload`;

  const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
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
        reject(new Error("Upload to Cloudinary failed."));
      }
    };

    xhr.onerror = () => reject(new Error("Upload to Cloudinary failed."));
    xhr.send(formData);
  });

  return result;
}
