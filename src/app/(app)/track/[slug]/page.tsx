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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Download, Upload } from "lucide-react";
import type { Entry } from "@/types/tracker";

type SortOption = "newest" | "oldest" | "title_az" | "title_za";

function sortEntries(entries: Entry[], sort: SortOption): Entry[] {
  const sorted = [...entries];
  switch (sort) {
    case "newest":
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    case "oldest":
      return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    case "title_az":
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case "title_za":
      return sorted.sort((a, b) => b.title.localeCompare(a.title));
    default:
      return sorted;
  }
}

export default function TrackerEntriesPage() {
  const { slug } = useParams<{ slug: string }>();
  const { trackerType, loading: typeLoading } = useTrackerType(slug);
  const { entries, loading: entriesLoading } = useEntries({
    trackerTypeId: trackerType?.id,
  });
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | undefined>();
  const [sort, setSort] = useState<SortOption>("newest");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id);
    });
  }, [supabase]);

  const isCreator = userId && trackerType?.created_by === userId;

  const loading = typeLoading || entriesLoading;

  const sortedEntries = useMemo(() => sortEntries(entries, sort), [entries, sort]);

  const doneEntries = useMemo(
    () => sortedEntries.filter((e) => e.status === "done"),
    [sortedEntries]
  );
  const wantToEntries = useMemo(
    () => sortedEntries.filter((e) => e.status === "want_to"),
    [sortedEntries]
  );

  const exportEntries = () => {
    const exportData = entries.map((e) => ({
      title: e.title,
      status: e.status,
      data: e.data,
      notes: e.notes,
      created_at: e.created_at,
    }));
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${trackerType!.slug}-entries.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
            <Button variant="outline" onClick={exportEntries}>
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
            <Link
              href={`/import?tracker=${trackerType.id}`}
              className={buttonVariants({ variant: "outline" })}
            >
              <Upload className="h-4 w-4 mr-1" /> Import
            </Link>
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
        <div className="flex items-center justify-between gap-4 mb-2">
          <TabsList>
            <TabsTrigger value="done">
              Done ({doneEntries.length})
            </TabsTrigger>
            <TabsTrigger value="want_to">
              Want to ({wantToEntries.length})
            </TabsTrigger>
          </TabsList>
          <Select value={sort} onValueChange={(val) => setSort(val as SortOption)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="title_az">Title A-Z</SelectItem>
              <SelectItem value="title_za">Title Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
