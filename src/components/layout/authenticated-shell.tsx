"use client";

import { BranchSwitcher } from "@/components/layout/branch-switcher";
import { NotificationBell } from "@/components/layout/notification-bell";
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
  HeartPulse,
  Wallet,
  MessagesSquare,
  TrendingUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

function normalizeHexColor(color?: string | null) {
  if (!color) {
    return null;
  }

  const value = color.trim();
  const match = value.match(/^#?([0-9a-fA-F]{6})$/);
  if (!match) {
    return null;
  }

  return `#${match[1]}`;
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const parsed = Number.parseInt(normalized, 16);

  return {
    r: (parsed >> 16) & 255,
    g: (parsed >> 8) & 255,
    b: parsed & 255,
  };
}

function rgba(hex: string, alpha: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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
  | "settings"
  | "compassion"
  | "wallet"
  | "community"
  | "analytics"
  | "reconciliation";

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
  compassion: HeartPulse,
  wallet: Wallet,
  community: MessagesSquare,
  analytics: TrendingUp,
  reconciliation: History,
} satisfies Record<ShellIconName, React.ComponentType<{ className?: string }>>;

export function AuthenticatedShell({
  title,
  subtitle,
  portalLabel,
  accountName,
  accountRole,
  accent = "emerald",
  tenantName,
  tenantLogoUrl,
  tenantBrandColor,
  navItems,
  children,
}: {
  title: string;
  subtitle: string;
  portalLabel: string;
  accountName: string;
  accountRole: string;
  accent?: "emerald" | "blue";
  tenantName?: string;
  tenantLogoUrl?: string;
  tenantBrandColor?: string | null;
  navItems: ShellNavItem[];
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navReady, setNavReady] = useState(false);
  const navScrollRef = useRef<HTMLDivElement>(null);

  // We explicitly apply the 'dark' variant internally for the sidebar if needed,
  // but using generic CSS variable utilities allows the injected --primary to shine.
  const dynamicStyles = {
    active:
      "data-[state=active]:border-primary/40 data-[state=active]:bg-primary/20 data-[state=active]:text-white",
    badge:
      "border-primary/20 bg-primary/12 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
    dot: "bg-primary",
    icon: "text-primary",
    panel:
      "border border-primary/20 bg-gradient-to-br from-primary/5 to-white/95",
    highlight:
      "border-primary/25 bg-primary/12 text-primary hover:border-primary/35 hover:bg-primary/18",
    surface:
      "border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))]",
  };

  const normalizedTenantColor = normalizeHexColor(tenantBrandColor);
  const cssVars = normalizedTenantColor
    ? ({ "--primary": normalizedTenantColor } as React.CSSProperties)
    : {};
  const sidebarStyle = ({
    backgroundImage: normalizedTenantColor
      ? `radial-gradient(circle at top left, ${rgba(normalizedTenantColor, 0.22)}, transparent 32%), linear-gradient(180deg, rgba(15,23,42,0.98), rgba(2,6,23,0.99))`
      : "linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))",
  } as React.CSSProperties);
  const mainPaneStyle = ({
    backgroundImage: normalizedTenantColor
      ? `radial-gradient(circle at top, ${rgba(normalizedTenantColor, 0.12)}, transparent 28%), linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)`
      : "radial-gradient(circle at top,rgba(16,185,129,0.06),transparent 28%), linear-gradient(180deg,#f8fafc 0%,#f1f5f9 100%)",
  } as React.CSSProperties);
  const portalBadgeStyle = normalizedTenantColor
    ? ({
        borderColor: rgba(normalizedTenantColor, 0.25),
        backgroundColor: rgba(normalizedTenantColor, 0.12),
        color: normalizedTenantColor,
      } as React.CSSProperties)
    : undefined;
  const accountPanelStyle = normalizedTenantColor
    ? ({
        borderColor: rgba(normalizedTenantColor, 0.18),
        boxShadow: `0 10px 30px rgba(2,6,23,0.22), inset 0 1px 0 ${rgba(normalizedTenantColor, 0.14)}`,
      } as React.CSSProperties)
    : undefined;
  const logoutButtonStyle = normalizedTenantColor
    ? ({
        borderColor: rgba(normalizedTenantColor, 0.28),
        backgroundColor: rgba(normalizedTenantColor, 0.12),
        color: "#f8fafc",
      } as React.CSSProperties)
    : undefined;
  const accountBadgeStyle = normalizedTenantColor
    ? ({
        backgroundImage: `linear-gradient(135deg, ${rgba(normalizedTenantColor, 0.18)}, rgba(255,255,255,0.95))`,
        borderColor: rgba(normalizedTenantColor, 0.22),
        color: normalizedTenantColor,
      } as React.CSSProperties)
    : undefined;

  useEffect(() => {
    // Delay enabling scroll so Radix's focus-triggered scrollIntoView
    // cannot shift the nav container during mount.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setNavReady(true));
    });
  }, []);

  const renderSidebar = () => (
    <div
      className={`flex h-full flex-col border-r ${dynamicStyles.surface} text-white`}
      style={sidebarStyle}
    >
      <div
        className="h-1 w-full"
        style={
          normalizedTenantColor
            ? {
                background: `linear-gradient(90deg, ${rgba(normalizedTenantColor, 0.95)}, ${rgba(normalizedTenantColor, 0.4)})`,
              }
            : undefined
        }
      />
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-5">
        <div
          className={`flex min-w-0 flex-col gap-1 transition-all ${
            collapsed ? "xl:w-0 xl:opacity-0" : "xl:w-auto xl:opacity-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden border border-white/10 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.35)] ${
                tenantName ? "rounded-2xl" : "rounded-full"
              }`}
            >
              {tenantLogoUrl ? (
                <img
                  src={tenantLogoUrl}
                  alt={tenantName || "Logo"}
                  className="h-full w-full object-cover"
                />
              ) : tenantName ? (
                <span className="text-xl font-black text-slate-900">
                  {tenantName.charAt(0).toUpperCase()}
                </span>
              ) : (
                <img
                  src="/images/agapay_solo.png"
                  alt="Agapay Symbol"
                  className="h-[22px] w-[22px] object-contain"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-black tracking-tight text-white">
                {tenantName || "Agapay"}
              </p>
              <div className="flex items-center gap-1.5 opacity-60">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300">
                  Powered by
                </span>
                <img
                  src="/images/agapay_titled.png"
                  alt="Agapay"
                  className="h-[18px] object-contain opacity-90 filter brightness-200"
                />
              </div>
            </div>
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
        <TabsList className="flex h-auto w-full flex-col justify-start gap-1 bg-transparent p-0">
          {navItems.map((item) => {
            const Icon = ICON_MAP[item.icon];
            return (
              <TabsTrigger
                key={item.value}
                value={item.value}
                onClick={() => setMobileOpen(false)}
                className={`group h-auto w-full justify-start rounded-2xl border px-3 py-2 text-left text-slate-300 transition-all hover:border-white/12 hover:bg-white/6 hover:text-white ${dynamicStyles.active} ${
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
                    <p className="truncate text-[13px] font-bold">
                      {item.label}
                    </p>
                  </div>
                  {typeof item.badge === "number" && item.badge > 0 ? (
                    <span
                      className={`rounded-full border border-white/10 px-2 py-1 text-[10px] font-black ${
                        collapsed ? "xl:hidden" : ""
                      } ${dynamicStyles.badge}`}
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
        <div
          className="space-y-3 rounded-[1.75rem] border border-white/8 bg-white/5 p-3 shadow-[0_10px_30px_rgba(2,6,23,0.22)]"
          style={accountPanelStyle}
        >
          <div className={collapsed ? "xl:hidden" : ""}>
            <BranchSwitcher />
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl font-black ${dynamicStyles.panel} ${dynamicStyles.icon}`}
              style={accountBadgeStyle}
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
            className={`w-full justify-start rounded-2xl border px-4 py-3 text-slate-100 ${dynamicStyles.highlight}`}
            style={logoutButtonStyle}
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span className={collapsed ? "xl:hidden" : ""}>Logout</span>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen bg-slate-950 text-white lg:flex lg:h-screen lg:overflow-hidden"
      style={cssVars}
    >
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

      <div
        className="min-w-0 flex-1 text-slate-950 lg:h-screen lg:overflow-y-auto"
        style={mainPaneStyle}
      >
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
            <div className="flex items-center gap-3 self-start lg:self-auto">
              <NotificationBell />
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 ${dynamicStyles.badge}`}
                style={portalBadgeStyle}
              >
                <div
                  className={`h-2.5 w-2.5 rounded-full ${dynamicStyles.dot}`}
                />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">
                  {portalLabel}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div data-dashboard-scroll className="p-5 md:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
