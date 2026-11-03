import { WORKFLOW_STEPS } from "@/lib/constants";
import type { WorkflowStatus } from "@/lib/types";

export function WorkflowStrip({ status }: { status: WorkflowStatus }) {
  const idx = WORKFLOW_STEPS.findIndex((s) => s.id === status);
  return (
    <ol className="grid grid-cols-2 gap-2 md:grid-cols-6">
      {WORKFLOW_STEPS.map((step, i) => {
        const done = i <= idx;
        return (
          <li
            key={step.id}
            className={`rounded border px-2 py-2 text-center text-[11px] leading-tight ${
              done ? "border-slate-800 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-500"
            }`}
          >
            <span className="block font-semibold">{i + 1}</span>
            {step.label}
          </li>
        );
      })}
    </ol>
  );
}
