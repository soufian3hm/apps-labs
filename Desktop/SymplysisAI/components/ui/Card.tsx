import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  elevated?: boolean;
  flat?: boolean;
}

export function Card({ hover, elevated, flat, className, ...rest }: CardProps) {
  return (
    <div
      className={cn("card", hover && "card-hover", elevated && "card-elevated", flat && "card-flat", className)}
      {...rest}
    />
  );
}
