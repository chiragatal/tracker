"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useEntries } from "@/lib/hooks/use-entries";
import { useUserTrackers } from "@/lib/hooks/use-user-trackers";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { EntryList } from "@/components/entries/entry-list";
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";

const TRACKER_COLORS: Record<string, { gradient: string; border: string; text: string }> = {
  coffee: { gradient: "from-emerald-500/20 to-emerald-500/5", border: "border-emerald-500/20", text: "text-emerald-400" },
  books: { gradient: "from-blue-500/20 to-blue-500/5", border: "border-blue-500/20", text: "text-blue-400" },
  recipes: { gradient: "from-orange-500/20 to-orange-500/5", border: "border-orange-500/20", text: "text-orange-400" },
};

const DEFAULT_COLOR = { gradient: "from-violet-500/20 to-violet-500/5", border: "border-violet-500/20", text: "text-violet-400" };

export default function DashboardPage() {
  const { entries, loading: entriesLoading } = useEntries({ limit: 20 });
  const { subscribedTypes, loading: trackersLoading } = useUserTrackers();

  const loading = entriesLoading || trackersLoading;

  const monthlyStats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEntries = entries.filter(
      (e) => new Date(e.created_at) >= startOfMonth
    );

    const counts: Record<string, { name: string; slug: string; icon: string; count: number }> = {};
    for (const entry of thisMonthEntries) {
      const tt = entry.tracker_type;
      if (!tt) continue;
      if (!counts[tt.id]) {
        counts[tt.id] = { name: tt.name, slug: tt.slug ?? tt.name.toLowerCase(), icon: tt.icon, count: 0 };
      }
      counts[tt.id].count++;
    }
    return Object.values(counts);
  }, [entries]);

  if (loading) {
    return <CardGridSkeleton />;
  }

  if (subscribedTypes.length === 0) {
    return (
      <EmptyState
        icon="🧭"
        title="No trackers yet"
        description="Subscribe to tracker types to start logging your experiences."
        actionLabel="Discover Trackers"
        actionHref="/discover"
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Your tracking overview"
        actions={
          <Link href="/new" className={buttonVariants()}>
            New Entry
          </Link>
        }
      />

      {monthlyStats.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">This Month</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {monthlyStats.map((stat) => {
              const colors = TRACKER_COLORS[stat.slug] ?? DEFAULT_COLOR;
              return (
                <Card key={stat.name} size="sm" className={`bg-gradient-to-br ${colors.gradient} ${colors.border} border card-glow`}>
                  <CardHeader>
                    <CardTitle>
                      <span className="mr-2 text-lg">{stat.icon}</span>
                      {stat.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className={`text-3xl font-bold ${colors.text}`}>{stat.count}</p>
                    <p className="text-xs text-muted-foreground mt-1">this month</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <EntryList entries={entries} />
      </section>
    </div>
  );
}
