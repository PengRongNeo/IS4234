"use client";

import type { ReactNode } from "react";
import { REPORTING_PERIOD, REPORTING_PERIODS } from "@/lib/constants";
import { branches } from "@/lib/mock";
import type { Severity } from "@/lib/types";

const regions = ["All", ...Array.from(new Set(branches.map((b) => b.region)))];

export interface FilterState {
  region: string;
  severity: "all" | Severity;
  branchId: string;
  period: string;
}

export const defaultFilters: FilterState = {
  region: "All",
  severity: "all",
  branchId: "all",
  period: REPORTING_PERIOD,
};

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-500">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800"
      >
        {children}
      </select>
    </label>
  );
}

export function FilterBar({
  filters,
  onChange,
}: {
  filters: FilterState;
  onChange: (next: FilterState) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-white p-3 md:grid-cols-4">
      <Select
        label="Region"
        value={filters.region}
        onChange={(region) => onChange({ ...filters, region })}
      >
        {regions.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </Select>
      <Select
        label="Severity"
        value={filters.severity}
        onChange={(severity) => onChange({ ...filters, severity: severity as FilterState["severity"] })}
      >
        <option value="all">All</option>
        <option value="green">Low (Green)</option>
        <option value="amber">Elevated (Amber)</option>
        <option value="red">High (Red)</option>
      </Select>
      <Select
        label="Branch"
        value={filters.branchId}
        onChange={(branchId) => onChange({ ...filters, branchId })}
      >
        <option value="all">All branches</option>
        {branches.map((b) => (
          <option key={b.id} value={b.id}>
            {b.id} {b.name}
          </option>
        ))}
      </Select>
      <Select
        label="Reporting period"
        value={filters.period}
        onChange={(period) => onChange({ ...filters, period })}
      >
        {REPORTING_PERIODS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </Select>
    </div>
  );
}
