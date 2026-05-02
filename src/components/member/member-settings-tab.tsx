"use client";

import { Bell, Building2, Mail, Phone, ShieldCheck, User2 } from "lucide-react";
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
              Account at Seguridad
            </h2>
            <p className="text-sm text-slate-500">
              Isang mas malinaw na view ng profile, branch context, consent, at
              proteksyon ng account mo.
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
              label="Branch"
              value={tenant.name || "Branch"}
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
              <InfoBlock label="Buong Pangalan" value={profile.fullName} />
              <InfoBlock label="Username" value={profile.username} />
              <InfoBlock label="Email" value={profile.email} icon={<Mail className="h-3.5 w-3.5 text-slate-400" />} />
              <InfoBlock
                label="Phone"
                value={profile.phone || "Walang naka-save"}
                icon={<Phone className="h-3.5 w-3.5 text-slate-400" />}
              />
              <InfoBlock
                label="Occupation"
                value={profile.occupation || "Walang naka-save"}
              />
              <InfoBlock
                label="Business"
                value={profile.businessName || "Walang naka-save"}
              />
            </div>
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Member since <span className="font-semibold text-slate-800">{profile.joinedAt}</span>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                Branch at Consent
              </h3>
            </div>
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Active Branch
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {tenant.name || "Branch"}
                </p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  Data Privacy Consent
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {consent.accepted ? "Tinanggap na" : "Hindi pa tinatanggap"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {consent.accepted
                    ? `Version ${consent.version || "n/a"} • ${consent.acceptedAt || "May record"}`
                    : "Kailangan ito para sa buong paggamit ng platform."}
                </p>
              </div>
              <div className="flex justify-start">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={() => window.open("/terms", "_blank")}
                >
                  Basahin ang Terms at Privacy
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                Notification Snapshot
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoBlock label="Unread Notifications" value={String(notifications.unreadCount)} />
              <InfoBlock label="Recent Notifications" value={String(notifications.totalCount)} />
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Ang system alerts, mentorship responses, at direct messages ay
              puwedeng lumabas dito at sa notification bell sa dashboard shell.
            </p>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 space-y-1">
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
              Security Controls
            </h3>
            <p className="text-sm text-slate-500">
              Protektahan ang access mo gamit ang authenticator-based two-factor
              authentication.
            </p>
          </div>
          <div className="flex justify-center">
            <TwoFactorSetup isEnabledInitial={security.is2FAEnabled} />
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
