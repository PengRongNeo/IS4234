/** Reporting-period close used to decide overdue items in the prototype. */
export const AS_OF = "2026-08-31";

export function isPastDeadline(deadline: string, done?: boolean) {
  if (done) return false;
  return deadline < AS_OF;
}
