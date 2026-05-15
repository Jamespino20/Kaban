"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import {
  Bell, Building2, Link2, Landmark,
  ShieldCheck, User2, Wallet, Settings2, Plus, Trash2,
  Github, Chrome, Facebook, Check, FileText, GraduationCap, Eye,
  Download, AlertTriangle, Camera,
} from "lucide-react";
import { TwoFactorSetup } from "@/components/auth/two-factor-setup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { useRouter } from "next/navigation";
import { updatePersonalInfo } from "@/actions/member-profile";
import { updateUsername } from "@/actions/update-profile";
import { uploadIdPicture } from "@/actions/upload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFormPersistence } from "@/hooks/use-form-persistence";

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
    avatarUrl?: string | null;
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

type ProfileFormValues = {
  email: string;
  phone: string;
  occupation: string;
  businessName: string;
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

  // Editable personal info — managed via react-hook-form + useFormPersistence
  const form = useForm<ProfileFormValues>({
    defaultValues: {
      email: profile.email,
      phone: profile.phone || "",
      occupation: profile.occupation || "",
      businessName: profile.businessName || "",
    },
  });

  const watchedProfileValues = form.watch();
  const formDataAsRecord = useMemo(() => watchedProfileValues as unknown as Record<string, unknown>, [watchedProfileValues]);
  const { draftFound, clearPersistence, dismissDraftNotice } = useFormPersistence(
    "member-profile-settings",
    formDataAsRecord,
    (restored) => {
      form.reset(restored as ProfileFormValues);
    },
    true,
  );

  // Username editing
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameValue, setUsernameValue] = useState(profile.username);
  const [savingUsername, setSavingUsername] = useState(false);

  // Avatar
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatarUrl || null);

  // Deactivation
  const [deactivationDialogOpen, setDeactivationDialogOpen] = useState(false);
  const [deactivationConfirm, setDeactivationConfirm] = useState("");

  // Onboarding re-view dialogs
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);
  const [showTutorialDialog, setShowTutorialDialog] = useState(false);

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

  // Form persistence: auto-save profile edits to localStorage with draft recovery
  useEffect(() => {
    try {
      const savedAvatar = localStorage.getItem("agapay_avatar_url");
      if (savedAvatar) setAvatarPreview(savedAvatar);
    } catch { /* ignore */ }
  }, []);

  const router = useRouter();

  const handleSubmitProfile = async (values: ProfileFormValues) => {
    const res = await updatePersonalInfo({
      email: values.email,
      phone: values.phone,
      occupation: values.occupation,
      businessName: values.businessName,
    });
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.success || "Profile updated successfully");
      clearPersistence();
      router.refresh();
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    const res = await uploadIdPicture(formData);
    if (res.success && res.url) {
      setAvatarPreview(res.url);
      localStorage.setItem("agapay_avatar_url", res.url);
      const updateRes = await updatePersonalInfo({ photoUrl: res.url });
      if (updateRes.error) toast.error(updateRes.error);
      else toast.success("Profile image updated");
    } else {
      toast.error(res.error || "Failed to upload image");
    }
  };

  const handleDeactivation = () => {
    if (deactivationConfirm.toLowerCase() !== "deactivate") {
      toast.error('Type "deactivate" to confirm');
      return;
    }
    localStorage.setItem("agapay_account_deactivated", "true");
    setDeactivationDialogOpen(false);
    toast.success("Account deactivation request submitted. You will receive a confirmation email.");
  };

  const handleDownloadBackup = () => {
    const backup = {
      profile,
      security,
      notifications,
      consent,
      linkedAccounts,
      bankAccounts,
      notificationPrefs,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `agapay-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Backup downloaded successfully");
  };

// Profile fields config for display-only (no editing)
type ReadOnlyFieldProps = {
  label: string;
  value: string;
};

function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

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
            <div className="flex items-center gap-4 mb-4">
              <div className="relative group">
                <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User2 className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <label className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Camera className="w-5 h-5 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{profile.fullName}</p>
                <p className="text-xs text-slate-500">@{profile.username}</p>
              </div>
            </div>
            {/* Draft notice banner */}
            {draftFound && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xs font-bold">!</div>
                <p className="flex-1 font-medium">We found a saved draft from your last session. Continue where you left off.</p>
                <button
                  type="button"
                  onClick={() => { clearPersistence(); dismissDraftNotice(); }}
                  className="text-xs font-bold text-amber-600 hover:text-amber-800 underline"
                >
                  Dismiss
                </button>
              </div>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmitProfile)} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ReadOnlyField label="Full Name" value={profile.fullName} />
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Username</p>
                  <div className="mt-1 flex items-center gap-2">
                    {editingUsername ? (
                      <>
                        <Input
                          value={usernameValue}
                          onChange={(e) => setUsernameValue(e.target.value)}
                          className="h-8 text-sm rounded-lg flex-1"
                        />
                        <Button
                          size="sm"
                          className="h-8 rounded-lg"
                          disabled={savingUsername}
                          onClick={async () => {
                            if (!usernameValue.trim()) return;
                            setSavingUsername(true);
                            const res = await updateUsername(usernameValue.trim());
                            setSavingUsername(false);
                            if (res.error) {
                              toast.error(res.error);
                              setUsernameValue(profile.username);
                            } else {
                              toast.success("Username updated");
                              router.refresh();
                            }
                            setEditingUsername(false);
                          }}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 rounded-lg"
                          onClick={() => {
                            setUsernameValue(profile.username);
                            setEditingUsername(false);
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-slate-900 flex-1">@{profile.username}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 text-xs rounded-lg"
                          onClick={() => setEditingUsername(true)}
                        >
                          Edit
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Email</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-8 text-sm rounded-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Phone</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-8 text-sm rounded-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Occupation</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-8 text-sm rounded-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Business Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-8 text-sm rounded-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
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
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => setShowPrivacyDialog(true)}
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Data Privacy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => setShowTermsDialog(true)}
                >
                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                  Terms & Conditions
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => setShowTutorialDialog(true)}
                >
                  <GraduationCap className="h-3.5 w-3.5 mr-1.5" />
                  Tutorial
                </Button>
              </div>
            </div>
          </div>

          {/* Re-view Privacy Dialog */}
          <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
            <DialogContent className="sm:max-w-lg rounded-3xl p-0 gap-0 overflow-hidden border-0 shadow-2xl">
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur mb-4">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <DialogTitle className="text-2xl font-display font-bold italic text-white">
                  Data Privacy & Consent
                </DialogTitle>
                <DialogDescription className="text-blue-100 mt-2 text-sm">
                  {tenant.name || "Your cooperative"} values your privacy. Please review how we handle your data.
                </DialogDescription>
              </div>
              <div className="p-6">
                <ScrollArea className="h-56 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600 leading-relaxed">
                  <p className="font-bold text-slate-900 mb-2">Data Collection</p>
                  <p className="mb-4">We collect personal information including your name, contact details, government-issued IDs, and financial information necessary for loan processing and membership management.</p>
                  <p className="font-bold text-slate-900 mb-2">Data Usage</p>
                  <p className="mb-4">Your data is used exclusively for cooperative operations: loan evaluation, credit scoring, payment processing, and regulatory compliance. We do not share your data with third parties without your explicit consent.</p>
                  <p className="font-bold text-slate-900 mb-2">Data Retention</p>
                  <p className="mb-4">Your personal data is retained for the duration of your membership and for a period of 5 years after account deactivation, as required by Philippine data privacy regulations.</p>
                  <p className="font-bold text-slate-900 mb-2">Your Rights</p>
                  <p>You have the right to access, correct, and request deletion of your personal data. You may withdraw consent at any time through your account settings.</p>
                </ScrollArea>
                <DialogFooter className="mt-6">
                  <Button onClick={() => setShowPrivacyDialog(false)} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6">
                    Close
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          {/* Re-view Terms Dialog */}
          <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
            <DialogContent className="sm:max-w-lg rounded-3xl p-0 gap-0 overflow-hidden border-0 shadow-2xl">
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 text-white">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur mb-4">
                  <FileText className="h-7 w-7" />
                </div>
                <DialogTitle className="text-2xl font-display font-bold italic text-white">
                  Terms & Conditions
                </DialogTitle>
                <DialogDescription className="text-emerald-100 mt-2 text-sm">
                  Please read and accept the terms of membership with {tenant.name || "your cooperative"}.
                </DialogDescription>
              </div>
              <div className="p-6">
                <ScrollArea className="h-56 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600 leading-relaxed">
                  <p className="font-bold text-slate-900 mb-2">Membership</p>
                  <p className="mb-4">By accepting these terms, you agree to abide by the cooperative's bylaws, pay membership dues as applicable, and participate in cooperative activities in good faith.</p>
                  <p className="font-bold text-slate-900 mb-2">Loan Obligations</p>
                  <p className="mb-4">All loan applications are subject to approval based on credit evaluation. You agree to repay loans according to the agreed schedule. Default may result in guarantor enforcement and membership suspension.</p>
                  <p className="font-bold text-slate-900 mb-2">Guarantor Responsibility</p>
                  <p className="mb-4">By serving as a guarantor, you accept financial responsibility for the loan if the primary borrower defaults. This includes potential wage deduction and legal action.</p>
                  <p className="font-bold text-slate-900 mb-2">Code of Conduct</p>
                  <p>Members must maintain respectful communication, provide accurate information, and cooperate with cooperative officers. Violation may result in membership suspension or termination.</p>
                </ScrollArea>
                <DialogFooter className="mt-6">
                  <Button onClick={() => setShowTermsDialog(false)} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-6">
                    Close
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          {/* Re-view Tutorial Dialog */}
          <Dialog open={showTutorialDialog} onOpenChange={setShowTutorialDialog}>
            <DialogContent className="sm:max-w-lg rounded-3xl p-0 gap-0 overflow-hidden border-0 shadow-2xl">
              <div className="bg-gradient-to-br from-amber-500 to-amber-700 p-8 text-white">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur mb-4">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <DialogTitle className="text-2xl font-display font-bold italic text-white">
                  Welcome to {tenant.name || "Your Cooperative"}!
                </DialogTitle>
                <DialogDescription className="text-amber-100 mt-2 text-sm">
                  A quick tour to help you get started.
                </DialogDescription>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 font-bold">1</div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Overview & Wallet</p>
                      <p className="text-xs text-slate-500 mt-0.5">Check your savings, wallet balance, and active loans at a glance.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 font-bold">2</div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Loan Application</p>
                      <p className="text-xs text-slate-500 mt-0.5">Apply for loans, track application status, and manage repayments.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 font-bold">3</div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Community</p>
                      <p className="text-xs text-slate-500 mt-0.5">Connect with fellow members, join discussions, and send direct messages.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 font-bold">4</div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Support & Settings</p>
                      <p className="text-xs text-slate-500 mt-0.5">Submit support tickets, manage your profile, and configure security settings.</p>
                    </div>
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button onClick={() => setShowTutorialDialog(false)} className="w-full rounded-xl bg-amber-600 hover:bg-amber-700 text-white">
                    Got it
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

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

          <div className="dashboard-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Download className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                Data & Backup
              </h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Download your account data as a JSON backup or view your terms and policies.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="rounded-xl" onClick={handleDownloadBackup}>
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Download Backup
              </Button>
            </div>
          </div>

          <div className="dashboard-card p-5 border-rose-100">
            <div className="mb-4 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-rose-500">
                Danger Zone
              </h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Once you deactivate your account, you will lose access to all services. This action may be reversible by contacting support.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
              onClick={() => setDeactivationDialogOpen(true)}
            >
              <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
              Deactivate Account
            </Button>
          </div>

          <Dialog open={deactivationDialogOpen} onOpenChange={setDeactivationDialogOpen}>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-rose-600">
                  <AlertTriangle className="h-5 w-5" />
                  Deactivate Account
                </DialogTitle>
                <DialogDescription>
                  This will suspend your account and all associated services. Type <strong>deactivate</strong> below to confirm.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="rounded-xl bg-rose-50 border border-rose-100 p-4">
                  <p className="text-sm text-rose-700 font-medium">What happens when you deactivate?</p>
                  <ul className="mt-2 text-sm text-rose-600 list-disc list-inside space-y-1">
                    <li>You will not be able to log in</li>
                    <li>Active loans remain due as per schedule</li>
                    <li>Your profile will be hidden from the community</li>
                    <li>Contact support to reactivate your account</li>
                  </ul>
                </div>
                <Input
                  value={deactivationConfirm}
                  onChange={(e) => setDeactivationConfirm(e.target.value)}
                  placeholder='Type "deactivate" to confirm'
                  className="rounded-xl"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setDeactivationDialogOpen(false); setDeactivationConfirm(""); }} className="rounded-xl">
                  Cancel
                </Button>
                <Button
                  onClick={handleDeactivation}
                  disabled={deactivationConfirm.toLowerCase() !== "deactivate"}
                  className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
                >
                  Deactivate
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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