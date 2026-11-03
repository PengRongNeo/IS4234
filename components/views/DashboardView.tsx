"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BarChartCard, LineChartCard } from "@/components/charts/Charts";
import { SeverityBadge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/Card";
import { defaultFilters, FilterBar, type FilterState } from "@/components/ui/FilterBar";
import { InfoTip } from "@/components/ui/InfoTip";
import { APP_NAME, APP_SUBTITLE, REPORTING_PERIOD } from "@/lib/constants";
import { formatNumber, formatPct } from "@/lib/format";
import { accounts, branches, conductEvents, mockStats, scoresByBranch } from "@/lib/mock";
import { MONTHS } from "@/lib/constants";
import { useAppState } from "@/context/AppStateContext";
import { filterAlerts, filterBranches, scenarioMeta } from "@/lib/demo";
import { AS_OF, isPastDeadline } from "@/lib/asOf";
import { THRESHOLD_DISCLAIMER } from "@/lib/thresholds";
import { GlossaryTip } from "@/components/ui/GlossaryTip";

function severityFill(score: number) {
  if (score >= 60) return "#b91c1c";
  if (score >= 30) return "#d97706";
  return "#059669";
}

export function DashboardView() {
  const { alerts, investigations, correctiveActions, demoScenario } = useAppState();
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const scenario = scenarioMeta(demoScenario);

  const filtered = useMemo(() => {
    return filterBranches(branches, demoScenario).filter((b) => {
      const s = scoresByBranch[b.id];
      if (filters.region !== "All" && b.region !== filters.region) return false;
      if (filters.severity !== "all" && s.severity !== filters.severity) return false;
      if (filters.branchId !== "all" && b.id !== filters.branchId) return false;
      return true;
    });
  }, [filters, demoScenario]);

  const counts = useMemo(() => {
    const list = filtered.map((b) => scoresByBranch[b.id]);
    return {
      total: list.length,
      green: list.filter((s) => s.severity === "green").length,
      amber: list.filter((s) => s.severity === "amber").length,
      red: list.filter((s) => s.severity === "red").length,
    };
  }, [filtered]);

  const scopedAlerts = filterAlerts(alerts, demoScenario);
  const scopedBranchIds = new Set(filtered.map((b) => b.id));
  const scopedAccounts = accounts.filter((a) => scopedBranchIds.has(a.branchId));
  const inactive = scopedAccounts.filter((a) => !a.funded).length;
  const scopedEvents = conductEvents.filter((e) => scopedBranchIds.has(e.branchId));
  const openAlerts = scopedAlerts.filter((a) => a.status !== "closed" && a.workflowStatus !== "closed_monitoring").length;
  const systemicAlerts = scopedAlerts.filter(
    (a) => a.alertType === "Potential Systemic Incentive Risk" || a.alertType === "Potential Recurring Control Failure",
  ).length;
  const highRisk = filtered.filter((b) => scoresByBranch[b.id].severity === "red").length;
  const overdueInv = investigations.filter(
    (i) =>
      scopedAlerts.some((a) => a.id === i.alertId) &&
      i.status !== "closed_monitoring" &&
      isPastDeadline(i.dueDate),
  ).length;
  const overdueCa = correctiveActions.filter(
    (c) =>
      scopedAlerts.some((a) => a.id === c.alertId) &&
      c.status !== "completed" &&
      isPastDeadline(c.deadline, false),
  ).length;

  const trendSource = filtered.length ? filtered : branches;
  const enterpriseTrend = MONTHS.map((month, i) => {
    const rows = trendSource.map((b) => b.monthlyTrends[i]);
    const n = rows.length || 1;
    return {
      month: month.replace(" 2026", ""),
      unfundedRate: Number((rows.reduce((acc, r) => acc + r.unfundedRate, 0) / n).toFixed(1)),
      complaints: rows.reduce((acc, r) => acc + r.complaints, 0),
      terminations: rows.reduce((acc, r) => acc + r.terminations, 0),
      investigations: rows.reduce((acc, r) => acc + Math.round(r.complaints * 0.4), 0),
      alerts: i < 3 ? 0 : i === 3 ? 1 : i === 4 ? 2 : scopedAlerts.length,
    };
  });

  const barData = filtered.map((b) => ({
    name: b.id,
    score: scoresByBranch[b.id].riskScore,
    fill: severityFill(scoresByBranch[b.id].riskScore),
  }));

  const periodNote =
    filters.period !== REPORTING_PERIOD
      ? "Prior-period archive is not loaded in this prototype; figures remain the current reporting period."
      : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{APP_NAME}</h1>
          <p className="mt-1 text-sm text-slate-600">{APP_SUBTITLE} — operational overview</p>
          <p className="mt-1 text-xs text-slate-500">
            Proposed technology-enabled solution · synthetic demonstration data · {REPORTING_PERIOD}
          </p>
        </div>
        <InfoTip text="You are viewing as Independent Enterprise Risk. Classification of systemic alerts is reserved for Risk / Compliance, not the originating business.">
          <span className="cursor-help rounded border border-slate-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
            Enterprise Risk
          </span>
        </InfoTip>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">Scenario in view: {scenario.label}</p>
        <p className="mt-1">{scenario.description}</p>
        <p className="mt-2 text-xs text-slate-500">
          Ordinary operational activity (accounts opened, routine complaints) is shown alongside{" "}
          <GlossaryTip term="conduct risk" /> patterns — combinations that may indicate systemic
          misconduct. {THRESHOLD_DISCLAIMER}
        </p>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />
      {periodNote ? <p className="text-xs text-slate-500">{periodNote}</p> : null}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Total accounts opened" value={formatNumber(scopedAccounts.length)} />
        <StatCard
          label="Inactive / unused accounts"
          value={`${formatNumber(inactive)} (${formatPct(scopedAccounts.length ? (inactive / scopedAccounts.length) * 100 : 0)})`}
        />
        <StatCard
          label="Unauthorised-account complaints"
          value={scopedEvents.filter((e) => e.type === "complaint").length}
        />
        <StatCard
          label="Sales-related investigations"
          value={scopedEvents.filter((e) => e.type === "investigation").length}
        />
        <StatCard
          label="Sales-related terminations"
          value={scopedEvents.filter((e) => e.type === "termination").length}
        />
        <StatCard label="Active risk alerts" value={openAlerts} />
        <StatCard label="High-risk branches" value={highRisk} tone={highRisk ? "red" : "green"} />
        <StatCard
          label="Overdue reviews / actions"
          value={overdueInv + overdueCa}
          tone={overdueInv + overdueCa ? "red" : "green"}
          hint={`Investigations ${overdueInv} · actions ${overdueCa} as at ${AS_OF}`}
        />
      </div>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Green branches" value={counts.green} tone="green" />
        <StatCard label="Amber branches" value={counts.amber} tone="amber" />
        <StatCard label="Red branches" value={counts.red} tone="red" />
        <StatCard label="Systemic / recurring alerts" value={systemicAlerts} tone="red" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <LineChartCard
          title="Unfunded Account Rate"
          subtitle="Enterprise average, 6 months"
          data={enterpriseTrend}
          series={[{ key: "unfundedRate", name: "Unfunded %", color: "#334155" }]}
        />
        <LineChartCard
          title="Customer Complaints"
          subtitle="Enterprise count, 6 months"
          data={enterpriseTrend}
          series={[{ key: "complaints", name: "Complaints", color: "#475569" }]}
        />
        <LineChartCard
          title="Sales-related investigations & terminations"
          subtitle="Integrity activity is control activity — not proof that risk is falling"
          data={enterpriseTrend}
          series={[
            { key: "investigations", name: "Investigations (illustrative)", color: "#475569" },
            { key: "terminations", name: "Terminations", color: "#1e293b" },
          ]}
        />
        <LineChartCard
          title="Risk alert trend"
          subtitle="Alerts generated as combinations appear — not as a target to maximise"
          data={enterpriseTrend}
          series={[{ key: "alerts", name: "Active / new alerts", color: "#334155" }]}
        />
        <BarChartCard
          title="Risk Score by Branch"
          subtitle="Rule-based 0–100 score. Green 0–29 · Amber 30–59 · Red 60–100"
          data={barData}
        />
      </div>

      <Card>
        <CardHeader
          title="Branch Risk Overview"
          subtitle="Click a row for the branch file. Scores aggregate employee indicators — they are not HR conclusions."
        />
        <CardBody className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                {[
                  "Branch",
                  "Region",
                  "Sales Target",
                  "Products Sold",
                  "Unfunded Account %",
                  "Reversal %",
                  "Complaints",
                  "EthicsLine Cases",
                  "Terminations",
                  "Risk Score",
                  "Severity",
                ].map((h) => (
                  <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => {
                const s = scoresByBranch[b.id];
                return (
                  <tr key={b.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/branches/${b.id}`} className="font-medium text-slate-900 hover:underline">
                        {b.id} {b.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{b.region}</td>
                    <td className="px-4 py-3 tabular-nums">{formatNumber(b.salesTarget)}</td>
                    <td className="px-4 py-3 tabular-nums">{formatNumber(b.productsSold)}</td>
                    <td className="px-4 py-3 tabular-nums">{formatPct(s.unfundedAccountRate)}</td>
                    <td className="px-4 py-3 tabular-nums">{formatPct(s.reversalRate)}</td>
                    <td className="px-4 py-3 tabular-nums">{s.complaintCount}</td>
                    <td className="px-4 py-3 tabular-nums">{s.ethicsLineCount}</td>
                    <td className="px-4 py-3 tabular-nums">{s.terminationCount}</td>
                    <td className="px-4 py-3 font-semibold tabular-nums">{s.riskScore}</td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={s.severity} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>
      <p className="text-[11px] text-slate-500">
        Synthetic store: {mockStats.branches} branches · {mockStats.employees} employees ·{" "}
        {mockStats.accounts} accounts · {mockStats.conductEvents} conduct events · {mockStats.alerts}{" "}
        alerts. Not genuine Wells Fargo data. Composite scores are explainable but limited; they can
        produce false positives and still require human interpretation.
      </p>
    </div>
  );
}
