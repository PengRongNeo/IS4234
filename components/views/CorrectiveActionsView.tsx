"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader, StatCard } from "@/components/ui/Card";
import { GlossaryTip } from "@/components/ui/GlossaryTip";
import { useAppState } from "@/context/AppStateContext";
import { AS_OF, isPastDeadline } from "@/lib/asOf";
import { LINE_LABELS } from "@/lib/constants";
import { filterTagged } from "@/lib/demo";
import { branchLabel } from "@/lib/mock";

export function CorrectiveActionsView() {
  const { correctiveActions, updateCorrectiveAction, demoScenario } = useAppState();
  const rows = filterTagged(correctiveActions, demoScenario);
  const overdue = rows.filter((a) => a.status === "overdue" || isPastDeadline(a.deadline, a.status === "completed"));
  const ineffective = rows.filter((a) => a.status === "ineffective" || a.recurrenceAfterCompletion);
  const onTime = rows.filter((a) => a.status === "completed" && a.completedDate && a.completedDate <= a.deadline);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Corrective Actions</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          Owned by <strong>front-line management</strong> ({LINE_LABELS.first.split("—")[0].trim()}). Independent
          Risk assigns and challenges; Internal Audit can inspect completion for assurance.{" "}
          <GlossaryTip term="control activity" /> is not the same as <GlossaryTip term="control effectiveness" />.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Actions on register" value={rows.length} hint="Control activity" />
        <StatCard label="Completed on time" value={onTime.length} tone="green" hint="Necessary, not sufficient" />
        <StatCard label="Overdue" value={overdue.length} tone={overdue.length ? "red" : "green"} hint={`As at ${AS_OF}`} />
        <StatCard label="Recurred after completion" value={ineffective.length} tone="red" hint="Effectiveness failure" />
      </div>
      <Card>
        <CardHeader title="Action tracker" />
        <CardBody className="overflow-x-auto p-0">
          {rows.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-slate-500">No corrective actions in this scenario.</p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  {["ID", "Title", "Branch", "First-line owner", "Deadline", "Status", "Effectiveness"].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((a) => (
                  <tr key={a.id} className="border-t border-slate-100 align-top">
                    <td className="px-4 py-3 font-mono text-xs">{a.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{a.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{a.description}</p>
                      <p className="mt-1 text-xs">
                        Investigation{" "}
                        <Link className="underline" href={`/investigations/${a.investigationId}`}>
                          {a.investigationId}
                        </Link>
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{a.branchIds.map(branchLabel).join(", ")}</td>
                    <td className="px-4 py-3 text-slate-700">
                      {a.owner}
                      <span className="block text-[11px] text-slate-500">{a.ownerRole}</span>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{a.deadline}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {a.effectivenessNote ?? (a.recurrenceAfterCompletion ? "Indicators returned after completion." : "—")}
                      {a.status !== "completed" && a.status !== "ineffective" ? (
                        <button
                          type="button"
                          className="mt-2 block text-xs font-medium text-slate-900 underline"
                          onClick={() =>
                            updateCorrectiveAction(
                              a.id,
                              {
                                status: "completed",
                                completedDate: new Date().toISOString().slice(0, 10),
                                effectivenessNote:
                                  "Marked complete in the demonstration. Effectiveness is judged by whether indicators fall, not by ticking the task.",
                              },
                              `${a.id} marked complete by first line`,
                            )
                          }
                        >
                          Mark complete
                        </button>
                      ) : null}
                    </td>
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
