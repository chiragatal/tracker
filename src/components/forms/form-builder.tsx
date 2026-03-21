"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ChevronUp, ChevronDown, Trash2, Plus, X } from "lucide-react";
import { slugify } from "@/lib/utils";
import { FIELD_TYPES, type FieldDefinition, type FieldType } from "@/types/tracker";

interface FormBuilderProps {
  fields: FieldDefinition[];
  onChange: (fields: FieldDefinition[]) => void;
  /** Number of original fields that are locked (have existing entries). These can be renamed but not deleted or type-changed. */
  lockedFieldCount?: number;
}

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Text",
  long_text: "Long Text",
  number: "Number",
  date: "Date",
  rating: "Rating",
  image: "Image",
  url: "URL",
  tags: "Tags",
  location: "Location",
  price: "Price",
  duration: "Duration",
  checkbox: "Checkbox",
  dropdown: "Dropdown",
};

function DropdownOptionsEditor({
  options,
  onChange,
}: {
  options: string[];
  onChange: (options: string[]) => void;
}) {
  const [input, setInput] = useState("");

  const addOption = () => {
    const trimmed = input.trim();
    if (trimmed && !options.includes(trimmed)) {
      onChange([...options, trimmed]);
    }
    setInput("");
  };

  return (
    <div className="space-y-2 ml-6 mt-2">
      <Label className="text-xs text-muted-foreground">Options</Label>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => (
          <span
            key={opt}
            className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs"
          >
            {opt}
            <button
              type="button"
              onClick={() => onChange(options.filter((o) => o !== opt))}
              className="hover:text-destructive"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-1">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addOption();
            }
          }}
          placeholder="Add option..."
          className="h-7 text-xs"
        />
        <Button
          type="button"
          variant="outline"
          size="xs"
          onClick={addOption}
        >
          Add
        </Button>
      </div>
    </div>
  );
}

export function FormBuilder({ fields, onChange, lockedFieldCount = 0 }: FormBuilderProps) {
  const addField = useCallback(() => {
    const newField: FieldDefinition = {
      key: `field_${Date.now()}`,
      label: "",
      type: "text",
      required: false,
    };
    onChange([...fields, newField]);
  }, [fields, onChange]);

  const updateField = useCallback(
    (index: number, updates: Partial<FieldDefinition>) => {
      const updated = fields.map((f, i) => {
        if (i !== index) return f;
        const merged = { ...f, ...updates };
        // Auto-generate key from label
        if (updates.label !== undefined) {
          merged.key = slugify(updates.label) || `field_${Date.now()}`;
        }
        // Add options array for dropdown type
        if (updates.type === "dropdown" && !merged.options) {
          merged.options = [];
        }
        // Remove options for non-dropdown types
        if (updates.type && updates.type !== "dropdown") {
          delete merged.options;
        }
        return merged;
      });
      onChange(updated);
    },
    [fields, onChange]
  );

  const removeField = useCallback(
    (index: number) => {
      onChange(fields.filter((_, i) => i !== index));
    },
    [fields, onChange]
  );

  const moveField = useCallback(
    (index: number, direction: -1 | 1) => {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= fields.length) return;
      const updated = [...fields];
      [updated[index], updated[newIndex]] = [
        updated[newIndex],
        updated[index],
      ];
      onChange(updated);
    },
    [fields, onChange]
  );

  return (
    <div className="space-y-4">
      {fields.map((field, index) => {
        const isLocked = index < lockedFieldCount;
        return (
        <Card key={index} className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex flex-col gap-0.5 pt-1">
              <button
                type="button"
                onClick={() => moveField(index, -1)}
                disabled={index === 0}
                className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5 rounded hover:bg-muted"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => moveField(index, 1)}
                disabled={index === fields.length - 1}
                className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5 rounded hover:bg-muted"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">Label</Label>
                  <Input
                    type="text"
                    value={field.label}
                    onChange={(e) =>
                      updateField(index, { label: e.target.value })
                    }
                    placeholder="Field label..."
                  />
                </div>
                <div className="w-40">
                  <Label className="text-xs text-muted-foreground">Type</Label>
                  {isLocked ? (
                    <div className="h-8 flex items-center px-2 text-sm text-muted-foreground bg-muted/50 rounded-md">
                      {FIELD_TYPE_LABELS[field.type]}
                    </div>
                  ) : (
                    <Select
                      value={field.type}
                      onValueChange={(val) =>
                        updateField(index, { type: val as FieldType })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {FIELD_TYPE_LABELS[type]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={field.required ?? false}
                  onCheckedChange={(checked) =>
                    updateField(index, { required: !!checked })
                  }
                />
                <Label className="text-xs cursor-pointer">Required</Label>
                <span className="text-xs text-muted-foreground ml-auto">
                  key: {field.key}
                </span>
              </div>

              {field.type === "dropdown" && (
                <DropdownOptionsEditor
                  options={field.options ?? []}
                  onChange={(options) => updateField(index, { options })}
                />
              )}
            </div>

            {isLocked ? (
              <div className="w-8 h-8 flex items-center justify-center" title="Cannot delete — has entries">
                <Trash2 className="h-4 w-4 text-muted-foreground/30" />
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeField(index)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
        );
      })}

      <Button type="button" variant="outline" onClick={addField} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Field
      </Button>
    </div>
  );
}
