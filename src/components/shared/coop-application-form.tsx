"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { submitCoopApplication } from "@/actions/compliance-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Users,
  MapPin,
  Phone,
  Mail,
  Send,
  Loader2,
  FileUp,
  ShieldCheck,
} from "lucide-react";

export function CoopApplicationForm() {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    region: "",
    membersCount: "",
    message: "",
    docs: {
      validId: null as string | null,
      barangayCert: null as string | null,
      businessPermit: null as string | null,
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitCoopApplication(formData);

      if (res.error) {
        toast.error(res.error);
        return;
      }

      toast.success(res.success);
      setFormData({
        name: "",
        email: "",
        phone: "",
        region: "",
        membersCount: "",
        message: "",
        docs: {
          validId: null,
          barangayCert: null,
          businessPermit: null,
        },
      });
    });
  };

  const isFormValid =
    formData.name &&
    formData.email &&
    formData.phone &&
    formData.region &&
    formData.membersCount;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
          <Building2 className="w-3.5 h-3.5" />
          Cooperative Onboarding
        </div>
        <h3 className="text-3xl font-black italic text-slate-900 tracking-tight">
          Irehistro ang iyong Cooperative.
        </h3>
        <p className="text-slate-500 text-lg leading-relaxed">
          Punan ang mga detalye sa ibaba upang makapagsimula ang inyong branch
          sa Agapay ecosystem.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">
              Pangalan ng Cooperative
            </label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Hal. San Jose Multi-Purpose Coop"
                className="rounded-2xl h-14 pl-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 transition-all font-medium"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">
              Official Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@coop.com"
                className="rounded-2xl h-14 pl-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+63 9xx xxxx xxx"
                className="rounded-2xl h-14 pl-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 transition-all font-medium"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 ml-1">
              Region / Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                name="region"
                value={formData.region}
                onChange={handleChange}
                placeholder="Hal. NCR, Quezon City"
                className="rounded-2xl h-14 pl-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <label className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Mandatory Documents
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DocumentUploadField
              label="Valid ID"
              onUpload={(base64) =>
                setFormData((prev) => ({
                  ...prev,
                  docs: { ...prev.docs, validId: base64 },
                }))
              }
              isUploaded={!!formData.docs.validId}
            />
            <DocumentUploadField
              label="Barangay Cert"
              onUpload={(base64) =>
                setFormData((prev) => ({
                  ...prev,
                  docs: { ...prev.docs, barangayCert: base64 },
                }))
              }
              isUploaded={!!formData.docs.barangayCert}
            />
            <DocumentUploadField
              label="Business Permit"
              onUpload={(base64) =>
                setFormData((prev) => ({
                  ...prev,
                  docs: { ...prev.docs, businessPermit: base64 },
                }))
              }
              isUploaded={!!formData.docs.businessPermit}
            />
          </div>
          <p className="text-[11px] text-slate-400 italic">
            Ang mga dokumentong ito ay gagamitin para sa verification ng inyong
            branch application (Max 1MB per file).
          </p>
        </div>

        <Button
          type="submit"
          disabled={isPending || !isFormValid || !formData.docs.validId}
          className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black italic text-lg shadow-xl shadow-emerald-500/20 group transition-all"
        >
          {isPending ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              Ipasa ang Application
              <Send className="w-5 h-5 ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </>
          )}
        </Button>
      </form>
    </div>
  );
}

function DocumentUploadField({
  label,
  onUpload,
  isUploaded,
}: {
  label: string;
  onUpload: (base64: string) => void;
  isUploaded: boolean;
}) {
  return (
    <div
      className={`relative p-4 rounded-2xl border-2 border-dashed transition-all ${isUploaded ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-emerald-300"}`}
    >
      <input
        type="file"
        accept="image/*,.pdf"
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => onUpload(reader.result as string);
            reader.readAsDataURL(file);
          }
        }}
      />
      <div className="flex flex-col items-center gap-2 text-center">
        {isUploaded ? (
          <ShieldCheck className="w-6 h-6 text-emerald-600" />
        ) : (
          <FileUp className="w-6 h-6 text-slate-300" />
        )}
        <span
          className={`text-[10px] font-bold uppercase tracking-tight ${isUploaded ? "text-emerald-700" : "text-slate-500"}`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
