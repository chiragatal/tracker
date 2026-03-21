"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { TrackerType } from "@/types/tracker";
import { slugify } from "@/lib/utils";

export function useTrackerTypes() {
  const [trackerTypes, setTrackerTypes] = useState<TrackerType[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("tracker_types")
      .select("*")
      .order("name");
    setTrackerTypes((data as TrackerType[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = useCallback(
    async (
      input: Omit<TrackerType, "id" | "slug" | "created_by" | "created_at">
    ) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("tracker_types")
        .insert({ ...input, slug: slugify(input.name), created_by: user.id })
        .select()
        .single();
      if (error) throw error;
      setTrackerTypes((prev) => [...prev, data as TrackerType]);
      return data as TrackerType;
    },
    [supabase]
  );

  return { trackerTypes, loading, refetch: fetch, create };
}

export function useTrackerType(slug: string) {
  const [trackerType, setTrackerType] = useState<TrackerType | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("tracker_types")
        .select("*")
        .eq("slug", slug)
        .single();
      setTrackerType(data as TrackerType | null);
      setLoading(false);
    }
    load();
  }, [slug, supabase]);

  return { trackerType, loading };
}
