"use client";

import { useMemo, useState } from "react";
import { useEntries } from "@/lib/hooks/use-entries";
import { PageHeader } from "@/components/shared/page-header";
import { EntryCard } from "@/components/entries/entry-card";
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import { Badge } from "@/components/ui/badge";
import type { Entry, FieldDefinition } from "@/types/tracker";

function extractTags(entry: Entry): string[] {
  const tags: string[] = [];
  const fields: FieldDefinition[] = entry.tracker_type?.fields ?? [];
  const tagFields = fields.filter((f) => f.type === "tags");
  for (const field of tagFields) {
    const value = entry.data?.[field.key];
    if (Array.isArray(value)) {
      for (const v of value) {
        if (typeof v === "string" && v.trim()) {
          tags.push(v.trim());
        }
      }
    }
  }
  return tags;
}

export default function TagsPage() {
  const { entries, loading } = useEntries();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const tagMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of entries) {
      const tags = extractTags(entry);
      for (const tag of tags) {
        map.set(tag, (map.get(tag) ?? 0) + 1);
      }
    }
    return map;
  }, [entries]);

  const sortedTags = useMemo(
    () => [...tagMap.entries()].sort((a, b) => b[1] - a[1]),
    [tagMap]
  );

  const filteredEntries = useMemo(() => {
    if (!selectedTag) return [];
    return entries.filter((entry) => extractTags(entry).includes(selectedTag));
  }, [entries, selectedTag]);

  if (loading) {
    return <CardGridSkeleton />;
  }

  return (
    <div>
      <PageHeader
        title="Tags"
        description="Browse all tags across your entries."
      />

      {sortedTags.length === 0 ? (
        <p className="text-muted-foreground text-center py-12">
          No tags found. Add tags to your entries to see them here.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2 mb-8">
          {sortedTags.map(([tag, count]) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className="cursor-pointer"
            >
              <Badge
                variant={selectedTag === tag ? "default" : "secondary"}
              >
                {tag} ({count})
              </Badge>
            </button>
          ))}
        </div>
      )}

      {selectedTag && (
        <div>
          <h2 className="text-lg font-semibold mb-4">
            Entries tagged &ldquo;{selectedTag}&rdquo;
          </h2>
          {filteredEntries.length === 0 ? (
            <p className="text-muted-foreground">No entries found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEntries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
