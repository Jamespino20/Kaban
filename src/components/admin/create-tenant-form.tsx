"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Building2, Map, UploadCloud, X } from "lucide-react";

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
import { MockHomepagePreview } from "./mock-homepage-preview";

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

const TenantSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  groupId: z.string().min(1, "Region is required"),
});

export function CreateTenantForm({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [regions, setRegions] = useState<{ id: number; name: string }[]>([]);
  const [logoDataUrl, setLogoDataUrl] = useState<string>("");
  const [brandColor, setBrandColor] = useState("#10b981");
  const [accentColor, setAccentColor] = useState("#3b82f6");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getRegions().then(setRegions as any);
  }, []);

  const form = useForm<z.infer<typeof TenantSchema>>({
    resolver: zodResolver(TenantSchema),
    defaultValues: { name: "", slug: "", groupId: "" },
  });

  const watchedName = form.watch("name");

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

  const onSubmit = (values: z.infer<typeof TenantSchema>) => {
    startTransition(async () => {
      const res = await createTenant(
        values.name,
        values.slug,
        parseInt(values.groupId),
        {
          logoUrl: logoDataUrl || undefined,
          brandColor,
          accentColor,
        },
      );
      if (res.success) {
        toast.success("Tenant created successfully!");
        onOpenChange(false);
        window.location.reload();
      } else {
        toast.error(res.error || "Failed to create tenant");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 pt-4">
      {/* ── Left: Form ── */}
      <div className="lg:col-span-3 space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Region */}
            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Region</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Map className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        {...field}
                        className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm outline-none"
                      >
                        <option value="">Select Region</option>
                        {regions.map((r) => (
                          <option key={r.id} value={r.id.toString()}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tenant Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tenant Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        {...field}
                        placeholder="e.g. Lipa Tenant"
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* URL Slug */}
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Slug</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. agapay-lipa" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Colors */}
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
                    className="h-10 w-10 rounded-lg border border-slate-200 cursor-pointer shrink-0 p-0.5"
                  />
                  <Input
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    placeholder="#10b981"
                    className="h-10 font-mono uppercase text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold text-sm">
                  Accent Color
                </Label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-10 w-10 rounded-lg border border-slate-200 cursor-pointer shrink-0 p-0.5"
                  />
                  <Input
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    placeholder="#3b82f6"
                    className="h-10 font-mono uppercase text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold text-sm">
                Tenant Logo
              </Label>
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                  {logoDataUrl ? (
                    <img
                      src={logoDataUrl}
                      alt="Logo preview"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <UploadCloud className="h-6 w-6 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex gap-2 items-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/webp,image/svg+xml"
                      onChange={handleFileChange}
                      className="flex-1 text-sm text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                    />
                    {logoDataUrl && (
                      <button
                        type="button"
                        onClick={clearLogo}
                        className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Transparent PNG, WebP, or SVG recommended — Max 5MB
                  </p>
                </div>
              </div>
            </div>

            <Button
              disabled={isPending}
              type="submit"
              className="w-full bg-slate-900 text-white"
            >
              {isPending ? "Creating..." : "Create Tenant"}
            </Button>
          </form>
        </Form>
      </div>

      {/* ── Right: Live Preview ── */}
      <div className="lg:col-span-2 space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Live Preview
          </p>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            Synchronized
          </span>
        </div>
        <div className="h-[420px] w-full">
          <MockHomepagePreview
            branding={{
              logoUrl: logoDataUrl || undefined,
              primaryColor: brandColor,
              displayName: watchedName || "New Tenant",
            }}
          />
        </div>
      </div>
    </div>
  );
}
