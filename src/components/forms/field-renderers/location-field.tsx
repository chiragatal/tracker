"use client";

import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { registerField, type FieldRendererProps } from "../field-registry";

function LocationField({
  field,
  value,
  onChange,
  readOnly,
}: FieldRendererProps) {
  const location = (value as string) ?? "";

  if (readOnly) {
    if (!location) return <p className="text-sm text-muted-foreground">—</p>;
    return (
      <div className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" />
        {location}
      </div>
    );
  }

  return (
    <Input
      type="text"
      value={location}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Enter ${field.label.toLowerCase()}...`}
    />
  );
}

registerField("location", LocationField);
