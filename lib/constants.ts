import type { Classification, ReviewAction } from "./types";

export const APP_NAME = "Conduct Risk Monitor";
export const APP_SUBTITLE = "Enterprise Sales Conduct Monitoring";
export const REPORTING_PERIOD = "1 Mar 2026 – 31 Aug 2026";
export const REPORTING_PERIODS = [
  REPORTING_PERIOD,
  "1 Sep 2025 – 28 Feb 2026",
] as const;
export const CURRENT_USER = {
  name: "A. Chen",
  role: "Enterprise Risk",
  title: "Independent Compliance Officer",
};
export const MONTHS = [
  "Mar 2026",
  "Apr 2026",
  "May 2026",
  "Jun 2026",
  "Jul 2026",
  "Aug 2026",
] as const;

export const REVIEW_ACTIONS: ReviewAction[] = [
  { id: "investigate_employee", label: "Investigate employee", defaultFor: ["person_level"] },
  { id: "investigate_manager", label: "Investigate manager", defaultFor: ["manager_level"] },
  { id: "require_management_response", label: "Require management response", defaultFor: ["manager_level", "systemic_incentive"] },
  { id: "escalate_regional", label: "Escalate to Regional Risk", defaultFor: ["manager_level"] },
  { id: "escalate_cro", label: "Escalate to Chief Risk Officer", defaultFor: ["systemic_incentive"] },
  { id: "escalate_board", label: "Escalate to Board Risk Committee", defaultFor: ["systemic_incentive"] },
  { id: "freeze_targets", label: "Freeze sales-target increase", defaultFor: ["systemic_incentive"] },
  { id: "review_incentives", label: "Review incentive structure", defaultFor: ["systemic_incentive"] },
  { id: "customer_remediation", label: "Initiate customer remediation review", defaultFor: ["person_level", "manager_level", "systemic_incentive"] },
];

export const CLASSIFICATION_LABELS: Record<Classification, string> = {
  person_level: "Person-level issue",
  manager_level: "Manager-level issue",
  systemic_incentive: "Business Model / Systemic Incentive Risk",
};

export const SEVERITY_LABELS = {
  green: "Low Risk",
  amber: "Elevated Risk",
  red: "High Risk",
} as const;

export const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  draft: "Draft saved",
  under_review: "Under review",
  classified: "Classified",
  escalated: "Escalated",
  closed: "Closed",
  detected: "Detected",
  assigned: "Assigned",
  corrective_action: "Corrective action",
  closed_monitoring: "Closed / monitoring",
  in_progress: "In progress",
  completed: "Completed",
  overdue: "Overdue",
  ineffective: "Ineffective (recurred)",
};

export const WORKFLOW_STEPS = [
  { id: "detected", label: "Detected" },
  { id: "assigned", label: "Assigned (IRM)" },
  { id: "under_review", label: "Under review" },
  { id: "escalated", label: "Escalated" },
  { id: "corrective_action", label: "Corrective action" },
  { id: "closed_monitoring", label: "Closed / monitoring" },
] as const;

export const LINE_LABELS = {
  first: "First line — Front-line management",
  second: "Second line — Independent Risk Management",
  third: "Third line — Internal Audit",
} as const;
