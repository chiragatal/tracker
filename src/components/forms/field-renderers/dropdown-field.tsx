"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerField, type FieldRendererProps } from "../field-registry";

function DropdownField({
  field,
  value,
  onChange,
  readOnly,
}: FieldRendererProps) {
  const selected = (value as string) ?? "";
  const options = field.options ?? [];

  if (readOnly) {
    return (
      <p className="text-sm text-muted-foreground">{selected || "—"}</p>
    );
  }

  return (
    <Select value={selected} onValueChange={(val) => onChange(val)}>
      <SelectTrigger>
        <SelectValue placeholder={`Select ${field.label.toLowerCase()}...`} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

registerField("dropdown", DropdownField);
