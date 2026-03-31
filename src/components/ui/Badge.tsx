import type { ReactNode } from "react";

interface BadgeProps {
  variant: "up" | "down" | "neutral";
  children: ReactNode;
}

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`badge badge--${variant}`} aria-label={variant === "up" ? "상승" : "하락"}>
      {children}
    </span>
  );
}
