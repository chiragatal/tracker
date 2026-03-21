"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { registerField, type FieldRendererProps } from "../field-registry";

function TextField({ field, value, onChange, readOnly }: FieldRendererProps) {
  const text = (value as string) ?? "";

  if (readOnly) {
    return <p className="text-sm text-muted-foreground">{text || "—"}</p>;
  }

  if (field.type === "long_text") {
    return (
      <Textarea
        value={text}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Enter ${field.label.toLowerCase()}...`}
        rows={4}
      />
    );
  }

  return (
    <Input
      type="text"
      value={text}
      onChange={(e) => onChange(e.target.value)}
      placeholder={`Enter ${field.label.toLowerCase()}...`}
    />
  );
}

registerField("text", TextField);
registerField("long_text", TextField);
