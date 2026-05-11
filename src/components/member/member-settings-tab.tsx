"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Bell, Building2, Link2, Landmark, Mail, Phone,
  ShieldCheck, User2, Wallet, Settings2, Plus, Trash2,
  Github, Chrome, Facebook, Check,
} from "lucide-react";
import { TwoFactorSetup } from "@/components/auth/two-factor-setup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

type LinkedAccount = {
  id: string;
  provider: "google" | "facebook" | "github";
  label: string;
  email: string;
  linkedAt: string;
};

type BankWalletAccount = {
  id: string;
  type: "bank" | "ewallet";
  name: string;
  accountNumber: string;
  holderName: string;
};

type NotificationPref = {
  key: string;
  label: string;
  desc: string;
  enabled: boolean;
};

const STORAGE_KEY_LINKED = "agapay_linked_accounts";
const STORAGE_KEY_BANK = "agapay_bank_accounts";
const STORAGE_KEY_PREFS = "agapay_notification_prefs";

const DEFAULT_PREFS: NotificationPref[] = [
  { key: "loan_updates", label: "Loan Updates", desc: "Application status, approval, and payment reminders", enabled: true },
  { key: "payment_confirmations", label: "Payment Confirmations", desc: "Confirmation for every payment transaction", enabled: true },
  { key: "community_messages", label: "Community Messages", desc: "Direct messages and group chat notifications", enabled: true },
  { key: "promos", label: "Promos & Announcements", desc: "Tenant-wide announcements and promotions", enabled: true },
  { key: "security_alerts", label: "Security Alerts", desc: "Login attempts, password changes, and 2FA updates", enabled: true },
];

const PROVIDER_ICONS: Record<string, React.ReactNode> = {
  google: <Chrome className="h-4 w-4" />,
  facebook: <Facebook className="h-4 w-4" />,
  github: <Github className="h-4 w-4" />,
};

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
  const [linkedAccounts, setLinkedAccounts] = useState<LinkedAccount[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankWalletAccount[]>([]);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPref[]>(DEFAULT_PREFS);

  // Linked accounts dialog state
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkProvider, setLinkProvider] = useState<string>("");
  const [linkEmail, setLinkEmail] = useState("");

  // Bank account dialog state
  const [bankDialogOpen, setBankDialogOpen] = useState(false);
  const [bankType, setBankType] = useState<"bank" | "ewallet">("bank");
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankHolderName, setBankHolderName] = useState("");

  useEffect(() => {
    try {
      const savedLinked = localStorage.getItem(STORAGE_KEY_LINKED);
      if (savedLinked) setLinkedAccounts(JSON.parse(savedLinked));
      const savedBank = localStorage.getItem(STORAGE_KEY_BANK);
      if (savedBank) setBankAccounts(JSON.parse(savedBank));
      const savedPrefs = localStorage.getItem(STORAGE_KEY_PREFS);
      if (savedPrefs) setNotificationPrefs(JSON.parse(savedPrefs));
    } catch { /* ignore */ }
  }, []);

  const saveLinked = useCallback((accounts: LinkedAccount[]) => {
    setLinkedAccounts(accounts);
    localStorage.setItem(STORAGE_KEY_LINKED, JSON.stringify(accounts));
  }, []);

  const saveBank = useCallback((accounts: BankWalletAccount[]) => {
    setBankAccounts(accounts);
    localStorage.setItem(STORAGE_KEY_BANK, JSON.stringify(accounts));
  }, []);

  const savePrefs = useCallback((prefs: NotificationPref[]) => {
    setNotificationPrefs(prefs);
    localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(prefs));
  }, []);

  const handleLinkAccount = () => {
    if (!linkProvider || !linkEmail.trim()) {
      toast.error("Please select a provider and enter an email");
      return;
    }
    const newAccount: LinkedAccount = {
      id: crypto.randomUUID(),
      provider: linkProvider as LinkedAccount["provider"],
      label: linkProvider.charAt(0).toUpperCase() + linkProvider.slice(1),
      email: linkEmail.trim(),
      linkedAt: new Date().toISOString(),
    };
    saveLinked([...linkedAccounts, newAccount]);
    setLinkProvider("");
    setLinkEmail("");
    setLinkDialogOpen(false);
    toast.success("Account linked successfully");
  };

  const handleUnlinkAccount = (id: string) => {
    saveLinked(linkedAccounts.filter((a) => a.id !== id));
    toast.success("Account unlinked");
  };

  const handleAddBankAccount = () => {
    if (!bankName.trim() || !bankAccountNumber.trim() || !bankHolderName.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    const newAccount: BankWalletAccount = {
      id: crypto.randomUUID(),
      type: bankType,
      name: bankName.trim(),
      accountNumber: bankAccountNumber.trim(),
      holderName: bankHolderName.trim(),
    };
    saveBank([...bankAccounts, newAccount]);
    setBankName("");
    setBankAccountNumber("");
    setBankHolderName("");
    setBankDialogOpen(false);
    toast.success("Account added successfully");
  };

  const handleRemoveBankAccount = (id: string) => {
    saveBank(bankAccounts.filter((a) => a.id !== id));
    toast.success("Account removed");
  };

  const toggleNotificationPref = (key: string) => {
    savePrefs(
      notificationPrefs.map((p) =>
        p.key === key ? { ...p, enabled: !p.enabled } : p,
      ),
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="dashboard-card p-5">
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
          <div className="dashboard-card p-5">
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

          <div className="dashboard-card p-5">
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

          <div className="dashboard-card p-5">
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
              {linkedAccounts.length > 0 ? (
                <div className="space-y-2">
                  {linkedAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center">
                          {PROVIDER_ICONS[acc.provider] || <Link2 className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{acc.label}</p>
                          <p className="text-xs text-slate-500">{acc.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnlinkAccount(acc.id)}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center">
                  <Link2 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No linked accounts yet</p>
                </div>
              )}
              <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl">
                    <Plus className="h-4 w-4 mr-2" /> Link an Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Link an Account</DialogTitle>
                    <DialogDescription>
                      Connect an external account for faster access.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Provider</label>
                      <Select value={linkProvider} onValueChange={setLinkProvider}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="google">Google</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="github">GitHub</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Email</label>
                      <Input
                        value={linkEmail}
                        onChange={(e) => setLinkEmail(e.target.value)}
                        placeholder="account@email.com"
                        className="rounded-xl"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setLinkDialogOpen(false)} className="rounded-xl">
                      Cancel
                    </Button>
                    <Button onClick={handleLinkAccount} className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
                      Link Account
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="dashboard-card p-5">
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
              {bankAccounts.length > 0 ? (
                <div className="space-y-2">
                  {bankAccounts.map((acc) => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${acc.type === "bank" ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600"}`}>
                          <Landmark className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{acc.name}</p>
                          <p className="text-xs text-slate-500">{acc.holderName} • {acc.accountNumber}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveBankAccount(acc.id)}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center">
                  <Wallet className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No registered bank or wallet accounts yet</p>
                </div>
              )}
              <Dialog open={bankDialogOpen} onOpenChange={setBankDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-xl">
                    <Plus className="h-4 w-4 mr-2" /> Add an Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-2xl sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add an Account</DialogTitle>
                    <DialogDescription>
                      Register a bank account or e-wallet for transactions.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Account Type</label>
                      <Select value={bankType} onValueChange={(v) => setBankType(v as "bank" | "ewallet")}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank">Bank Account</SelectItem>
                          <SelectItem value="ewallet">E-Wallet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">{bankType === "bank" ? "Bank Name" : "Wallet Name"}</label>
                      <Input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder={bankType === "bank" ? "BDO, BPI, etc." : "GCash, Maya, etc."} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Account Number</label>
                      <Input value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} placeholder="Enter account number" className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Account Holder Name</label>
                      <Input value={bankHolderName} onChange={(e) => setBankHolderName(e.target.value)} placeholder="Full name on account" className="rounded-xl" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setBankDialogOpen(false)} className="rounded-xl">Cancel</Button>
                    <Button onClick={handleAddBankAccount} className="rounded-xl bg-emerald-600 hover:bg-emerald-700">Add Account</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
          <div className="dashboard-card p-5">
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

          <div className="dashboard-card p-5">
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
                {notificationPrefs.map((pref) => (
                  <div
                    key={pref.key}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => toggleNotificationPref(pref.key)}
                  >
                    <div
                      className={`flex h-5 w-5 items-center justify-center rounded border-2 mt-0.5 transition-colors ${
                        pref.enabled
                          ? "border-emerald-400 bg-emerald-500"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {pref.enabled && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">{pref.label}</p>
                      <p className="text-xs text-slate-400">{pref.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 italic">
                Preferences are saved locally and will sync when backend support is available.
              </p>
            </div>
          </div>

          <div className="dashboard-card p-5">
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