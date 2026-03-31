import type { CSSProperties } from "react";

interface SkeletonProps {
  width?:  string | number;
  height?: string | number;
  style?:  CSSProperties;
}

export function Skeleton({ width = "100%", height = 16, style }: SkeletonProps) {
  return (
    <span
      className="skeleton"
      style={{ width, height, display: "inline-block", borderRadius: 4, ...style }}
      aria-hidden
    />
  );
}
