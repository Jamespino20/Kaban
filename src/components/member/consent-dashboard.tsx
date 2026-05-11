"use client";

import { useState } from "react";
import {
  Shield,
  Check,
  Lock,
  ChevronRight,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ConsentDashboardProps {
  tenantName: string;
  isAccepted: boolean;
  acceptedAt?: Date | null;
  version?: string | null;
  onAccept: (version: string) => Promise<{ success?: string; error?: string }>;
}

export const ConsentDashboard = ({
  tenantName,
  isAccepted,
  acceptedAt,
  version,
  onAccept,
}: ConsentDashboardProps) => {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleAccept = async () => {
    setIsPending(true);
    try {
      const res = await onAccept("v2026.04.29");
      if (res.success) {
        toast.success("Terms and Data Privacy Consent accepted.");
        router.refresh();
      } else {
        toast.error(res.error || "An error occurred.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Data Privacy & Consent
            </h2>
            <p className="text-sm text-slate-500">
              DPA 2012 Compliance for {tenantName}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              What does {tenantName} see?
            </h3>
            <ul className="space-y-3">
              {[
                "Name, Profile Photo, and Gender",
                "Loan and Payment History",
                "Trust Score and Vouch History",
                "Business Performance Metrics",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-slate-700 text-sm"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-500" />
              What does the Superadmin see?
            </h3>
            <ul className="space-y-3">
              {[
                "Global Audit Logs (for security)",
                "System Health & Maintenance Data",
                "Tenant Performance Overview",
                "Fraud & Risk Prevention Patterns",
              ].map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-slate-700 text-sm"
                >
                  <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {!isAccepted ? (
          <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 mb-8">
            <div className="flex gap-4">
              <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0" />
              <div className="space-y-2">
                <p className="font-bold text-amber-900 leading-tight">
                  Your consent is required
                </p>
                <p className="text-sm text-amber-800 leading-relaxed">
                  Before continuing to use the platform, you need to accept
                  the Terms and Conditions and Data Privacy Agreement of{" "}
                  {tenantName}.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-8">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-emerald-600 border border-slate-200">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">
                    Your Consent is Active
                  </p>
                  <p className="text-xs text-slate-500 italic">
                    Accepted on {acceptedAt?.toLocaleDateString()} (Version{" "}
                    {version})
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="text-emerald-600 font-bold"
                onClick={() => window.open("/terms", "_blank")}
              >
                View T&C <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {!isAccepted && (
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              className="flex-1 rounded-xl h-12"
              onClick={() => window.open("/terms", "_blank")}
            >
              <FileText className="w-4 h-4 mr-2" />
              Read Terms
            </Button>
            <Button
              className="flex-1 rounded-xl h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              disabled={isPending}
              onClick={handleAccept}
            >
              {isPending ? "Connecting..." : "Accept & Verify"}
            </Button>
          </div>
        )}
      </div>

      <div className="text-center px-8">
        <p className="text-xs text-slate-400 leading-relaxed">
          Agapay complies with **Republic Act No. 10173 (Data Privacy Act of
          2012)**. Your data is safe and used only for your microfinance
          transactions.
        </p>
      </div>
    </div>
  );
};
