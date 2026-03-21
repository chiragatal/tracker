import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { ImageGallery } from "@/components/shared/image-gallery";
import { DynamicForm } from "@/components/forms/dynamic-form";
import { formatDate } from "@/lib/utils";
import type { Entry } from "@/types/tracker";

export default async function SharedEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: entry } = await supabase
    .from("entries")
    .select("*, tracker_type:tracker_types(*), images:entry_images(*)")
    .eq("id", id)
    .eq("is_public", true)
    .single();

  if (!entry) {
    notFound();
  }

  const typedEntry = entry as Entry;
  const fields = typedEntry.tracker_type?.fields ?? [];
  const trackerIcon = typedEntry.tracker_type?.icon;
  const displayDate = (typedEntry.data?.entry_date as string) ?? typedEntry.created_at;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <a href="/" className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-2">
          <img src="/logo.svg" alt="Tracker" className="h-7 w-7" />
          <span className="text-lg font-bold text-gradient">Tracker</span>
        </a>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            {trackerIcon && <span className="text-4xl">{trackerIcon}</span>}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {typedEntry.title}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <StatusBadge status={typedEntry.status} />
                {typedEntry.tracker_type && (
                  <span className="text-sm text-muted-foreground">
                    {typedEntry.tracker_type.name}
                  </span>
                )}
                <span className="text-sm text-muted-foreground">
                  {formatDate(displayDate)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        {typedEntry.images && typedEntry.images.length > 0 && (
          <Card className="gradient-border">
            <CardContent className="pt-6">
              <ImageGallery images={typedEntry.images} readOnly />
            </CardContent>
          </Card>
        )}

        {/* Dynamic fields */}
        {fields.length > 0 && (
          <Card className="gradient-border">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-4 text-gradient">
                Details
              </h2>
              <DynamicForm
                fields={fields}
                values={typedEntry.data ?? {}}
                onChange={() => {}}
                readOnly
              />
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {typedEntry.notes && (
          <Card className="gradient-border">
            <CardContent className="pt-6">
              <h2 className="text-lg font-semibold mb-2 text-gradient">
                Notes
              </h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {typedEntry.notes}
              </p>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground pt-4">
          Shared via Tracker
        </p>
      </main>
    </div>
  );
}
