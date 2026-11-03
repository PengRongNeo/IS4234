export type Severity = "green" | "amber" | "red";

export type AlertStatus =
  | "open"
  | "draft"
  | "under_review"
  | "classified"
  | "escalated"
  | "closed";

export type Classification =
  | "person_level"
  | "manager_level"
  | "systemic_incentive";

export type ConductEventType =
  | "complaint"
  | "ethicsline"
  | "investigation"
  | "termination";

export type AlertType =
  | "Possible Individual Misconduct"
  | "Possible Manager-Level Conduct Risk"
  | "Potential Systemic Incentive Risk"
  | "Potential Incentive Risk"
  | "Potential Recurring Control Failure";

export type WorkflowStatus =
  | "detected"
  | "assigned"
  | "under_review"
  | "escalated"
  | "corrective_action"
  | "closed_monitoring";

export type LineOfDefence = "first" | "second" | "third";

export type DemoScenarioId = "all" | "normal" | "emerging" | "recurring";

export type CorrectiveActionStatus =
  | "open"
  | "in_progress"
  | "completed"
  | "overdue"
  | "ineffective";

export type EscalationTarget =
  | "Regional Risk"
  | "CRO"
  | "ERCC"
  | "Board Risk Committee";

export interface TriggeredIndicator {
  name: string;
  value: string;
  threshold: string;
  breached: boolean;
}

export interface DetectionHit {
  ruleId: string;
  ruleName: string;
  alertType: AlertType;
  severity: Severity;
  branchIds: string[];
  employeeId?: string;
  indicators: TriggeredIndicator[];
  explanation: string;
  isolated: boolean;
  systemic: boolean;
  recurring: boolean;
}

export interface MonthlyTrend {
  month: string;
  salesVolume: number;
  unfundedAccounts: number;
  unfundedRate: number;
  complaints: number;
  terminations: number;
  reversals: number;
  salesTarget: number;
}

export interface Branch {
  id: string;
  name: string;
  region: string;
  manager: string;
  status: string;
  lastReviewed: string;
  salesTarget: number;
  productsSold: number;
  targetIncreasePct: number;
  monthlyTrends: MonthlyTrend[];
  interpretation: string;
  flagReasons: string[];
  scenario:
    | "healthy"
    | "individual"
    | "manager"
    | "systemic"
    | "moderate";
}

export interface BranchScore {
  branchId: string;
  unfundedAccountRate: number;
  reversalRate: number;
  complaintCount: number;
  ethicsLineCount: number;
  investigationCount: number;
  terminationCount: number;
  complaintRate: number;
  ethicsLineRate: number;
  investigationTerminationRate: number;
  components: {
    unfunded: number;
    reversal: number;
    complaints: number;
    ethicsLine: number;
    investigationTermination: number;
  };
  riskScore: number;
  severity: Severity;
  flags: string[];
  reasons: string[];
}

export interface Employee {
  id: string;
  branchId: string;
  name: string;
  productsSold: number;
  target: number;
  unfundedAccounts: number;
  reversals: number;
  complaints: number;
  investigations: number;
  riskStatus: Severity;
}

export interface Account {
  id: string;
  branchId: string;
  employeeId: string;
  productType: string;
  openedDate: string;
  funded: boolean;
  sameDayReversal: boolean;
  status: "active" | "unfunded" | "reversed" | "closed";
}

export interface ConductEvent {
  id: string;
  branchId: string;
  employeeId?: string;
  type: ConductEventType;
  date: string;
  description: string;
}

export interface RiskAlert {
  id: string;
  date: string;
  branchIds: string[];
  severity: Severity;
  alertType: AlertType;
  trigger: string;
  status: AlertStatus;
  assignedTo: string;
  assignedRole: string;
  indicators: string[];
  explanation: string;
  supportingMetrics: { label: string; value: string }[];
  classification?: Classification;
  comment?: string;
  selectedActions?: string[];
  canBusinessClose: boolean;
  requiresIndependentClassification: boolean;
  workflowStatus: WorkflowStatus;
  ruleId?: string;
  triggeredIndicators?: TriggeredIndicator[];
  investigationId?: string;
  scenarioTags: DemoScenarioId[];
}

export interface Investigation {
  id: string;
  alertId: string;
  branchIds: string[];
  status: WorkflowStatus;
  openedDate: string;
  dueDate: string;
  assignedTo: string;
  assignedRole: string;
  lineOfDefence: LineOfDefence;
  findings: string;
  escalationTarget?: EscalationTarget;
  escalationRationale?: string;
  escalatedDate?: string;
  reviewedDate?: string;
  closedDate?: string;
  recurrenceRecorded: boolean;
  scenarioTags: DemoScenarioId[];
}

export interface CorrectiveAction {
  id: string;
  investigationId: string;
  alertId: string;
  branchIds: string[];
  title: string;
  description: string;
  owner: string;
  ownerRole: string;
  lineOfDefence: LineOfDefence;
  status: CorrectiveActionStatus;
  deadline: string;
  completedDate?: string;
  effectivenessNote?: string;
  recurrenceAfterCompletion: boolean;
  scenarioTags: DemoScenarioId[];
}

export interface ReviewAction {
  id: string;
  label: string;
  defaultFor?: Classification[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  alertId?: string;
  oldStatus?: string;
  newStatus?: string;
  comment?: string;
}

export interface ReviewDraft {
  classification: Classification | "";
  comment: string;
  selectedActions: string[];
}

export interface KriRow {
  kri: string;
  currentValue: string;
  threshold: string;
  status: Severity;
  trend: "up" | "down" | "stable";
}
