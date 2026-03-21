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

    const counts: Record<string, { name: string; icon: string; count: number }> = {};
    for (const entry of thisMonthEntries) {
      const tt = entry.tracker_type;
      if (!tt) continue;
      if (!counts[tt.id]) {
        counts[tt.id] = { name: tt.name, icon: tt.icon, count: 0 };
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
            {monthlyStats.map((stat) => (
              <Card key={stat.name} size="sm">
                <CardHeader>
                  <CardTitle>
                    <span className="mr-2">{stat.icon}</span>
                    {stat.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{stat.count}</p>
                </CardContent>
              </Card>
            ))}
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
