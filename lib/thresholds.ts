/**
 * Illustrative prototype assumptions only.
 * These are not Wells Fargo internal limits or regulatory standards.
 */
export const THRESHOLD_DISCLAIMER =
  "Thresholds are illustrative prototype assumptions for demonstration. They are not Wells Fargo policy or regulatory standards.";

export const ILLUSTRATIVE_THRESHOLDS = {
  inactiveAccountRatePct: 12,
  reversalRatePct: 8,
  complaintCount: 5,
  investigationCount: 2,
  terminationCount: 2,
  isolatedEmployeeUnfundedShare: 0.45,
  branchScoreForSystemic: 60,
  peerBranchScoreCeiling: 40,
  clusteredBranchCount: 3,
  reviewSlaDays: 10,
  detectionToEscalationSlaDays: 15,
} as const;

export const GLOSSARY = {
  "conduct risk":
    "The risk that the firm’s culture, incentives or behaviour cause poor outcomes for customers or markets. An alert is a hypothesis for review, not proof of misconduct.",
  "inactive accounts":
    "Newly opened accounts with little or no customer use (unfunded / unused). A high rate, especially with complaints, may indicate pressure to open products rather than genuine demand.",
  "risk threshold":
    "An illustrative cut-off used in this prototype to flag unusual combinations of indicators. Thresholds must be calibrated in a real bank and can produce false positives.",
  escalation:
    "Referring a material or recurring issue out of the originating business to Independent Risk, the ERCC, or the Board Risk Committee so it cannot be closed as a local HR matter.",
  "three lines of defence":
    "First line (front-line management) owns operational risk and corrective actions. Second line (Independent Risk Management) challenges and escalates. Third line (Internal Audit) provides assurance over the process.",
  "control activity":
    "Volume of work done — investigations opened, alerts raised, employees reviewed. Activity is not the same as effectiveness.",
  "control effectiveness":
    "Whether controls change outcomes: timely review, completed remediation, fewer recurrences, and falling risk indicators after action.",
} as const;
