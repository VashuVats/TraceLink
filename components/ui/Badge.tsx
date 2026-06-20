import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border border-ink-500 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wide text-paper/80",
        className
      )}
      {...props}
    />
  );
}

export function StatusStamp({ status }: { status: "active" | "resolved" }) {
  return (
    <span className={status === "active" ? "stamp-active" : "stamp-resolved"}>
      {status === "active" ? "Active" : "Resolved"}
    </span>
  );
}

/** Confidence score rendered as a small colored mono badge */
export function ConfidenceBadge({ value }: { value: number }) {
  const tone =
    value >= 70
      ? "border-tag text-tag bg-tag/10"
      : value >= 40
      ? "border-paper-dark text-paper/80"
      : "border-ink-500 text-muted";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[11px] font-bold",
        tone
      )}
    >
      {value}%
    </span>
  );
}
