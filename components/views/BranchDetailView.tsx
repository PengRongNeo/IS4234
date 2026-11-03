"use client";

import Link from "next/link";
import { LineChartCard } from "@/components/charts/Charts";
import { SeverityBadge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/Card";
import { formatPct } from "@/lib/format";
import { branches, employees, scoresByBranch } from "@/lib/mock";

export function BranchDetailView({ branchId }: { branchId: string }) {
  const branch = branches.find((b) => b.id === branchId);
  const score = scoresByBranch[branchId];
  const staff = employees.filter((e) => e.branchId === branchId);

  if (!branch || !score) {
    return (
      <div>
        <p className="text-sm text-slate-600">Branch not found.</p>
        <Link href="/branches" className="text-sm text-slate-900 underline">
          Back to branch monitoring
        </Link>
      </div>
    );
  }

  const trend = branch.monthlyTrends.map((m) => ({
    month: m.month.replace(" 2026", ""),
    salesVolume: m.salesVolume,
    unfundedAccounts: m.unfundedAccounts,
    complaints: m.complaints,
    terminations: m.terminations,
  }));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/branches" className="text-xs text-slate-500 hover:text-slate-800">
          ← Branch monitoring
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {branch.id} {branch.name}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {branch.region} region · Manager {branch.manager}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wide text-slate-500">Risk score</p>
              <p className="text-2xl font-semibold tabular-nums text-slate-900">{score.riskScore}</p>
            </div>
            <SeverityBadge severity={score.severity} />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-600">
          <span>
            Status: <strong className="font-medium text-slate-800">{branch.status}</strong>
          </span>
          <span>Last reviewed: {branch.lastReviewed}</span>
          {score.flags.map((f) => (
            <SeverityBadge key={f} severity={score.severity} label={f} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Sales Target" value={branch.salesTarget} />
        <StatCard label="Products Sold" value={branch.productsSold} />
        <StatCard label="Unfunded Account Rate" value={formatPct(score.unfundedAccountRate)} />
        <StatCard label="Same-Day Reversal Rate" value={formatPct(score.reversalRate)} />
        <StatCard label="Customer Complaints" value={score.complaintCount} />
        <StatCard label="EthicsLine Cases" value={score.ethicsLineCount} />
        <StatCard label="Investigations" value={score.investigationCount} />
        <StatCard label="Terminations" value={score.terminationCount} />
      </div>

      <LineChartCard
        title="Six-month operating and conduct trend"
        subtitle="Sales volume vs unfunded accounts, complaints, and terminations"
        data={trend}
        series={[
          { key: "salesVolume", name: "Sales volume", color: "#334155" },
          { key: "unfundedAccounts", name: "Unfunded accounts", color: "#64748b" },
          { key: "complaints", name: "Complaints", color: "#d97706" },
          { key: "terminations", name: "Terminations", color: "#b91c1c" },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Why this branch was flagged" />
          <CardBody>
            <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">
              {branch.flagReasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Score narrative
              </p>
              <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-600">
                {score.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Risk Interpretation" subtitle="Hypothesis for human review — not a finding of guilt" />
          <CardBody>
            <p className="text-sm leading-relaxed text-slate-700">{branch.interpretation}</p>
            {branch.scenario === "manager" || branch.scenario === "systemic" ? (
              <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
                Repeated patterns across employees are routed for manager-level or incentive-model
                review. They are not automatically closed as isolated HR cases.
              </p>
            ) : null}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Employees"
          subtitle="Person-level indicators are inputs to branch aggregation. High-risk status is a monitoring flag."
        />
        <CardBody className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                {[
                  "Employee ID",
                  "Employee Name",
                  "Products Sold",
                  "Target",
                  "Unfunded Accounts",
                  "Reversals",
                  "Complaints",
                  "Investigations",
                  "Risk Status",
                ].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {staff.map((e) => (
                <tr key={e.id} className="border-t border-slate-100">
                  <td className="px-4 py-2.5 font-mono text-xs">{e.id}</td>
                  <td className="px-4 py-2.5">{e.name}</td>
                  <td className="px-4 py-2.5 tabular-nums">{e.productsSold}</td>
                  <td className="px-4 py-2.5 tabular-nums">{e.target}</td>
                  <td className="px-4 py-2.5 tabular-nums">{e.unfundedAccounts}</td>
                  <td className="px-4 py-2.5 tabular-nums">{e.reversals}</td>
                  <td className="px-4 py-2.5 tabular-nums">{e.complaints}</td>
                  <td className="px-4 py-2.5 tabular-nums">{e.investigations}</td>
                  <td className="px-4 py-2.5">
                    <SeverityBadge severity={e.riskStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
