"use client";

import { BarChartCard, DistributionPie, DualLineCard, LineChartCard } from "@/components/charts/Charts";
import { SeverityBadge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/Card";
import { useAppState } from "@/context/AppStateContext";
import { LINE_LABELS, MONTHS } from "@/lib/constants";
import { branches, scoresByBranch } from "@/lib/mock";
import { filterAlerts, filterBranches } from "@/lib/demo";
import { AS_OF, isPastDeadline } from "@/lib/asOf";
import { ILLUSTRATIVE_THRESHOLDS } from "@/lib/thresholds";
import type { KriRow } from "@/lib/types";
import { trendArrow } from "@/lib/format";

export function BoardReportView() {
  const {
    alerts,
    investigations,
    correctiveActions,
    salesTargetFrozen,
    incentiveReviewRequired,
    boardEscalated,
    demoScenario,
  } = useAppState();
  const scopedBranches = filterBranches(branches, demoScenario);
  const scopedAlerts = filterAlerts(alerts, demoScenario);
  const scores = scopedBranches.map((b) => scoresByBranch[b.id]);
  const red = scores.filter((s) => s.severity === "red").length;
  const amber = scores.filter((s) => s.severity === "amber").length;
  const green = scores.filter((s) => s.severity === "green").length;
  const avgScore = Math.round(scores.reduce((a, s) => a + s.riskScore, 0) / scores.length);
  const overall = avgScore >= 60 ? "High" : avgScore >= 30 ? "Elevated" : "Within appetite";
  const highOpen = scopedAlerts.filter(
    (a) => a.severity === "red" && a.status !== "closed" && a.workflowStatus !== "closed_monitoring",
  ).length;
  const systemicOpen = scopedAlerts.filter(
    (a) =>
      a.alertType === "Potential Systemic Incentive Risk" ||
      a.alertType === "Potential Recurring Control Failure",
  ).length;
  const overdueInv = investigations.filter(
    (i) => i.status !== "closed_monitoring" && isPastDeadline(i.dueDate),
  ).length;
  const overdueCa = correctiveActions.filter(
    (c) => c.status !== "completed" && isPastDeadline(c.deadline, false),
  ).length;
  const recurring = correctiveActions.filter((c) => c.recurrenceAfterCompletion || c.status === "ineffective").length;
  const completedOnTime = correctiveActions.filter(
    (c) => c.status === "completed" && c.completedDate && c.completedDate <= c.deadline,
  ).length;
  const reviewedOnTime = investigations.filter((i) => {
    if (!i.reviewedDate) return i.status === "closed_monitoring" && !isPastDeadline(i.dueDate, true);
    return i.reviewedDate <= i.dueDate;
  }).length;
  const reviewPct = investigations.length
    ? Math.round((reviewedOnTime / investigations.length) * 100)
    : 0;
  const completePct = correctiveActions.length
    ? Math.round((completedOnTime / correctiveActions.length) * 100)
    : 0;
  const recurrenceRate = correctiveActions.length
    ? Math.round((recurring / correctiveActions.length) * 100)
    : 0;

  const n = scores.length || 1;
  const products = scopedBranches.reduce((a, b) => a + b.productsSold, 0) || 1;
  const staff = scopedBranches.length * 8 || 1;
  const unfundedAvg = scores.reduce((a, s) => a + s.unfundedAccountRate, 0) / n;
  const reversalAvg = scores.reduce((a, s) => a + s.reversalRate, 0) / n;
  const complaintRate = (scores.reduce((a, s) => a + s.complaintCount, 0) / products) * 100;
  const ethicsRate = (scores.reduce((a, s) => a + s.ethicsLineCount, 0) / products) * 100;
  const termRate = (scores.reduce((a, s) => a + s.terminationCount, 0) / staff) * 100;

  const kris: KriRow[] = [
    {
      kri: "Unfunded Account Rate",
      currentValue: `${unfundedAvg.toFixed(1)}%`,
      threshold: "12%",
      status: unfundedAvg >= 12 ? "red" : unfundedAvg >= 8 ? "amber" : "green",
      trend: "up",
    },
    {
      kri: "Termination Rate",
      currentValue: `${termRate.toFixed(1)} per 100 staff`,
      threshold: "5 per 100",
      status: termRate >= 5 ? "red" : termRate >= 2 ? "amber" : "green",
      trend: "up",
    },
    {
      kri: "EthicsLine Rate",
      currentValue: `${ethicsRate.toFixed(2)} per 100 products`,
      threshold: "1.0",
      status: ethicsRate >= 1 ? "red" : ethicsRate >= 0.4 ? "amber" : "green",
      trend: "up",
    },
    {
      kri: "Complaint Rate",
      currentValue: `${complaintRate.toFixed(2)} per 100 products`,
      threshold: "3.0",
      status: complaintRate >= 3 ? "red" : complaintRate >= 1.5 ? "amber" : "green",
      trend: "up",
    },
    {
      kri: "Same-Day Reversal Rate",
      currentValue: `${reversalAvg.toFixed(1)}%`,
      threshold: "8%",
      status: reversalAvg >= 8 ? "red" : reversalAvg >= 4 ? "amber" : "green",
      trend: "up",
    },
  ];

  const trend = MONTHS.map((month, i) => {
    const rows = (scopedBranches.length ? scopedBranches : branches).map((b) => b.monthlyTrends[i]);
    return {
      month: month.replace(" 2026", ""),
      riskIndex: Number(
        (
          rows.reduce((acc, r) => acc + r.unfundedRate, 0) / rows.length +
          rows.reduce((acc, r) => acc + r.complaints, 0) * 0.8 +
          rows.reduce((acc, r) => acc + r.terminations, 0) * 4
        ).toFixed(1),
      ),
      complaints: rows.reduce((acc, r) => acc + r.complaints, 0),
      terminations: rows.reduce((acc, r) => acc + r.terminations, 0),
      unfundedRate: Number((rows.reduce((acc, r) => acc + r.unfundedRate, 0) / rows.length).toFixed(1)),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          ERCC / Board Risk Committee
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">Governance Oversight</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Are conduct risks being identified, escalated and resolved — or are the same problems
          continuing despite existing controls? Portfolio stance in this view: {overall} (score{" "}
          {Number.isFinite(avgScore) ? avgScore : 0}). This pack is accountability and remediation,
          not the operational detection dashboard. It does not attribute individual guilt.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          {LINE_LABELS.first} implements actions. {LINE_LABELS.second} challenges and escalates.{" "}
          {LINE_LABELS.third} assures the process. Lines are not interchangeable.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <StatCard label="High-severity alerts" value={highOpen} tone="red" hint={`${systemicOpen} systemic/recurring`} />
        <StatCard label="Recurring / ineffective actions" value={recurring} tone="red" />
        <StatCard label="Overdue investigations" value={overdueInv} tone={overdueInv ? "red" : "green"} hint={`As at ${AS_OF}`} />
        <StatCard label="Overdue corrective actions" value={overdueCa} tone={overdueCa ? "red" : "green"} />
        <StatCard label="Unresolved escalations" value={scopedAlerts.filter((a) => a.workflowStatus === "escalated").length} tone="red" />
      </div>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Control activity: alerts" value={scopedAlerts.length} hint="Volume is not effectiveness" />
        <StatCard label="% reviewed within SLA" value={`${reviewPct}%`} hint={`Illustrative SLA ${ILLUSTRATIVE_THRESHOLDS.reviewSlaDays} days`} />
        <StatCard label="% actions completed on time" value={`${completePct}%`} />
        <StatCard label="Recurrence rate" value={`${recurrenceRate}%`} tone={recurrenceRate ? "red" : "green"} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <LineChartCard
          title="Conduct risk trend"
          subtitle="Composite index of unfunded rates, complaints, and terminations"
          data={trend}
          series={[{ key: "riskIndex", name: "Conduct risk index", color: "#1e293b" }]}
        />
        <DualLineCard
          title="Terminations vs unfunded account rate"
          subtitle="Integrity outcomes should not be read without unused-account context"
          data={trend}
        />
        <LineChartCard
          title="Complaints trend"
          data={trend}
          series={[{ key: "complaints", name: "Complaints", color: "#334155" }]}
        />
        <DistributionPie
          title="Risk distribution"
          data={[
            { name: "Green", value: green, fill: "#059669" },
            { name: "Amber", value: amber, fill: "#d97706" },
            { name: "Red", value: red, fill: "#b91c1c" },
          ]}
        />
      </div>

      <BarChartCard
        title="Branch risk scores (Board view)"
        data={scopedBranches.map((b) => ({
          name: b.id,
          score: scoresByBranch[b.id].riskScore,
          fill:
            scoresByBranch[b.id].riskScore >= 60
              ? "#b91c1c"
              : scoresByBranch[b.id].riskScore >= 30
                ? "#d97706"
                : "#059669",
        }))}
      />

      <Card>
        <CardHeader title="Key Risk Indicators" />
        <CardBody className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                {["KRI", "Current Value", "Threshold", "Status", "Trend"].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kris.map((k) => (
                <tr key={k.kri} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">{k.kri}</td>
                  <td className="px-4 py-3 tabular-nums">{k.currentValue}</td>
                  <td className="px-4 py-3 text-slate-600">{k.threshold}</td>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={k.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {trendArrow(k.trend)} {k.trend}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Matters Requiring Board Attention" />
        <CardBody>
          <ol className="list-decimal space-y-3 pl-5 text-sm text-slate-800">
            <li>
              Recurring control failure at Lakeside (B003 / A005): prior first-line coaching was
              completed on time, but unused-account and complaint indicators returned. Control
              activity occurred; control effectiveness did not.
            </li>
            <li>
              Systemic incentive-risk alert affecting B004 Harborview / B005 Midtown / B006 Capitol
              Square. Independent Risk classification is required; the business cannot close the
              alert.
            </li>
            <li>
              {salesTargetFrozen
                ? "Sales-target increase frozen pending CRO review (governance action recorded)."
                : "Sales-target increase frozen pending CRO review — recommended control; confirm by submitting the A003 classification."}
            </li>
            <li>
              {incentiveReviewRequired
                ? "Incentive structure review required (recorded on the audit trail)."
                : "Incentive structure review required — employee-level remediation alone is insufficient for a three-branch pattern."}
            </li>
            {boardEscalated ? (
              <li>Alert A003 has been escalated to this Committee and is on the formal agenda.</li>
            ) : null}
          </ol>
        </CardBody>
      </Card>
    </div>
  );
}
