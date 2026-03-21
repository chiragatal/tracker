"use client";

import { useState, useCallback } from "react";
import { useUserTrackers } from "@/lib/hooks/use-user-trackers";
import { useEntries } from "@/lib/hooks/use-entries";
import { PageHeader } from "@/components/shared/page-header";
import { CardGridSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

interface ImportEntry {
  title: string;
  status: string;
  data: Record<string, unknown>;
  notes?: string | null;
  created_at?: string;
}

export default function ImportPage() {
  const searchParams = useSearchParams();
  const preselectedTracker = searchParams.get("tracker");
  const { subscribedTypes, loading: trackersLoading } = useUserTrackers();
  const { create } = useEntries();

  const [trackerTypeId, setTrackerTypeId] = useState(preselectedTracker ?? "");
  const [entries, setEntries] = useState<ImportEntry[]>([]);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setParseError(null);
      setEntries([]);
      setFileName("");
      setDone(false);
      setProgress(0);

      const file = e.target.files?.[0];
      if (!file) return;

      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (!Array.isArray(parsed)) {
            setParseError("JSON file must contain an array of entries.");
            return;
          }
          const valid = parsed.filter(
            (item: unknown) =>
              typeof item === "object" &&
              item !== null &&
              "title" in item &&
              typeof (item as ImportEntry).title === "string"
          );
          if (valid.length === 0) {
            setParseError(
              "No valid entries found. Each entry must have at least a title."
            );
            return;
          }
          setEntries(valid as ImportEntry[]);
        } catch {
          setParseError("Invalid JSON file.");
        }
      };
      reader.readAsText(file);
    },
    []
  );

  const handleImport = async () => {
    if (!trackerTypeId || entries.length === 0) return;
    setImporting(true);
    setProgress(0);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      try {
        await create({
          tracker_type_id: trackerTypeId,
          title: entry.title,
          status: (entry.status as "done" | "want_to") ?? "done",
          data: entry.data ?? {},
          notes: entry.notes ?? null,
        });
        successCount++;
      } catch {
        errorCount++;
      }
      setProgress(i + 1);
    }

    setImporting(false);
    setDone(true);
    if (errorCount === 0) {
      toast.success(`Imported ${successCount} entries successfully!`);
    } else {
      toast.warning(
        `Imported ${successCount} entries. ${errorCount} failed.`
      );
    }
  };

  if (trackersLoading) return <CardGridSkeleton />;

  const selectedTracker = subscribedTypes.find((t) => t.id === trackerTypeId);

  return (
    <div>
      <PageHeader
        title="Import Entries"
        description="Import entries from a JSON file."
      />

      <div className="max-w-2xl space-y-6">
        <div className="space-y-2">
          <Label>Tracker</Label>
          <Select
            value={trackerTypeId}
            onValueChange={(v) => setTrackerTypeId(v ?? "")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a tracker...">
                {selectedTracker ? (
                  <span>
                    {selectedTracker.icon} {selectedTracker.name}
                  </span>
                ) : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {subscribedTypes.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  <span className="mr-2">{t.icon}</span>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>JSON File</Label>
          <Input
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
          />
          {parseError && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {parseError}
            </div>
          )}
        </div>

        {entries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Preview: {fileName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Found <span className="font-semibold text-foreground">{entries.length}</span> entries to import.
              </p>
              <ul className="text-sm space-y-1 max-h-48 overflow-y-auto">
                {entries.slice(0, 20).map((entry, i) => (
                  <li key={i} className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-foreground font-medium truncate">
                      {entry.title}
                    </span>
                    <span className="text-xs">({entry.status ?? "done"})</span>
                  </li>
                ))}
                {entries.length > 20 && (
                  <li className="text-xs text-muted-foreground">
                    ...and {entries.length - 20} more
                  </li>
                )}
              </ul>

              {importing && (
                <div className="space-y-2">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${(progress / entries.length) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {progress} / {entries.length} entries imported...
                  </p>
                </div>
              )}

              {done && (
                <div className="flex items-center gap-2 text-sm text-emerald-500">
                  <CheckCircle2 className="h-4 w-4" />
                  Import complete!
                </div>
              )}

              <Button
                onClick={handleImport}
                disabled={!trackerTypeId || importing || done}
                className="w-full"
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Importing...
                  </>
                ) : done ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Imported
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Import {entries.length} Entries
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
