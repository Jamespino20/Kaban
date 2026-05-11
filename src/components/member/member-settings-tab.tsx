"use client";

import { Badge } from "@/components/ui/badge";
import { Bell, Building2, Link2, Landmark, Mail, Phone, ShieldCheck, User2, Wallet, Settings2 } from "lucide-react";
import { TwoFactorSetup } from "@/components/auth/two-factor-setup";
import { Button } from "@/components/ui/button";

type MemberSettingsTabProps = {
  profile: {
    username: string;
    email: string;
    phone?: string | null;
    joinedAt: string;
    fullName: string;
    occupation?: string | null;
    businessName?: string | null;
  };
  tenant: {
    name?: string | null;
  };
  security: {
    is2FAEnabled: boolean;
  };
  notifications: {
    unreadCount: number;
    totalCount: number;
  };
  consent: {
    accepted: boolean;
    acceptedAt?: string | null;
    version?: string | null;
  };
};

export function MemberSettingsTab({
  profile,
  tenant,
  security,
  notifications,
  consent,
}: MemberSettingsTabProps) {
  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">
              Account & Security
            </h2>
            <p className="text-sm text-slate-500">
              A clear view of your profile, tenant context, consent, and account protection.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:min-w-[420px]">
            <MiniStat
              icon={<Bell className="h-4 w-4" />}
              label="Unread Alerts"
              value={String(notifications.unreadCount)}
              accent="amber"
            />
            <MiniStat
              icon={<ShieldCheck className="h-4 w-4" />}
              label="2FA"
              value={security.is2FAEnabled ? "Enabled" : "Off"}
              accent={security.is2FAEnabled ? "emerald" : "slate"}
            />
            <MiniStat
              icon={<Building2 className="h-4 w-4" />}
              label="Tenant"
              value={tenant.name || "Tenant"}
              accent="slate"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.98fr_1.02fr]">
        <section className="space-y-5">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <User2 className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                Profile Snapshot
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoBlock label="Full Name" value={profile.fullName} />
              <InfoBlock label="Username" value={profile.username} />
              <InfoBlock
                label="Email"
                value={profile.email}
                icon={<Mail className="h-3.5 w-3.5 text-slate-400" />}
              />
              <InfoBlock
                label="Phone"
                value={profile.phone || "Not saved"}
                icon={<Phone className="h-3.5 w-3.5 text-slate-400" />}
              />
              <InfoBlock
                label="Occupation"
                value={profile.occupation || "Not saved"}
              />
              <InfoBlock
                label="Business"
                value={profile.businessName || "Not saved"}
              />
            </div>
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Member since{" "}
              <span className="font-semibold text-slate-800">
                {profile.joinedAt}
              </span>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                Tenant & Consent
              </h3>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Active Tenant
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {tenant.name || "Tenant"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Data Privacy Consent
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {consent.accepted ? "Accepted" : "Not yet accepted"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {consent.accepted
                    ? `Version ${consent.version || "n/a"} • ${consent.acceptedAt || "On record"}`
                    : "Required for full platform access."}
                </p>
              </div>
              <div className="flex justify-start">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => window.open("/terms", "_blank")}
                >
                  Read Terms & Privacy
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Link2 className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                Linked Accounts
              </h3>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-slate-500">
                Link your external accounts for faster login and data sharing.
              </p>
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center">
                <Link2 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No linked accounts yet</p>
                <Button variant="outline" size="sm" className="mt-3 rounded-xl" disabled>
                  Link an Account
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Landmark className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                Bank & Wallet Accounts
              </h3>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-slate-500">
                Manage your bank accounts and e-wallets for withdrawals and deposits.
              </p>
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center">
                <Wallet className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No registered bank or wallet accounts yet</p>
                <Button variant="outline" size="sm" className="mt-3 rounded-xl" disabled>
                  Add an Account
                </Button>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Available Payment Methods</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none">GCash</Badge>
                  <Badge variant="secondary" className="bg-green-50 text-green-700 border-none">Maya</Badge>
                  <Badge variant="secondary" className="bg-slate-50 text-slate-600 border-slate-200">Bank Transfer</Badge>
                  <Badge variant="secondary" className="bg-slate-50 text-slate-600 border-slate-200">Over-the-Counter</Badge>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                Notification Snapshot
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoBlock
                label="Unread Notifications"
                value={String(notifications.unreadCount)}
              />
              <InfoBlock
                label="Recent Notifications"
                value={String(notifications.totalCount)}
              />
            </div>
            <p className="mt-3 text-xs text-slate-500">
              System alerts, mentorship responses, and direct messages may appear here and in the notification bell in the dashboard shell.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                Notification Preferences
              </h3>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-slate-500">
                Choose which notifications you want to receive.
              </p>
              <div className="space-y-3">
                {[
                  { label: "Loan Updates", desc: "Application status, approval, and payment reminders" },
                  { label: "Payment Confirmations", desc: "Confirmation for every payment transaction" },
                  { label: "Community Messages", desc: "Direct messages and group chat notifications" },
                  { label: "Promos & Announcements", desc: "Tenant-wide announcements and promotions" },
                  { label: "Security Alerts", desc: "Login attempts, password changes, and 2FA updates" },
                ].map((pref) => (
                  <div key={pref.label} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded border-2 border-emerald-400 bg-emerald-50 mt-0.5">
                      <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">{pref.label}</p>
                      <p className="text-xs text-slate-400">{pref.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 italic">
                Notification preferences currently default to all alert types.
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 space-y-1">
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                Security Controls
              </h3>
              <p className="text-sm text-slate-500">
                Protect your access using authenticator-based two-factor authentication.
              </p>
            </div>
            <div className="flex justify-center">
              <TwoFactorSetup isEnabledInitial={security.is2FAEnabled} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function InfoBlock({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </p>
      <div className="mt-1 flex items-center gap-2">
        {icon}
        <p className="text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: "amber" | "emerald" | "slate";
}) {
  const accentClasses = {
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
  }[accent];

  return (
    <div className={`rounded-xl border px-3 py-3 ${accentClasses}`}>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[11px] font-black uppercase tracking-[0.18em]">
          {label}
        </p>
      </div>
      <p className="mt-2 text-base font-bold text-slate-900">{value}</p>
    </div>
  );
}