"use client";

import { useEffect } from "react";

export function Toast({
  message,
  tone,
  onDismiss,
}: {
  message: string;
  tone: "success" | "info";
  onDismiss: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  return (
    <div className="fixed right-6 top-6 z-50 max-w-md rounded-md border border-slate-200 bg-white px-4 py-3 shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {tone === "success" ? "Decision recorded" : "Saved"}
      </p>
      <p className="mt-1 text-sm text-slate-800">{message}</p>
    </div>
  );
}
