import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = session.user;

  if (!checkRateLimit(`search:${user.id}`, 30)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q") ?? "";
  const tracker = searchParams.get("tracker") || null;
  const status = searchParams.get("status") || null;
  const from = searchParams.get("from") || null;
  const to = searchParams.get("to") || null;

  if (!q.trim()) {
    return NextResponse.json({ entries: [], count: 0 });
  }

  const { data: rawEntries, error } = await supabase.rpc("search_entries", {
    search_query: q,
    p_user_id: user.id,
    p_tracker_type_id: tracker,
    p_status: status,
    p_date_from: from,
    p_date_to: to,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let entries = rawEntries ?? [];

  // Fallback: if pg_trgm returned no results, try ilike substring match
  if (entries.length === 0) {
    const pattern = `%${q}%`;
    let fallbackQuery = supabase
      .from("entries")
      .select("*")
      .eq("user_id", user.id)
      .or(`title.ilike.${pattern},notes.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(50);
    if (tracker) fallbackQuery = fallbackQuery.eq("tracker_type_id", tracker);
    if (status) fallbackQuery = fallbackQuery.eq("status", status);
    if (from) fallbackQuery = fallbackQuery.gte("created_at", from);
    if (to) fallbackQuery = fallbackQuery.lte("created_at", to);
    const { data: fallbackData } = await fallbackQuery;
    entries = fallbackData ?? [];
  }

  // Enrich results with tracker_type and images
  if (entries.length > 0) {
    const entryIds = entries.map((e: { id: string }) => e.id);
    const trackerTypeIds = [
      ...new Set(entries.map((e: { tracker_type_id: string }) => e.tracker_type_id)),
    ];

    const [{ data: trackerTypes }, { data: images }] = await Promise.all([
      supabase
        .from("tracker_types")
        .select("*")
        .in("id", trackerTypeIds as string[]),
      supabase
        .from("entry_images")
        .select("*")
        .in("entry_id", entryIds as string[])
        .order("position"),
    ]);

    const trackerMap = new Map(
      (trackerTypes ?? []).map((t: { id: string }) => [t.id, t])
    );
    const imageMap = new Map<string, typeof images>();
    for (const img of images ?? []) {
      const list = imageMap.get(img.entry_id) ?? [];
      list.push(img);
      imageMap.set(img.entry_id, list);
    }

    const enriched = entries.map((e: { id: string; tracker_type_id: string }) => ({
      ...e,
      tracker_type: trackerMap.get(e.tracker_type_id) ?? null,
      images: imageMap.get(e.id) ?? [],
    }));

    return NextResponse.json({ entries: enriched, count: enriched.length });
  }

  return NextResponse.json({ entries: [], count: 0 });
}
