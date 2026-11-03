# Conduct Risk Monitor

Academic **proposed** GRC prototype inspired by the Wells Fargo sales-practices scandal (2002–2016). It is **not** a Wells Fargo system, a banking platform, or a fraud engine, and it does not use genuine Wells Fargo data.

**Problem:** Existing controls (EthicsLine, investigations, account monitoring, discipline) mostly caught *individual* employees. Warning signs were not combined, interpreted, or escalated, so senior management and the Board did not see a *systemic* incentive problem.

**Solution:** The CRM integrates operational indicators, flags unusual *combinations*, supports Independent Risk Management review, and tracks escalation and corrective-action **effectiveness**.

**Workflow demonstrated:** detection → investigation → escalation → corrective action → effectiveness monitoring.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Synthetic data; investigation/action updates persist in the browser (`localStorage`).

## Demonstration scenarios

Use the **Demonstration scenario** control in the header.

| Selector | What you should see |
| --- | --- |
| **1 · Normal operations** | B001 / B007 / B009 stable. No cross-indicator alert. Ordinary activity is not treated as systemic risk. |
| **2 · Emerging systemic risk** | B003 plus East cluster B004–B006. Inactive accounts, complaints and investigations rise together (A002, A003). |
| **3 · Recurring control failure** | Lakeside B003 after CA001 “completed” coaching. Indicators returned (A005). Activity without effectiveness. |
| **Full portfolio** | All ten branches, including isolated-employee B002 (A001) as contrast. |

## Pages

| Nav | Route | Purpose |
| --- | --- | --- |
| Overview | `/` | Operational detection dashboard (accounts, inactive %, complaints, investigations, alerts, overdue work) |
| Risk Indicators | `/branches` | Branch files; click through for employees and score narrative |
| Risk Alerts | `/alerts` | Explainable alerts; not proof of fraud |
| Investigations | `/investigations` | IRM (second line) workflow |
| Corrective Actions | `/corrective-actions` | First-line owners, deadlines, recurrence |
| Governance Oversight | `/board-report` | ERCC / Board: escalation, overdue work, effectiveness vs activity |
| Audit Trail | `/audit-trail` | Append-only governance log |
| Cross-indicator patterns | `/systemic-risk` | Heatmap + engine hits |

## Cross-indicator detection (`lib/detection.ts`)

Thresholds in `lib/thresholds.ts` are **illustrative prototype assumptions**, not Wells Fargo or regulatory standards.

| Rule | Logic | Typical case |
| --- | --- | --- |
| RULE-ISO | One employee dominates unused accounts; branch otherwise near peer range | A001 Oakridge — **do not** mark the whole branch systemic |
| RULE-COMBO | Inactive-account rate **and** investigations **and** complaints all above threshold | A002 Lakeside — possible supervisory / incentive pressure |
| RULE-MULTI | Three or more branches show unused accounts + complaints + terminations | A003 East cluster — possible incentive-model issue |
| RULE-REC | Corrective action completed (or deadline passed) **and** the same indicators remain high | A005 Lakeside — recurring control failure |

A composite 0–100 branch score remains in `lib/scoring.ts` with visible weights and reasons. Limitations: false positives, calibration, data quality, and the need for human interpretation.

## Three lines of defence

- **First line** owns operations and **implements** corrective actions.
- **Second line (IRM)** owns alerts and investigations, challenges the business, and escalates. The business cannot close systemic/recurring alerts.
- **Third line (Internal Audit)** has visibility of investigation files and action completion for assurance.

The prototype does **not** auto-discipline employees.

## Control activity vs effectiveness

Governance Oversight shows both:

- Activity: alerts raised, investigations opened, actions assigned.
- Effectiveness: % reviewed in SLA, % actions on time, **recurrence after “complete”**, overdue work.

More investigations do not mean risk management is working.

## Viva walkthrough

1. Set scenario **Normal operations** — Overview is quiet.
2. Set **Emerging systemic risk** — Overview KPIs move together; open A002 / B003; open A003.
3. Set **Recurring control failure** — open A005 and CA001 (ineffective); Investigations INV005 already escalated to ERCC.
4. On INV002, record findings, escalate, create a first-line action.
5. Governance Oversight: “are the same problems continuing?”
6. Audit Trail: new rows after each action.

## What already existed vs what was added

**Already there:** Next.js dashboard, branch scores, charts, person/manager/systemic alerts, IRM classification form, Board pack, audit trail, mock book (10 branches / 80 staff / ~800 accounts).

**Improved / added:** cross-indicator engine with labelled thresholds; recurring-failure scenario; investigation workflow (detected → closed/monitoring); first-line corrective actions; control-effectiveness metrics; scenario selector; 3LOD labelling; operational vs governance dashboards; academic disclaimers.

## Limitations (must be stated in the demo)

- Synthetic data and illustrative thresholds; not a real integration of bank systems.
- False positives and alert volume are real design risks.
- Access control, model risk, and production data quality are out of scope.
- Technology supports governance; it cannot replace management accountability.
