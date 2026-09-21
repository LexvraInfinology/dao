"use client";

import { useState } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: string;
  color?: string;
  loading?: boolean;
}

export function StatCard({ label, value, sub, icon, color = "#f59e0b", loading = false }: StatCardProps) {
  return (
    <div className="stat-card">
      {icon && <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>{icon}</div>}
      <div className="stat-label">{label}</div>
      {loading ? (
        <div className="skeleton" style={{ height: "2rem", width: "60%", marginTop: "0.5rem" }} />
      ) : (
        <div className="stat-value" style={{ color }}>{value}</div>
      )}
      {sub && !loading && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
