"use client";

import { EntryCard } from "@/components/entries/entry-card";
import { EmptyState } from "@/components/shared/empty-state";
import type { Entry } from "@/types/tracker";

interface EntryListProps {
  entries: Entry[];
  emptyIcon?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  emptyActionHref?: string;
}

export function EntryList({
  entries,
  emptyIcon = "📝",
  emptyTitle = "No entries yet",
  emptyDescription = "Create your first entry to get started.",
  emptyActionLabel = "New Entry",
  emptyActionHref = "/new",
}: EntryListProps) {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        actionHref={emptyActionHref}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {entries.map((entry) => (
        <EntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
