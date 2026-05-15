"use client";

import { useState, useTransition, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  User2, Mail, Phone, Camera, Loader2, Bell, ShieldCheck,
  Settings2, Download, AlertTriangle, Building2,
} from "lucide-react";
import { updateProfileInfo } from "@/actions/admin-actions";
import { updateUsername, updateProfilePhoto } from "@/actions/update-profile";
import { useFormPersistence } from "@/hooks/use-form-persistence";
import { TwoFactorSetup } from "@/components/auth/two-factor-setup";
import { useRouter } from "next/navigation";

export function AdminProfileSettings({
  initialData,
  security,
}: {
  initialData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    username?: string;
    photoUrl?: string | null;
  };
  security?: {
    is2FAEnabled: boolean;
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    initialData.photoUrl || null,
  );
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Username editing
  const [editingUsername, setEditingUsername] = useState(false);
  const [usernameValue, setUsernameValue] = useState(initialData.username || "");
  const [savingUsername, setSavingUsername] = useState(false);

  const form = useForm({
    defaultValues: {
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      email: initialData.email,
      phone: initialData.phone,
    },
  });

  const { draftFound, clearPersistence, dismissDraftNotice } = useFormPersistence(
    "admin-profile-settings",
    form.watch(),
    (restored) => {
      form.reset(restored);
    },
    true,
  );

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        toast.success("Avatar selected. Save changes to confirm.");
        setIsUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("Failed to read image file.");
      setIsUploadingAvatar(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = form.handleSubmit(
    async (values) => {
      startTransition(async () => {
        const res = await updateProfileInfo({
          ...values,
          photoUrl: avatarUrl || undefined,
        });
        if (res.success) {
          toast.success("Profile updated successfully.");
          clearPersistence();
          dismissDraftNotice();
          router.refresh();
        } else {
          toast.error(res.error || "Failed to update profile.");
        }
      });
    },
    () => {
      toast.error("Validation failed. Please check the form.");
    }
  );

  const handleDownloadBackup = () => {
    const backup = {
      profile: initialData,
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

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {draftFound && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
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

      <div className="dashboard-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">
              Account & Security
            </h2>
            <p className="text-sm text-slate-500">
              Manage your profile, username, photo, and account protection.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:min-w-[280px]">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-emerald-700">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <p className="text-[11px] font-black uppercase tracking-[0.18em]">2FA</p>
              </div>
              <p className="mt-2 text-base font-bold text-slate-900">
                {security?.is2FAEnabled ? "Enabled" : "Off"}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-slate-700">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <p className="text-[11px] font-black uppercase tracking-[0.18em]">Role</p>
              </div>
              <p className="mt-2 text-base font-bold text-slate-900">
                {initialData.firstName}
              </p>
            </div>
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
                <div className="h-16 w-16 rounded-full bg-slate-100 border-2 border-slate-200 overflow-hidden flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User2 className="w-8 h-8 text-slate-400" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingAvatar}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                  title="Upload avatar"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <Camera className="h-5 w-5 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{initialData.firstName} {initialData.lastName}</p>
                <p className="text-xs text-slate-500">@{initialData.username || "operator"}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Full Name</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{initialData.firstName} {initialData.lastName}</p>
              </div>

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
                            setUsernameValue(initialData.username || "");
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
                          setUsernameValue(initialData.username || "");
                          setEditingUsername(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-slate-900 flex-1">@{initialData.username || "operator"}</p>
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
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={handleSubmit} className="dashboard-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                  Personal Information
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">First Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-8 text-sm rounded-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} className="h-8 text-sm rounded-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        <Mail className="h-3 w-3 inline mr-1" />Email
                      </FormLabel>
                      <FormControl>
                        <Input {...field} type="email" className="h-8 text-sm rounded-lg" />
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
                      <FormLabel className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        <Phone className="h-3 w-3 inline mr-1" />Phone
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+63..." className="h-8 text-sm rounded-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="h-10 px-6 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>

          <div className="dashboard-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                Security Controls
              </h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Protect your access using authenticator-based two-factor authentication.
            </p>
            <div className="flex justify-center">
              <TwoFactorSetup isEnabledInitial={security?.is2FAEnabled ?? false} />
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="dashboard-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                Notification Preferences
              </h3>
            </div>
            <p className="text-sm text-slate-500">
              Notification settings for system alerts, approvals, and community messages will be available soon.
            </p>
          </div>

          <div className="dashboard-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Download className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                Data & Backup
              </h3>
            </div>
            <p className="text-sm text-slate-500 mb-4">
              Download your account data as a JSON backup.
            </p>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={handleDownloadBackup}>
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Download Backup
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
