"use client";

import { useState, useCallback } from "react";

interface UploadResult {
  publicUrl: string;
}

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = useCallback(async (file: File): Promise<UploadResult> => {
    setUploading(true);
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append("file", file);
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
