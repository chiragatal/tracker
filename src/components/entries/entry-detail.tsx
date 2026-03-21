"use client";

import { StatusBadge } from "@/components/shared/status-badge";
import { ImageGallery } from "@/components/shared/image-gallery";
import { DynamicForm } from "@/components/forms/dynamic-form";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import type { Entry } from "@/types/tracker";

interface EntryDetailProps {
  entry: Entry;
}

export function EntryDetail({ entry }: EntryDetailProps) {
  const trackerIcon = entry.tracker_type?.icon;
  const fields = entry.tracker_type?.fields ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {trackerIcon && <span className="text-4xl">{trackerIcon}</span>}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{entry.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <StatusBadge status={entry.status} />
              {entry.tracker_type && (
                <span className="text-sm text-muted-foreground">
                  {entry.tracker_type.name}
                </span>
              )}
              <span className="text-sm text-muted-foreground">
                {formatDate(entry.created_at)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      {entry.images && entry.images.length > 0 && (
        <Card className="gradient-border">
          <CardContent className="pt-6">
            <ImageGallery images={entry.images} readOnly />
          </CardContent>
        </Card>
      )}

      {/* Dynamic fields */}
      {fields.length > 0 && (
        <Card className="gradient-border">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-4 text-gradient">Details</h2>
            <DynamicForm
              fields={fields}
              values={entry.data ?? {}}
              onChange={() => {}}
              readOnly
            />
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {entry.notes && (
        <Card className="gradient-border">
          <CardContent className="pt-6">
            <h2 className="text-lg font-semibold mb-2 text-gradient">Notes</h2>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {entry.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
