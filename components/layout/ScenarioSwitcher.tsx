"use client";

import { useAppState } from "@/context/AppStateContext";
import { DEMO_SCENARIOS, scenarioMeta } from "@/lib/demo";

export function ScenarioSwitcher() {
  const { demoScenario, setDemoScenario } = useAppState();
  const meta = scenarioMeta(demoScenario);
  return (
    <div className="flex min-w-0 max-w-xl flex-col gap-1">
      <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Demonstration scenario
      </label>
      <select
        value={demoScenario}
        onChange={(e) => setDemoScenario(e.target.value as typeof demoScenario)}
        className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800"
      >
        {DEMO_SCENARIOS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
      <p className="hidden text-[11px] leading-snug text-slate-500 lg:block">{meta.description}</p>
    </div>
  );
}
