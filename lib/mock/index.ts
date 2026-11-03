import { mock } from "./generate";
import { initialCorrectiveActions, initialInvestigations } from "./governance";
import { detectConductRisk } from "../detection";

export { initialCorrectiveActions, initialInvestigations };

export const branches = mock.branches;
export const employees = mock.employees;
export const accounts = mock.accounts;
export const conductEvents = mock.events;
export const initialAlerts = mock.alerts;
export const initialAuditEvents = mock.auditEvents;
export const branchScores = mock.scores;
export const scoresByBranch = mock.byId;
export const systemicDetection = mock.systemic;

export const detectionHits = detectConductRisk({
  scores: branchScores,
  employees,
  investigations: initialInvestigations,
  actions: initialCorrectiveActions,
});

export const mockStats = {
  branches: branches.length,
  employees: employees.length,
  accounts: accounts.length,
  conductEvents: conductEvents.length,
  alerts: initialAlerts.length,
  investigations: initialInvestigations.length,
  correctiveActions: initialCorrectiveActions.length,
};

export function branchLabel(id: string) {
  const b = branches.find((x) => x.id === id);
  return b ? `${id} ${b.name}` : id;
}

export function scopeLabel(ids: string[]) {
  return ids.map(branchLabel).join(" / ");
}
