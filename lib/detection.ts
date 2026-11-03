import { ILLUSTRATIVE_THRESHOLDS as T, THRESHOLD_DISCLAIMER } from "./thresholds";
import type {
  BranchScore,
  DetectionHit,
  Employee,
  Investigation,
  CorrectiveAction,
} from "./types";

function indicator(
  name: string,
  value: string,
  threshold: string,
  breached: boolean,
) {
  return { name, value, threshold, breached };
}

/**
 * Cross-indicator detection engine (separate from UI).
 * Combines inactive accounts, complaints and investigations.
 * Does not determine guilt; it routes cases for human review.
 */
export function detectConductRisk(input: {
  scores: BranchScore[];
  employees: Employee[];
  investigations?: Investigation[];
  actions?: CorrectiveAction[];
}): DetectionHit[] {
  const hits: DetectionHit[] = [];
  const { scores, employees, investigations = [], actions = [] } = input;

  for (const score of scores) {
    const staff = employees.filter((e) => e.branchId === score.branchId);
    const unfundedTotal = staff.reduce((n, e) => n + e.unfundedAccounts, 0);
    const top = [...staff].sort((a, b) => b.unfundedAccounts - a.unfundedAccounts)[0];
    const share = unfundedTotal && top ? top.unfundedAccounts / unfundedTotal : 0;

    const combo =
      score.unfundedAccountRate >= T.inactiveAccountRatePct &&
      score.investigationCount >= T.investigationCount &&
      score.complaintCount >= T.complaintCount;

    const isolated =
      Boolean(top) &&
      share >= T.isolatedEmployeeUnfundedShare &&
      score.riskScore < T.peerBranchScoreCeiling &&
      staff.filter((e) => e.riskStatus !== "green").length <= 2;

    if (isolated && !combo) {
      hits.push({
        ruleId: "RULE-ISO",
        ruleName: "Isolated employee pattern",
        alertType: "Possible Individual Misconduct",
        severity: "amber",
        branchIds: [score.branchId],
        employeeId: top?.id,
        isolated: true,
        systemic: false,
        recurring: false,
        indicators: [
          indicator("Inactive / unfunded accounts concentrated in one employee", `${(share * 100).toFixed(0)}%`, `${T.isolatedEmployeeUnfundedShare * 100}% share`, true),
          indicator("Branch composite score (peer range)", String(score.riskScore), `< ${T.peerBranchScoreCeiling}`, score.riskScore < T.peerBranchScoreCeiling),
          indicator("Employees with elevated status", String(staff.filter((e) => e.riskStatus !== "green").length), "≤ 2", true),
        ],
        explanation:
          "A single employee accounts for a disproportionate share of unused accounts, while other branch indicators remain closer to peer range. The CRM records this as a potential person-level issue for Independent Risk review. It does not automatically treat the whole branch as a systemic control failure.",
      });
    }

    if (combo) {
      hits.push({
        ruleId: "RULE-COMBO",
        ruleName: "Cross-indicator sales-conduct combination",
        alertType: "Possible Manager-Level Conduct Risk",
        severity: "red",
        branchIds: [score.branchId],
        isolated: false,
        systemic: false,
        recurring: false,
        indicators: [
          indicator("Inactive account rate", `${score.unfundedAccountRate.toFixed(1)}%`, `${T.inactiveAccountRatePct}%`, true),
          indicator("Sales-related investigations", String(score.investigationCount), String(T.investigationCount), true),
          indicator("Customer complaints (unauthorised / unused accounts)", String(score.complaintCount), String(T.complaintCount), true),
        ],
        explanation:
          "Multiple conduct-risk indicators have increased within the same reporting period: inactive accounts, sales-related investigations, and customer complaints. The combination may suggest that sales incentives or supervisory practices are contributing to recurring misconduct. Independent Risk Management review is recommended. This is not definitive evidence of fraud.",
      });
    }
  }

  const clustered = scores.filter(
    (s) =>
      s.unfundedAccountRate >= T.inactiveAccountRatePct &&
      s.complaintCount >= T.complaintCount &&
      s.terminationCount >= T.terminationCount,
  );
  if (clustered.length >= T.clusteredBranchCount) {
    hits.push({
      ruleId: "RULE-MULTI",
      ruleName: "Multi-branch incentive pattern",
      alertType: "Potential Systemic Incentive Risk",
      severity: "red",
      branchIds: clustered.map((s) => s.branchId),
      isolated: false,
      systemic: true,
      recurring: false,
      indicators: clustered.map((s) =>
        indicator(
          `${s.branchId} inactive % / complaints / terminations`,
          `${s.unfundedAccountRate.toFixed(1)}% / ${s.complaintCount} / ${s.terminationCount}`,
          `${T.inactiveAccountRatePct}% AND ${T.complaintCount} AND ${T.terminationCount}`,
          true,
        ),
      ),
      explanation:
        "The same combination of unused accounts, complaints and integrity terminations appears across multiple branches in one period. Recurrence across units is a potential systemic incentive-model weakness, not a set of unrelated employee-integrity cases. Line management cannot close this class of alert. Independent Risk should classify and, if material, escalate to the ERCC or Board Risk Committee.",
    });
  }

  for (const action of actions) {
    const stillHot = action.branchIds.some((id) => {
      const s = scores.find((x) => x.branchId === id);
      return (
        s &&
        s.unfundedAccountRate >= T.inactiveAccountRatePct &&
        s.complaintCount >= T.complaintCount
      );
    });
    const failed =
      action.recurrenceAfterCompletion ||
      action.status === "ineffective" ||
      (Boolean(action.completedDate) && stillHot);
    if (!failed || !stillHot) continue;
    hits.push({
      ruleId: "RULE-REC",
      ruleName: "Recurring control failure after corrective action",
      alertType: "Potential Recurring Control Failure",
      severity: "red",
      branchIds: action.branchIds,
      isolated: false,
      systemic: false,
      recurring: true,
      indicators: [
        indicator("Prior corrective action", action.id, "completed / deadline passed", true),
        indicator("Similar indicators after deadline", "Inactive accounts and complaints still above threshold", "reduction after remediation", true),
      ],
      explanation:
        "This branch previously received corrective action, but similar misconduct indicators continued after the deadline. That is a potential recurring control failure: control activity occurred, but control effectiveness did not. Escalation beyond the originating business is recommended. Generating another local investigation alone is not sufficient.",
    });
  }

  void investigations;
  return hits;
}

export function detectionDisclaimer() {
  return THRESHOLD_DISCLAIMER;
}
