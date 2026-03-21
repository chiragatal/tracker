"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTrackerTypes } from "@/lib/hooks/use-tracker-types";
import { useUserTrackers } from "@/lib/hooks/use-user-trackers";
import { TrackerGrid } from "@/components/trackers/tracker-grid";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { Plus } from "lucide-react";

export default function DiscoverPage() {
  const { trackerTypes, loading: typesLoading } = useTrackerTypes();
  const { subscribe, unsubscribe, isSubscribed, loading: userLoading } =
    useUserTrackers();
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id);
    });
  }, [supabase]);

  const loading = typesLoading || userLoading;

  const handleToggle = async (trackerTypeId: string) => {
    if (isSubscribed(trackerTypeId)) {
      await unsubscribe(trackerTypeId);
    } else {
      await subscribe(trackerTypeId);
    }
  };

  return (
    <div>
      <PageHeader
        title="What do you want to track?"
        description="Subscribe to trackers or create your own."
        actions={
          <Link
            href="/tracker/new"
            className={buttonVariants()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Tracker
          </Link>
        }
      />

      {loading ? (
        <CardGridSkeleton />
      ) : trackerTypes.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No trackers yet"
          description="Be the first to create a tracker and start organizing what matters to you."
          actionLabel="Create Tracker"
          actionHref="/tracker/new"
        />
      ) : (
        <TrackerGrid
          trackers={trackerTypes}
          isSubscribed={isSubscribed}
          onToggle={handleToggle}
          currentUserId={userId}
        />
      )}
    </div>
  );
}
