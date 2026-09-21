import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  "data-ocid"?: string;
}

/**
 * Shared empty / no-results state: signal icon, headline, supporting copy and
 * an optional recovery action.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  "data-ocid": dataOcid,
}: EmptyStateProps) {
  return (
    <div
      data-ocid={dataOcid}
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/40 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="relative mb-5 flex size-14 items-center justify-center rounded-full border border-border bg-muted/60">
        <Icon className="size-6 text-muted-foreground" aria-hidden="true" />
        <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full bg-primary/70" />
      </div>
      <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
