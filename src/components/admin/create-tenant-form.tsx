"use client";

import { useState, useTransition, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Building2, Map, UploadCloud, X, CreditCard, Users } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createTenant, getRegions } from "@/actions/tenant-management";
import { getSubscriptionPlans } from "@/actions/superadmin-actions";
import { MockHomepagePreview } from "./mock-homepage-preview";
import { getTenantApplicationsForReview } from "@/actions/superadmin-actions";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const STORAGE_KEY = "agapay_tenant_draft";

const TenantSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  groupId: z.string().min(1, "Region is required"),
  heroHeadline: z.string().min(1, "Required"),
  heroSubheadline: z.string().min(1, "Required"),
  mission: z.string(),
  vision: z.string(),
  enabledFeatures: z.array(z.string()).min(1, "Required"),
  planId: z.string().optional(),
});

type TenantFormValues = z.infer<typeof TenantSchema>;

export function CreateTenantForm({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [regions, setRegions] = useState<{ id: number; name: string }[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [pendingApplications, setPendingApplications] = useState<any[]>([]);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string>("");
  const [logoDataUrl, setLogoDataUrl] = useState<string>("");
  const [brandColor, setBrandColor] = useState("#10b981");
  const [accentColor, setAccentColor] = useState("#3b82f6");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getRegions().then(setRegions as any);
    getSubscriptionPlans().then((r) => {
      if (r.success && r.data) setPlans(r.data);
    });
    getTenantApplicationsForReview({ status: "pending" }).then((r: any) => {
      if (r.success && r.data) setPendingApplications(r.data);
    });
  }, []);

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(TenantSchema),
    defaultValues: {
      name: "",
      slug: "",
      groupId: "",
      heroHeadline: "Iyong Agapay, Ating Tagumpay",
      heroSubheadline:
        "Filipino-first na lending platform para sa mga miyembro at cooperative tenants.",
      mission: "",
      vision: "",
      enabledFeatures: ["loans", "wallet", "community"],
      planId: "",
    },
  });

  const handleSelectApplicant = useCallback((applicationId: string) => {
    setSelectedApplicantId(applicationId);
    if (!applicationId) return;
    const app = pendingApplications.find((a) => a.application_id.toString() === applicationId);
    if (!app) return;
    form.setValue("name", app.tenant_name || "");
    form.setValue("slug", app.tenant_slug || "");
    form.setValue("groupId", app.tenant_group_id?.toString() || "");
    if (app.brand_color) setBrandColor(app.brand_color);
    if (app.accent_color) setAccentColor(app.accent_color);
    if (app.logo_url) setLogoDataUrl(app.logo_url);
    toast.info(`Pre-filled from "${app.tenant_name}" application`);
  }, [pendingApplications, form]);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        form.reset(parsed.formValues);
        if (parsed.logoDataUrl) setLogoDataUrl(parsed.logoDataUrl);
        if (parsed.brandColor) setBrandColor(parsed.brandColor);
        if (parsed.accentColor) setAccentColor(parsed.accentColor);
      } catch (e) {
        console.error("Failed to load tenant draft", e);
      }
    }
    setIsLoaded(true);
  }, [form]);

  useEffect(() => {
    if (!isLoaded) return;
    const subscription = form.watch((values) => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          formValues: values,
          logoDataUrl,
          brandColor,
          accentColor,
        }),
      );
    });
    return () => subscription.unsubscribe();
  }, [form, isLoaded, logoDataUrl, brandColor, accentColor]);

  const watchedName = form.watch("name");
  const planIdWatch = form.watch("planId");

  useEffect(() => {
    if (planIdWatch && plans.length > 0) {
      const selectedPlan = plans.find((p) => p.id.toString() === planIdWatch);
      if (selectedPlan) {
        const tier = (selectedPlan.tier_name || "").toLowerCase();
        let defaultFeatures = ["loans", "wallet", "audit"];
        if (tier.includes("pro")) {
          defaultFeatures = [...defaultFeatures, "community", "branding", "analytics"];
        } else if (tier.includes("enterprise")) {
          defaultFeatures = [...defaultFeatures, "community", "branding", "reports", "analytics", "system_config", "compassion"];
        }
        form.setValue("enabledFeatures", defaultFeatures);
      }
    }
  }, [planIdWatch, plans, form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      toast.error("File too large. Max allowed: 5MB");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setLogoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearLogo = () => {
    setLogoDataUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onSubmit = (values: TenantFormValues) => {
    startTransition(async () => {
      const res = await createTenant(
        values.name,
        values.slug,
        parseInt(values.groupId),
        {
          logoUrl: logoDataUrl || undefined,
          brandColor,
          accentColor,
          heroHeadline: values.heroHeadline,
          heroSubheadline: values.heroSubheadline,
          mission: values.mission,
          vision: values.vision,
          enabledFeatures: values.enabledFeatures,
          planId: values.planId ? parseInt(values.planId) : undefined,
        },
      );
      if (res.success) {
        toast.success("Tenant created successfully!");
        localStorage.removeItem(STORAGE_KEY);
        onOpenChange(false);
        window.location.reload();
      } else {
        toast.error(res.error || "Failed to create tenant");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 pt-4">
      {/* ── Left: Form ── */}
      <div className="lg:col-span-3 space-y-6 max-h-[80vh] overflow-y-auto pr-3 scrollbar-hide">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Section 1: Core Identity */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-100">
                1. Core Identity
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="groupId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Region</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
                        >
                          <option value="">Select Region</option>
                          {regions.map((r) => (
                            <option key={r.id} value={r.id.toString()}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tenant Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Lipa Tenant" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Slug</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-slate-50 text-slate-500 text-xs">
                          agapay.coop/
                        </span>
                        <Input
                          {...field}
                          placeholder="agapay-lipa"
                          className="rounded-l-none"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Pending Applicant Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                <Users className="w-3 h-3 inline mr-1" /> From Pending Applicant
              </label>
              <select
                value={selectedApplicantId}
                onChange={(e) => handleSelectApplicant(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Manual entry (no applicant)</option>
                {pendingApplications.map((a: any) => (
                  <option key={a.application_id} value={a.application_id.toString()}>
                    {a.tenant_name} — {a.applicant_name || a.applicant_email}
                  </option>
                ))}
              </select>
            </div>

            {/* Plan Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Subscription Plan</label>
              <select
                value={form.watch("planId")}
                onChange={(e) => form.setValue("planId", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="">Select a plan (optional)</option>
                {plans.map((p: any) => (
                  <option key={p.id} value={p.id.toString()}>
                    {p.tier_name} — ₱{p.tier_name.toLowerCase().includes("core") 
                      ? Number(p.price_quarterly).toLocaleString() + " / 3 mos"
                      : p.tier_name.toLowerCase().includes("pro")
                      ? Number(p.price_semi_annually).toLocaleString() + " / 6 mos"
                      : Number(p.price_annually).toLocaleString() + " / year"} ({p.max_members} members)
                  </option>
                ))}
              </select>
            </div>

            {/* Section 2: Branding & Colors */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-100">
                2. Branding & Colors
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold text-sm">
                    Brand Color
                  </Label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="h-9 w-9 rounded-md border border-slate-200 cursor-pointer p-0.5"
                    />
                    <Input
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="h-9 font-mono text-xs"
                    />
                  </div>
                </div>
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label className="text-slate-700 font-semibold text-sm">
                    Tenant Logo
                  </Label>
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-md border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
                      {logoDataUrl ? (
                        <img
                          src={logoDataUrl}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <UploadCloud className="h-4 h-4 text-slate-300" />
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="flex-1 text-[10px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Homepage Builder */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-100">
                3. Homepage Builder
              </h4>
              <FormField
                control={form.control}
                name="heroHeadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hero Headline</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="heroSubheadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hero Subheadline</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="mission"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mission</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="vision"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vision</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Section 4: Dashboard Builder */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-100">
                4. Dashboard Builder (Functions)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: "loans", label: "Loaning Node", icon: "💰" },
                  { id: "wallet", label: "E-Wallet", icon: "💳" },
                  { id: "community", label: "Community", icon: "🤝" },
                  { id: "branding", label: "Content/Branding", icon: "🎨" },
                  { id: "reports", label: "Analytics", icon: "📊" },
                  { id: "audit", label: "Audit Logs", icon: "📋" },
                  { id: "analytics", label: "Analytics", icon: "📈" },
                  { id: "system_config", label: "System Config", icon: "⚙️" },
                  { id: "compassion", label: "Compassion", icon: "❤️" },
                ].map((feat) => (
                  <label
                    key={feat.id}
                    className="flex items-center gap-2 p-3 rounded-xl border border-slate-100 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={form.watch("enabledFeatures").includes(feat.id)}
                      onChange={(e) => {
                        const current = form.getValues("enabledFeatures");
                        if (e.target.checked) {
                          form.setValue("enabledFeatures", [
                            ...current,
                            feat.id,
                          ]);
                        } else {
                          form.setValue(
                            "enabledFeatures",
                            current.filter((id) => id !== feat.id),
                          );
                        }
                      }}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="flex flex-col">
                      <span className="text-base">{feat.icon}</span>
                      <span className="text-[10px] font-bold text-slate-700">
                        {feat.label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <Button
              disabled={isPending}
              type="submit"
              className="w-full bg-slate-900 text-white h-12 rounded-xl text-md font-bold"
            >
              {isPending ? "Creating..." : "Initialize Tenant System"}
            </Button>
          </form>
        </Form>
      </div>

      {/* ── Right: Live Preview ── */}
      <div className="lg:col-span-2 space-y-4">
        <div className="sticky top-4 space-y-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Landscape Preview
            </p>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Synchronized
            </span>
          </div>
          <div className="h-[600px] w-full">
            <MockHomepagePreview
              branding={{
                logoUrl: logoDataUrl || undefined,
                primaryColor: brandColor,
                displayName: watchedName || "New Tenant",
              }}
              content={{
                heroHeadline: form.watch("heroHeadline"),
                heroSubheadline: form.watch("heroSubheadline"),
              }}
            />
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">
              Current URL Strategy
            </p>
            <code className="text-xs bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-slate-800 font-mono">
              agapay.coop/{form.watch("slug") || "your-slug"}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}
