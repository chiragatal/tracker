"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTrackerTypes } from "@/lib/hooks/use-tracker-types";
import { PageHeader } from "@/components/shared/page-header";
import { EntryList } from "@/components/entries/entry-list";
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type { Entry } from "@/types/tracker";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { trackerTypes } = useTrackerTypes();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [tracker, setTracker] = useState(searchParams.get("tracker") ?? "all");
  const [status, setStatus] = useState(searchParams.get("status") ?? "all");
  const [results, setResults] = useState<Entry[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const performSearch = useCallback(async () => {
    if (!query.trim()) {
      setResults([]);
      setCount(0);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    const params = new URLSearchParams({ q: query.trim() });
    if (tracker !== "all") params.set("tracker", tracker);
    if (status !== "all") params.set("status", status);

    // Update URL
    router.replace(`/search?${params.toString()}`, { scroll: false });

    try {
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      setResults(data.entries ?? []);
      setCount(data.count ?? 0);
    } catch {
      setResults([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [query, tracker, status, router]);

  // Search on filter changes (but only if there's a query)
  useEffect(() => {
    if (query.trim()) {
      performSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracker, status]);

  // Initial search if URL has query
  useEffect(() => {
    if (searchParams.get("q")) {
      performSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  return (
    <div>
      <PageHeader title="Search" description="Find your entries" />

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your entries..."
            className="pl-10"
          />
        </div>

        <div className="flex gap-3">
          <Select value={tracker} onValueChange={(v) => setTracker(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="All trackers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All trackers</SelectItem>
              {trackerTypes.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  <span className="mr-2">{t.icon}</span>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={(v) => setStatus(v ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="done">Done</SelectItem>
              <SelectItem value="want_to">Want to</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>

      {loading && <CardGridSkeleton />}

      {!loading && searched && (
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            {count} result{count !== 1 ? "s" : ""} found
          </p>
          <EntryList
            entries={results}
            emptyIcon="🔍"
            emptyTitle="No results"
            emptyDescription="Try a different search term or adjust your filters."
          />
        </div>
      )}
    </div>
  );
}
