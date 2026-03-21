"use client";

import { Input } from "@/components/ui/input";
import { ExternalLink } from "lucide-react";
import { registerField, type FieldRendererProps } from "../field-registry";

function UrlField({ field, value, onChange, readOnly }: FieldRendererProps) {
  const url = (value as string) ?? "";

  if (readOnly) {
    if (!url) return <p className="text-sm text-muted-foreground">—</p>;
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        {url}
        <ExternalLink className="h-3 w-3" />
      </a>
    );
  }

  return (
    <Input
      type="url"
      value={url}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Enter ${field.label.toLowerCase()} URL...`}
    />
  );
}

registerField("url", UrlField);
