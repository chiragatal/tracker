"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTrackerType } from "@/lib/hooks/use-tracker-types";
import { createClient } from "@/lib/supabase/client";
import { FormBuilder } from "@/components/forms/form-builder";
import { DynamicForm } from "@/components/forms/dynamic-form";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import { Loader2, AlertTriangle } from "lucide-react";
import type { FieldDefinition } from "@/types/tracker";

export default function EditTrackerPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const { trackerType, loading } = useTrackerType(slug);
  const supabase = useMemo(() => createClient(), []);

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FieldDefinition[]>([]);
  const [previewValues, setPreviewValues] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasEntries, setHasEntries] = useState(false);

  useEffect(() => {
    if (trackerType) {
      setName(trackerType.name);
      setIcon(trackerType.icon);
      setDescription(trackerType.description);
      setFields(trackerType.fields);
    }
  }, [trackerType]);

  useEffect(() => {
    if (!trackerType) return;
    async function checkEntries() {
      const { count } = await supabase
        .from("entries")
        .select("*", { count: "exact", head: true })
        .eq("tracker_type_id", trackerType!.id);
      setHasEntries((count ?? 0) > 0);
    }
    checkEntries();
  }, [trackerType, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackerType || !name.trim()) return;
    setError(null);
    setSaving(true);
    try {
      const { error: updateError } = await supabase
        .from("tracker_types")
        .update({
          name: name.trim(),
          icon: icon || "📋",
          description: description.trim(),
          fields,
        })
        .eq("id", trackerType.id);
      if (updateError) throw updateError;
      router.push(`/track/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update tracker");
      setSaving(false);
    }
  };

  if (loading) return <CardGridSkeleton />;
  if (!trackerType) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Tracker not found.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={`Edit ${trackerType.name}`} description="Update your tracker type." />

      {hasEntries && (
        <div className="flex items-center gap-2 rounded-md bg-yellow-500/10 border border-yellow-500/20 p-3 text-sm text-yellow-700 dark:text-yellow-400 mb-6">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p>
            This tracker has existing entries. Only additive changes are recommended
            (adding new fields). Removing or renaming fields may break existing data.
          </p>
        </div>
      )}

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
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="icon">Icon (emoji)</Label>
              <Input
                id="icon"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Fields</Label>
              <FormBuilder
                fields={fields}
                onChange={setFields}
                lockedFieldCount={hasEntries ? (trackerType?.fields.length ?? 0) : 0}
              />
            </div>

            <Button type="submit" disabled={saving || !name.trim()} className="w-full">
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
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
                    Add fields to see a preview.
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
