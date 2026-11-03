"use client";

import Link from "next/link";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/Card";
import { branches, detectionHits, scoresByBranch, systemicDetection } from "@/lib/mock";
import { THRESHOLD_DISCLAIMER } from "@/lib/thresholds";
import { formatPct } from "@/lib/format";
import { useAppState } from "@/context/AppStateContext";

function heatClass(level: "low" | "mid" | "high") {
  if (level === "high") return "bg-red-50 text-red-800 font-medium";
  if (level === "mid") return "bg-amber-50 text-amber-900";
  return "bg-emerald-50 text-emerald-800";
}

function rateLevel(n: number, mid: number, high: number): "low" | "mid" | "high" {
  if (n >= high) return "high";
  if (n >= mid) return "mid";
  return "low";
}

export function SystemicRiskView() {
  const { salesTargetFrozen, incentiveReviewRequired } = useAppState();
  const cluster = ["B004", "B005", "B006"];
  const clusterBranches = branches.filter((b) => cluster.includes(b.id));
  const avgScore = Math.round(
    cluster.reduce((acc, id) => acc + scoresByBranch[id].riskScore, 0) / cluster.length,
  );

  const complaintChange = clusterBranches.map((b) => {
    const first = b.monthlyTrends[0].complaints;
    const last = b.monthlyTrends[b.monthlyTrends.length - 1].complaints;
    return last - first;
  });
  const termChange = clusterBranches.map((b) => {
    const first = b.monthlyTrends[0].terminations;
    const last = b.monthlyTrends[b.monthlyTrends.length - 1].terminations;
    return last - first;
  });
  const unfundedChange = clusterBranches.map((b) => {
    const first = b.monthlyTrends[0].unfundedRate;
    const last = b.monthlyTrends[b.monthlyTrends.length - 1].unfundedRate;
    return last - first;
  });

  const regions = Array.from(new Set(clusterBranches.map((b) => b.region)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Systemic Risk Monitoring</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Patterns that recur across branches are treated as incentive-model risk, not a set of
          unrelated employee cases. The detection engine (RULE-COMBO / RULE-MULTI / RULE-REC) is
          separate from the screens. {THRESHOLD_DISCLAIMER}
        </p>
        <ul className="mt-2 list-disc pl-5 text-xs text-slate-600">
          {detectionHits.slice(0, 6).map((h) => (
            <li key={`${h.ruleId}-${h.branchIds.join("-")}`}>
              {h.ruleId} {h.ruleName}: {h.branchIds.join(", ")}
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-800">
          Potential Systemic Incentive Risk Detected
        </p>
        <p className="mt-2 text-sm leading-relaxed text-red-900">
          Three branches show simultaneous increases in sales pressure and conduct-risk indicators.
          This pattern warrants review of the incentive model rather than employee-level remediation
          alone.
        </p>
        <p className="mt-2 text-xs text-red-800">
          Engine: {systemicDetection.message || "Cluster B004 / B005 / B006."}{" "}
          <Link href="/alerts/A003" className="underline">
            Open alert A003
          </Link>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Branches affected" value={cluster.length} tone="red" />
        <StatCard label="Regions affected" value={regions.join(", ")} />
        <StatCard label="Average risk score" value={avgScore} tone="red" />
        <StatCard
          label="Change in complaints"
          value={`+${complaintChange.reduce((a, b) => a + b, 0)}`}
          hint="Cluster, period start to end"
        />
        <StatCard
          label="Change in terminations"
          value={`+${termChange.reduce((a, b) => a + b, 0)}`}
        />
        <StatCard
          label="Change in unfunded rates"
          value={`+${(unfundedChange.reduce((a, b) => a + b, 0) / unfundedChange.length).toFixed(1)} pp`}
        />
      </div>

      {(salesTargetFrozen || incentiveReviewRequired) && (
        <div className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700">
          {salesTargetFrozen ? <p>Governance action in force: sales-target increase frozen pending CRO review.</p> : null}
          {incentiveReviewRequired ? <p>Incentive structure review has been required.</p> : null}
        </div>
      )}

      <Card>
        <CardHeader
          title="Indicator heatmap"
          subtitle="B004, B005 and B006 share a common deterioration pattern (highlighted)."
        />
        <CardBody className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                {[
                  "Branch",
                  "Target Increase",
                  "Sales Growth",
                  "Unfunded Rate",
                  "Reversal Rate",
                  "Complaints",
                  "EthicsLine",
                  "Terminations",
                ].map((h) => (
                  <th key={h} className="px-3 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => {
                const s = scoresByBranch[b.id];
                const highlight = cluster.includes(b.id);
                const salesGrowth =
                  ((b.monthlyTrends[5].salesVolume - b.monthlyTrends[0].salesVolume) /
                    b.monthlyTrends[0].salesVolume) *
                  100;
                return (
                  <tr
                    key={b.id}
                    className={`border-t border-slate-100 ${highlight ? "outline outline-1 outline-offset-[-1px] outline-slate-400" : ""}`}
                  >
                    <td className="px-3 py-2.5">
                      <Link href={`/branches/${b.id}`} className="font-medium hover:underline">
                        {b.id} {b.name}
                      </Link>
                      {highlight ? (
                        <span className="ml-2 text-[10px] uppercase tracking-wide text-red-700">
                          Common pattern
                        </span>
                      ) : null}
                    </td>
                    <td className={`px-3 py-2.5 tabular-nums ${heatClass(rateLevel(b.targetIncreasePct, 8, 18))}`}>
                      {b.targetIncreasePct}%
                    </td>
                    <td className={`px-3 py-2.5 tabular-nums ${heatClass(rateLevel(salesGrowth, 8, 15))}`}>
                      {salesGrowth.toFixed(0)}%
                    </td>
                    <td className={`px-3 py-2.5 tabular-nums ${heatClass(rateLevel(s.unfundedAccountRate, 8, 12))}`}>
                      {formatPct(s.unfundedAccountRate)}
                    </td>
                    <td className={`px-3 py-2.5 tabular-nums ${heatClass(rateLevel(s.reversalRate, 4, 8))}`}>
                      {formatPct(s.reversalRate)}
                    </td>
                    <td className={`px-3 py-2.5 tabular-nums ${heatClass(rateLevel(s.complaintCount, 3, 5))}`}>
                      {s.complaintCount}
                    </td>
                    <td className={`px-3 py-2.5 tabular-nums ${heatClass(rateLevel(s.ethicsLineCount, 1, 2))}`}>
                      {s.ethicsLineCount}
                    </td>
                    <td className={`px-3 py-2.5 tabular-nums ${heatClass(rateLevel(s.terminationCount, 1, 2))}`}>
                      {s.terminationCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
