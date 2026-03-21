"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEntry, useEntries } from "@/lib/hooks/use-entries";
import { DynamicForm } from "@/components/forms/dynamic-form";
import { PageHeader } from "@/components/shared/page-header";
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function EditEntryPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const markDone = searchParams.get("markDone") === "true";

  const { entry, loading } = useEntry(id);
  const { update } = useEntries();

  const [data, setData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (entry) {
      const entryData: Record<string, unknown> = { ...(entry.data ?? {}) };
      // Populate derived fields into data if not already present
      if (!entryData.name && entry.title) {
        entryData.name = entry.title;
      }
      if (!entryData.status && entry.status) {
        entryData.status = entry.status === "want_to" ? "Want to" : "Done";
      }
      if (!entryData.notes && entry.notes) {
        entryData.notes = entry.notes;
      }
      // If markDone, set the status field to "Done"
      if (markDone) {
        entryData.status = "Done";
      }
      setData(entryData);
    }
  }, [entry, markDone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const fields = entry?.tracker_type?.fields ?? [];

      // Derive title from "name" field or first text field
      const nameField = fields.find(f => f.key === "name" || f.label.toLowerCase() === "name");
      const firstTextField = fields.find(f => f.type === "text");
      const title = (data[nameField?.key ?? ""] as string) || (data[firstTextField?.key ?? ""] as string) || "Untitled";

      // Derive status from "status" field
      const statusField = fields.find(f => f.key === "status");
      const statusValue = statusField ? (data[statusField.key] as string) : null;
      const status = statusValue === "Want to" ? "want_to" : "done";

      // Derive notes from "notes" field or first long_text field
      const notesField = fields.find(f => f.key === "notes" || f.type === "long_text");
      const notes = notesField ? (data[notesField.key] as string) || null : null;

      await update(id, {
        title: title.trim(),
        status,
        data,
        notes,
      });
      router.push(`/entry/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update entry");
      setSaving(false);
    }
  };

  if (loading) return <CardGridSkeleton count={1} />;
  if (!entry) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Entry not found.</p>
      </div>
    );
  }

  const fields = entry.tracker_type?.fields ?? [];

  return (
    <div>
      <PageHeader
        title={markDone ? "Mark as Done" : "Edit Entry"}
        description={markDone ? `Marking "${entry.title}" as done.` : `Editing "${entry.title}".`}
      />

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* All fields from tracker schema */}
        {fields.length > 0 && (
          <DynamicForm fields={fields} values={data} onChange={setData} />
        )}

        <Button type="submit" disabled={saving} className="w-full">
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {markDone ? "Mark as Done" : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
