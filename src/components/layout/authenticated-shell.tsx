"use client";

import { BranchSwitcher } from "@/components/layout/branch-switcher";
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signOut } from "next-auth/react";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  FileText,
  HandCoins,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings2,
  ShieldAlert,
  Users2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type ShellNavItem = {
  value: string;
  label: string;
  icon: ShellIconName;
  badge?: number;
};

export type ShellIconName =
  | "overview"
  | "approvals"
  | "members"
  | "products"
  | "branches"
  | "content"
  | "feedback"
  | "audit"
  | "apply"
  | "repayment"
  | "settings";

const ICON_MAP = {
  overview: LayoutDashboard,
  approvals: FileText,
  members: Users2,
  products: Settings2,
  branches: ShieldAlert,
  content: FileText,
  feedback: AlertTriangle,
  audit: History,
  apply: HandCoins,
  repayment: History,
  settings: Settings2,
} satisfies Record<ShellIconName, React.ComponentType<{ className?: string }>>;

export function AuthenticatedShell({
  title,
  subtitle,
  portalLabel,
  accountName,
  accountRole,
  accent = "emerald",
  navItems,
  children,
}: {
  title: string;
  subtitle: string;
  portalLabel: string;
  accountName: string;
  accountRole: string;
  accent?: "emerald" | "blue";
  navItems: ShellNavItem[];
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navReady, setNavReady] = useState(false);
  const navScrollRef = useRef<HTMLDivElement>(null);

  const accentStyles =
    accent === "blue"
      ? {
          active:
            "data-[state=active]:border-blue-400/40 data-[state=active]:bg-blue-500/20 data-[state=active]:text-white",
          badge:
            "border-blue-400/20 bg-blue-500/12 text-blue-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
          dot: "bg-blue-400",
          icon: "text-blue-300",
          panel:
            "border border-blue-200/80 bg-gradient-to-br from-blue-50 to-white",
          highlight:
            "border-blue-500/25 bg-blue-500/12 text-blue-100 hover:border-blue-400/35 hover:bg-blue-500/18",
          surface:
            "border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))]",
        }
      : {
          active:
            "data-[state=active]:border-emerald-400/40 data-[state=active]:bg-emerald-500/20 data-[state=active]:text-white",
          badge:
            "border-emerald-400/20 bg-emerald-500/12 text-emerald-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
          dot: "bg-emerald-400",
          icon: "text-emerald-300",
          panel:
            "border border-emerald-200/80 bg-gradient-to-br from-emerald-50 to-white",
          highlight:
            "border-emerald-500/25 bg-emerald-500/12 text-emerald-100 hover:border-emerald-400/35 hover:bg-emerald-500/18",
          surface:
            "border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))]",
        };

  useEffect(() => {
    // Delay enabling scroll so Radix's focus-triggered scrollIntoView
    // cannot shift the nav container during mount.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setNavReady(true));
    });
  }, []);

  const renderSidebar = () => (
    <div
      className={`flex h-full flex-col border-r ${accentStyles.surface} text-white`}
    >
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-5">
        <div
          className={`flex min-w-0 items-center gap-3 overflow-hidden transition-all ${
            collapsed ? "xl:w-0 xl:opacity-0" : "xl:w-auto xl:opacity-100"
          }`}
        >
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-xl font-black italic text-white shadow-[0_10px_30px_rgba(15,23,42,0.35)]">
            A
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-black italic tracking-tight text-white">
              Agapay
            </p>
            <p className="truncate text-[11px] uppercase tracking-[0.24em] text-slate-400">
              Cooperative SaaS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(false)}
            className="rounded-2xl text-slate-300 hover:bg-white/10 hover:text-white lg:hidden"
            title="Close navigation"
          >
            <X className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed((value) => !value)}
            className="hidden rounded-2xl text-slate-300 hover:bg-white/10 hover:text-white xl:flex"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      <div
        ref={navScrollRef}
        className={`flex-1 px-3 pt-3 pb-3 ${navReady ? "overflow-y-auto" : "overflow-y-hidden"}`}
      >
        <TabsList className="flex h-auto w-full flex-col gap-1 bg-transparent p-0">
          {navItems.map((item) => {
            const Icon = ICON_MAP[item.icon];
            return (
              <TabsTrigger
                key={item.value}
                value={item.value}
                onClick={() => setMobileOpen(false)}
                className={`group h-auto w-full justify-start rounded-2xl border px-3 py-2 text-left text-slate-300 transition-all hover:border-white/12 hover:bg-white/6 hover:text-white ${accentStyles.active} ${
                  collapsed ? "xl:px-2.5" : ""
                }`}
              >
                <div className="flex w-full items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] border border-white/8 bg-white/5 transition-colors group-data-[state=active]:border-white/15 group-data-[state=active]:bg-white/10">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div
                    className={`min-w-0 flex-1 transition-all ${
                      collapsed ? "xl:hidden" : ""
                    }`}
                  >
                    <p className="truncate font-display text-[13px] font-bold italic">
                      {item.label}
                    </p>
                  </div>
                  {typeof item.badge === "number" && item.badge > 0 ? (
                    <span
                      className={`rounded-full border border-white/10 px-2 py-1 text-[10px] font-black ${
                        collapsed ? "xl:hidden" : ""
                      } ${
                        accent === "blue"
                          ? "bg-blue-400/15 text-blue-200"
                          : "bg-emerald-400/15 text-emerald-200"
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      <div className="border-t border-white/10 p-3">
        <div className="space-y-3 rounded-[1.75rem] border border-white/8 bg-white/5 p-3 shadow-[0_10px_30px_rgba(2,6,23,0.22)]">
          <div className={collapsed ? "xl:hidden" : ""}>
            <BranchSwitcher />
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl font-black ${accentStyles.panel} ${accentStyles.icon}`}
            >
              {accountName.slice(0, 2).toUpperCase()}
            </div>
            <div className={`min-w-0 flex-1 ${collapsed ? "xl:hidden" : ""}`}>
              <p className="truncate text-sm font-bold text-white">
                {accountName}
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                {accountRole}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: "/" })}
            className={`w-full justify-start rounded-2xl border px-4 py-3 text-slate-100 ${accentStyles.highlight}`}
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span className={collapsed ? "xl:hidden" : ""}>Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white lg:flex lg:h-screen lg:overflow-hidden">
      <div
        className={`fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      <div
        aria-hidden="true"
        className={`hidden lg:block lg:flex-shrink-0 lg:w-[18.5rem] ${
          collapsed ? "xl:w-[6.5rem]" : "xl:w-[21rem]"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 h-screen w-[min(88vw,20rem)] -translate-x-full transition-transform duration-300 lg:w-[18.5rem] lg:translate-x-0 ${
          collapsed ? "xl:w-[6.5rem]" : "xl:w-[21rem]"
        } ${mobileOpen ? "translate-x-0" : ""}`}
      >
        {renderSidebar()}
      </aside>

      <div className="min-w-0 flex-1 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.06),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)] text-slate-950 lg:h-screen lg:overflow-y-auto">
        <div className="border-b border-slate-200/80 bg-white/88 px-5 py-5 backdrop-blur-xl md:px-8 lg:sticky lg:top-0 lg:z-20">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-3 lg:hidden">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setMobileOpen(true)}
                  className="rounded-2xl border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                  title="Open navigation"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="min-w-0">
                  <p className="text-sm font-black italic tracking-tight text-slate-900">
                    Agapay
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Cooperative SaaS
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <h1 className="text-3xl font-display font-bold italic tracking-tight text-slate-950 md:text-4xl">
                  {title}
                </h1>
                <p className="max-w-3xl text-sm text-slate-500 md:text-base">
                  {subtitle}
                </p>
              </div>
            </div>
            <div
              className={`inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 lg:self-auto ${accentStyles.badge}`}
            >
              <div className={`h-2.5 w-2.5 rounded-full ${accentStyles.dot}`} />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">
                {portalLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 md:p-8">{children}</div>
      </div>
    </div>
  );
}
