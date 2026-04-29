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

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">
            Bilang ng Aktibong Miyembro
          </label>
          <div className="relative">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              name="membersCount"
              value={formData.membersCount}
              onChange={handleChange}
              placeholder="Hal. 50-100 members"
              className="rounded-2xl h-14 pl-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 transition-all font-medium"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700 ml-1">
            Mensahe o Karagdagang Detalye
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="I-kwento sa amin ang inyong mithiin para sa inyong mga miyembro..."
            className="w-full min-h-[120px] rounded-[1.5rem] p-5 bg-slate-50 border border-slate-200 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all font-medium text-sm leading-relaxed"
          />
        </div>

        <Button
          type="submit"
          disabled={isPending || !isFormValid}
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
