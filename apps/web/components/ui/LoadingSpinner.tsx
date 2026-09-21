"use client";

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  label?: string;
  fullPage?: boolean;
}

export function LoadingSpinner({
  size = 40,
  color = "#f59e0b",
  label = "Loading...",
  fullPage = false,
}: LoadingSpinnerProps) {
  const spinner = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: `3px solid rgba(245,158,11,0.15)`,
          borderTopColor: color,
          animation: "spin 0.8s linear infinite",
        }}
      />
      {label && (
        <span style={{ color: "#94a3b8", fontSize: "0.875rem" }}>{label}</span>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
        }}
      >
        {spinner}
      </div>
    );
  }

  return spinner;
}

/** Inline skeleton shimmer box */
export function Skeleton({ width = "100%", height = 20, radius = 8 }: {
  width?: string | number;
  height?: number;
  radius?: number;
}) {
  return (
    <div
      className="skeleton"
      style={{ width, height, borderRadius: radius }}
    />
  );
}
