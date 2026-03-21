"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserTracker, TrackerType } from "@/types/tracker";

export function useUserTrackers() {
  const [userTrackers, setUserTrackers] = useState<UserTracker[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("user_trackers")
      .select("*, tracker_type:tracker_types(*)")
      .order("created_at");
    setUserTrackers((data as UserTracker[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const subscribe = useCallback(
    async (trackerTypeId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("user_trackers")
        .insert({ user_id: user.id, tracker_type_id: trackerTypeId });
      if (error) throw error;
      await fetch();
    },
    [supabase, fetch]
  );

  const unsubscribe = useCallback(
    async (trackerTypeId: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("user_trackers")
        .delete()
        .eq("user_id", user.id)
        .eq("tracker_type_id", trackerTypeId);
      if (error) throw error;
      setUserTrackers((prev) =>
        prev.filter((ut) => ut.tracker_type_id !== trackerTypeId)
      );
    },
    [supabase]
  );

  const isSubscribed = useCallback(
    (trackerTypeId: string) =>
      userTrackers.some((ut) => ut.tracker_type_id === trackerTypeId),
    [userTrackers]
  );

  const subscribedTypes: TrackerType[] = userTrackers
    .map((ut) => ut.tracker_type)
    .filter(Boolean) as TrackerType[];

  return {
    userTrackers,
    subscribedTypes,
    loading,
    refetch: fetch,
    subscribe,
    unsubscribe,
    isSubscribed,
  };
}
