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

      let slug = slugify(input.name);
      const { data, error } = await supabase
        .from("tracker_types")
        .insert({ ...input, slug, created_by: user.id })
        .select()
        .single();

      if (error?.code === "23505") {
        // Unique violation — append random suffix
        slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
        const { data: retryData, error: retryError } = await supabase
          .from("tracker_types")
          .insert({ ...input, slug, created_by: user.id })
          .select()
          .single();
        if (retryError) throw retryError;
        setTrackerTypes((prev) => [...prev, retryData as TrackerType]);
        return retryData as TrackerType;
      }

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
