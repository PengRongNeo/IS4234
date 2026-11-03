import type {
  Account,
  Branch,
  BranchScore,
  ConductEvent,
  Employee,
  Severity,
} from "./types";

const CAPS = {
  unfunded: 20,
  reversal: 12,
  complaintRate: 8,
  ethicsLineRate: 4,
  investigationTerminationRate: 40,
};

const HIGH = {
  unfunded: 12,
  complaints: 5,
  terminations: 2,
  highRiskEmployees: 3,
};

export function clamp(n: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, n));
}

export function normalize(value: number, cap: number) {
  if (cap <= 0) return 0;
  return clamp((value / cap) * 100);
}

export function severityFromScore(score: number): Severity {
  if (score >= 60) return "red";
  if (score >= 30) return "amber";
  return "green";
}

export function pct(part: number, whole: number) {
  if (!whole) return 0;
  return (part / whole) * 100;
}

export function scoreBranch(
  branch: Branch,
  accounts: Account[],
  events: ConductEvent[],
  employees: Employee[],
): BranchScore {
  const branchAccounts = accounts.filter((a) => a.branchId === branch.id);
  const branchEvents = events.filter((e) => e.branchId === branch.id);
  const branchEmployees = employees.filter((e) => e.branchId === branch.id);

  const productsSold = branchAccounts.length;
  const unfunded = branchAccounts.filter((a) => !a.funded).length;
  const reversals = branchAccounts.filter((a) => a.sameDayReversal).length;
  const unfundedAccountRate = pct(unfunded, productsSold);
  const reversalRate = pct(reversals, productsSold);

  const complaintCount = branchEvents.filter((e) => e.type === "complaint").length;
  const ethicsLineCount = branchEvents.filter((e) => e.type === "ethicsline").length;
  const investigationCount = branchEvents.filter((e) => e.type === "investigation").length;
  const terminationCount = branchEvents.filter((e) => e.type === "termination").length;

  const complaintRate = pct(complaintCount, productsSold / 100 || 1) / 100;
  const ethicsLineRate = pct(ethicsLineCount, productsSold / 100 || 1) / 100;
  const complaintRatePer100 = productsSold ? (complaintCount / productsSold) * 100 : 0;
  const ethicsLineRatePer100 = productsSold ? (ethicsLineCount / productsSold) * 100 : 0;
  const employeeCount = branchEmployees.length || 1;
  const investigationTerminationRate =
    ((investigationCount + terminationCount) / employeeCount) * 100;

  const components = {
    unfunded: normalize(unfundedAccountRate, CAPS.unfunded),
    reversal: normalize(reversalRate, CAPS.reversal),
    complaints: normalize(complaintRatePer100, CAPS.complaintRate),
    ethicsLine: normalize(ethicsLineRatePer100, CAPS.ethicsLineRate),
    investigationTermination: normalize(
      investigationTerminationRate,
      CAPS.investigationTerminationRate,
    ),
  };

  const riskScore = Math.round(
    components.unfunded * 0.3 +
      components.reversal * 0.2 +
      components.complaints * 0.2 +
      components.ethicsLine * 0.15 +
      components.investigationTermination * 0.15,
  );

  const flags: string[] = [];
  const reasons: string[] = [
    `Unfunded account rate ${unfundedAccountRate.toFixed(1)}% contributes 30% of the score (normalized ${components.unfunded.toFixed(0)}/100).`,
    `Same-day reversal rate ${reversalRate.toFixed(1)}% contributes 20% (normalized ${components.reversal.toFixed(0)}/100).`,
    `Complaint intensity ${complaintRatePer100.toFixed(2)} per 100 products contributes 20% (normalized ${components.complaints.toFixed(0)}/100).`,
    `EthicsLine intensity ${ethicsLineRatePer100.toFixed(2)} per 100 products contributes 15% (normalized ${components.ethicsLine.toFixed(0)}/100).`,
    `Investigation/termination rate ${investigationTerminationRate.toFixed(0)} per 100 employees contributes 15% (normalized ${components.investigationTermination.toFixed(0)}/100).`,
  ];

  const highRiskEmployees = branchEmployees.filter((e) => e.riskStatus !== "green").length;

  if (terminationCount >= HIGH.terminations && unfundedAccountRate >= HIGH.unfunded) {
    flags.push("Potential Incentive Risk");
    reasons.push(
      "Override rule 1: termination activity is elevated while unfunded account rates remain high — this combination is a potential incentive-risk signal, not only an HR outcome.",
    );
  }

  if (highRiskEmployees >= HIGH.highRiskEmployees) {
    flags.push("Possible Manager-Level Risk");
    reasons.push(
      `Override rule 2: ${highRiskEmployees} employees in this branch show similar elevated conduct indicators. The pattern may indicate manager-level sales pressure rather than an isolated person-level issue.`,
    );
  }

  return {
    branchId: branch.id,
    unfundedAccountRate,
    reversalRate,
    complaintCount,
    ethicsLineCount,
    investigationCount,
    terminationCount,
    complaintRate,
    ethicsLineRate,
    investigationTerminationRate,
    components,
    riskScore,
    severity: severityFromScore(riskScore),
    flags,
    reasons,
  };
}

export function detectSystemicIncentiveRisk(scores: BranchScore[]) {
  const clustered = scores.filter(
    (s) =>
      s.unfundedAccountRate >= HIGH.unfunded &&
      s.complaintCount >= HIGH.complaints &&
      s.terminationCount >= HIGH.terminations,
  );

  if (clustered.length >= 3) {
    return {
      flagged: true,
      branchIds: clustered.map((s) => s.branchId),
      message:
        "Override rule 3: three or more branches show high unfunded-account rates, high complaints, and high termination rates in the same reporting period. This is a potential systemic incentive-risk pattern and should not be closed as isolated employee misconduct.",
    };
  }

  return { flagged: false, branchIds: [] as string[], message: "" };
}

export function scorePortfolio(
  branches: Branch[],
  accounts: Account[],
  events: ConductEvent[],
  employees: Employee[],
) {
  const scores = branches.map((b) => scoreBranch(b, accounts, events, employees));
  const systemic = detectSystemicIncentiveRisk(scores);
  const byId = Object.fromEntries(scores.map((s) => [s.branchId, s])) as Record<
    string,
    BranchScore
  >;

  if (systemic.flagged) {
    for (const id of systemic.branchIds) {
      if (!byId[id].flags.includes("Potential Systemic Incentive Risk")) {
        byId[id].flags.push("Potential Systemic Incentive Risk");
        byId[id].reasons.push(systemic.message);
      }
    }
  }

  return { scores: Object.values(byId), byId, systemic };
}
