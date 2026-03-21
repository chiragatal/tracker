"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import { ImageGallery } from "@/components/shared/image-gallery";
import { DynamicForm } from "@/components/forms/dynamic-form";
import type { Entry } from "@/types/tracker";

interface EntryDetailProps {
  entry: Entry;
}

export function EntryDetail({ entry }: EntryDetailProps) {
  const trackerIcon = entry.tracker_type?.icon;
  const fields = entry.tracker_type?.fields ?? [];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          {trackerIcon && <span className="text-3xl">{trackerIcon}</span>}
          <h1 className="text-3xl font-bold tracking-tight">{entry.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={entry.status} />
          {entry.tracker_type && (
            <span className="text-sm text-muted-foreground">
              {entry.tracker_type.name}
            </span>
          )}
          <span className="text-sm text-muted-foreground">
            {new Date(entry.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {entry.images && entry.images.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Images</h2>
          <ImageGallery images={entry.images} readOnly />
        </div>
      )}

      {fields.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Details</h2>
          <DynamicForm
            fields={fields}
            values={entry.data ?? {}}
            onChange={() => {}}
            readOnly
          />
        </div>
      )}

      {entry.notes && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Notes</h2>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {entry.notes}
          </p>
        </div>
      )}
    </div>
  );
}
