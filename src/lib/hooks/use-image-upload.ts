"use client";

import { useState, useCallback } from "react";

interface UploadResult {
  publicUrl: string;
}

function resizeImage(file: File, maxSize: number = 1920, quality: number = 0.8): Promise<Blob> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height / width) * maxSize;
          width = maxSize;
        } else {
          width = (width / height) * maxSize;
          height = maxSize;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => resolve(blob!), "image/jpeg", quality);
    };
    img.src = URL.createObjectURL(file);
  });
}

function uploadViaXHR(formData: FormData): Promise<{ publicUrl: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          reject(new Error("Invalid response"));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error || "Upload failed"));
        } catch {
          reject(new Error(`Upload failed (${xhr.status})`));
        }
      }
    };
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(formData);
  });
}

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(async (file: File): Promise<UploadResult> => {
    setUploading(true);
    setProgress(0);
    try {
      const resized = await resizeImage(file);
      const resizedFile = new File([resized], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
      const formData = new FormData();
      formData.append("file", resizedFile);
      // Use XMLHttpRequest to avoid any global fetch interceptors (e.g. Supabase SDK)
      const result = await uploadViaXHR(formData);
      setProgress(100);
      return result;
    } finally {
      setUploading(false);
    }
  }, []);

  return { upload, uploading, progress };
}
