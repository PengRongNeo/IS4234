import { MONTHS } from "../constants";
import { scorePortfolio } from "../scoring";
import type {
  Account,
  AuditEvent,
  Branch,
  ConductEvent,
  Employee,
  MonthlyTrend,
  RiskAlert,
  Severity,
} from "../types";

function mulberry32(seed: number) {
  return function rng() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = [
  "Noah", "Mia", "Liam", "Ava", "Ethan", "Sophia", "Lucas", "Isabella",
  "Mason", "Chloe", "Logan", "Harper", "Jackson", "Amelia", "Aiden", "Evelyn",
  "Carter", "Abigail", "Henry", "Ella", "Owen", "Scarlett", "Wyatt", "Grace",
  "Julian", "Lily", "Leo", "Aria", "David", "Zoe", "Samuel", "Nora",
  "Joseph", "Hannah", "Caleb", "Penelope", "Isaac", "Layla", "John", "Riley",
];
const LAST = [
  "Nguyen", "Patel", "Kim", "Garcia", "Johnson", "Williams", "Brown", "Jones",
  "Miller", "Davis", "Wilson", "Moore", "Taylor", "Anderson", "Thomas", "Jackson",
  "White", "Harris", "Martin", "Thompson", "Martinez", "Robinson", "Clark", "Rodriguez",
  "Lewis", "Lee", "Walker", "Hall", "Allen", "Young", "Hernandez", "King",
];
const PRODUCTS = ["Checking", "Savings", "Credit Card", "Personal Loan", "Line of Credit"];

type Scenario = Branch["scenario"];

interface BranchSeed {
  id: string;
  name: string;
  region: string;
  manager: string;
  scenario: Scenario;
  status: string;
  lastReviewed: string;
  targetIncreasePct: number;
  interpretation: string;
  flagReasons: string[];
  events: { complaints: number; ethics: number; investigations: number; terminations: number };
  highRiskCount: number;
}

const BRANCH_SEEDS: BranchSeed[] = [
  {
    id: "B001",
    name: "Riverside",
    region: "West",
    manager: "Helen Park",
    scenario: "healthy",
    status: "Within appetite",
    lastReviewed: "2026-08-12",
    targetIncreasePct: 3,
    interpretation:
      "Conduct indicators remain within appetite. No clustering of employee-level exceptions is observed. Continue routine monitoring.",
    flagReasons: ["No threshold breaches in the current reporting period."],
    events: { complaints: 1, ethics: 0, investigations: 0, terminations: 0 },
    highRiskCount: 0,
  },
  {
    id: "B002",
    name: "Oakridge",
    region: "West",
    manager: "Daniel Cho",
    scenario: "individual",
    status: "Under review",
    lastReviewed: "2026-08-28",
    targetIncreasePct: 6,
    interpretation:
      "The branch is otherwise within appetite. One employee accounts for a disproportionate share of unfunded accounts and reversals. This may be person-level misconduct, but the case should still be reviewed against incentive pressure before it is treated as an isolated HR matter.",
    flagReasons: [
      "Unfunded account rate is moderately elevated versus peer West-region branches.",
      "One employee (E009) drives most unfunded and same-day reversal activity.",
      "A single EthicsLine report names the same employee.",
    ],
    events: { complaints: 3, ethics: 1, investigations: 1, terminations: 0 },
    highRiskCount: 1,
  },
  {
    id: "B003",
    name: "Lakeside",
    region: "Midwest",
    manager: "Marcus Hale",
    scenario: "manager",
    status: "High risk — manager review required",
    lastReviewed: "2026-08-30",
    targetIncreasePct: 14,
    interpretation:
      "Multiple employees display similar conduct indicators. This pattern may indicate manager-level sales pressure rather than isolated employee misconduct.",
    flagReasons: [
      "Unfunded account rate exceeds threshold.",
      "Same-day reversal rate exceeds threshold.",
      "Complaints increased sharply versus the prior quarter.",
      "Multiple employees are under investigation.",
      "Terminations increased while sales remained high.",
    ],
    events: { complaints: 8, ethics: 4, investigations: 3, terminations: 3 },
    highRiskCount: 4,
  },
  {
    id: "B004",
    name: "Harborview",
    region: "East",
    manager: "Priya Shah",
    scenario: "systemic",
    status: "Systemic pattern — independent classification required",
    lastReviewed: "2026-08-31",
    targetIncreasePct: 22,
    interpretation:
      "Deterioration coincides with a sales-target increase. Similar movement is visible in Midtown (B005) and Capitol Square (B006). Employee-level remediation alone is unlikely to address the control failure.",
    flagReasons: [
      "Sales targets increased mid-period.",
      "Product sales increased alongside unfunded accounts.",
      "Complaints, EthicsLine reports, and terminations rose together.",
      "The same pattern is present in B005 and B006.",
    ],
    events: { complaints: 6, ethics: 3, investigations: 2, terminations: 2 },
    highRiskCount: 5,
  },
  {
    id: "B005",
    name: "Midtown",
    region: "East",
    manager: "James Whitaker",
    scenario: "systemic",
    status: "Systemic pattern — independent classification required",
    lastReviewed: "2026-08-31",
    targetIncreasePct: 20,
    interpretation:
      "Conduct-risk indicators deteriorated in lockstep with target increases. Recurrence across East-region branches points to incentive design rather than a single manager.",
    flagReasons: [
      "Sales targets increased mid-period.",
      "Unfunded account and reversal rates rose with sales volume.",
      "Complaints and EthicsLine reports increased.",
      "Terminations increased while production remained high.",
    ],
    events: { complaints: 6, ethics: 2, investigations: 2, terminations: 2 },
    highRiskCount: 5,
  },
  {
    id: "B006",
    name: "Capitol Square",
    region: "East",
    manager: "Elena Vasquez",
    scenario: "systemic",
    status: "Systemic pattern — independent classification required",
    lastReviewed: "2026-08-31",
    targetIncreasePct: 21,
    interpretation:
      "The branch exhibits the same simultaneous increase in sales pressure and conduct indicators as B004 and B005. This is a candidate for incentive-model review, not branch-by-branch HR closure.",
    flagReasons: [
      "Sales targets increased mid-period.",
      "Unfunded accounts and same-day reversals increased.",
      "Customer complaints and EthicsLine reports increased.",
      "Integrity-related terminations increased.",
    ],
    events: { complaints: 5, ethics: 3, investigations: 1, terminations: 2 },
    highRiskCount: 5,
  },
  {
    id: "B007",
    name: "Greenfield",
    region: "South",
    manager: "Olivia Bennett",
    scenario: "healthy",
    status: "Within appetite",
    lastReviewed: "2026-08-10",
    targetIncreasePct: 2,
    interpretation: "Stable production and low exception rates. No aggregation signal.",
    flagReasons: ["No material conduct-risk threshold breaches."],
    events: { complaints: 1, ethics: 0, investigations: 0, terminations: 0 },
    highRiskCount: 0,
  },
  {
    id: "B008",
    name: "Cedar Falls",
    region: "Midwest",
    manager: "Ryan Cole",
    scenario: "moderate",
    status: "Watchlist",
    lastReviewed: "2026-08-22",
    targetIncreasePct: 8,
    interpretation:
      "Moderately elevated complaints and reversals. The pattern is not clustered across multiple employees at the same intensity as Lakeside.",
    flagReasons: [
      "Complaint volume is above the South/Midwest peer median.",
      "One EthicsLine case is open.",
    ],
    events: { complaints: 3, ethics: 1, investigations: 1, terminations: 0 },
    highRiskCount: 1,
  },
  {
    id: "B009",
    name: "Sunset Valley",
    region: "South",
    manager: "Amelia Grant",
    scenario: "healthy",
    status: "Within appetite",
    lastReviewed: "2026-08-08",
    targetIncreasePct: 1,
    interpretation: "Healthy control environment with low unused-account and complaint rates.",
    flagReasons: ["Indicators remain well inside threshold."],
    events: { complaints: 0, ethics: 0, investigations: 0, terminations: 0 },
    highRiskCount: 0,
  },
  {
    id: "B010",
    name: "Northgate",
    region: "West",
    manager: "Thomas Reed",
    scenario: "moderate",
    status: "Watchlist",
    lastReviewed: "2026-08-18",
    targetIncreasePct: 5,
    interpretation:
      "Slightly elevated unfunded accounts without a multi-employee cluster. Continue monitoring.",
    flagReasons: ["Unfunded account rate is modestly above West-region average."],
    events: { complaints: 2, ethics: 0, investigations: 0, terminations: 0 },
    highRiskCount: 1,
  },
];

function trendFor(seed: BranchSeed): MonthlyTrend[] {
  const baseSales =
    seed.scenario === "healthy" ? 62 : seed.scenario === "manager" ? 88 : seed.scenario === "systemic" ? 90 : 70;
  const grow = seed.scenario === "systemic" || seed.scenario === "manager";
  return MONTHS.map((month, i) => {
    const t = i / 5;
    const salesVolume = Math.round(baseSales * (grow ? 1 + 0.18 * t : 1 + 0.04 * t));
    const unfundedRate =
      seed.scenario === "healthy"
        ? 3.2 + i * 0.1
        : seed.scenario === "individual"
          ? 6.5 + i * 0.5
          : seed.scenario === "manager"
            ? 11 + i * 2.1
            : seed.scenario === "systemic"
              ? 7 + i * 2.4
              : 6 + i * 0.4;
    const unfundedAccounts = Math.round((unfundedRate / 100) * salesVolume);
    const complaints =
      seed.scenario === "healthy"
        ? i === 4
          ? 1
          : 0
        : seed.scenario === "individual"
          ? i > 3
            ? 1
            : i === 2
              ? 1
              : 0
          : seed.scenario === "manager"
            ? 1 + Math.floor(i / 2)
            : seed.scenario === "systemic"
              ? Math.floor(i * 0.7)
              : i > 3
                ? 1
                : 0;
    const terminations =
      seed.scenario === "manager"
        ? i >= 4
          ? 1
          : i === 3
            ? 1
            : 0
        : seed.scenario === "systemic"
          ? i >= 4
            ? 1
            : 0
          : 0;
    const reversals = Math.round(salesVolume * (unfundedRate / 100) * 0.45);
    const salesTarget = Math.round(
      salesVolume * (0.95 + (seed.targetIncreasePct / 100) * t),
    );
    return {
      month,
      salesVolume,
      unfundedAccounts,
      unfundedRate: Number(unfundedRate.toFixed(1)),
      complaints,
      terminations,
      reversals,
      salesTarget,
    };
  });
}

function ratesFor(scenario: Scenario, highRisk: boolean) {
  if (highRisk && scenario === "individual") return { unfunded: 0.42, reversal: 0.22 };
  if (highRisk && scenario === "manager") return { unfunded: 0.38, reversal: 0.2 };
  if (highRisk && scenario === "systemic") return { unfunded: 0.28, reversal: 0.14 };
  if (highRisk) return { unfunded: 0.18, reversal: 0.08 };
  if (scenario === "healthy") return { unfunded: 0.035, reversal: 0.012 };
  if (scenario === "individual") return { unfunded: 0.05, reversal: 0.02 };
  if (scenario === "manager") return { unfunded: 0.12, reversal: 0.06 };
  if (scenario === "systemic") return { unfunded: 0.16, reversal: 0.08 };
  return { unfunded: 0.07, reversal: 0.03 };
}

function employeeRisk(unfunded: number, reversals: number, complaints: number, investigations: number): Severity {
  const score = unfunded * 4 + reversals * 5 + complaints * 8 + investigations * 20;
  if (score >= 28) return "red";
  if (score >= 10) return "amber";
  return "green";
}

export function generateMockData() {
  const rng = mulberry32(20260831);
  const branches: Branch[] = [];
  const employees: Employee[] = [];
  const accounts: Account[] = [];
  const events: ConductEvent[] = [];

  let empSeq = 1;
  let accSeq = 1;
  let evSeq = 1;

  for (const seed of BRANCH_SEEDS) {
    const monthlyTrends = trendFor(seed);
    const last = monthlyTrends[monthlyTrends.length - 1];
    branches.push({
      id: seed.id,
      name: seed.name,
      region: seed.region,
      manager: seed.manager,
      status: seed.status,
      lastReviewed: seed.lastReviewed,
      salesTarget: last.salesTarget,
      productsSold: last.salesVolume,
      targetIncreasePct: seed.targetIncreasePct,
      monthlyTrends,
      interpretation: seed.interpretation,
      flagReasons: seed.flagReasons,
      scenario: seed.scenario,
    });

    const empIds: string[] = [];
    for (let i = 0; i < 8; i++) {
      const id = `E${String(empSeq).padStart(3, "0")}`;
      empIds.push(id);
      const highRisk = i < seed.highRiskCount;
      const r = ratesFor(seed.scenario, highRisk);
      const accountCount = 10;
      let unfundedCount = 0;
      let reversalCount = 0;
      const first = FIRST[(empSeq * 3) % FIRST.length];
      const lastName = LAST[(empSeq * 7) % LAST.length];

      for (let a = 0; a < accountCount; a++) {
        const funded = rng() >= r.unfunded;
        const sameDayReversal = !funded ? rng() < r.reversal * 1.6 : rng() < r.reversal;
        const monthIdx = Math.floor(rng() * 6);
        const day = 1 + Math.floor(rng() * 27);
        const openedDate = `2026-${String(monthIdx + 3).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const status: Account["status"] = sameDayReversal
          ? "reversed"
          : funded
            ? "active"
            : "unfunded";
        if (!funded) unfundedCount += 1;
        if (sameDayReversal) reversalCount += 1;
        accounts.push({
          id: `ACC${String(accSeq).padStart(4, "0")}`,
          branchId: seed.id,
          employeeId: id,
          productType: PRODUCTS[Math.floor(rng() * PRODUCTS.length)],
          openedDate,
          funded,
          sameDayReversal,
          status,
        });
        accSeq += 1;
      }

      employees.push({
        id,
        branchId: seed.id,
        name: `${first} ${lastName}`,
        productsSold: accountCount,
        target: seed.scenario === "systemic" || seed.scenario === "manager" ? 12 : 10,
        unfundedAccounts: unfundedCount,
        reversals: reversalCount,
        complaints: 0,
        investigations: 0,
        riskStatus: "green",
      });
      empSeq += 1;
    }

    const pickEmp = (preferHigh: boolean) => {
      const idx = preferHigh ? Math.floor(rng() * Math.max(1, seed.highRiskCount)) : Math.floor(rng() * 8);
      return empIds[Math.min(idx, empIds.length - 1)];
    };

    const pushEvents = (
      type: ConductEvent["type"],
      count: number,
      descriptions: string[],
      preferHigh = true,
    ) => {
      for (let i = 0; i < count; i++) {
        const monthIdx = 2 + Math.floor(rng() * 4);
        const day = 2 + Math.floor(rng() * 26);
        const employeeId = pickEmp(preferHigh);
        events.push({
          id: `CE${String(evSeq).padStart(3, "0")}`,
          branchId: seed.id,
          employeeId,
          type,
          date: `2026-${String(monthIdx + 3).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
          description: descriptions[i % descriptions.length],
        });
        evSeq += 1;
      }
    };

    pushEvents("complaint", seed.events.complaints, [
      "Customer reports an account was opened without request.",
      "Complaint regarding unwanted product and difficulty closing.",
      "Customer states they were not told a second product was opened.",
      "Fee dispute linked to an unused account.",
    ]);
    pushEvents("ethicsline", seed.events.ethics, [
      "EthicsLine: alleged pressure to meet daily product targets.",
      "EthicsLine: unused accounts opened to close a sales gap.",
      "EthicsLine: manager coaching focused solely on units sold.",
    ]);
    pushEvents("investigation", seed.events.investigations, [
      "Sales-integrity investigation opened following complaint cluster.",
      "Investigation of possible unauthorized account opening.",
    ]);
    pushEvents("termination", seed.events.terminations, [
      "Sales integrity termination following investigation.",
      "Termination for policy breach related to product sales.",
    ]);
  }

  const complaintByEmp = new Map<string, number>();
  const invByEmp = new Map<string, number>();
  for (const ev of events) {
    if (!ev.employeeId) continue;
    if (ev.type === "complaint") {
      complaintByEmp.set(ev.employeeId, (complaintByEmp.get(ev.employeeId) ?? 0) + 1);
    }
    if (ev.type === "investigation") {
      invByEmp.set(ev.employeeId, (invByEmp.get(ev.employeeId) ?? 0) + 1);
    }
  }

  for (const emp of employees) {
    emp.complaints = complaintByEmp.get(emp.id) ?? 0;
    emp.investigations = invByEmp.get(emp.id) ?? 0;
    emp.riskStatus = employeeRisk(
      emp.unfundedAccounts,
      emp.reversals,
      emp.complaints,
      emp.investigations,
    );
  }

  const { scores, byId, systemic } = scorePortfolio(branches, accounts, events, employees);

  for (const b of branches) {
    const s = byId[b.id];
    b.productsSold = accounts.filter((a) => a.branchId === b.id).length;
    b.salesTarget = Math.round(b.productsSold * (1 + b.targetIncreasePct / 200));
    if (s.severity === "green" && b.flagReasons[0]?.startsWith("No")) {
      /* keep */
    } else if (s.flags.length && b.scenario !== "healthy") {
      b.flagReasons = Array.from(new Set([...s.flags.map((f) => `Model flag: ${f}`), ...b.flagReasons]));
    }
  }

  const alerts: RiskAlert[] = [
    {
      id: "A001",
      date: "2026-08-18",
      branchIds: ["B002"],
      severity: "amber",
      alertType: "Possible Individual Misconduct",
      trigger: "Employee E009 unfunded-account and reversal rates exceed peer distribution",
      status: "open",
      assignedTo: "A. Chen",
      assignedRole: "Independent Compliance Officer",
      indicators: [
        "Unfunded accounts concentrated in one employee",
        "Same-day reversals",
        "EthicsLine report naming one banker",
      ],
      explanation:
        "Oakridge (B002) is largely within appetite. One employee exhibits a distinct outlier pattern on unfunded accounts and reversals, with a related EthicsLine report. This is a candidate person-level issue, but it should still be checked against local sales pressure before it is treated as an isolated HR case.",
      supportingMetrics: [
        { label: "Branch risk score", value: String(byId.B002.riskScore) },
        { label: "Unfunded account rate", value: `${byId.B002.unfundedAccountRate.toFixed(1)}%` },
        { label: "Employees with elevated status", value: String(employees.filter((e) => e.branchId === "B002" && e.riskStatus !== "green").length) },
      ],
      canBusinessClose: true,
      requiresIndependentClassification: false,
      workflowStatus: "assigned",
      ruleId: "RULE-ISO",
      investigationId: "INV001",
      scenarioTags: ["all"],
      triggeredIndicators: [
        { name: "Unused accounts concentrated in one employee", value: "Outlier E009", threshold: "Peer distribution", breached: true },
        { name: "Branch-level combination (inactive + investigations + complaints)", value: "Not met", threshold: "All three", breached: false },
      ],
    },
    {
      id: "A002",
      date: "2026-08-24",
      branchIds: ["B003"],
      severity: "red",
      alertType: "Possible Manager-Level Conduct Risk",
      trigger: "Multiple employees in Lakeside share elevated unfunded, reversal, and complaint indicators",
      status: "under_review",
      assignedTo: "A. Chen",
      assignedRole: "Independent Compliance Officer",
      indicators: [
        "Unfunded account rate above threshold",
        "Same-day reversal rate above threshold",
        "Complaint spike",
        "Multiple employees under investigation",
        "Terminations while sales remained high",
      ],
      explanation:
        "Lakeside (B003) is not explained by a single outlier employee. Several bankers show the same unused-account, reversal, and complaint pattern while production stayed high. This aggregation is a manager-level conduct-risk hypothesis. The technology does not determine guilt; it routes the case for human review.",
      supportingMetrics: [
        { label: "Branch risk score", value: String(byId.B003.riskScore) },
        { label: "Unfunded account rate", value: `${byId.B003.unfundedAccountRate.toFixed(1)}%` },
        { label: "Reversal rate", value: `${byId.B003.reversalRate.toFixed(1)}%` },
        { label: "EthicsLine cases", value: String(byId.B003.ethicsLineCount) },
        { label: "Terminations", value: String(byId.B003.terminationCount) },
      ],
      canBusinessClose: false,
      requiresIndependentClassification: true,
      workflowStatus: "under_review",
      ruleId: "RULE-COMBO",
      investigationId: "INV002",
      scenarioTags: ["emerging", "recurring", "all"],
      triggeredIndicators: [
        { name: "Inactive account rate", value: `${byId.B003.unfundedAccountRate.toFixed(1)}%`, threshold: "12%", breached: true },
        { name: "Sales-related investigations", value: String(byId.B003.investigationCount), threshold: "2", breached: true },
        { name: "Customer complaints", value: String(byId.B003.complaintCount), threshold: "5", breached: true },
      ],
    },
    {
      id: "A003",
      date: "2026-08-31",
      branchIds: ["B004", "B005", "B006"],
      severity: "red",
      alertType: "Potential Systemic Incentive Risk",
      trigger: "Three East-region branches show simultaneous increases in targets, unfunded accounts, complaints, EthicsLine reports, and terminations",
      status: "open",
      assignedTo: "A. Chen",
      assignedRole: "Independent Compliance Officer",
      indicators: [
        "Sales-target increase",
        "Unfunded account rates",
        "Same-day reversals",
        "Customer complaints",
        "EthicsLine reports",
        "Employee terminations",
      ],
      explanation:
        "Systemic pattern detected across multiple branches.\n\nThe following indicators increased simultaneously:\n- sales targets\n- unfunded account rates\n- same-day reversals\n- customer complaints\n- EthicsLine reports\n- employee terminations\n\nThe recurrence across multiple branches suggests the issue may be associated with the incentive model rather than isolated misconduct.\n\nLine management cannot close this alert. Independent Risk / Compliance must classify it. Serious systemic issues escalate to the CRO and Board Risk Committee. The model supports a governance decision; it does not determine guilt.",
      supportingMetrics: [
        { label: "Branches in cluster", value: systemic.branchIds.join(", ") || "B004, B005, B006" },
        { label: "Avg risk score (cluster)", value: String(Math.round((byId.B004.riskScore + byId.B005.riskScore + byId.B006.riskScore) / 3)) },
        { label: "Target increase (B004/B005/B006)", value: "20–22%" },
      ],
      canBusinessClose: false,
      requiresIndependentClassification: true,
      workflowStatus: "assigned",
      ruleId: "RULE-MULTI",
      investigationId: "INV003",
      scenarioTags: ["emerging", "all"],
      triggeredIndicators: [
        { name: "Branches in combination cluster", value: "B004, B005, B006", threshold: "3+ branches", breached: true },
        { name: "Inactive accounts + complaints + terminations", value: "All three elevated", threshold: "Illustrative AND-rule", breached: true },
      ],
    },
    {
      id: "A004",
      date: "2026-08-20",
      branchIds: ["B008"],
      severity: "amber",
      alertType: "Possible Individual Misconduct",
      trigger: "Watchlist: complaint and EthicsLine activity above Midwest peer median",
      status: "open",
      assignedTo: "Regional Risk — Midwest",
      assignedRole: "Regional Risk",
      indicators: ["Complaints above peer median", "Open EthicsLine case"],
      explanation:
        "Cedar Falls (B008) is on the watchlist. Indicators are elevated but not clustered at Lakeside intensity. Continue monitoring and complete the open EthicsLine follow-up.",
      supportingMetrics: [
        { label: "Branch risk score", value: String(byId.B008.riskScore) },
        { label: "Complaints", value: String(byId.B008.complaintCount) },
      ],
      canBusinessClose: true,
      requiresIndependentClassification: false,
      workflowStatus: "detected",
      ruleId: "RULE-ISO",
      investigationId: "INV004",
      scenarioTags: ["all"],
      triggeredIndicators: [
        { name: "Complaints vs Midwest peer median", value: String(byId.B008.complaintCount), threshold: "Watchlist", breached: true },
      ],
    },
    {
      id: "A005",
      date: "2026-08-25",
      branchIds: ["B003"],
      severity: "red",
      alertType: "Potential Recurring Control Failure",
      trigger: "Similar unused-account and complaint indicators reappeared at Lakeside after corrective action CA001 was marked complete",
      status: "escalated",
      assignedTo: "A. Chen",
      assignedRole: "Independent Risk Management",
      indicators: [
        "Prior investigation INV000 closed as a local integrity issue",
        "Corrective action CA001 completed on deadline",
        "Inactive account rate still above threshold",
        "Complaints still above threshold",
      ],
      explanation:
        "Lakeside previously received first-line coaching after a sales-integrity review. The task was completed on time, which is control activity. The same combination of inactive accounts and complaints returned after the deadline, which is a control-effectiveness failure. Independent Risk has escalated this beyond the originating business. This is a potential recurring weakness, not proof of fraud, and it must not be closed again as an isolated employee issue.",
      supportingMetrics: [
        { label: "Prior action", value: "CA001 completed 28 Jun 2026" },
        { label: "Deadline", value: "30 Jun 2026" },
        { label: "Unfunded account rate now", value: `${byId.B003.unfundedAccountRate.toFixed(1)}%` },
        { label: "Complaints now", value: String(byId.B003.complaintCount) },
      ],
      canBusinessClose: false,
      requiresIndependentClassification: true,
      workflowStatus: "escalated",
      ruleId: "RULE-REC",
      investigationId: "INV005",
      scenarioTags: ["recurring", "all"],
      triggeredIndicators: [
        { name: "Prior corrective action completed", value: "CA001", threshold: "Deadline 2026-06-30", breached: true },
        { name: "Inactive account rate after deadline", value: `${byId.B003.unfundedAccountRate.toFixed(1)}%`, threshold: "12%", breached: true },
        { name: "Complaints after deadline", value: String(byId.B003.complaintCount), threshold: "5", breached: true },
      ],
    },
  ];

  const auditEvents: AuditEvent[] = [
    {
      id: "AU001",
      timestamp: "2026-08-31T09:02:00",
      actor: "System",
      role: "Conduct Risk Engine",
      action: "Alert A003 created",
      alertId: "A003",
      oldStatus: "—",
      newStatus: "Open",
      comment: "Rule 3 triggered: three or more branches with high unfunded rates, complaints, and terminations.",
    },
    {
      id: "AU002",
      timestamp: "2026-08-31T09:05:00",
      actor: "System",
      role: "Conduct Risk Engine",
      action: "Systemic conduct pattern detected",
      alertId: "A003",
      oldStatus: "Open",
      newStatus: "Open",
      comment: "Cluster B004 / B005 / B006. Incentive-model review recommended; not an automatic finding of guilt.",
    },
    {
      id: "AU003",
      timestamp: "2026-08-31T09:40:00",
      actor: "Priya Shah",
      role: "Branch Manager",
      action: "Management explanation submitted",
      alertId: "A003",
      oldStatus: "Open",
      newStatus: "Under review",
      comment: "Harborview attributes unused accounts to a new product campaign and staff turnover. Line management cannot close a systemic alert.",
    },
    {
      id: "AU004",
      timestamp: "2026-08-24T08:10:00",
      actor: "System",
      role: "Conduct Risk Engine",
      action: "Alert A002 created",
      alertId: "A002",
      oldStatus: "—",
      newStatus: "Open",
      comment: "Rule 2: multiple employees in B003 share high-risk conduct indicators.",
    },
    {
      id: "AU005",
      timestamp: "2026-08-24T11:20:00",
      actor: "A. Chen",
      role: "Independent Compliance Officer",
      action: "Alert placed under review",
      alertId: "A002",
      oldStatus: "Open",
      newStatus: "Under review",
      comment: "Manager-level hypothesis. Business explanation requested; independent classification required.",
    },
    {
      id: "AU006",
      timestamp: "2026-08-18T07:45:00",
      actor: "System",
      role: "Conduct Risk Engine",
      action: "Alert A001 created",
      alertId: "A001",
      oldStatus: "—",
      newStatus: "Open",
      comment: "Outlier employee pattern in B002.",
    },
    {
      id: "AU007",
      timestamp: "2026-05-20T16:00:00",
      actor: "A. Chen",
      role: "IRM Reviewer",
      action: "Prior Lakeside investigation closed as local integrity issue",
      alertId: "A002",
      oldStatus: "under_review",
      newStatus: "closed_monitoring",
      comment: "First-line coaching agreed. Subsequent monitoring is required to test effectiveness, not only completion.",
    },
    {
      id: "AU008",
      timestamp: "2026-06-28T10:00:00",
      actor: "Marcus Hale",
      role: "Branch Manager (first line)",
      action: "Corrective action CA001 marked complete",
      alertId: "A002",
      oldStatus: "corrective_action",
      newStatus: "closed_monitoring",
      comment: "Coaching and huddle completed. Completing the task is control activity, not evidence that the risk has fallen.",
    },
    {
      id: "AU009",
      timestamp: "2026-08-25T09:10:00",
      actor: "System",
      role: "Conduct Risk Engine",
      action: "Alert A005 created — recurring control failure",
      alertId: "A005",
      oldStatus: "—",
      newStatus: "detected",
      comment: "RULE-REC: similar indicators after CA001 deadline. Not an automatic finding of guilt.",
    },
    {
      id: "AU010",
      timestamp: "2026-08-28T14:00:00",
      actor: "A. Chen",
      role: "IRM Reviewer",
      action: "Escalated A005 to ERCC",
      alertId: "A005",
      oldStatus: "under_review",
      newStatus: "escalated",
      comment: "Recurrence after completed first-line action. Independent Risk will not allow another local HR closure.",
    },
  ];

  return {
    branches,
    employees,
    accounts,
    events,
    alerts,
    auditEvents,
    scores,
    byId,
    systemic,
  };
}

export const mock = generateMockData();
