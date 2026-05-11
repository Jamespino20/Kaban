"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { ShieldCheck, FileText, GraduationCap, ArrowRight, Check } from "lucide-react";

type Step = "privacy" | "terms" | "tutorial" | null;

export function MemberOnboardingDialogs({
  consentAccepted,
  tenantName,
}: {
  consentAccepted: boolean;
  tenantName?: string;
}) {
  const [step, setStep] = useState<Step>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!consentAccepted) {
      setStep("privacy");
    }
  }, [consentAccepted]);

  const handleNext = async () => {
    if (step === "privacy") setStep("terms");
    else if (step === "terms") setStep("tutorial");
    else if (step === "tutorial") {
      setIsSubmitting(true);
      try {
        const { acceptConsent } = await import("@/actions/compliance-actions");
        const res = await acceptConsent("v2026.04.29");
        if (res.success) {
          toast.success("Welcome aboard! Your preferences have been saved.");
          setStep(null);
        } else {
          toast.error(res.error || "Failed to save consent.");
        }
      } catch {
        toast.error("Failed to save consent.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDismiss = () => {
    setStep(null);
  };

  const name = tenantName || "your cooperative";

  return (
    <>
      {/* Data Privacy & Consent */}
      <Dialog open={step === "privacy"} onOpenChange={(open) => !open && handleDismiss()}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-0 gap-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur mb-4">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <DialogTitle className="text-2xl font-display font-bold italic text-white">
              Data Privacy & Consent
            </DialogTitle>
            <DialogDescription className="text-blue-100 mt-2 text-sm">
              {name} values your privacy. Please review how we handle your data.
            </DialogDescription>
          </div>
          <div className="p-6">
            <ScrollArea className="h-56 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-900 mb-2">Data Collection</p>
              <p className="mb-4">
                We collect personal information including your name, contact details, government-issued IDs,
                and financial information necessary for loan processing and membership management.
              </p>
              <p className="font-bold text-slate-900 mb-2">Data Usage</p>
              <p className="mb-4">
                Your data is used exclusively for cooperative operations: loan evaluation, credit scoring,
                payment processing, and regulatory compliance. We do not share your data with third parties
                without your explicit consent.
              </p>
              <p className="font-bold text-slate-900 mb-2">Data Retention</p>
              <p className="mb-4">
                Your personal data is retained for the duration of your membership and for a period of
                5 years after account deactivation, as required by Philippine data privacy regulations.
              </p>
              <p className="font-bold text-slate-900 mb-2">Your Rights</p>
              <p>
                You have the right to access, correct, and request deletion of your personal data.
                You may withdraw consent at any time through your account settings.
              </p>
            </ScrollArea>
            <DialogFooter className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={handleDismiss} className="rounded-xl text-slate-500">
                Decline
              </Button>
              <Button onClick={handleNext} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6">
                I Consent <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Terms & Conditions */}
      <Dialog open={step === "terms"} onOpenChange={(open) => !open && handleDismiss()}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-0 gap-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 p-8 text-white">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur mb-4">
              <FileText className="h-7 w-7" />
            </div>
            <DialogTitle className="text-2xl font-display font-bold italic text-white">
              Terms & Conditions
            </DialogTitle>
            <DialogDescription className="text-emerald-100 mt-2 text-sm">
              Please read and accept the terms of membership with {name}.
            </DialogDescription>
          </div>
          <div className="p-6">
            <ScrollArea className="h-56 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600 leading-relaxed">
              <p className="font-bold text-slate-900 mb-2">Membership</p>
              <p className="mb-4">
                By accepting these terms, you agree to abide by the cooperative's bylaws, pay membership
                dues as applicable, and participate in cooperative activities in good faith.
              </p>
              <p className="font-bold text-slate-900 mb-2">Loan Obligations</p>
              <p className="mb-4">
                All loan applications are subject to approval based on credit evaluation. You agree to
                repay loans according to the agreed schedule. Default may result in guarantor enforcement
                and membership suspension.
              </p>
              <p className="font-bold text-slate-900 mb-2">Guarantor Responsibility</p>
              <p className="mb-4">
                By serving as a guarantor, you accept financial responsibility for the loan if the
                primary borrower defaults. This includes potential wage deduction and legal action.
              </p>
              <p className="font-bold text-slate-900 mb-2">Code of Conduct</p>
              <p>
                Members must maintain respectful communication, provide accurate information, and
                cooperate with cooperative officers. Violation may result in membership suspension or
                termination.
              </p>
            </ScrollArea>
            <DialogFooter className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={handleDismiss} className="rounded-xl text-slate-500">
                Decline
              </Button>
              <Button onClick={handleNext} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-6">
                I Agree <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tutorial */}
      <Dialog open={step === "tutorial"} onOpenChange={(open) => !open && handleDismiss()}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-0 gap-0 overflow-hidden border-0 shadow-2xl">
          <div className="bg-gradient-to-br from-amber-500 to-amber-700 p-8 text-white">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur mb-4">
              <GraduationCap className="h-7 w-7" />
            </div>
            <DialogTitle className="text-2xl font-display font-bold italic text-white">
              Welcome to {name}!
            </DialogTitle>
            <DialogDescription className="text-amber-100 mt-2 text-sm">
              A quick tour to help you get started.
            </DialogDescription>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 font-bold">
                  1
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Overview & Wallet</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Check your savings, wallet balance, and active loans at a glance.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 font-bold">
                  2
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Loan Application</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Apply for loans, track application status, and manage repayments.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 font-bold">
                  3
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Community</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Connect with fellow members, join discussions, and send direct messages.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 font-bold">
                  4
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Support & Settings</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Submit support tickets, manage your profile, and configure security settings.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button onClick={handleNext} className="w-full rounded-xl bg-amber-600 hover:bg-amber-700 text-white">
                <Check className="mr-2 h-4 w-4" /> Get Started
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
