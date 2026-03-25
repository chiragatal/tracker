"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, X as XIcon } from "lucide-react";
import { useImageUpload } from "@/lib/hooks/use-image-upload";
import { registerField, type FieldRendererProps } from "../field-registry";

function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-pointer"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 z-10"
      >
        <XIcon className="h-5 w-5" />
      </button>
      <img
        src={src}
        alt=""
        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function ImageField({ value, onChange, readOnly }: FieldRendererProps) {
  const imageUrl = (value as string) ?? "";
  const { upload, uploading } = useImageUpload();
  const inputRef = useRef<HTMLInputElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { publicUrl } = await upload(file);
    onChange(publicUrl);
  };

  if (readOnly) {
    if (!imageUrl) return <p className="text-sm text-muted-foreground">—</p>;
    return (
      <>
        <div
          className="relative w-full max-w-sm overflow-hidden rounded-md cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => setLightboxOpen(true)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className="w-full h-auto object-contain rounded-md"
          />
        </div>
        {lightboxOpen && (
          <ImageLightbox src={imageUrl} onClose={() => setLightboxOpen(false)} />
        )}
      </>
    );
  }

  return (
    <div className="space-y-2">
      {imageUrl && (
        <div className="relative group w-full max-w-sm overflow-hidden rounded-md">
          <Image
            src={imageUrl}
            alt=""
            width={400}
            height={300}
            className="w-full h-auto object-contain rounded-md cursor-pointer"
            onClick={() => setLightboxOpen(true)}
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <XIcon className="h-3 w-3" />
          </button>
        </div>
      )}
      {lightboxOpen && imageUrl && (
        <ImageLightbox src={imageUrl} onClose={() => setLightboxOpen(false)} />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
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
        {imageUrl ? "Replace Image" : "Upload Image"}
      </Button>
    </div>
  );
}

registerField("image", ImageField);
