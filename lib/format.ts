import type { Severity } from "@/lib/types";
import { SEVERITY_LABELS, STATUS_LABELS } from "@/lib/constants";

export function formatPct(n: number, digits = 1) {
  return `${n.toFixed(digits)}%`;
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export function formatDate(iso: string) {
  if (!iso) return "—";
  return iso.replace("T", " ").slice(0, 16);
}

export function formatDay(iso: string) {
  if (!iso) return "—";
  return iso.slice(0, 10);
}

export function severityLabel(s: Severity) {
  return SEVERITY_LABELS[s];
}

export function statusLabel(s: string) {
  return STATUS_LABELS[s] ?? s;
}

export function trendArrow(trend: "up" | "down" | "stable") {
  if (trend === "up") return "↑";
  if (trend === "down") return "↓";
  return "→";
}
