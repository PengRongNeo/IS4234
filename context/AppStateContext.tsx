"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CLASSIFICATION_LABELS, CURRENT_USER, REVIEW_ACTIONS } from "@/lib/constants";
import {
  initialAlerts,
  initialAuditEvents,
  initialCorrectiveActions,
  initialInvestigations,
} from "@/lib/mock";
import type {
  AlertStatus,
  AuditEvent,
  Classification,
  CorrectiveAction,
  DemoScenarioId,
  Investigation,
  ReviewDraft,
  RiskAlert,
  WorkflowStatus,
} from "@/lib/types";

const STORAGE_KEY = "crm-grc-state-v1";

const emptyDraft: ReviewDraft = {
  classification: "",
  comment: "",
  selectedActions: [],
};

function nowIso() {
  return new Date().toISOString();
}

function nextId(prefix: string, items: { id: string }[]) {
  return `${prefix}${String(items.length + 1).padStart(3, "0")}`;
}

type Toast = { message: string; tone: "success" | "info" } | null;

interface AppStateValue {
  alerts: RiskAlert[];
  auditEvents: AuditEvent[];
  investigations: Investigation[];
  correctiveActions: CorrectiveAction[];
  drafts: Record<string, ReviewDraft>;
  toast: Toast;
  salesTargetFrozen: boolean;
  incentiveReviewRequired: boolean;
  boardEscalated: boolean;
  demoScenario: DemoScenarioId;
  setDemoScenario: (id: DemoScenarioId) => void;
  getDraft: (alertId: string, alert: RiskAlert) => ReviewDraft;
  updateDraft: (alertId: string, patch: Partial<ReviewDraft>) => void;
  saveDraft: (alertId: string) => void;
  submitDecision: (alertId: string) => { ok: boolean; message: string };
  updateInvestigation: (
    id: string,
    patch: Partial<Investigation>,
    auditAction: string,
  ) => { ok: boolean; message: string };
  addCorrectiveAction: (input: {
    investigationId: string;
    title: string;
    description: string;
    owner: string;
    deadline: string;
  }) => { ok: boolean; message: string };
  updateCorrectiveAction: (
    id: string,
    patch: Partial<CorrectiveAction>,
    auditAction: string,
  ) => { ok: boolean; message: string };
  dismissToast: () => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

function suggestedActions(classification: Classification | "") {
  if (!classification) return [];
  return REVIEW_ACTIONS.filter((a) => a.defaultFor?.includes(classification)).map((a) => a.id);
}

const WORKFLOW_TO_ALERT: Partial<Record<WorkflowStatus, AlertStatus>> = {
  detected: "open",
  assigned: "open",
  under_review: "under_review",
  escalated: "escalated",
  corrective_action: "classified",
  closed_monitoring: "closed",
};

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<RiskAlert[]>(initialAlerts);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(() =>
    [...initialAuditEvents].sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
  );
  const [investigations, setInvestigations] = useState<Investigation[]>(initialInvestigations);
  const [correctiveActions, setCorrectiveActions] = useState<CorrectiveAction[]>(initialCorrectiveActions);
  const [drafts, setDrafts] = useState<Record<string, ReviewDraft>>({});
  const [toast, setToast] = useState<Toast>(null);
  const [salesTargetFrozen, setSalesTargetFrozen] = useState(false);
  const [incentiveReviewRequired, setIncentiveReviewRequired] = useState(false);
  const [boardEscalated, setBoardEscalated] = useState(false);
  const [demoScenario, setDemoScenario] = useState<DemoScenarioId>("all");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Restore demonstration edits after mount (avoids SSR mismatch).
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setHydrated(true);
        return;
      }
      const saved = JSON.parse(raw) as Partial<{
        alerts: RiskAlert[];
        auditEvents: AuditEvent[];
        investigations: Investigation[];
        correctiveActions: CorrectiveAction[];
        salesTargetFrozen: boolean;
        incentiveReviewRequired: boolean;
        boardEscalated: boolean;
        demoScenario: DemoScenarioId;
      }>;
      if (saved.alerts?.length) setAlerts(saved.alerts);
      if (saved.auditEvents?.length) setAuditEvents(saved.auditEvents);
      if (saved.investigations?.length) setInvestigations(saved.investigations);
      if (saved.correctiveActions?.length) setCorrectiveActions(saved.correctiveActions);
      if (typeof saved.salesTargetFrozen === "boolean") setSalesTargetFrozen(saved.salesTargetFrozen);
      if (typeof saved.incentiveReviewRequired === "boolean") setIncentiveReviewRequired(saved.incentiveReviewRequired);
      if (typeof saved.boardEscalated === "boolean") setBoardEscalated(saved.boardEscalated);
      if (saved.demoScenario) setDemoScenario(saved.demoScenario);
    } catch {
      /* ignore corrupt local state */
    }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        alerts,
        auditEvents,
        investigations,
        correctiveActions,
        salesTargetFrozen,
        incentiveReviewRequired,
        boardEscalated,
        demoScenario,
      }),
    );
  }, [
    alerts,
    auditEvents,
    boardEscalated,
    correctiveActions,
    demoScenario,
    hydrated,
    incentiveReviewRequired,
    investigations,
    salesTargetFrozen,
  ]);

  const getDraft = useCallback(
    (alertId: string, alert: RiskAlert) => {
      if (drafts[alertId]) return drafts[alertId];
      if (alert.classification) {
        return {
          classification: alert.classification,
          comment: alert.comment ?? "",
          selectedActions: alert.selectedActions ?? [],
        };
      }
      if (alert.alertType === "Potential Systemic Incentive Risk" || alert.alertType === "Potential Recurring Control Failure") {
        return {
          classification: "systemic_incentive" as const,
          comment: "",
          selectedActions: suggestedActions("systemic_incentive"),
        };
      }
      if (alert.alertType === "Possible Manager-Level Conduct Risk") {
        return {
          classification: "manager_level" as const,
          comment: "",
          selectedActions: suggestedActions("manager_level"),
        };
      }
      return { ...emptyDraft };
    },
    [drafts],
  );

  const updateDraft = useCallback((alertId: string, patch: Partial<ReviewDraft>) => {
    setDrafts((prev) => {
      const alert = alerts.find((a) => a.id === alertId);
      const current = prev[alertId] ?? (alert ? getDraft(alertId, alert) : { ...emptyDraft });
      const next = { ...current, ...patch };
      if (patch.classification && patch.classification !== current.classification) {
        next.selectedActions = suggestedActions(patch.classification);
      }
      return { ...prev, [alertId]: next };
    });
  }, [alerts, getDraft]);

  const appendAudit = useCallback((events: AuditEvent[], extra: Omit<AuditEvent, "id">) => {
    return [...events, { ...extra, id: nextId("AU", events) }];
  }, []);

  const saveDraft = useCallback(
    (alertId: string) => {
      const alert = alerts.find((a) => a.id === alertId);
      if (!alert) return;
      const draft = drafts[alertId] ?? getDraft(alertId, alert);
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId
            ? {
                ...a,
                status: a.status === "open" ? "draft" : a.status,
                classification: draft.classification || a.classification,
                comment: draft.comment,
                selectedActions: draft.selectedActions,
              }
            : a,
        ),
      );
      setAuditEvents((prev) =>
        appendAudit(prev, {
          timestamp: nowIso(),
          actor: CURRENT_USER.name,
          role: CURRENT_USER.title,
          action: "Review draft saved",
          alertId,
          oldStatus: alert.status,
          newStatus: alert.status === "open" ? "draft" : alert.status,
          comment: draft.comment || "Draft retained pending independent classification.",
        }),
      );
      setToast({ message: `Draft saved for ${alertId}. The alert remains open for independent review.`, tone: "info" });
    },
    [alerts, appendAudit, drafts, getDraft],
  );

  const submitDecision = useCallback(
    (alertId: string) => {
      const alert = alerts.find((a) => a.id === alertId);
      if (!alert) return { ok: false, message: "Alert not found." };
      const draft = drafts[alertId] ?? getDraft(alertId, alert);
      if (!draft.classification) {
        return { ok: false, message: "Select a risk classification before submitting." };
      }
      if (!draft.comment.trim()) {
        return { ok: false, message: "Add a review comment before submitting. Governance decisions require a rationale." };
      }

      const isSystemic = draft.classification === "systemic_incentive";
      const nextStatus: AlertStatus = isSystemic ? "escalated" : "classified";
      const freeze = isSystemic || draft.selectedActions.includes("freeze_targets");
      const escalateBoard = draft.selectedActions.includes("escalate_board");
      const escalateCro = draft.selectedActions.includes("escalate_cro") || isSystemic;
      const reviewIncentives = draft.selectedActions.includes("review_incentives") || isSystemic;
      const workflow: WorkflowStatus = isSystemic ? "escalated" : "corrective_action";

      const oldStatus = alert.status;
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId
            ? {
                ...a,
                status: nextStatus,
                workflowStatus: workflow,
                classification: draft.classification as Classification,
                comment: draft.comment,
                selectedActions: draft.selectedActions,
              }
            : a,
        ),
      );
      setInvestigations((prev) =>
        prev.map((i) =>
          i.alertId === alertId && i.status !== "closed_monitoring"
            ? {
                ...i,
                status: workflow,
                findings: draft.comment || i.findings,
                reviewedDate: i.reviewedDate ?? nowIso().slice(0, 10),
                escalationTarget: escalateBoard ? "Board Risk Committee" : escalateCro ? "CRO" : i.escalationTarget,
                escalationRationale: isSystemic ? draft.comment : i.escalationRationale,
                escalatedDate: isSystemic ? nowIso().slice(0, 10) : i.escalatedDate,
              }
            : i,
        ),
      );

      setAuditEvents((prev) => {
        let next = prev;
        next = appendAudit(next, {
          timestamp: nowIso(),
          actor: CURRENT_USER.name,
          role: "IRM Reviewer (second line)",
          action: `Alert classified as ${CLASSIFICATION_LABELS[draft.classification as Classification]}`,
          alertId,
          oldStatus,
          newStatus: nextStatus,
          comment: draft.comment,
        });
        if (freeze) {
          next = appendAudit(next, {
            timestamp: nowIso(),
            actor: "System",
            role: "Governance Control",
            action: "Sales-target increase frozen",
            alertId,
            oldStatus: nextStatus,
            newStatus: nextStatus,
            comment: "Sales target increase frozen pending CRO review.",
          });
        }
        if (escalateCro) {
          next = appendAudit(next, {
            timestamp: nowIso(),
            actor: "System",
            role: "Governance Control",
            action: "Escalated to Chief Risk Officer / ERCC path",
            alertId,
            oldStatus: nextStatus,
            newStatus: "escalated",
            comment: "Serious conduct-risk alerts escalate outside the originating business.",
          });
        }
        if (escalateBoard) {
          next = appendAudit(next, {
            timestamp: nowIso(),
            actor: CURRENT_USER.name,
            role: "Chief Risk Officer",
            action: "Escalated to Board Risk Committee",
            alertId,
            oldStatus: "escalated",
            newStatus: "escalated",
            comment: "Matter requiring Board attention: systemic or recurring conduct-risk pattern.",
          });
        }
        if (reviewIncentives) {
          next = appendAudit(next, {
            timestamp: nowIso(),
            actor: CURRENT_USER.name,
            role: CURRENT_USER.title,
            action: "Incentive structure review required",
            alertId,
            oldStatus: nextStatus,
            newStatus: nextStatus,
            comment: "Employee-level remediation alone is insufficient for a multi-branch or recurring pattern.",
          });
        }
        return next;
      });

      if (freeze) setSalesTargetFrozen(true);
      if (reviewIncentives) setIncentiveReviewRequired(true);
      if (escalateBoard) setBoardEscalated(true);

      const extra = freeze ? " Sales target increase frozen pending CRO review." : "";
      setToast({
        message: `Decision submitted for ${alertId}. Status is now ${nextStatus}.${extra} This is not a disciplinary finding.`,
        tone: "success",
      });
      return { ok: true, message: "submitted" };
    },
    [alerts, appendAudit, drafts, getDraft],
  );

  const updateInvestigation = useCallback(
    (id: string, patch: Partial<Investigation>, auditAction: string) => {
      const current = investigations.find((i) => i.id === id);
      if (!current) return { ok: false, message: "Investigation not found." };
      const nextStatus = patch.status ?? current.status;
      setInvestigations((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === current.alertId
            ? {
                ...a,
                workflowStatus: nextStatus,
                status: WORKFLOW_TO_ALERT[nextStatus] ?? a.status,
              }
            : a,
        ),
      );
      setAuditEvents((prev) =>
        appendAudit(prev, {
          timestamp: nowIso(),
          actor: CURRENT_USER.name,
          role: "IRM Reviewer (second line)",
          action: auditAction,
          alertId: current.alertId,
          oldStatus: current.status,
          newStatus: nextStatus,
          comment: patch.findings || patch.escalationRationale || auditAction,
        }),
      );
      if (patch.escalationTarget === "Board Risk Committee") setBoardEscalated(true);
      setToast({ message: `${id}: ${auditAction}. Human review recorded — not an automatic disciplinary action.`, tone: "success" });
      return { ok: true, message: "updated" };
    },
    [appendAudit, investigations],
  );

  const addCorrectiveAction = useCallback(
    (input: {
      investigationId: string;
      title: string;
      description: string;
      owner: string;
      deadline: string;
    }) => {
      if (!input.title.trim() || !input.owner.trim() || !input.deadline) {
        return { ok: false, message: "Title, first-line owner and deadline are required." };
      }
      const inv = investigations.find((i) => i.id === input.investigationId);
      if (!inv) return { ok: false, message: "Investigation not found." };
      const action: CorrectiveAction = {
        id: nextId("CA", correctiveActions).replace("CA0", "CA"),
        investigationId: inv.id,
        alertId: inv.alertId,
        branchIds: inv.branchIds,
        title: input.title.trim(),
        description: input.description.trim(),
        owner: input.owner.trim(),
        ownerRole: "Front-line management (first line)",
        lineOfDefence: "first",
        status: "open",
        deadline: input.deadline,
        recurrenceAfterCompletion: false,
        scenarioTags: inv.scenarioTags,
      };
      setCorrectiveActions((prev) => [...prev, action]);
      setInvestigations((prev) =>
        prev.map((i) => (i.id === inv.id ? { ...i, status: "corrective_action" as const } : i)),
      );
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === inv.alertId ? { ...a, workflowStatus: "corrective_action", status: "classified" } : a,
        ),
      );
      setAuditEvents((prev) =>
        appendAudit(prev, {
          timestamp: nowIso(),
          actor: CURRENT_USER.name,
          role: "IRM Reviewer (second line)",
          action: `Corrective action ${action.id} assigned to first line`,
          alertId: inv.alertId,
          oldStatus: inv.status,
          newStatus: "corrective_action",
          comment: `${action.title} · owner ${action.owner} · deadline ${action.deadline}. First line implements; second line does not close by completing a task.`,
        }),
      );
      setToast({ message: `${action.id} assigned to first-line management with deadline ${action.deadline}.`, tone: "success" });
      return { ok: true, message: action.id };
    },
    [appendAudit, correctiveActions, investigations],
  );

  const updateCorrectiveAction = useCallback(
    (id: string, patch: Partial<CorrectiveAction>, auditAction: string) => {
      const current = correctiveActions.find((a) => a.id === id);
      if (!current) return { ok: false, message: "Action not found." };
      setCorrectiveActions((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
      setAuditEvents((prev) =>
        appendAudit(prev, {
          timestamp: nowIso(),
          actor: patch.lineOfDefence === "first" ? current.owner : CURRENT_USER.name,
          role: current.ownerRole,
          action: auditAction,
          alertId: current.alertId,
          oldStatus: current.status,
          newStatus: patch.status ?? current.status,
          comment: patch.effectivenessNote || auditAction,
        }),
      );
      setToast({ message: auditAction, tone: "success" });
      return { ok: true, message: "updated" };
    },
    [appendAudit, correctiveActions],
  );

  const dismissToast = useCallback(() => setToast(null), []);

  const value = useMemo(
    () => ({
      alerts,
      auditEvents,
      investigations,
      correctiveActions,
      drafts,
      toast,
      salesTargetFrozen,
      incentiveReviewRequired,
      boardEscalated,
      demoScenario,
      setDemoScenario,
      getDraft,
      updateDraft,
      saveDraft,
      submitDecision,
      updateInvestigation,
      addCorrectiveAction,
      updateCorrectiveAction,
      dismissToast,
    }),
    [
      addCorrectiveAction,
      alerts,
      auditEvents,
      boardEscalated,
      correctiveActions,
      demoScenario,
      dismissToast,
      drafts,
      getDraft,
      incentiveReviewRequired,
      investigations,
      salesTargetFrozen,
      saveDraft,
      submitDecision,
      toast,
      updateCorrectiveAction,
      updateDraft,
      updateInvestigation,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}

export function useScenarioFilter() {
  const { demoScenario } = useAppState();
  return demoScenario;
}
