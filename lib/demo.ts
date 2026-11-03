import type { DemoScenarioId } from "./types";

export const DEMO_SCENARIOS: {
  id: DemoScenarioId;
  label: string;
  short: string;
  description: string;
  branchIds: string[] | null;
  alertIds: string[] | null;
}[] = [
  {
    id: "all",
    label: "Full portfolio",
    short: "All branches",
    description: "Synthetic retail book used for the academic demonstration. Not genuine Wells Fargo data.",
    branchIds: null,
    alertIds: null,
  },
  {
    id: "normal",
    label: "1 · Normal operations",
    short: "B001 Riverside",
    description:
      "Stable account activity, low complaints, no cross-indicator combination. Existing controls look busy-as-usual — and in this branch they are sufficient.",
    branchIds: ["B001", "B007", "B009"],
    alertIds: [],
  },
  {
    id: "emerging",
    label: "2 · Emerging systemic risk",
    short: "B003 + East cluster",
    description:
      "Inactive accounts, complaints and sales investigations rise together. The CRM combines them instead of treating each as an employee-integrity case.",
    branchIds: ["B003", "B004", "B005", "B006"],
    alertIds: ["A002", "A003"],
  },
  {
    id: "recurring",
    label: "3 · Recurring control failure",
    short: "B003 after prior action",
    description:
      "Lakeside already had an investigation and a completed corrective action. The same indicators reappeared after the deadline — activity without effectiveness.",
    branchIds: ["B003"],
    alertIds: ["A002", "A005"],
  },
];

export function scenarioMeta(id: DemoScenarioId) {
  return DEMO_SCENARIOS.find((s) => s.id === id) ?? DEMO_SCENARIOS[0];
}

export function filterBranches<T extends { id: string }>(items: T[], scenario: DemoScenarioId) {
  const ids = scenarioMeta(scenario).branchIds;
  if (!ids) return items;
  return items.filter((b) => ids.includes(b.id));
}

export function filterAlerts<T extends { id: string; scenarioTags?: DemoScenarioId[] }>(
  items: T[],
  scenario: DemoScenarioId,
) {
  const ids = scenarioMeta(scenario).alertIds;
  if (ids === null) return items;
  return items.filter((a) => ids.includes(a.id) || a.scenarioTags?.includes(scenario));
}

export function filterTagged<T extends { scenarioTags?: DemoScenarioId[]; alertId?: string }>(
  items: T[],
  scenario: DemoScenarioId,
) {
  if (scenario === "all") return items;
  const alertIds = scenarioMeta(scenario).alertIds ?? [];
  return items.filter(
    (i) => i.scenarioTags?.includes(scenario) || (i.alertId ? alertIds.includes(i.alertId) : false),
  );
}
