"use client";

import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useAppState } from "@/context/AppStateContext";
import { formatDate, statusLabel } from "@/lib/format";

export function AuditTrailView() {
  const { auditEvents } = useAppState();
  const rows = [...auditEvents].sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Audit Trail</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Governance actions append immutable records. This prototype stores events in session
          state; entries are not edited after write. Submitting an alert decision adds classification,
          freeze, and escalation rows here.
        </p>
      </div>
      <Card>
        <CardHeader title="Event log" subtitle="Append-only · Independent Risk / System" />
        <CardBody className="overflow-x-auto p-0">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                {["Timestamp", "User / System", "Role", "Action", "Alert", "Old Status", "New Status", "Comment"].map(
                  (h) => (
                    <th key={h} className="px-4 py-3 font-semibold">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr key={e.id} className="border-t border-slate-100 align-top">
                  <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs text-slate-600">
                    {formatDate(e.timestamp)}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-slate-800">{e.actor}</td>
                  <td className="px-4 py-2.5 text-slate-600">{e.role}</td>
                  <td className="px-4 py-2.5 text-slate-800">{e.action}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{e.alertId ?? "—"}</td>
                  <td className="px-4 py-2.5 text-slate-600">{e.oldStatus ? statusLabel(e.oldStatus) : "—"}</td>
                  <td className="px-4 py-2.5 text-slate-600">{e.newStatus ? statusLabel(e.newStatus) : "—"}</td>
                  <td className="max-w-sm px-4 py-2.5 text-xs text-slate-600">{e.comment ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
