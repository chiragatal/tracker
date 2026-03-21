"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { registerField, type FieldRendererProps } from "../field-registry";

function CheckboxField({
  field,
  value,
  onChange,
  readOnly,
}: FieldRendererProps) {
  const checked = (value as boolean) ?? false;

  return (
    <div className="flex items-center gap-2">
      <Checkbox
        checked={checked}
        onCheckedChange={(val) => onChange(val)}
        disabled={readOnly}
      />
      <Label className="cursor-pointer">{field.label}</Label>
    </div>
  );
}

registerField("checkbox", CheckboxField);
