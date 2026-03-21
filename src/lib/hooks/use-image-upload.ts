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

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(async (file: File): Promise<UploadResult> => {
    setUploading(true);
    setProgress(0);
    try {
      const resized = await resizeImage(file);
      const formData = new FormData();
      formData.append("file", resized, file.name.replace(/\.[^.]+$/, ".jpg"));
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { publicUrl } = await res.json();
      setProgress(100);
      return { publicUrl };
    } finally {
      setUploading(false);
    }
  }, []);

  return { upload, uploading, progress };
}
