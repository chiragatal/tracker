import { Badge } from "@/components/ui/badge";
import type { EntryStatus } from "@/types/tracker";

const STATUS_CONFIG: Record<
  EntryStatus,
  { label: string; variant: "default" | "secondary" }
> = {
  done: { label: "Done", variant: "default" },
  want_to: { label: "Want to", variant: "secondary" },
};

export function StatusBadge({ status }: { status: EntryStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
