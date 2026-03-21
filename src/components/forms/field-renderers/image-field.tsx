"use client";

import { useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useImageUpload } from "@/lib/hooks/use-image-upload";
import { registerField, type FieldRendererProps } from "../field-registry";

function ImageField({ value, onChange, readOnly }: FieldRendererProps) {
  const imageUrl = (value as string) ?? "";
  const { upload, uploading } = useImageUpload();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { publicUrl } = await upload(file);
    onChange(publicUrl);
  };

  if (readOnly) {
    if (!imageUrl) return <p className="text-sm text-muted-foreground">—</p>;
    return (
      <div className="relative aspect-video w-full max-w-sm overflow-hidden rounded-md">
        <Image
          src={imageUrl}
          alt=""
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {imageUrl && (
        <div className="relative group aspect-video w-full max-w-sm overflow-hidden rounded-md">
          <Image src={imageUrl} alt="" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
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
