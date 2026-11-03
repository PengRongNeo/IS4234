import type { Severity } from "@/lib/types";
import { SEVERITY_LABELS } from "@/lib/constants";

const styles: Record<Severity, string> = {
  green: "bg-emerald-50 text-emerald-800 border-emerald-200",
  amber: "bg-amber-50 text-amber-900 border-amber-200",
  red: "bg-red-50 text-red-800 border-red-200",
};

export function SeverityBadge({
  severity,
  label,
}: {
  severity: Severity;
  label?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${styles[severity]}`}
    >
      {label ?? SEVERITY_LABELS[severity]}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open: "bg-slate-100 text-slate-800 border-slate-200",
    draft: "bg-slate-100 text-slate-700 border-slate-200",
    under_review: "bg-slate-200 text-slate-900 border-slate-300",
    classified: "bg-slate-800 text-white border-slate-800",
    escalated: "bg-slate-900 text-white border-slate-900",
    closed: "bg-white text-slate-500 border-slate-200",
    detected: "bg-slate-100 text-slate-800 border-slate-200",
    assigned: "bg-slate-200 text-slate-900 border-slate-300",
    corrective_action: "bg-slate-800 text-white border-slate-800",
    closed_monitoring: "bg-white text-slate-500 border-slate-200",
    in_progress: "bg-slate-200 text-slate-900 border-slate-300",
    completed: "bg-emerald-50 text-emerald-800 border-emerald-200",
    overdue: "bg-red-50 text-red-800 border-red-200",
    ineffective: "bg-red-50 text-red-800 border-red-200",
  };
  const label: Record<string, string> = {
    open: "Open",
    draft: "Draft",
    under_review: "Under review",
    classified: "Classified",
    escalated: "Escalated",
    closed: "Closed",
    detected: "Detected",
    assigned: "Assigned",
    corrective_action: "Corrective action",
    closed_monitoring: "Closed / monitoring",
    in_progress: "In progress",
    completed: "Completed",
    overdue: "Overdue",
    ineffective: "Ineffective",
  };
  return (
    <span
      className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${map[status] ?? map.open}`}
    >
      {label[status] ?? status}
    </span>
  );
}
