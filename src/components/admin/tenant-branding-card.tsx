"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateTenantBranding } from "@/actions/tenant-management";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Palette,
  UploadCloud,
  Type,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

const FONT_PAIRINGS = [
  {
    id: "inter_outfit",
    label: "Inter & Outfit",
    description: "Modern, clean, and highly readable.",
  },
  {
    id: "roboto_playfair",
    label: "Roboto & Playfair",
    description: "Classic executive look with serif accents.",
  },
  {
    id: "montserrat_poppins",
    label: "Montserrat & Poppins",
    description: "Geometric and friendly tech vibe.",
  },
];

export function TenantBrandingCard({
  tenantId,
  initialBranding,
}: {
  tenantId?: number;
  initialBranding: {
    brand_color: string | null;
    accent_color: string | null;
    font_pairing: string | null;
    logo_url: string | null;
  };
}) {
  const [branding, setBranding] = useState({
    brandColor: initialBranding.brand_color || "#10b981",
    accentColor: initialBranding.accent_color || "#3b82f6",
    fontPairing: initialBranding.font_pairing || "inter_outfit",
    logoUrl: initialBranding.logo_url || "",
  });

  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateTenantBranding({
        tenantId,
        ...branding,
      });

      if (result.success) {
        toast.success(
          "Na-update ang branding settings. I-refresh para makita ang pagbabago.",
        );
      } else {
        toast.error(result.error || "Failed to update branding.");
      }
    });
  };

  return (
    <div className="w-full max-w-2xl rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-sm space-y-8">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <Palette className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-display font-bold text-slate-900">
            Branding at Visuals
          </h3>
          <p className="text-sm text-slate-500">
            I-customize ang anyo ng iyong workspace.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <Label htmlFor="brand-color" className="text-slate-700 font-bold">
            Primary Brand Color
          </Label>
          <div className="flex gap-3">
            <div
              className="h-11 w-11 rounded-xl shadow-inner border border-slate-200 shrink-0"
              style={{ backgroundColor: branding.brandColor }}
            />
            <Input
              id="brand-color"
              type="text"
              value={branding.brandColor}
              onChange={(e) =>
                setBranding((prev) => ({ ...prev, brandColor: e.target.value }))
              }
              placeholder="#10b981"
              className="h-11 rounded-xl font-mono uppercase"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="accent-color" className="text-slate-700 font-bold">
            Accent Color
          </Label>
          <div className="flex gap-3">
            <div
              className="h-11 w-11 rounded-xl shadow-inner border border-slate-200 shrink-0"
              style={{ backgroundColor: branding.accentColor }}
            />
            <Input
              id="accent-color"
              type="text"
              value={branding.accentColor}
              onChange={(e) =>
                setBranding((prev) => ({
                  ...prev,
                  accentColor: e.target.value,
                }))
              }
              placeholder="#3b82f6"
              className="h-11 rounded-xl font-mono uppercase"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="logo-upload" className="text-slate-700 font-bold">
          Co-op Logo (Base64)
        </Label>
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt="Logo Preview"
                className="h-full w-full object-contain"
              />
            ) : (
              <UploadCloud className="h-8 w-8 text-slate-300" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <Input
              id="logo-upload"
              type="file"
              accept="image/png,image/webp,image/svg+xml"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > 5 * 1024 * 1024) {
                    toast.error("File too large. Max allowed: 5MB");
                    return;
                  }
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setBranding((prev) => ({
                      ...prev,
                      logoUrl: reader.result as string,
                    }));
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="h-11 rounded-xl cursor-pointer"
            />
            <p className="text-[11px] text-slate-400 italic">
              Transparent PNG, WebP, or SVG recommended (Max 5MB).
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-slate-700 font-bold flex items-center gap-2">
          <Type className="h-4 w-4" /> Font Pairing Styles
        </Label>
        <div className="grid grid-cols-1 gap-3">
          {FONT_PAIRINGS.map((pairing) => (
            <button
              key={pairing.id}
              onClick={() =>
                setBranding((prev) => ({ ...prev, fontPairing: pairing.id }))
              }
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left group ${
                branding.fontPairing === pairing.id
                  ? "border-emerald-600 bg-emerald-50/50 ring-1 ring-emerald-600"
                  : "border-slate-200 hover:border-slate-300 bg-slate-50/30"
              }`}
            >
              <div className="space-y-0.5">
                <p
                  className={`font-bold ${branding.fontPairing === pairing.id ? "text-emerald-900" : "text-slate-900"}`}
                >
                  {pairing.label}
                </p>
                <p className="text-xs text-slate-500">{pairing.description}</p>
              </div>
              {branding.fontPairing === pairing.id && (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ExternalLink className="h-3 w-3" />
          <span>
            Ito ay magre-reflect sa lahat ng dashboard view ng tenant.
          </span>
        </div>
        <Button
          onClick={handleSave}
          disabled={isPending}
          className="h-12 px-8 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 font-bold"
        >
          {isPending ? "Pina-proseso..." : "I-save ang Branding"}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Updated layout with Preview Panel
// ---------------------------------------------------------------------------
import { MockHomepagePreview } from "./mock-homepage-preview";

export function BrandingTabWrapper({
  tenantId,
  initialBranding,
  displayName,
}: {
  tenantId?: number;
  initialBranding: any;
  displayName: string;
}) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
      <div className="xl:col-span-3">
        <TenantBrandingCard
          tenantId={tenantId}
          initialBranding={initialBranding}
        />
      </div>
      <div className="xl:col-span-2 space-y-4">
        <div className="sticky top-24">
          <div className="flex items-center justify-between mb-4 px-2">
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400">
              Live Preview
            </h4>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Synchronized
            </span>
          </div>
          <div className="h-[500px] w-full">
            <MockHomepagePreview
              branding={{
                logoUrl: initialBranding.logo_url,
                primaryColor: initialBranding.brand_color,
                displayName: displayName,
              }}
            />
          </div>
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-100">
            <p className="text-xs text-amber-800 font-medium leading-relaxed">
              <strong>Tip:</strong> Ang preview na ito ay nagpapakita kung paano
              lalabas ang iyong tenant branding sa main dashboard at mobile
              view.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
