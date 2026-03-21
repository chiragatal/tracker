"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTrackerType } from "@/lib/hooks/use-tracker-types";
import { useEntries } from "@/lib/hooks/use-entries";
import { createClient } from "@/lib/supabase/client";
import { PageHeader } from "@/components/shared/page-header";
import { EntryList } from "@/components/entries/entry-list";
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { buttonVariants } from "@/components/ui/button";
import { Pencil } from "lucide-react";

export default function TrackerEntriesPage() {
  const { slug } = useParams<{ slug: string }>();
  const { trackerType, loading: typeLoading } = useTrackerType(slug);
  const { entries, loading: entriesLoading } = useEntries({
    trackerTypeId: trackerType?.id,
  });
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | undefined>();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id);
    });
  }, [supabase]);

  const isCreator = userId && trackerType?.created_by === userId;

  const loading = typeLoading || entriesLoading;

  const doneEntries = useMemo(
    () => entries.filter((e) => e.status === "done"),
    [entries]
  );
  const wantToEntries = useMemo(
    () => entries.filter((e) => e.status === "want_to"),
    [entries]
  );

  if (loading) {
    return <CardGridSkeleton />;
  }

  if (!trackerType) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Tracker type not found.</p>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`${trackerType.icon} ${trackerType.name}`}
        description={trackerType.description}
        actions={
          <div className="flex items-center gap-2">
            {isCreator && (
              <Link href={`/tracker/${slug}/edit`} className={buttonVariants({ variant: "outline" })}>
                <Pencil className="h-4 w-4 mr-1" /> Edit Tracker
              </Link>
            )}
            <Link href="/new" className={buttonVariants()}>
              Add Entry
            </Link>
          </div>
        }
      />

      <Tabs defaultValue="done">
        <TabsList>
          <TabsTrigger value="done">
            Done ({doneEntries.length})
          </TabsTrigger>
          <TabsTrigger value="want_to">
            Want to ({wantToEntries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="done">
          <EntryList
            entries={doneEntries}
            emptyIcon={trackerType.icon}
            emptyTitle="No entries yet"
            emptyDescription={`You haven't logged any ${trackerType.name.toLowerCase()} yet.`}
            emptyActionLabel="Add Entry"
            emptyActionHref="/new"
          />
        </TabsContent>

        <TabsContent value="want_to">
          <EntryList
            entries={wantToEntries}
            emptyIcon={trackerType.icon}
            emptyTitle="Nothing on the list"
            emptyDescription={`Add ${trackerType.name.toLowerCase()} you want to try.`}
            emptyActionLabel="Add Entry"
            emptyActionHref="/new"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
