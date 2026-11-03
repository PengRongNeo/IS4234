"use client";

import { useState, type ReactNode } from "react";

export function InfoTip({ text, children }: { text: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {children}
      {open ? (
        <span className="absolute left-0 top-full z-20 mt-1 w-64 rounded border border-slate-200 bg-slate-900 px-3 py-2 text-xs leading-relaxed text-white shadow-lg">
          {text}
        </span>
      ) : null}
    </span>
  );
}
