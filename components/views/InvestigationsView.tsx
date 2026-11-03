"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/Card";
import { WorkflowStrip } from "@/components/workflow/WorkflowStrip";
import { useAppState } from "@/context/AppStateContext";
import { AS_OF, isPastDeadline } from "@/lib/asOf";
import { LINE_LABELS } from "@/lib/constants";
import { filterTagged } from "@/lib/demo";
import { branchLabel } from "@/lib/mock";
import { GlossaryTip } from "@/components/ui/GlossaryTip";

export function InvestigationsView() {
  const { investigations, demoScenario } = useAppState();
  const rows = filterTagged(investigations, demoScenario);
  const overdue = rows.filter(
    (i) => isPastDeadline(i.dueDate, i.status === "closed_monitoring") && i.status !== "closed_monitoring",
  );
  const escalated = rows.filter((i) => i.status === "escalated");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Investigations & Escalations</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Detection is not enough — Wells Fargo’s warning signs were often not{" "}
          <GlossaryTip term="escalation" />. Independent Risk Management (second line) owns the
          review. An investigation does not automatically discipline an employee.
        </p>
      </div>
      <WorkflowStrip status="under_review" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Open investigations" value={rows.filter((i) => i.status !== "closed_monitoring").length} />
        <StatCard label="Overdue reviews" value={overdue.length} tone={overdue.length ? "red" : "green"} hint={`SLA vs ${AS_OF}`} />
        <StatCard label="Escalated" value={escalated.length} tone="red" />
        <StatCard label="Owner" value="IRM (2nd line)" hint={LINE_LABELS.second} />
      </div>
      <Card>
        <CardHeader title="Investigation register" subtitle="Assigned to Independent Risk Management, not the originating business" />
        <CardBody className="overflow-x-auto p-0">
          {rows.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">
              No investigations in this demonstration scenario (normal operations).
            </p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  {["ID", "Alert", "Scope", "Status", "IRM owner", "Due", "Escalation"].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((i) => (
                  <tr key={i.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link href={`/investigations/${i.id}`} className="font-semibold hover:underline">
                        {i.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/alerts/${i.alertId}`} className="hover:underline">
                        {i.alertId}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{i.branchIds.map(branchLabel).join(" / ")}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={i.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-700">{i.assignedTo}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {i.dueDate}
                      {isPastDeadline(i.dueDate, i.status === "closed_monitoring") ? (
                        <span className="ml-2 text-[10px] font-semibold uppercase text-red-700">Overdue</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{i.escalationTarget ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
