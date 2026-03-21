"use client";

import { useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useEntry, useEntries } from "@/lib/hooks/use-entries";
import { EntryDetail } from "@/components/entries/entry-detail";
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import { Pencil, Trash2, CheckCircle, ArrowLeft, Share2, Copy, Globe, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function EntryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { entry, loading } = useEntry(id);
  const { remove } = useEntries();
  const supabase = useMemo(() => createClient(), []);
  const [isPublic, setIsPublic] = useState<boolean | null>(null);
  const [toggling, setToggling] = useState(false);

  // Sync isPublic from entry when loaded
  const publicState = isPublic ?? entry?.is_public ?? false;

  const handleDelete = async () => {
    if (!entry) return;
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      await remove(entry.id);
      toast.success("Entry deleted");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete entry");
    }
  };

  const handleToggleShare = async () => {
    if (!entry) return;
    setToggling(true);
    const newValue = !publicState;
    try {
      const { error } = await supabase
        .from("entries")
        .update({ is_public: newValue })
        .eq("id", entry.id);
      if (error) throw error;
      setIsPublic(newValue);
      toast.success(newValue ? "Entry is now public" : "Entry is now private");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update sharing"
      );
    } finally {
      setToggling(false);
    }
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/share/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  if (loading) return <CardGridSkeleton count={1} />;
  if (!entry) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Entry not found.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex items-center gap-2">
          {entry.status === "want_to" && (
            <Link
              href={`/entry/${entry.id}/edit?markDone=true`}
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark as Done
            </Link>
          )}
          <Button
            variant={publicState ? "secondary" : "outline"}
            size="sm"
            onClick={handleToggleShare}
            disabled={toggling}
          >
            {publicState ? (
              <Globe className="h-4 w-4 mr-1" />
            ) : (
              <Share2 className="h-4 w-4 mr-1" />
            )}
            {publicState ? "Public" : "Share"}
          </Button>
          {publicState && (
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              <Copy className="h-4 w-4 mr-1" />
              Copy Link
            </Button>
          )}
          <Link
            href={`/new?tracker=${entry.tracker_type_id}&prefill=${entry.id}`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Track Again
          </Link>
          <Link
            href={`/entry/${entry.id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Link>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      <EntryDetail entry={entry} />
    </div>
  );
}
