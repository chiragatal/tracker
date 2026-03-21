"use client";

import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { registerField, type FieldRendererProps } from "../field-registry";

function DateField({ field, value, onChange, readOnly }: FieldRendererProps) {
  const dateStr = (value as string) ?? "";

  if (readOnly) {
    return (
      <p className="text-sm text-muted-foreground">
        {dateStr ? formatDate(dateStr) : "—"}
      </p>
    );
  }

  return (
    <Input
      type="date"
      value={dateStr}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Select ${field.label.toLowerCase()}...`}
    />
  );
}

registerField("date", DateField);
