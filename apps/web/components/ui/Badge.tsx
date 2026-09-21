"use client";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "gold" | "green" | "red" | "blue" | "purple" | "gray";
  size?: "sm" | "md";
  glow?: boolean;
}

const VARIANT_STYLES: Record<string, string> = {
  gold:   "badge-gold",
  green:  "badge-green",
  red:    "badge-red",
  blue:   "badge-blue",
  purple: "badge-purple",
  gray:   "badge-gray",
};

export function Badge({ children, variant = "gold", size = "md", glow = false }: BadgeProps) {
  return (
    <span
      className={`badge ${VARIANT_STYLES[variant]}`}
      style={{
        fontSize: size === "sm" ? "0.65rem" : "0.75rem",
        padding: size === "sm" ? "0.15rem 0.5rem" : undefined,
        boxShadow: glow && variant === "gold" ? "0 0 12px rgba(245,158,11,0.3)" : undefined,
      }}
    >
      {children}
    </span>
  );
}
