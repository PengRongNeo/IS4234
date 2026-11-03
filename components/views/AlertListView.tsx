"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SeverityBadge, StatusBadge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useAppState } from "@/context/AppStateContext";
import { formatDay } from "@/lib/format";
import { branchLabel, scopeLabel } from "@/lib/mock";
import { filterAlerts } from "@/lib/demo";
import type { Severity } from "@/lib/types";

export function AlertListView() {
  const { alerts, demoScenario } = useAppState();
  const [severity, setSeverity] = useState<"all" | Severity>("all");
  const [status, setStatus] = useState("all");

  const rows = useMemo(() => {
    return filterAlerts(alerts, demoScenario).filter((a) => {
      if (severity !== "all" && a.severity !== severity) return false;
      if (status !== "all" && a.status !== status && a.workflowStatus !== status) return false;
      return true;
    });
  }, [alerts, demoScenario, severity, status]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Risk Alerts</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Alerts are potential conduct-risk hypotheses generated from cross-indicator rules. They
          require investigation. They are not definitive evidence of fraud. Systemic and recurring
          alerts cannot be closed by the originating business.
        </p>
      </div>
      <div className="flex gap-3">
        <label className="text-xs text-slate-500">
          Severity
          <select
            className="ml-2 rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-800"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as "all" | Severity)}
          >
            <option value="all">All</option>
            <option value="green">Green</option>
            <option value="amber">Amber</option>
            <option value="red">Red</option>
          </select>
        </label>
        <label className="text-xs text-slate-500">
          Status
          <select
            className="ml-2 rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-800"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="draft">Draft</option>
            <option value="under_review">Under review</option>
            <option value="classified">Classified</option>
            <option value="escalated">Escalated</option>
          </select>
        </label>
      </div>
      <Card>
        <CardHeader title="Conduct-risk alerts" subtitle={`${rows.length} in view`} />
        <CardBody className="overflow-x-auto p-0">
          {rows.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              No alerts in this demonstration scenario. Ordinary operations are not auto-classified as
              systemic risk.
            </p>
          ) : null}
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                {["Alert ID", "Date", "Branch / Scope", "Severity", "Alert Type", "Workflow", "Owner (IRM)"].map(
                  (h) => (
                    <th key={h} className="px-4 py-3 font-semibold">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/alerts/${a.id}`} className="font-semibold text-slate-900 hover:underline">
                      {a.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">{formatDay(a.date)}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {a.branchIds.length > 1 ? scopeLabel(a.branchIds) : branchLabel(a.branchIds[0])}
                  </td>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={a.severity} />
                  </td>
                  <td className="px-4 py-3 text-slate-800">{a.alertType}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.workflowStatus} />
                  </td>
                  <td className="px-4 py-3 text-slate-700">{a.assignedTo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
