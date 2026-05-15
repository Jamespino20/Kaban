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
  Bot,
  ChevronLeft,
  ChevronRight,
  FileText,
  HandCoins,
  History,
  LayoutDashboard,
  LogOut,
  Mail,
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
  Sun,
  Moon,
  CreditCard,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
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
  const parsed = parseInt(normalized, 16);

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

function getContrastColor(hex: string | null) {
  if (!hex) return "white";
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "black" : "white";
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
  | "check"
  | "subscriptions"
  | "mail"
  | "bot";

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
  check: HeartPulse,
  subscriptions: CreditCard,
  mail: Mail,
  bot: Bot,
} satisfies Record<ShellIconName, React.ComponentType<{ className?: string }>>;

export function AuthenticatedShell({
  title,
  subtitle,
  portalLabel,
  accountName,
  accountRole,
  accountPhotoUrl,
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
  accountPhotoUrl?: string;
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

  // Force system green theme for superadmin
  const isSuperadmin = accountRole === "superadmin";

  const normalizedTenantColor = isSuperadmin 
    ? "#009966"
    : normalizeHexColor(tenantBrandColor);
    
  const normalizedAccentColor = normalizeHexColor(tenantAccentColor);

  const getFontFamily = (pairing: string | null) => {
    switch (pairing) {
      case "roboto_playfair":
        return "'Fraunces', serif";
      case "montserrat_poppins":
        return "'Fraunces', serif";
      default:
        return "'Fraunces', serif";
    }
  };

  const getBodyFontFamily = (pairing: string | null) => {
    switch (pairing) {
      case "roboto_playfair":
        return "'Plus Jakarta Sans', sans-serif";
      case "montserrat_poppins":
        return "'Plus Jakarta Sans', sans-serif";
      default:
        return "'Plus Jakarta Sans', sans-serif";
    }
  };

  const cssVars = {
    ...(normalizedTenantColor ? { "--primary": normalizedTenantColor } : {}),
    ...(normalizedAccentColor ? { "--accent": normalizedAccentColor } : {}),
    "--font-display": getFontFamily(tenantFontPairing || null),
    "--font-sans": getBodyFontFamily(tenantFontPairing || null),
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
  };

  const isBrandColorLight = normalizedTenantColor ? getContrastColor(normalizedTenantColor) === "black" : false;
  
  const sidebarBgStyle = {
    backgroundColor: normalizedTenantColor || "#0f172a",
  } as React.CSSProperties;

  const sidebarTextClass = isBrandColorLight ? "text-slate-900" : "text-white";
  const sidebarMutedClass = isBrandColorLight ? "text-slate-600" : "text-slate-300";
  const sidebarBorderClass = isBrandColorLight ? "border-slate-300/30" : "border-white/10";
  const sidebarHoverTextClass = isBrandColorLight ? "hover:bg-black/5 hover:text-black" : "hover:bg-white/10 hover:text-white";
  const sidebarActiveClass = isBrandColorLight 
    ? "data-[state=active]:bg-black/10 data-[state=active]:text-black data-[state=active]:font-bold" 
    : "data-[state=active]:bg-white/15 data-[state=active]:text-white data-[state=active]:font-bold";
  const iconBgContrastClass = isBrandColorLight 
    ? "bg-black/5 text-slate-600 group-data-[state=active]:bg-white group-data-[state=active]:text-black" 
    : "bg-white/10 text-white/70 group-data-[state=active]:bg-white group-data-[state=active]:text-slate-900";
  const badgeContrastClass = isBrandColorLight ? "bg-black/10 text-black" : "bg-white/20 text-white";
  
  const mainPaneStyle = {
    background: "none",
    backgroundColor: "#f8fafc",
  } as React.CSSProperties;

  const portalBadgeStyle = normalizedTenantColor
    ? ({
        borderColor: rgba(normalizedTenantColor, 0.22),
        backgroundColor: rgba(normalizedTenantColor, 0.1),
        color: normalizedTenantColor,
      } as React.CSSProperties)
    : undefined;

  useEffect(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setNavReady(true));
    });
  }, []);

  const renderSidebar = () => (
    <div
      className={cn("flex h-full flex-col border-r", sidebarTextClass, sidebarBorderClass)}
      style={sidebarBgStyle}
    >
      <div
        className={`h-1 w-full ${isBrandColorLight ? 'bg-black/10' : 'bg-white/10'}`}
      />
      <div
        className={cn("flex flex-col border-b px-4 py-5 space-y-4", sidebarBorderClass)}
      >
        <div className="flex items-center justify-between">
          <div
            className={`flex min-w-0 flex-col gap-1 transition-all ${
              collapsed ? "xl:w-0 xl:opacity-0" : "xl:w-auto xl:opacity-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden shadow-sm ${
                  tenantName ? "rounded-2xl" : "rounded-full"
                } ${isBrandColorLight ? "bg-black/5" : "bg-white/10"}`}
              >
                {tenantLogoUrl ? (
                  <img
                    src={tenantLogoUrl}
                    alt={tenantName || "Logo"}
                    className="h-full w-full object-cover"
                  />
                ) : tenantName ? (
                  <span className={cn("text-xl font-black", sidebarTextClass)}>
                    {tenantName.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <img
                    src="/images/agapay_solo.png"
                    alt="Agapay Symbol"
                    className={cn("h-[22px] w-[22px] object-contain", !isBrandColorLight && "brightness-0 invert")}
                  />
                )}
              </div>
              <div className="min-w-0">
                <p
                  className={cn(
                    "truncate text-lg font-black tracking-tight mb-0.5",
                    sidebarTextClass,
                  )}
                >
                  {tenantName || "Agapay"}
                </p>
                <div className="flex items-center gap-1.5 opacity-90">
                  <p className="text-xs">Powered by</p>
                  <img
                    src="/images/agapay_titled.png"
                    alt="Agapay"
                    className={cn("h-4 object-contain", isBrandColorLight ? "brightness-0" : "brightness-0 invert")}
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
              className={cn("rounded-2xl lg:hidden", sidebarMutedClass, sidebarHoverTextClass)}
              title="Close navigation"
            >
              <X className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed((value) => !value)}
              className={cn("hidden rounded-2xl xl:flex", sidebarMutedClass, sidebarHoverTextClass)}
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
        className={`flex-1 px-4 pt-4 pb-3 ${navReady ? "overflow-y-auto" : "overflow-y-hidden"}`}
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
                    className={cn(
                      "px-4 mb-2 text-[10px] font-black uppercase tracking-[0.2em] font-accent",
                      sidebarMutedClass,
                    )}
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
                      className={cn(
                        "group h-auto w-full justify-start rounded-2xl border border-transparent px-4 py-2.5 text-left transition-all cursor-pointer",
                        sidebarMutedClass,
                        sidebarHoverTextClass,
                        sidebarActiveClass,
                        collapsed ? "xl:px-2" : "",
                      )}
                    >
                      <div className="flex w-full items-center gap-3">
                        <div
                          className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[10px] ${iconBgContrastClass} transition-colors`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div
                          className={cn(
                            "min-w-0 flex-1 transition-all",
                            collapsed ? "xl:hidden" : "",
                          )}
                        >
                          <p className="truncate text-[13px] font-bold font-sans">
                            {item.label}
                          </p>
                        </div>
                        {typeof item.badge === "number" && item.badge > 0 ? (
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-black",
                              badgeContrastClass,
                              collapsed ? "xl:hidden" : "",
                            )}
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

      <div className={cn("border-t p-3", sidebarBorderClass)}>
        <div className="flex items-center justify-center gap-2 px-4 py-2">
          <p
            className={cn(
              "text-[10px] font-bold uppercase tracking-[0.2em]",
              sidebarMutedClass,
            )}
          >
            © 2026 Agapay
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div
      className="min-h-screen text-slate-900 bg-slate-50 lg:flex lg:h-screen lg:overflow-hidden"
      style={{ ...cssVars }}
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
        className={`hidden lg:block lg:flex-shrink-0 lg:w-[17.5rem] ${
          collapsed ? "xl:w-[6.5rem]" : "xl:w-[17.5rem]"
        }`}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 h-screen w-[min(88vw,20rem)] -translate-x-full transition-transform duration-300 lg:w-[17.5rem] lg:translate-x-0 ${
          collapsed ? "xl:w-[6.5rem]" : "xl:w-[17.5rem]"
        } ${mobileOpen ? "translate-x-0" : ""}`}
      >
        {renderSidebar()}
      </aside>

      <div
        className="min-w-0 flex-1 text-slate-900 lg:h-screen lg:overflow-y-auto"
        style={mainPaneStyle}
      >
        <div className="border-b border-slate-200/80 bg-white/95 px-5 py-4 backdrop-blur-xl md:px-8 lg:sticky lg:top-0 lg:z-20 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3 lg:hidden">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setMobileOpen(true)}
                  className="rounded-xl border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                  title="Open navigation"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <div className="min-w-0">
                  <p className="text-sm font-bold italic tracking-tight text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
                    Agapay
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    Cooperative SaaS
                  </p>
                </div>
              </div>

              <div className="space-y-1" style={{ fontFamily: "var(--font-display)" }}>
                {portalLabel ? (
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500 font-semibold font-accent">
                    {portalLabel}
                  </p>
                ) : null}
                <h1 className="text-2xl font-heading font-bold italic tracking-tight text-slate-950 md:text-3xl">
                  {title}
                </h1>
                <p
                  className="max-w-3xl text-sm text-slate-500 md:text-sm font-sans"
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
                className={`hidden md:inline-flex items-center gap-3 rounded-xl border p-1 pr-4 ${dynamicStyles.badge}`}
                style={portalBadgeStyle}
              >
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg font-bold bg-white/90 shadow-sm text-sm overflow-hidden"
                  style={{ color: normalizedTenantColor || "#0f172a" }}
                >
                  {accountPhotoUrl ? (
                    <img src={accountPhotoUrl} alt={accountName} className="h-full w-full object-cover" />
                  ) : (
                    accountName.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="hidden lg:block text-left text-current">
                  <p className="text-sm font-semibold leading-none font-accent">
                    {accountName}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-80 leading-tight mt-0.5">
                    {accountRole}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                      title="More actions"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl">
                    <DropdownMenuLabel className="font-accent">Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.history.pushState(null, "", `/${tenantSlug}/${accountRole === "member" ? "agapay-pintig" : "agapay-tanaw"}?tab=settings`)}>
                      <Settings2 className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" />
                      View Reports
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut({ callbackUrl: `/${tenantSlug}` })}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        <div data-dashboard-scroll className="px-5 py-5 md:px-[48px] md:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
