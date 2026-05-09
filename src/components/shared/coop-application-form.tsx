"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { submitCoopApplication } from "@/actions/compliance-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlanCard } from "./plan-card";
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
  ChevronRight,
  ChevronLeft,
  ArrowRight,
} from "lucide-react";

type Step = "info" | "plan" | "docs";

export function CoopApplicationForm() {
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState<Step>("info");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    region: "",
    membersCount: "",
    message: "",
    selectedPlanId: "pro",
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

  const handleNext = () => {
    if (currentStep === "info") setCurrentStep("plan");
    else if (currentStep === "plan") setCurrentStep("docs");
  };

  const handleBack = () => {
    if (currentStep === "plan") setCurrentStep("info");
    else if (currentStep === "docs") setCurrentStep("plan");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await submitCoopApplication({
        ...formData,
      });

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
        selectedPlanId: "pro",
        docs: {
          validId: null,
          barangayCert: null,
          businessPermit: null,
        },
      });
      setCurrentStep("info");
    });
  };

  const isInfoValid =
    formData.name &&
    formData.email &&
    formData.phone &&
    formData.region &&
    formData.membersCount;

  const isDocsValid = !!formData.docs.validId;

  const plans = [
    {
      id: "core",
      name: "Core",
      price: "19,990",
      description: "Ideal for new cooperatives who want to get started.",
      icon: "core" as const,
      features: [
        { text: "Up to 100 members", included: true },
        { text: "Basic Loan Computation", included: true },
        { text: "Email Support", included: true },
        { text: "Analytics Dashboard", included: false },
        { text: "Custom Branding", included: false },
      ],
    },
    {
      id: "pro",
      name: "Professional",
      price: "49,990",
      description: "For growing cooperatives needing advanced tools.",
      icon: "pro" as const,
      isPopular: true,
      features: [
        { text: "Up to 500 members", included: true },
        { text: "Advanced Loan Products", included: true },
        { text: "Analytics & Reports", included: true },
        { text: "Priority Support", included: true },
        { text: "White-label Portal", included: false },
      ],
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "99,990",
      description: "Full-scale solution for large and multi-tenant coops.",
      icon: "enterprise" as const,
      features: [
        { text: "Unlimited members", included: true },
        { text: "Multi-tenant Management", included: true },
        { text: "Full White-labeling", included: true },
        { text: "Dedicated Success Manager", included: true },
        { text: "API Access", included: true },
      ],
    },
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header section remains similar but updated for context */}
      <div className="space-y-3 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider">
          <Building2 className="w-3.5 h-3.5" />
          Agapay Franchise Onboarding
        </div>
        <h3 className="text-3xl md:text-4xl font-black italic text-slate-900 tracking-tight">
          Register your Cooperative.
        </h3>
        <p className="text-slate-500 text-lg leading-relaxed">
          {currentStep === "info" &&
            "Start your application by providing basic details."}
          {currentStep === "plan" &&
            "Select a plan that fits the size and needs of your cooperative."}
          {currentStep === "docs" &&
            "Upload mandatory documents for verification."}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-between px-2 mb-4 bg-slate-50 p-4 rounded-[2rem] border border-slate-100">
        <StepDot
          label="Information"
          isActive={currentStep === "info"}
          isCompleted={currentStep !== "info"}
        />
        <div className="flex-1 h-px bg-slate-200 mx-4" />
        <StepDot
          label="Plan Selection"
          isActive={currentStep === "plan"}
          isCompleted={currentStep === "docs"}
        />
        <div className="flex-1 h-px bg-slate-200 mx-4" />
        <StepDot
          label="Documents"
          isActive={currentStep === "docs"}
          isCompleted={false}
        />
      </div>

      <AnimatePresence mode="wait">
        {currentStep === "info" && (
          <motion.div
            key="info"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="Cooperative Name" icon={Building2}>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: San Jose Multi-Purpose Coop"
                  className="rounded-2xl h-14 pl-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 transition-all font-medium"
                />
              </FormField>
              <FormField label="Official Email" icon={Mail}>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@coop.com"
                  className="rounded-2xl h-14 pl-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 transition-all font-medium"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="Phone Number" icon={Phone}>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+63 9xx xxxx xxx"
                  className="rounded-2xl h-14 pl-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 transition-all font-medium"
                />
              </FormField>
              <FormField label="Estimated Members" icon={Users}>
                <Input
                  name="membersCount"
                  type="number"
                  value={formData.membersCount}
                  onChange={handleChange}
                  placeholder="Ex: 150"
                  className="rounded-2xl h-14 pl-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 transition-all font-medium"
                />
              </FormField>
            </div>

            <FormField label="Region / Location" icon={MapPin}>
              <Input
                name="region"
                value={formData.region}
                onChange={handleChange}
                placeholder="Ex. NCR, Quezon City"
                className="rounded-2xl h-14 pl-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-emerald-500 transition-all font-medium"
              />
            </FormField>

            <Button
              onClick={handleNext}
              disabled={!isInfoValid}
              className="w-full h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black italic text-lg shadow-xl shadow-emerald-500/20 group transition-all"
            >
              Next: Select Plan
              <ChevronRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        )}

        {currentStep === "plan" && (
          <motion.div
            key="plan"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  {...plan}
                  isSelected={formData.selectedPlanId === plan.id}
                  onSelect={(id: any) =>
                    setFormData((prev) => ({ ...prev, selectedPlanId: id }))
                  }
                />
              ))}
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handleBack}
                className="h-16 px-8 rounded-2xl border-2 border-slate-100 font-bold hover:bg-slate-50"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1 h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black italic text-lg shadow-xl shadow-emerald-500/20 group transition-all"
              >
                Next: Documents
                <ChevronRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === "docs" && (
          <motion.div
            key="docs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2 mb-8">
                <ShieldCheck className="w-4 h-4" />
                Upload Documents
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
              <p className="text-center text-[11px] text-slate-400 italic mt-8">
                These documents will be used solely for verification of your
                tenant application (Max 1MB per file).
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isPending}
                className="h-16 px-8 rounded-2xl border-2 border-slate-100 font-bold hover:bg-slate-50"
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending || !isDocsValid}
                className="flex-1 h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black italic text-lg shadow-xl shadow-emerald-500/20 group transition-all"
              >
                {isPending ? (
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                ) : (
                  <>
                    Submit Application
                    <Send className="w-5 h-5 ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepDot({
  label,
  isActive,
  isCompleted,
}: {
  label: string;
  isActive: boolean;
  isCompleted: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          isActive
            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-500/10"
            : isCompleted
              ? "bg-emerald-100 text-emerald-600"
              : "bg-slate-200 text-slate-400"
        }`}
      >
        {isCompleted ? (
          <ShieldCheck className="w-4 h-4" />
        ) : (
          <div className="text-[10px] font-black">?</div>
        )}
      </div>
      <span
        className={`text-[10px] font-black uppercase tracking-widest hidden sm:block ${isActive ? "text-slate-900" : "text-slate-400"}`}
      >
        {label}
      </span>
    </div>
  );
}

function FormField({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-slate-700 ml-1">{label}</label>
      <div className="relative">
        <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        {children}
      </div>
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
      className={`relative p-8 rounded-[2rem] border-2 border-dashed transition-all ${isUploaded ? "border-emerald-500 bg-emerald-50" : "border-slate-200 hover:border-emerald-300 bg-white"}`}
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
      <div className="flex flex-col items-center gap-3 text-center">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
            isUploaded
              ? "bg-emerald-600 text-white shadow-lg"
              : "bg-slate-50 text-slate-300"
          }`}
        >
          {isUploaded ? (
            <ShieldCheck className="w-6 h-6" />
          ) : (
            <FileUp className="w-6 h-6" />
          )}
        </div>
        <span
          className={`text-[10px] font-black uppercase tracking-widest ${isUploaded ? "text-emerald-700" : "text-slate-500"}`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
