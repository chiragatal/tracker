"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUserTrackers } from "@/lib/hooks/use-user-trackers";
import { useEntries } from "@/lib/hooks/use-entries";
import { DynamicForm } from "@/components/forms/dynamic-form";
import { ImageGallery } from "@/components/shared/image-gallery";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
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
import type { EntryImage, EntryStatus, TrackerType } from "@/types/tracker";

export default function NewEntryPage() {
  const router = useRouter();
  const { subscribedTypes, loading: trackersLoading } = useUserTrackers();
  const { create } = useEntries();

  const [trackerTypeId, setTrackerTypeId] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<EntryStatus>("done");
  const [data, setData] = useState<Record<string, unknown>>({});
  const [images, setImages] = useState<EntryImage[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedTracker: TrackerType | undefined = subscribedTypes.find(
    (t) => t.id === trackerTypeId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackerTypeId || !title.trim()) return;
    setError(null);
    setSaving(true);
    try {
      const entry = await create(
        {
          tracker_type_id: trackerTypeId,
          title: title.trim(),
          status,
          data,
          notes: notes.trim() || null,
        },
        images.length > 0 ? images : undefined
      );
      router.push(`/entry/${entry.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create entry");
      setSaving(false);
    }
  };

  if (trackersLoading) return <CardGridSkeleton />;

  if (subscribedTypes.length === 0) {
    return (
      <div>
        <PageHeader title="New Entry" />
        <EmptyState
          icon="📋"
          title="No subscribed trackers"
          description="Subscribe to a tracker first before creating entries."
          actionLabel="Discover Trackers"
          actionHref="/discover"
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="New Entry" description="Log something new." />

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <Label>Tracker</Label>
          <Select
            value={trackerTypeId}
            onValueChange={(v) => {
              setTrackerTypeId(v ?? "");
              setData({});
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a tracker...">
                {selectedTracker ? (
                  <span>{selectedTracker.icon} {selectedTracker.name}</span>
                ) : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {subscribedTypes.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  <span className="mr-2">{t.icon}</span>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What are you tracking?"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(val) => { if (val) setStatus(val as EntryStatus); }}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="want_to">Want to</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedTracker && selectedTracker.fields.length > 0 && (
          <div className="space-y-2">
            <Label>Details</Label>
            <DynamicForm
              fields={selectedTracker.fields}
              values={data}
              onChange={setData}
            />
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
            placeholder="Any additional notes..."
          />
        </div>

        <Button type="submit" disabled={saving || !trackerTypeId || !title.trim()} className="w-full">
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Create Entry
        </Button>
      </form>
    </div>
  );
}
