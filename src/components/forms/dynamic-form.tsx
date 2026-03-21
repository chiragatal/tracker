"use client";

import "@/components/forms/field-renderers";
import { getFieldRenderer } from "./field-registry";
import { Label } from "@/components/ui/label";
import type { FieldDefinition } from "@/types/tracker";

interface DynamicFormProps {
  fields: FieldDefinition[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  readOnly?: boolean;
}

export function DynamicForm({
  fields,
  values,
  onChange,
  readOnly = false,
}: DynamicFormProps) {
  return (
    <div className="space-y-6">
      {fields.map((field) => {
        const Renderer = getFieldRenderer(field.type);
        if (!Renderer) return null;
        return (
          <div key={field.key} className="space-y-2">
            {field.type !== "checkbox" && (
              <Label>
                {field.label}
                {field.required && (
                  <span className="text-destructive ml-1">*</span>
                )}
              </Label>
            )}
            <Renderer
              field={field}
              value={values[field.key]}
              onChange={(val) => onChange({ ...values, [field.key]: val })}
              readOnly={readOnly}
            />
          </div>
        );
      })}
    </div>
  );
}
