"use client";

import { BranchSwitcher } from "@/components/layout/branch-switcher";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { signOut } from "next-auth/react";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { useState } from "react";

type ShellNavItem = {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
};

export function AuthenticatedShell({
  defaultTab,
  title,
  subtitle,
  portalLabel,
  accountName,
  accountRole,
  accent = "emerald",
  navItems,
  children,
}: {
  defaultTab: string;
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

  const accentStyles =
    accent === "blue"
      ? {
          active: "data-[state=active]:bg-blue-600 data-[state=active]:text-white",
          badge: "bg-blue-500/15 border-blue-500/20 text-blue-600",
          dot: "bg-blue-500",
          icon: "text-blue-600",
          panel: "bg-blue-50 border-blue-100",
        }
      : {
          active:
            "data-[state=active]:bg-emerald-600 data-[state=active]:text-white",
          badge: "bg-emerald-500/15 border-emerald-500/20 text-emerald-600",
          dot: "bg-emerald-500",
          icon: "text-emerald-600",
          panel: "bg-emerald-50 border-emerald-100",
        };

  return (
    <Tabs
      defaultValue={defaultTab}
      className="min-h-screen bg-slate-950 text-white md:flex"
    >
      <aside
        className={`border-r border-white/10 bg-slate-950/95 backdrop-blur-xl transition-all duration-300 ${
          collapsed ? "md:w-24" : "md:w-80"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-5">
            <div
              className={`flex items-center gap-3 overflow-hidden transition-all ${
                collapsed ? "md:w-0 md:opacity-0" : "md:w-auto md:opacity-100"
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-xl font-black italic text-white">
                A
              </div>
              <div>
                <p className="text-lg font-black italic tracking-tight">
                  Agapay
                </p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Cooperative SaaS
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed((value) => !value)}
              className="hidden rounded-2xl text-slate-300 hover:bg-white/10 hover:text-white md:flex"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="px-4 py-4">
            <div className={`rounded-[1.75rem] border px-4 py-4 ${accentStyles.badge}`}>
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${accentStyles.dot}`} />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">
                  {portalLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-4">
            <TabsList className="flex h-auto w-full flex-col gap-2 bg-transparent p-0">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    className={`group h-auto w-full justify-start rounded-2xl border border-transparent px-4 py-3 text-left text-slate-300 transition-all hover:border-white/10 hover:bg-white/5 hover:text-white ${accentStyles.active}`}
                  >
                    <div className="flex w-full items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 transition-colors group-data-[state=active]:bg-white/10">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div
                        className={`min-w-0 flex-1 transition-all ${
                          collapsed ? "md:hidden" : ""
                        }`}
                      >
                        <p className="truncate text-sm font-bold">
                          {item.label}
                        </p>
                      </div>
                      {typeof item.badge === "number" && item.badge > 0 ? (
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-black ${
                            collapsed ? "md:hidden" : ""
                          } ${accent === "blue" ? "bg-blue-500/20 text-blue-300" : "bg-emerald-500/20 text-emerald-300"}`}
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
            <div className="space-y-3 rounded-[1.75rem] bg-white/5 p-3">
              <div className={`${collapsed ? "md:hidden" : ""}`}>
                <BranchSwitcher />
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl font-black ${
                    accentStyles.panel
                  } ${accentStyles.icon}`}
                >
                  {accountName.slice(0, 2).toUpperCase()}
                </div>
                <div className={`min-w-0 flex-1 ${collapsed ? "md:hidden" : ""}`}>
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
                className="w-full justify-start rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-slate-200 hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut className="mr-3 h-4 w-4" />
                <span className={collapsed ? "md:hidden" : ""}>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 bg-slate-50 text-slate-950">
        <div className="border-b border-slate-200 bg-white/80 px-6 py-5 backdrop-blur-xl md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-display font-bold italic tracking-tight md:text-4xl">
                {title}
              </h1>
              <p className="text-sm text-slate-500 md:text-base">{subtitle}</p>
            </div>
            <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 ${accentStyles.badge}`}>
              <div className={`h-2.5 w-2.5 rounded-full ${accentStyles.dot}`} />
              <span className="text-xs font-bold uppercase tracking-[0.2em]">
                {portalLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">{children}</div>
      </div>
    </Tabs>
  );
}
