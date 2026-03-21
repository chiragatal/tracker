"use client";

import { TrackerCard } from "@/components/trackers/tracker-card";
import type { TrackerType } from "@/types/tracker";

interface TrackerGridProps {
  trackers: TrackerType[];
  isSubscribed: (trackerTypeId: string) => boolean;
  onToggle: (trackerTypeId: string) => void;
  currentUserId?: string;
}

export function TrackerGrid({ trackers, isSubscribed, onToggle, currentUserId }: TrackerGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {trackers.map((tracker) => (
        <TrackerCard
          key={tracker.id}
          tracker={tracker}
          subscribed={isSubscribed(tracker.id)}
          isCreator={currentUserId ? tracker.created_by === currentUserId : false}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}
