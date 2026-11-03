"use client";

import type { ReactNode } from "react";
import { useAppState } from "@/context/AppStateContext";
import { Sidebar } from "./Sidebar";
import { Toast } from "../ui/Toast";
import { CURRENT_USER, REPORTING_PERIOD } from "@/lib/constants";
import { ScenarioSwitcher } from "./ScenarioSwitcher";

export function AppShell({ children }: { children: ReactNode }) {
  const { toast, dismissToast, salesTargetFrozen } = useAppState();
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-3">
          <div className="flex min-w-0 flex-1 items-start gap-6">
            <p className="hidden min-w-0 max-w-xs truncate text-xs text-slate-500 xl:block">
              Academic prototype · synthetic data · {REPORTING_PERIOD}
            </p>
            <ScenarioSwitcher />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {salesTargetFrozen ? (
              <span className="rounded border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700">
                Sales-target increase frozen
              </span>
            ) : null}
            <span className="text-xs text-slate-600">{CURRENT_USER.name}</span>
            <span className="rounded border border-slate-300 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
              {CURRENT_USER.role}
            </span>
          </div>
        </header>
        <main className="flex-1 px-8 py-6">{children}</main>
      </div>
      {toast ? (
        <Toast message={toast.message} tone={toast.tone} onDismiss={dismissToast} />
      ) : null}
    </div>
  );
}
