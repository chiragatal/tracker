"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTrackerTypes } from "@/lib/hooks/use-tracker-types";
import { FormBuilder } from "@/components/forms/form-builder";
import { DynamicForm } from "@/components/forms/dynamic-form";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { EmojiPicker } from "@/components/shared/emoji-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { FieldDefinition } from "@/types/tracker";

const DEFAULT_FIELDS: FieldDefinition[] = [
  { key: "name", label: "Name", type: "text", required: true },
  { key: "status", label: "Status", type: "dropdown", required: false, options: ["Done", "Want to"] },
  { key: "date", label: "Date", type: "date", required: false },
  { key: "rating", label: "Rating", type: "rating", required: false },
  { key: "notes", label: "Notes", type: "long_text", required: false },
];

export default function NewTrackerPage() {
  const router = useRouter();
  const { create } = useTrackerTypes();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FieldDefinition[]>(DEFAULT_FIELDS);
  const [previewValues, setPreviewValues] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    setSaving(true);
    try {
      const tracker = await create({
        name: name.trim(),
        icon: icon || "📋",
        description: description.trim(),
        fields,
      });
      toast.success("Tracker created!");
      router.push(`/track/${tracker.slug}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create tracker";
      setError(message);
      toast.error(message);
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Create Tracker" description="Define a new tracker type with custom fields." />

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Books, Movies, Recipes..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <EmojiPicker value={icon} onChange={setIcon} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will this tracker help you track?"
              />
            </div>

            <div className="space-y-2">
              <Label>Fields</Label>
              <FormBuilder fields={fields} onChange={setFields} />
            </div>

            <Button type="submit" disabled={saving || !name.trim()} className="w-full">
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Create Tracker
            </Button>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>{icon || "📋"}</span>
                  <span>{name || "Preview"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {fields.length > 0 ? (
                  <DynamicForm
                    fields={fields}
                    values={previewValues}
                    onChange={setPreviewValues}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Add fields to see a preview of your tracker form.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
