"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { TrackerType } from "@/types/tracker";
import { Check, Plus, Pencil } from "lucide-react";

interface TrackerCardProps {
  tracker: TrackerType;
  subscribed: boolean;
  isCreator?: boolean;
  onToggle: (trackerTypeId: string) => void;
}

export function TrackerCard({ tracker, subscribed, isCreator, onToggle }: TrackerCardProps) {
  return (
    <Card className="card-glow gradient-border">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-3xl shrink-0">{tracker.icon}</span>
            <div className="min-w-0">
              <CardTitle className="truncate">{tracker.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {tracker.description}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isCreator && (
              <Link href={`/tracker/${tracker.slug}/edit`}>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
            <Button
              variant={subscribed ? "secondary" : "outline"}
              size="sm"
              className={subscribed ? "" : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 hover:from-emerald-500 hover:to-teal-500"}
              onClick={() => onToggle(tracker.id)}
            >
              {subscribed ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Subscribed
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" />
                  Subscribe
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">
          {tracker.fields.length} field{tracker.fields.length !== 1 ? "s" : ""}
        </p>
      </CardContent>
    </Card>
  );
}
