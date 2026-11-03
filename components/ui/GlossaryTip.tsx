"use client";

import { InfoTip } from "./InfoTip";
import { GLOSSARY } from "@/lib/thresholds";

export function GlossaryTip({ term }: { term: keyof typeof GLOSSARY }) {
  return (
    <InfoTip text={GLOSSARY[term]}>
      <button type="button" className="cursor-help border-b border-dotted border-slate-400 text-inherit">
        {term}
      </button>
    </InfoTip>
  );
}
