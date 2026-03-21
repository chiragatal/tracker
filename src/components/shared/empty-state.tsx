import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-sm">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className={buttonVariants()}>
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
}
