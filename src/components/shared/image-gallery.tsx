"use client";

import { useImageUpload } from "@/lib/hooks/use-image-upload";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import type { EntryImage } from "@/types/tracker";

interface ImageGalleryProps {
  images: EntryImage[];
  onChange?: (images: EntryImage[]) => void;
  readOnly?: boolean;
}

export function ImageGallery({
  images,
  onChange,
  readOnly = false,
}: ImageGalleryProps) {
  const { upload, uploading } = useImageUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !onChange) return;
    let current = [...images];
    for (const file of Array.from(files)) {
      const { publicUrl } = await upload(file);
      const newImage: EntryImage = {
        id: crypto.randomUUID(),
        entry_id: "",
        url: publicUrl,
        alt_text: null,
        position: current.length,
      };
      current = [...current, newImage];
      onChange(current);
    }
  };

  const removeImage = (id: string) => {
    onChange?.(images.filter((img) => img.id !== id));
  };

  const moveImage = (from: number, to: number) => {
    if (!onChange) return;
    const updated = [...images];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    onChange(updated.map((img, i) => ({ ...img, position: i })));
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {images.map((img, index) => (
          <div
            key={img.id}
            className="relative group rounded-md overflow-hidden cursor-pointer"
            onClick={() => setLightboxUrl(img.url)}
          >
            <Image
              src={img.url}
              alt={img.alt_text ?? ""}
              width={300}
              height={200}
              className="w-full h-auto object-contain rounded-md"
            />
            {!readOnly && index > 0 && (
              <button
                type="button"
                onClick={() => moveImage(index, index - 1)}
                className="absolute top-1 left-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
            )}
            {!readOnly && index < images.length - 1 && (
              <button
                type="button"
                onClick={() => moveImage(index, index + 1)}
                className="absolute top-1 left-8 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="h-3 w-3" />
              </button>
            )}
            {!readOnly && (
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>
      {!readOnly && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ImagePlus className="h-4 w-4 mr-2" />
            )}
            Add Images
          </Button>
        </>
      )}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer"
          onClick={() => setLightboxUrl(null)}
        >
          <button
            onClick={() => setLightboxUrl(null)}
            className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 z-10"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={lightboxUrl}
            alt=""
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
