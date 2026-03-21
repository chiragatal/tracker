"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUserTrackers } from "@/lib/hooks/use-user-trackers";
import { Home, Search, Compass, Plus } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/search", label: "Search", icon: Search },
];

export function Sidebar() {
  const pathname = usePathname();
  const { subscribedTypes, refetch } = useUserTrackers();

  // Refetch subscriptions when navigating between pages
  useEffect(() => {
    refetch();
  }, [pathname, refetch]);

  return (
    <aside className="hidden md:flex flex-col w-64 border-r bg-card h-screen sticky top-0">
      <div className="p-4">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight">
          Tracker
        </Link>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname === item.href
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
        <Separator className="my-3" />
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            My Trackers
          </span>
          <Link
            href="/new"
            className="h-5 w-5 inline-flex items-center justify-center"
          >
            <Plus className="h-3 w-3" />
          </Link>
        </div>
        {subscribedTypes.map((tracker) => (
          <Link
            key={tracker.id}
            href={`/track/${tracker.slug}`}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname === `/track/${tracker.slug}`
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <span>{tracker.icon}</span>
            {tracker.name}
          </Link>
        ))}
      </nav>
      <div className="p-3">
        <Link
          href="/new"
          className="flex items-center justify-center gap-2 w-full rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> New Entry
        </Link>
      </div>
    </aside>
  );
}
