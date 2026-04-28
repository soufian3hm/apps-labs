import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Tone = "neutral" | "success" | "warning" | "error" | "info" | "brand";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  plain?: boolean;
}

export function Badge({ tone = "neutral", plain, className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn("badge", tone !== "neutral" && `badge-${tone}`, plain && "badge-plain", className)}
      {...rest}
    />
  );
}
