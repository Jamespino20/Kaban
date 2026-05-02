"use client";

import { Tabs } from "@/components/ui/tabs";
import {
  type ShellNavItem,
  AuthenticatedShell,
} from "@/components/layout/authenticated-shell";
import { useState } from "react";

type DashboardTabsShellProps = {
  defaultValue: string;
  title: string;
  subtitle: string;
  portalLabel: string;
  accountName: string;
  accountRole: string;
  tenantName?: string;
  tenantLogoUrl?: string;
  tenantBrandColor?: string | null;
  tenantAccentColor?: string | null;
  tenantFontPairing?: string | null;
  navItems: ShellNavItem[];
  children: React.ReactNode;
};

export function DashboardTabsShell({
  defaultValue,
  children,
  navItems,
  title,
  tenantAccentColor,
  tenantFontPairing,
  ...shellProps
}: DashboardTabsShellProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const activeLabel =
    navItems.find((item) => item.value === activeTab)?.label ?? title;

  const handleTabChange = (value: string) => {
    setActiveTab(value);

    if (typeof document === "undefined") return;
    const scrollContainer = document.querySelector<HTMLElement>(
      "[data-dashboard-scroll]",
    );
    scrollContainer?.scrollTo({ top: 0, behavior: "auto" });
  };

  return (
    <Tabs
      defaultValue={defaultValue}
      className="min-h-screen"
      onValueChange={handleTabChange}
    >
      <AuthenticatedShell
        {...shellProps}
        tenantAccentColor={tenantAccentColor}
        tenantFontPairing={tenantFontPairing}
        navItems={navItems}
        title={activeLabel}
      >
        {children}
      </AuthenticatedShell>
    </Tabs>
  );
}
