"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useEntry, useEntries } from "@/lib/hooks/use-entries";
import { DynamicForm } from "@/components/forms/dynamic-form";
import { ImageGallery } from "@/components/shared/image-gallery";
import { PageHeader } from "@/components/shared/page-header";
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { EntryImage, EntryStatus } from "@/types/tracker";

export default function EditEntryPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const markDone = searchParams.get("markDone") === "true";

  const { entry, loading } = useEntry(id);
  const { update } = useEntries();

  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<EntryStatus>("done");
  const [data, setData] = useState<Record<string, unknown>>({});
  const [images, setImages] = useState<EntryImage[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setStatus(markDone ? "done" : entry.status);
      setData(entry.data ?? {});
      setImages(entry.images ?? []);
      setNotes(entry.notes ?? "");
    }
  }, [entry, markDone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setError(null);
    setSaving(true);
    try {
      await update(
        id,
        {
          title: title.trim(),
          status,
          data,
          notes: notes.trim() || null,
        },
        images
      );
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
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(val) => setStatus(val as EntryStatus)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="want_to">Want to</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {fields.length > 0 && (
          <div className="space-y-2">
            <Label>Details</Label>
            <DynamicForm fields={fields} values={data} onChange={setData} />
          </div>
        )}

        <div className="space-y-2">
          <Label>Images</Label>
          <ImageGallery images={images} onChange={setImages} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <Button type="submit" disabled={saving || !title.trim()} className="w-full">
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {markDone ? "Mark as Done" : "Save Changes"}
        </Button>
      </form>
    </div>
  );
}
