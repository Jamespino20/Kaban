"use client";

import { Tabs } from "@/components/ui/tabs";
import { type ShellNavItem, AuthenticatedShell } from "@/components/layout/authenticated-shell";

type DashboardTabsShellProps = {
  defaultValue: string;
  title: string;
  subtitle: string;
  portalLabel: string;
  accountName: string;
  accountRole: string;
  accent?: "emerald" | "blue";
  navItems: ShellNavItem[];
  children: React.ReactNode;
};

export function DashboardTabsShell({
  defaultValue,
  children,
  ...shellProps
}: DashboardTabsShellProps) {
  const handleTabChange = () => {
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
      <AuthenticatedShell {...shellProps}>{children}</AuthenticatedShell>
    </Tabs>
  );
}
