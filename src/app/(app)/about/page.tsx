"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  {
    icon: "📋",
    title: "Custom Tracker Types",
    description:
      "Create and subscribe to tracker types for anything: coffee, books, recipes, workouts, and more. Each tracker has custom fields tailored to what you're tracking.",
  },
  {
    icon: "🔍",
    title: "Powerful Search",
    description:
      "Full-text search across all your entries. Filter by tracker type, status, date range, and tags to find exactly what you're looking for.",
  },
  {
    icon: "📤",
    title: "Export & Import",
    description:
      "Export your entries as JSON for backup or analysis. Import entries from JSON files to quickly populate your trackers.",
  },
  {
    icon: "🔗",
    title: "Share Entries",
    description:
      "Make individual entries public and share them with anyone via a unique link. Keep the rest private by default.",
  },
  {
    icon: "🏷️",
    title: "Tags & Organization",
    description:
      "Tag your entries for easy categorization. Use status tracking to mark items as done or save them for later.",
  },
  {
    icon: "📸",
    title: "Image Support",
    description:
      "Attach images to your entries to capture the full experience. Perfect for food, travel, and visual tracking.",
  },
];

export default function AboutPage() {
  return (
    <div>
      <PageHeader
        title="About Tracker"
        description="Track anything. Remember everything."
      />

      <div className="max-w-3xl space-y-8">
        <section>
          <Card className="bg-gradient-to-br from-emerald-500/10 to-violet-500/10 border-emerald-500/20">
            <CardContent className="py-6">
              <h2 className="text-xl font-semibold mb-3">
                What is Tracker?
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Tracker is a personal logging app that helps you keep track of the things you
                experience, consume, and enjoy. Whether it's coffee you've tasted, books you've
                read, recipes you've cooked, or anything else -- Tracker gives you a simple,
                flexible way to record and revisit it all.
              </p>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">How to Use</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
                1
              </span>
              <div>
                <p className="font-medium">Discover & Subscribe</p>
                <p className="text-sm text-muted-foreground">
                  Browse available tracker types or create your own. Subscribe to the ones you want to use.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
                2
              </span>
              <div>
                <p className="font-medium">Add Entries</p>
                <p className="text-sm text-muted-foreground">
                  Log new entries with custom fields, images, notes, and tags. Use quick-add from the dashboard for speed.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary text-sm font-bold shrink-0">
                3
              </span>
              <div>
                <p className="font-medium">Search & Explore</p>
                <p className="text-sm text-muted-foreground">
                  Search across all your entries. Export your data. Share favorites with friends.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-4">Key Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((feature) => (
              <Card key={feature.title} size="sm">
                <CardHeader>
                  <CardTitle>
                    <span className="mr-2 text-lg">{feature.icon}</span>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
