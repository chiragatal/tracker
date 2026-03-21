"use client";

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useEntry, useEntries } from "@/lib/hooks/use-entries";
import { EntryDetail } from "@/components/entries/entry-detail";
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import { Pencil, Trash2, CheckCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function EntryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { entry, loading } = useEntry(id);
  const { remove } = useEntries();

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
