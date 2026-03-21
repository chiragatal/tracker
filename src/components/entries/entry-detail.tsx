"use client";

import { StatusBadge } from "@/components/shared/status-badge";
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

  // Derive date from data's date field, legacy entry_date, or created_at
  const dateField = fields.find(f => f.type === "date");
  const dateSource = (dateField ? entry.data?.[dateField.key] as string : null)
    ?? (entry.data?.entry_date as string)
    ?? entry.created_at;

  return (
    <div className="space-y-6 animate-fade-in">
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
                {formatDate(dateSource)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* All fields from tracker schema (read-only) */}
      {fields.length > 0 && (
        <Card className="gradient-border">
          <CardContent className="pt-6">
            <DynamicForm
              fields={fields}
              values={entry.data ?? {}}
              onChange={() => {}}
              readOnly
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
