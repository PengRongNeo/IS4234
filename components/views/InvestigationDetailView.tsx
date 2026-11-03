"use client";

import Link from "next/link";
import { useState } from "react";
import { SeverityBadge, StatusBadge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { WorkflowStrip } from "@/components/workflow/WorkflowStrip";
import { useAppState } from "@/context/AppStateContext";
import { LINE_LABELS, WORKFLOW_STEPS } from "@/lib/constants";
import { branchLabel } from "@/lib/mock";
import type { EscalationTarget, WorkflowStatus } from "@/lib/types";

const ESCALATIONS: EscalationTarget[] = ["Regional Risk", "CRO", "ERCC", "Board Risk Committee"];

export function InvestigationDetailView({ investigationId }: { investigationId: string }) {
  const {
    investigations,
    alerts,
    correctiveActions,
    updateInvestigation,
    addCorrectiveAction,
  } = useAppState();
  const inv = investigations.find((i) => i.id === investigationId);
  const alert = alerts.find((a) => a.id === inv?.alertId);
  const actions = correctiveActions.filter((a) => a.investigationId === investigationId);

  const [findings, setFindings] = useState(inv?.findings ?? "");
  const [status, setStatus] = useState<WorkflowStatus>(inv?.status ?? "detected");
  const [target, setTarget] = useState<EscalationTarget>(inv?.escalationTarget ?? "ERCC");
  const [rationale, setRationale] = useState(inv?.escalationRationale ?? "");
  const [caTitle, setCaTitle] = useState("");
  const [caDesc, setCaDesc] = useState("");
  const [caOwner, setCaOwner] = useState("");
  const [caDeadline, setCaDeadline] = useState("2026-09-15");
  const [error, setError] = useState("");

  if (!inv) {
    return (
      <div>
        <p className="text-sm text-slate-600">Investigation not found.</p>
        <Link href="/investigations" className="text-sm underline">
          Back
        </Link>
      </div>
    );
  }

  const closed = inv.status === "closed_monitoring";

  return (
    <div className="space-y-6">
      <div>
        <Link href="/investigations" className="text-xs text-slate-500 hover:underline">
          ← Investigations
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Investigation {inv.id}</h1>
          <StatusBadge status={inv.status} />
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Alert{" "}
          <Link href={`/alerts/${inv.alertId}`} className="underline">
            {inv.alertId}
          </Link>
          {" · "}
          {inv.branchIds.map(branchLabel).join(" / ")}
        </p>
      </div>

      <WorkflowStrip status={inv.status} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Supporting indicators" subtitle="Hypothesis for review — not a finding of guilt" />
          <CardBody>
            {alert ? (
              <>
                <div className="mb-3 flex gap-2">
                  <SeverityBadge severity={alert.severity} />
                  <span className="text-sm text-slate-700">{alert.alertType}</span>
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{alert.explanation}</p>
                <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
                  {(alert.triggeredIndicators ?? alert.indicators.map((n) => ({ name: n, value: "triggered", threshold: "illustrative", breached: true }))).map(
                    (ind) => (
                      <li key={ind.name}>
                        {ind.name}
                        {"value" in ind ? ` — ${ind.value} (threshold ${ind.threshold})` : ""}
                      </li>
                    ),
                  )}
                </ul>
              </>
            ) : (
              <p className="text-sm text-slate-500">Alert record not loaded.</p>
            )}
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Accountability" />
          <CardBody className="space-y-2 text-sm text-slate-700">
            <p>
              <span className="text-[11px] uppercase text-slate-500">Review owner</span>
              <br />
              {inv.assignedTo} · {inv.assignedRole}
            </p>
            <p className="text-xs text-slate-500">{LINE_LABELS[inv.lineOfDefence]}</p>
            <p>
              Opened {inv.openedDate} · Due {inv.dueDate}
            </p>
            <p className="text-xs text-slate-500">
              First line implements corrective actions. Internal Audit (third line) can inspect this
              file for assurance. Lines of defence are not interchangeable.
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="IRM review record" subtitle="Update status, findings and escalation. Human decision required." />
        <CardBody className="space-y-4">
          <label className="block text-sm text-slate-700">
            Investigation findings
            <textarea
              disabled={closed}
              value={findings}
              onChange={(e) => setFindings(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm text-slate-700">
              Workflow status
              <select
                disabled={closed}
                value={status}
                onChange={(e) => setStatus(e.target.value as WorkflowStatus)}
                className="mt-1 w-full rounded border border-slate-300 px-2 py-2 text-sm"
              >
                {WORKFLOW_STEPS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-slate-700">
              Escalation target
              <select
                disabled={closed}
                value={target}
                onChange={(e) => setTarget(e.target.value as EscalationTarget)}
                className="mt-1 w-full rounded border border-slate-300 px-2 py-2 text-sm"
              >
                {ESCALATIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-sm text-slate-700">
            Escalation rationale
            <textarea
              disabled={closed}
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="Why this cannot remain a local employee-integrity matter."
            />
          </label>
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          {!closed ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded border border-slate-300 bg-white px-3 py-2 text-sm"
                onClick={() => {
                  const r = updateInvestigation(
                    inv.id,
                    { findings, status, assignedTo: inv.assignedTo },
                    `Investigation status set to ${status}`,
                  );
                  setError(r.ok ? "" : r.message);
                }}
              >
                Save findings & status
              </button>
              <button
                type="button"
                className="rounded bg-slate-900 px-3 py-2 text-sm text-white"
                onClick={() => {
                  if (!rationale.trim()) {
                    setError("Escalation requires a rationale.");
                    return;
                  }
                  const r = updateInvestigation(
                    inv.id,
                    {
                      findings,
                      status: "escalated",
                      escalationTarget: target,
                      escalationRationale: rationale,
                      escalatedDate: new Date().toISOString().slice(0, 10),
                    },
                    `Escalated to ${target}`,
                  );
                  setError(r.ok ? "" : r.message);
                  setStatus("escalated");
                }}
              >
                Record escalation
              </button>
              <button
                type="button"
                className="rounded border border-slate-300 px-3 py-2 text-sm"
                onClick={() => {
                  const r = updateInvestigation(
                    inv.id,
                    { status: "closed_monitoring", closedDate: new Date().toISOString().slice(0, 10), findings, recurrenceRecorded: inv.recurrenceRecorded },
                    "Closed with subsequent monitoring",
                  );
                  setError(r.ok ? "" : r.message);
                }}
              >
                Close / monitor
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-500">This file is closed. Subsequent monitoring still applies if indicators return.</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Corrective actions (first line)"
          subtitle="IRM assigns; front-line management executes. Completing a task is activity, not effectiveness."
        />
        <CardBody className="space-y-4">
          {actions.length === 0 ? (
            <p className="text-sm text-slate-500">No corrective actions on this file yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {actions.map((a) => (
                <li key={a.id} className="rounded border border-slate-200 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <Link href="/corrective-actions" className="font-medium hover:underline">
                      {a.id} · {a.title}
                    </Link>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Owner {a.owner} · deadline {a.deadline}
                    {a.recurrenceAfterCompletion ? " · Recurrence recorded after completion" : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {!closed ? (
            <div className="grid gap-2 border-t border-slate-100 pt-4 md:grid-cols-2">
              <input
                className="rounded border border-slate-300 px-3 py-2 text-sm md:col-span-2"
                placeholder="Action title"
                value={caTitle}
                onChange={(e) => setCaTitle(e.target.value)}
              />
              <input
                className="rounded border border-slate-300 px-3 py-2 text-sm md:col-span-2"
                placeholder="Description"
                value={caDesc}
                onChange={(e) => setCaDesc(e.target.value)}
              />
              <input
                className="rounded border border-slate-300 px-3 py-2 text-sm"
                placeholder="First-line owner"
                value={caOwner}
                onChange={(e) => setCaOwner(e.target.value)}
              />
              <input
                type="date"
                className="rounded border border-slate-300 px-3 py-2 text-sm"
                value={caDeadline}
                onChange={(e) => setCaDeadline(e.target.value)}
              />
              <button
                type="button"
                className="rounded bg-slate-900 px-3 py-2 text-sm text-white md:col-span-2"
                onClick={() => {
                  const r = addCorrectiveAction({
                    investigationId: inv.id,
                    title: caTitle,
                    description: caDesc,
                    owner: caOwner,
                    deadline: caDeadline,
                  });
                  setError(r.ok ? "" : r.message);
                  if (r.ok) {
                    setCaTitle("");
                    setCaDesc("");
                    setCaOwner("");
                  }
                }}
              >
                Create corrective action
              </button>
            </div>
          ) : null}
        </CardBody>
      </Card>
    </div>
  );
}
