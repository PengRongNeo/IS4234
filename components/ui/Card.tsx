import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-3">
      <div>
        <h2 className="text-sm font-semibold tracking-wide text-slate-800">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function CardBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}

export function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "green" | "amber" | "red";
}) {
  const bar =
    tone === "green"
      ? "border-l-emerald-600"
      : tone === "amber"
        ? "border-l-amber-500"
        : tone === "red"
          ? "border-l-red-600"
          : "border-l-slate-700";
  const valueColor =
    tone === "green"
      ? "text-emerald-800"
      : tone === "amber"
        ? "text-amber-800"
        : tone === "red"
          ? "text-red-700"
          : "text-slate-900";
  return (
    <Card className={`border-l-4 ${bar}`}>
      <CardBody>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <p className={`mt-1 text-2xl font-semibold tabular-nums ${valueColor}`}>{value}</p>
        {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
      </CardBody>
    </Card>
  );
}
