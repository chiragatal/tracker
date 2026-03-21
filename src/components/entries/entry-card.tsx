"use client";

import { EntityCard } from "@/components/shared/entity-card";
import { StatusBadge } from "@/components/shared/status-badge";
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

  return (
    <EntityCard
      href={`/entry/${entry.id}`}
      title={entry.title}
      subtitle={trackerName}
      icon={trackerIcon}
      imageUrl={firstImage}
      badge={<StatusBadge status={entry.status} />}
      metadata={
        <p className="text-xs text-muted-foreground">{date}</p>
      }
    />
  );
}
