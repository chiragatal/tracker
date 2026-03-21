import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EntryStatus } from "@/types/tracker";

const STATUS_CONFIG: Record<
  EntryStatus,
  { label: string; variant: "default" | "secondary"; className: string }
> = {
  done: {
    label: "Done",
    variant: "default",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20",
  },
  want_to: {
    label: "Want to",
    variant: "secondary",
    className: "bg-violet-500/15 text-violet-400 border-violet-500/20 hover:bg-violet-500/20",
  },
};

export function StatusBadge({ status }: { status: EntryStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant={config.variant} className={cn(config.className)}>
      {config.label}
    </Badge>
  );
}
