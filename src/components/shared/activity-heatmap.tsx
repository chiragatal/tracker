"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import type { Entry } from "@/types/tracker";

interface ActivityHeatmapProps {
  entries: Entry[];
}

export function ActivityHeatmap({ entries }: ActivityHeatmapProps) {
  const { grid } = useMemo(() => {
    const today = new Date();
    const counts = new Map<string, number>();

    for (const entry of entries) {
      const date =
        (entry.data?.entry_date as string) ?? entry.created_at.split("T")[0];
      counts.set(date, (counts.get(date) ?? 0) + 1);
    }

    const days: { date: string; count: number }[] = [];
    let max = 0;
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const count = counts.get(key) ?? 0;
      if (count > max) max = count;
      days.push({ date: key, count });
    }

    return { grid: days, maxCount: max };
  }, [entries]);

  const getColor = (count: number) => {
    if (count === 0) return "bg-muted/30";
    if (count === 1) return "bg-emerald-900/60";
    if (count <= 3) return "bg-emerald-600/60";
    return "bg-emerald-400/80";
  };

  return (
    <div>
      <div className="flex gap-[3px] flex-wrap">
        {grid.map((day) => (
          <div
            key={day.date}
            className={cn("w-3 h-3 rounded-sm", getColor(day.count))}
            title={`${day.date}: ${day.count} entries`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-muted/30" />
          <div className="w-3 h-3 rounded-sm bg-emerald-900/60" />
          <div className="w-3 h-3 rounded-sm bg-emerald-600/60" />
          <div className="w-3 h-3 rounded-sm bg-emerald-400/80" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
