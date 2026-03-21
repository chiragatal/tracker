"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserTrackers } from "@/lib/hooks/use-user-trackers";
import { useEntries, useEntry } from "@/lib/hooks/use-entries";
import { DynamicForm } from "@/components/forms/dynamic-form";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { TrackerType } from "@/types/tracker";

export default function NewEntryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTracker = searchParams.get("tracker");
  const prefillEntryId = searchParams.get("prefill");
  const { subscribedTypes, loading: trackersLoading } = useUserTrackers();
  const { create } = useEntries();
  const { entry: prefillEntry, loading: prefillLoading } = useEntry(prefillEntryId ?? "");

  const [trackerTypeId, setTrackerTypeId] = useState("");
  const [prefilled, setPrefilled] = useState(false);
  const [data, setData] = useState<Record<string, unknown>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preselect tracker from query param
  useEffect(() => {
    if (preselectedTracker && subscribedTypes.length > 0 && !trackerTypeId) {
      const match = subscribedTypes.find((t) => t.id === preselectedTracker);
      if (match) setTrackerTypeId(match.id);
    }
  }, [preselectedTracker, subscribedTypes, trackerTypeId]);

  // Prefill from existing entry (duplicate / "Track Again")
  useEffect(() => {
    if (prefillEntry && !prefilled) {
      setPrefilled(true);
      setTrackerTypeId(prefillEntry.tracker_type_id);
      // Populate data from existing entry's data, plus derived fields
      const prefillData: Record<string, unknown> = { ...(prefillEntry.data ?? {}) };
      // Ensure name field is populated from title if not already in data
      if (!prefillData.name && prefillEntry.title) {
        prefillData.name = `Copy of ${prefillEntry.title}`;
      }
      // Ensure status field is populated
      if (!prefillData.status && prefillEntry.status) {
        prefillData.status = prefillEntry.status === "want_to" ? "Want to" : "Done";
      }
      // Ensure notes field is populated
      if (!prefillData.notes && prefillEntry.notes) {
        prefillData.notes = prefillEntry.notes;
      }
      setData(prefillData);
    }
  }, [prefillEntry, prefilled]);

  const selectedTracker: TrackerType | undefined = subscribedTypes.find(
    (t) => t.id === trackerTypeId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackerTypeId) return;
    setError(null);
    setSaving(true);
    try {
      // Derive title from "name" field or first text field
      const nameField = selectedTracker?.fields.find(f => f.key === "name" || f.label.toLowerCase() === "name");
      const firstTextField = selectedTracker?.fields.find(f => f.type === "text");
      const title = (data[nameField?.key ?? ""] as string) || (data[firstTextField?.key ?? ""] as string) || "Untitled";

      // Derive status from "status" field
      const statusField = selectedTracker?.fields.find(f => f.key === "status");
      const statusValue = statusField ? (data[statusField.key] as string) : null;
      const status = statusValue === "Want to" ? "want_to" : "done";

      // Derive notes from "notes" field or first long_text field
      const notesField = selectedTracker?.fields.find(f => f.key === "notes" || f.type === "long_text");
      const notes = notesField ? (data[notesField.key] as string) || null : null;

      const entry = await create({
        tracker_type_id: trackerTypeId,
        title,
        status,
        data,
        notes,
      });
      router.push(`/entry/${entry.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create entry";
      setError(message);
      toast.error(message);
      setSaving(false);
    }
  };

  if (trackersLoading || (prefillEntryId && prefillLoading)) return <CardGridSkeleton />;

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
        {/* Tracker selector */}
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

        {/* All fields from tracker schema */}
        {selectedTracker && (
          <DynamicForm
            fields={selectedTracker.fields}
            values={data}
            onChange={setData}
          />
        )}

        <Button type="submit" disabled={saving || !trackerTypeId} className="w-full">
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Create Entry
        </Button>
      </form>
    </div>
  );
}
