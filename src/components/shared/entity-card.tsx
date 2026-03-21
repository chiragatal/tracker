"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface EntityCardProps {
  href: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  icon?: string;
  badge?: React.ReactNode;
  metadata?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export function EntityCard({
  href,
  title,
  subtitle,
  imageUrl,
  icon,
  badge,
  metadata,
  actions,
  className,
  children,
}: EntityCardProps) {
  return (
    <Link href={href} className="block group">
      <Card
        className={cn(
          "overflow-hidden transition-all hover:shadow-md hover:border-primary/20 card-glow gradient-border animate-slide-up",
          className
        )}
      >
        {imageUrl && (
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}
        <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
          <div className="flex items-center gap-2 min-w-0">
            {icon && <span className="text-xl shrink-0">{icon}</span>}
            <div className="min-w-0">
              <h3 className="font-semibold truncate">{title}</h3>
              {subtitle && (
                <p className="text-sm text-muted-foreground truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {badge}
            {actions}
          </div>
        </CardHeader>
        {(metadata || children) && (
          <CardContent className="pt-0">
            {metadata}
            {children}
          </CardContent>
        )}
      </Card>
    </Link>
  );
}
