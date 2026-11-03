"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SeverityBadge, StatusBadge } from "@/components/ui/Badge";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useAppState } from "@/context/AppStateContext";
import { CLASSIFICATION_LABELS, REVIEW_ACTIONS } from "@/lib/constants";
import { formatDay } from "@/lib/format";
import { branchLabel, scopeLabel } from "@/lib/mock";
import type { Classification } from "@/lib/types";

export function AlertDetailView({ alertId }: { alertId: string }) {
  const { alerts, getDraft, updateDraft, saveDraft, submitDecision } = useAppState();
  const alert = alerts.find((a) => a.id === alertId);
  const [error, setError] = useState("");

  const draft = useMemo(
    () => (alert ? getDraft(alertId, alert) : null),
    [alert, alertId, getDraft],
  );

  if (!alert || !draft) {
    return (
      <div>
        <p className="text-sm text-slate-600">Alert not found.</p>
        <Link href="/alerts" className="text-sm underline">
          Back to alerts
        </Link>
      </div>
    );
  }

  const submitted = alert.status === "classified" || alert.status === "escalated";
  const isSystemicType = alert.alertType === "Potential Systemic Incentive Risk";

  function toggleAction(id: string) {
    const selected = draft!.selectedActions.includes(id)
      ? draft!.selectedActions.filter((x) => x !== id)
      : [...draft!.selectedActions, id];
    updateDraft(alertId, { selectedActions: selected });
  }

  function onSubmit() {
    const result = submitDecision(alertId);
    setError(result.ok ? "" : result.message);
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/alerts" className="text-xs text-slate-500 hover:text-slate-800">
          ← Alerts
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-slate-900">Alert {alert.id}</h1>
          <div className="flex items-center gap-2">
            <SeverityBadge severity={alert.severity} />
            <StatusBadge status={alert.status} />
          </div>
        </div>
        <p className="mt-1 text-sm text-slate-600">{alert.alertType}</p>
        {alert.investigationId ? (
          <p className="mt-2 text-sm">
            Investigation file:{" "}
            <Link href={`/investigations/${alert.investigationId}`} className="underline">
              {alert.investigationId}
            </Link>
            {alert.ruleId ? ` · Detection rule ${alert.ruleId}` : null}
          </p>
        ) : null}
      </div>

      {alert.requiresIndependentClassification ? (
        <div className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">Independent classification required</p>
          <p className="mt-1">
            The originating business cannot close this alert. Independent Risk / Compliance must
            classify the issue. Serious alerts escalate to the CRO and, where systemic, the Board
            Risk Committee. The model supports the decision; it does not determine guilt.
          </p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="System-generated explanation" />
          <CardBody>
            <dl className="mb-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-slate-500">Scope</dt>
                <dd className="mt-0.5 text-slate-800">
                  {alert.branchIds.map((id) => (
                    <Link key={id} href={`/branches/${id}`} className="mr-2 underline">
                      {branchLabel(id)}
                    </Link>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-slate-500">Trigger date</dt>
                <dd className="mt-0.5 text-slate-800">{formatDay(alert.date)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[11px] uppercase tracking-wide text-slate-500">Trigger</dt>
                <dd className="mt-0.5 text-slate-800">{alert.trigger}</dd>
              </div>
            </dl>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{alert.explanation}</p>
            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Risk indicators that triggered the alert
              </p>
              {alert.triggeredIndicators?.length ? (
                <table className="mt-2 w-full text-left text-sm">
                  <thead className="text-[11px] uppercase text-slate-500">
                    <tr>
                      <th className="py-1">Indicator</th>
                      <th>Value</th>
                      <th>Illustrative threshold</th>
                      <th>Breached</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alert.triggeredIndicators.map((i) => (
                      <tr key={i.name} className="border-t border-slate-100">
                        <td className="py-1.5">{i.name}</td>
                        <td>{i.value}</td>
                        <td>{i.threshold}</td>
                        <td>{i.breached ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
                  {alert.indicators.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              )}
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Supporting metrics" />
          <CardBody className="space-y-3">
            {alert.supportingMetrics.map((m) => (
              <div key={m.label}>
                <p className="text-[11px] uppercase tracking-wide text-slate-500">{m.label}</p>
                <p className="text-sm font-medium text-slate-900">{m.value}</p>
              </div>
            ))}
            <p className="text-xs text-slate-500">Assigned to {alert.assignedTo} ({alert.assignedRole})</p>
            <p className="text-xs text-slate-500">Scope: {scopeLabel(alert.branchIds)}</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Risk Classification Review"
          subtitle="Human review. Technology does not auto-close or determine culpability."
        />
        <CardBody className="space-y-5">
          <fieldset disabled={submitted} className="space-y-2">
            <legend className="text-sm font-medium text-slate-800">Classification</legend>
            {(Object.keys(CLASSIFICATION_LABELS) as Classification[]).map((key) => (
              <label key={key} className="flex items-start gap-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="classification"
                  checked={draft.classification === key}
                  onChange={() => updateDraft(alertId, { classification: key })}
                  className="mt-1"
                />
                <span>
                  {CLASSIFICATION_LABELS[key]}
                  {key === "systemic_incentive" && isSystemicType ? (
                    <span className="block text-xs text-slate-500">
                      Default for multi-branch incentive patterns. Suggested actions include CRO /
                      Board escalation, freeze of target increases, and incentive review.
                    </span>
                  ) : null}
                </span>
              </label>
            ))}
          </fieldset>

          <label className="block text-sm text-slate-700">
            Review comment
            <textarea
              disabled={submitted}
              value={draft.comment}
              onChange={(e) => updateDraft(alertId, { comment: e.target.value })}
              rows={4}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800"
              placeholder="Record the rationale. This becomes part of the audit trail."
            />
          </label>

          <fieldset disabled={submitted}>
            <legend className="text-sm font-medium text-slate-800">Recommended actions</legend>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {REVIEW_ACTIONS.map((action) => (
                <label key={action.id} className="flex items-start gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={draft.selectedActions.includes(action.id)}
                    onChange={() => toggleAction(action.id)}
                    className="mt-1"
                  />
                  {action.label}
                </label>
              ))}
            </div>
          </fieldset>

          {draft.classification === "systemic_incentive" ? (
            <p className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Submitting a systemic classification will automatically record: “Sales target increase
              frozen pending CRO review”, and will escalate according to the selected governance
              actions. The alert will not be marked closed.
            </p>
          ) : null}

          {error ? <p className="text-sm text-red-700">{error}</p> : null}

          {!submitted ? (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => saveDraft(alertId)}
                className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={onSubmit}
                className="rounded bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Submit Decision
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-600">
              Decision recorded. See the{" "}
              <Link href="/audit-trail" className="underline">
                audit trail
              </Link>{" "}
              for the immutable sequence of governance actions.
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
