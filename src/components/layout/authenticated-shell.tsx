"use client";

import { NotificationBell } from "@/components/layout/notification-bell";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  MoreVertical,
  TrendingUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { TenantSelector } from "@/components/layout/tenant-selector";

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
  category?: string;
};

export type ShellIconName =
  | "overview"
  | "approvals"
  | "members"
  | "products"
  | "tenants"
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
  | "reconciliation"
  | "activity"
  | "shield"
  | "check";

const ICON_MAP = {
  overview: LayoutDashboard,
  approvals: FileText,
  members: Users2,
  products: Settings2,
  tenants: ShieldAlert,
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
  reconciliation: FileText,
  activity: HeartPulse,
  shield: ShieldAlert,
  check: HeartPulse, // Using HeartPulse as placeholder for check if needed
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
  tenantAccentColor,
  tenantFontPairing,
  navItems,
  tenantSlug,
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
  tenantAccentColor?: string | null;
  tenantFontPairing?: string | null;
  navItems: ShellNavItem[];
  tenantSlug: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [navReady, setNavReady] = useState(false);
  const navScrollRef = useRef<HTMLDivElement>(null);

  const normalizedTenantColor = normalizeHexColor(tenantBrandColor);
  const normalizedAccentColor = normalizeHexColor(tenantAccentColor);

  const getFontFamily = (pairing: string | null) => {
    switch (pairing) {
      case "roboto_playfair":
        return "'Playfair Display', serif";
      case "montserrat_poppins":
        return "'Poppins', sans-serif";
      default:
        return "'Outfit', sans-serif";
    }
  };

  const getBodyFontFamily = (pairing: string | null) => {
    switch (pairing) {
      case "roboto_playfair":
        return "'Roboto', sans-serif";
      case "montserrat_poppins":
        return "'Montserrat', sans-serif";
      default:
        return "'Inter', sans-serif";
    }
  };

  const cssVars = {
    ...(normalizedTenantColor ? { "--primary": normalizedTenantColor } : {}),
    ...(normalizedAccentColor
      ? { "--accent-custom": normalizedAccentColor }
      : {}),
    "--font-display-custom": getFontFamily(tenantFontPairing || null),
    "--font-sans-custom": getBodyFontFamily(tenantFontPairing || null),
  } as React.CSSProperties;

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
    surface: `border-white/10 bg-[linear-gradient(180deg,${rgba(normalizedTenantColor || "#0f172a", 0.96)},#020617)]`,
  };

  const getContrastColor = (hex?: string | null) => {
    if (!hex) return "white";
    const { r, g, b } = hexToRgb(hex);
    // Standard relative luminance formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? "black" : "white";
  };

  const contrastColor = getContrastColor(normalizedTenantColor);
  const isLight = contrastColor === "black";
  const contrastClass = isLight ? "text-slate-950" : "text-white";
  const mutedContrastClass = isLight ? "text-slate-700" : "text-white/60";
  const borderContrastClass = isLight
    ? "border-slate-950/10"
    : "border-white/10";
  const hoverContrastClass = isLight
    ? "hover:bg-slate-950/10"
    : "hover:bg-white/10";
  const activeContrastClass = isLight
    ? "data-[state=active]:bg-slate-950/15 data-[state=active]:border-slate-950/20"
    : "data-[state=active]:bg-white/15 data-[state=active]:border-white/20";
  const iconBgContrastClass = isLight ? "bg-slate-950/5" : "bg-white/5";
  const badgeContrastClass = isLight ? "bg-slate-950/20" : "bg-white/20";

  const sidebarStyle = {
    backgroundImage: normalizedTenantColor
      ? `linear-gradient(180deg, ${rgba(normalizedTenantColor, 0.08)})`
      : "linear-gradient(180deg, #f8fafc 0%, #2e353cff 100%)",
  } as React.CSSProperties;
  const mainPaneStyle = {
    backgroundImage: normalizedTenantColor
      ? `radial-gradient(circle at top, ${rgba(normalizedTenantColor, 0.15)}, transparent 30%), linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)`
      : "radial-gradient(circle at top, rgba(16,185,129,0.08), transparent 30%), linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
  } as React.CSSProperties;
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
      className={`flex h-full flex-col ${contrastClass}`}
      style={{
        backgroundColor: normalizedTenantColor || "#0f172a",
        ...sidebarStyle,
      }}
    >
      <div
        className={`h-1 w-full ${isLight ? "bg-slate-950/20" : "bg-white/20"}`}
      />
      <div
        className={`flex flex-col border-b ${borderContrastClass} p-4 space-y-4`}
      >
        <div className="flex items-center justify-between">
          <div
            className={`flex min-w-0 flex-col gap-1 transition-all ${
              collapsed ? "xl:w-0 xl:opacity-0" : "xl:w-auto xl:opacity-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden bg-white shadow-sm ${
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
                <p
                  className={`truncate text-lg font-black tracking-tight ${contrastClass} mb-0.5`}
                >
                  {tenantName || "Agapay"}
                </p>
                <div className="flex items-center gap-1.5 opacity-90">
                  <p className="text-xs">Powered by</p>
                  <img
                    src="/images/agapay_titled.png"
                    alt="Agapay"
                    className={`h-4 object-contain ${isLight ? "brightness-0" : "brightness-0 invert"}`}
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
              className={`rounded-2xl ${mutedContrastClass} ${hoverContrastClass} lg:hidden`}
              title="Close navigation"
            >
              <X className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed((value) => !value)}
              className={`hidden rounded-2xl ${mutedContrastClass} ${hoverContrastClass} xl:flex`}
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
      </div>

      <div
        ref={navScrollRef}
        className={`flex-1 px-3 pt-4 pb-3 ${navReady ? "overflow-y-auto" : "overflow-y-hidden"}`}
      >
        <TabsList className="flex h-auto w-full flex-col justify-start gap-1 bg-transparent p-0">
          {(() => {
            const grouped: Record<string, ShellNavItem[]> = {};
            navItems.forEach((item) => {
              const cat = item.category || "General";
              if (!grouped[cat]) grouped[cat] = [];
              grouped[cat].push(item);
            });

            return Object.entries(grouped).map(([category, items]) => (
              <div key={category} className="space-y-1 mb-6">
                {!collapsed && (
                  <h3
                    className={`pl-12 mb-2 text-[10px] font-black uppercase tracking-[0.2em] ${mutedContrastClass}`}
                  >
                    {category}
                  </h3>
                )}
                {items.map((item) => {
                  const Icon = ICON_MAP[item.icon];
                  return (
                    <TabsTrigger
                      key={item.value}
                      value={item.value}
                      onClick={() => {
                        setMobileOpen(false);
                        window.history.pushState(
                          null,
                          "",
                          `/${tenantSlug}/${accountRole === "member" ? "agapay-pintig" : "agapay-tanaw"}?tab=${item.value}`,
                        );
                        const event = new PopStateEvent("popstate");
                        window.dispatchEvent(event);
                      }}
                      className={`group h-auto w-full justify-start rounded-2xl border border-transparent px-1 py-2.5 text-left ${mutedContrastClass} transition-all hover:${contrastClass} ${hoverContrastClass} ${activeContrastClass} data-[state=active]:${contrastClass} ${
                        collapsed ? "xl:px-2.5" : ""
                      }`}
                      style={{
                        backgroundColor:
                          item.value ===
                          "" /* Check active state below if needed, but rad tabs handle this using css */
                            ? ""
                            : "transparent",
                      }}
                    >
                      <div className="flex w-full items-center gap-3">
                        <div
                          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] ${iconBgContrastClass} transition-colors group-data-[state=active]:bg-white group-data-[state=active]:text-slate-900`}
                        >
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
                            className={`rounded-full ${badgeContrastClass} px-2 py-0.5 text-[10px] font-black ${contrastClass} ${
                              collapsed ? "xl:hidden" : ""
                            }`}
                          >
                            {item.badge}
                          </span>
                        ) : null}
                      </div>
                    </TabsTrigger>
                  );
                })}
              </div>
            ));
          })()}
        </TabsList>
      </div>

      <div className={`border-t ${borderContrastClass} p-3`}>
        <div className="px-4 py-2 text-center">
          <p
            className={`text-[10px] font-bold uppercase tracking-[0.2em] ${mutedContrastClass}`}
          >
            © 2026 Agapay System
          </p>
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

              <div
                className="space-y-1"
                style={{ fontFamily: "var(--font-display-custom)" }}
              >
                <h1 className="text-3xl font-display font-bold italic tracking-tight text-slate-950 md:text-4xl">
                  {title}
                </h1>
                <p
                  className="max-w-3xl text-sm text-slate-500 md:text-base"
                  style={{ fontFamily: "var(--font-sans-custom)" }}
                >
                  {subtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-start lg:self-auto">
              {accountRole === "member" && (
                <TenantSelector currentTenant={tenantSlug} />
              )}
              <NotificationBell />

              <div
                className={`hidden md:inline-flex items-center gap-3 rounded-full border p-1 pr-5 ${dynamicStyles.badge}`}
                style={portalBadgeStyle}
              >
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-black bg-white/90 shadow-sm"
                  style={{ color: normalizedTenantColor || "#0f172a" }}
                >
                  {accountName.slice(0, 2).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left text-current">
                  <p className="text-sm font-bold leading-none">
                    {accountName}
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 leading-tight mt-1">
                    {accountRole}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: `/${tenantSlug}` })}
                className="rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 ml-1"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
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
