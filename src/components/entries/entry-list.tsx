"use client";

import { useState } from "react";
import { EntryCard } from "@/components/entries/entry-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import type { Entry } from "@/types/tracker";

const INITIAL_DISPLAY_COUNT = 12;

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
  const [showAll, setShowAll] = useState(false);

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

  const hasMore = entries.length > INITIAL_DISPLAY_COUNT;
  const visibleEntries = showAll ? entries : entries.slice(0, INITIAL_DISPLAY_COUNT);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleEntries.map((entry) => (
          <EntryCard key={entry.id} entry={entry} />
        ))}
      </div>
      {hasMore && !showAll && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outline"
            onClick={() => setShowAll(true)}
          >
            Show more ({entries.length - INITIAL_DISPLAY_COUNT} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}
