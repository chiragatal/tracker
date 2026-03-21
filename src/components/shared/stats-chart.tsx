"use client";

import { useMemo } from "react";
import type { Entry } from "@/types/tracker";

interface StatsChartProps {
  entries: Entry[];
}

export function StatsChart({ entries }: StatsChartProps) {
  const weeklyData = useMemo(() => {
    const weeks: { label: string; count: number }[] = [];
    const now = new Date();

    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7 + weekStart.getDay()));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const count = entries.filter((e) => {
        const d = new Date(
          (e.data?.entry_date as string) ?? e.created_at
        );
        return d >= weekStart && d <= weekEnd;
      }).length;

      const label = weekStart.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      weeks.push({ label, count });
    }

    return weeks;
  }, [entries]);

  const maxCount = Math.max(...weeklyData.map((w) => w.count), 1);

  return (
    <div>
      <div className="flex items-end gap-2 h-32">
        {weeklyData.map((week, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full flex items-end justify-center"
              style={{ height: "100px" }}
            >
              <div
                className="w-full max-w-8 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-sm transition-all"
                style={{
                  height: `${Math.max(
                    (week.count / maxCount) * 100,
                    week.count > 0 ? 8 : 2
                  )}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-muted-foreground">
              {week.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
