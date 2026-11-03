"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SeverityBadge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { defaultFilters, FilterBar, type FilterState } from "@/components/ui/FilterBar";
import { branches, scoresByBranch } from "@/lib/mock";
import { filterBranches } from "@/lib/demo";
import { useAppState } from "@/context/AppStateContext";
import { ILLUSTRATIVE_THRESHOLDS, THRESHOLD_DISCLAIMER } from "@/lib/thresholds";

export function BranchListView() {
  const { demoScenario } = useAppState();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const rows = useMemo(() => {
    return filterBranches(branches, demoScenario).filter((b) => {
      const s = scoresByBranch[b.id];
      if (filters.region !== "All" && b.region !== filters.region) return false;
      if (filters.severity !== "all" && s.severity !== filters.severity) return false;
      if (filters.branchId !== "all" && b.id !== filters.branchId) return false;
      return true;
    });
  }, [filters, demoScenario]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Risk Indicators</h1>
        <p className="mt-1 text-sm text-slate-600">
          Branch files combine unused accounts, complaints, EthicsLine activity, investigations and
          terminations. A single employee case is not automatically a branch-level systemic risk.
        </p>
      </div>
      <p className="text-xs text-slate-500">
        Cross-indicator rule (illustrative): inactive account rate ≥ {ILLUSTRATIVE_THRESHOLDS.inactiveAccountRatePct}%{" "}
        AND investigations ≥ {ILLUSTRATIVE_THRESHOLDS.investigationCount} AND complaints ≥{" "}
        {ILLUSTRATIVE_THRESHOLDS.complaintCount}. {THRESHOLD_DISCLAIMER}
      </p>
      <FilterBar filters={filters} onChange={setFilters} />
      <Card>
        <CardHeader title="Monitored branches" subtitle={`${rows.length} branches in view`} />
        <CardBody className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                {["Branch", "Region", "Manager", "Risk score", "Severity", "Status", "Last reviewed"].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => {
                const s = scoresByBranch[b.id];
                return (
                  <tr key={b.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/branches/${b.id}`} className="font-medium text-slate-900 hover:underline">
                        {b.id} {b.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{b.region}</td>
                    <td className="px-4 py-3 text-slate-700">{b.manager}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums">{s.riskScore}</td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={s.severity} />
                    </td>
                    <td className="px-4 py-3 text-slate-600">{b.status}</td>
                    <td className="px-4 py-3 text-slate-600">{b.lastReviewed}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>
      <p className="text-xs text-slate-500">
        Unfunded and reversal rates on the branch file are computed from mock account records. Click
        through for employees and the explainable score narrative.
      </p>
    </div>
  );
}
