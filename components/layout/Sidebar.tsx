"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  LineChart,
  ScrollText,
  Search,
  Shield,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";

const items = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/branches", label: "Risk Indicators", icon: LineChart },
  { href: "/alerts", label: "Risk Alerts", icon: AlertTriangle },
  { href: "/investigations", label: "Investigations", icon: Search },
  { href: "/corrective-actions", label: "Corrective Actions", icon: ClipboardCheck },
  { href: "/board-report", label: "Governance Oversight", icon: ClipboardList },
  { href: "/audit-trail", label: "Audit Trail", icon: ScrollText },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-64 shrink-0 flex-col bg-slate-900 text-slate-200">
      <div className="border-b border-slate-800 px-5 py-5">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-slate-100" />
          <div>
            <p className="text-sm font-semibold tracking-wide text-white">{APP_NAME}</p>
            <p className="text-[11px] text-slate-400">Proposed GRC prototype · IRM</p>
          </div>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 rounded px-3 py-2 text-sm ${
                active
                  ? "bg-slate-800 text-white"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        <Link
          href="/systemic-risk"
          className={`mt-2 flex items-center gap-2 rounded px-3 py-2 text-xs ${
            pathname.startsWith("/systemic-risk")
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
          }`}
        >
          Cross-indicator patterns
        </Link>
      </nav>
      <div className="border-t border-slate-800 px-5 py-4 text-[11px] leading-relaxed text-slate-400">
        Technology supports governance. It does not replace management accountability or determine guilt.
      </div>
    </aside>
  );
}
