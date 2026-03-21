"use client";

import { EntityCard } from "@/components/shared/entity-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Star } from "lucide-react";
import type { Entry } from "@/types/tracker";

interface EntryCardProps {
  entry: Entry;
}

export function EntryCard({ entry }: EntryCardProps) {
  const firstImage = entry.images?.[0]?.url;
  const trackerIcon = entry.tracker_type?.icon;
  const trackerName = entry.tracker_type?.name;
  const dateSource = (entry.data?.entry_date as string) ?? entry.created_at;
  const date = new Date(dateSource).toLocaleDateString();

  const previewFields = entry.tracker_type?.fields
    .filter(f => f.type === "text" && entry.data[f.key])
    .slice(0, 2)
    .map(f => `${f.label}: ${entry.data[f.key]}`) ?? [];

  const ratingKey = entry.tracker_type?.fields
    .find(f => f.type === "rating")
    ?.key;
  const ratingValue = ratingKey ? (entry.data[ratingKey] as number) : null;

  return (
    <EntityCard
      href={`/entry/${entry.id}`}
      title={entry.title}
      subtitle={trackerName}
      icon={trackerIcon}
      imageUrl={firstImage}
      badge={<StatusBadge status={entry.status} />}
      metadata={
        <div className="space-y-1">
          {ratingValue != null && ratingValue > 0 && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < ratingValue
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          )}
          {previewFields.length > 0 && (
            <p className="text-xs text-muted-foreground truncate">
              {previewFields.join(" · ")}
            </p>
          )}
          <p className="text-xs text-muted-foreground">{date}</p>
        </div>
      }
    />
  );
}
