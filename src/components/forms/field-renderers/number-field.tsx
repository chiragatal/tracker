"use client";

import { Input } from "@/components/ui/input";
import { registerField, type FieldRendererProps } from "../field-registry";

function NumberField({ field, value, onChange, readOnly }: FieldRendererProps) {
  const num = value as number | undefined;

  if (readOnly) {
    return (
      <p className="text-sm text-muted-foreground">
        {num !== undefined && num !== null ? num : "—"}
      </p>
    );
  }

  return (
    <Input
      type="number"
      value={num ?? ""}
      onChange={(e) => {
        const val = e.target.value;
        onChange(val === "" ? undefined : Number(val));
      }}
      placeholder={`Enter ${field.label.toLowerCase()}...`}
    />
  );
}

registerField("number", NumberField);
