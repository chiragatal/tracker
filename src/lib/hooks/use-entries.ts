"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Entry, EntryImage } from "@/types/tracker";

interface UseEntriesOptions {
  trackerTypeId?: string;
  status?: "done" | "want_to";
  limit?: number;
}

export function useEntries(options: UseEntriesOptions = {}) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetch = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("entries")
      .select("*, tracker_type:tracker_types(*), images:entry_images(*)")
      .order("created_at", { ascending: false });
    if (options.trackerTypeId)
      query = query.eq("tracker_type_id", options.trackerTypeId);
    if (options.status) query = query.eq("status", options.status);
    if (options.limit) query = query.limit(options.limit);
    const { data } = await query;
    setEntries((data as Entry[]) ?? []);
    setLoading(false);
  }, [supabase, options.trackerTypeId, options.status, options.limit]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = useCallback(
    async (
      input: Omit<
        Entry,
        | "id"
        | "user_id"
        | "created_at"
        | "updated_at"
        | "tracker_type"
        | "images"
      >,
      images?: EntryImage[]
    ) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data: entry, error } = await supabase
        .from("entries")
        .insert({ ...input, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      if (images?.length) {
        await supabase.from("entry_images").insert(
          images.map((img, i) => ({
            entry_id: entry.id,
            url: img.url,
            alt_text: img.alt_text,
            position: i,
          }))
        );
      }
      await fetch();
      return entry as Entry;
    },
    [supabase, fetch]
  );

  const update = useCallback(
    async (
      id: string,
      input: Partial<Pick<Entry, "title" | "status" | "data" | "notes">>,
      images?: EntryImage[]
    ) => {
      const { error } = await supabase
        .from("entries")
        .update(input)
        .eq("id", id);
      if (error) throw error;
      if (images) {
        await supabase.from("entry_images").delete().eq("entry_id", id);
        if (images.length) {
          await supabase.from("entry_images").insert(
            images.map((img, i) => ({
              entry_id: id,
              url: img.url,
              alt_text: img.alt_text,
              position: i,
            }))
          );
        }
      }
      await fetch();
    },
    [supabase, fetch]
  );

  const remove = useCallback(
    async (id: string) => {
      const { error } = await supabase
        .from("entries")
        .delete()
        .eq("id", id);
      if (error) throw error;
      setEntries((prev) => prev.filter((e) => e.id !== id));
    },
    [supabase]
  );

  return { entries, loading, refetch: fetch, create, update, remove };
}

export function useEntry(id: string) {
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("entries")
        .select("*, tracker_type:tracker_types(*), images:entry_images(*)")
        .eq("id", id)
        .single();
      setEntry(data as Entry | null);
      setLoading(false);
    }
    load();
  }, [id, supabase]);

  return { entry, loading };
}
