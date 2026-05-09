"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShieldAlert,
  AlertTriangle,
  FileWarning,
  EyeOff,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { getSuperadminFraudMetrics } from "@/actions/superadmin-actions";

type FraudMetrics = {
  delinquentVolume: number;
  delinquentCount: number;
  pendingVerifications: number;
  rejectedVerifications: number;
  suspiciousActivities: any[];
};

export function FraudRiskTab() {
  const [data, setData] = useState<FraudMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await getSuperadminFraudMetrics();
        if (res.success && res.data) {
          setData(res.data);
        } else {
          toast.error(res.error || "Failed to load fraud metrics");
        }
      } catch (error) {
        toast.error("Failed to load fraud metrics");
      } finally {
        setIsLoading(false);
      }
    }
    loadMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-slate-400">
          Loading risk monitoring engine...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col space-y-2 mb-6">
        <h2 className="text-2xl font-bold font-display text-slate-900 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-600" />
          Fraud & Risk Monitoring
        </h2>
        <p className="text-slate-500">
          System-wide AI anomaly detection, KYC tracking, and delinquency
          metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-red-100 shadow-sm bg-red-50/30">
          <CardHeader className="pb-2 text-red-800">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> System Delinquency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-red-600">
              ₱{data?.delinquentVolume.toLocaleString() || "0"}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                {data?.delinquentCount || 0} Accounts
              </span>
              <span className="text-xs text-red-500">
                Flagged platform-wide
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-100 shadow-sm bg-amber-50/30">
          <CardHeader className="pb-2 text-amber-800">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
              <FileWarning className="w-4 h-4" /> KYC Backlog
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-amber-600">
              {data?.pendingVerifications || 0}
            </p>
            <p className="text-xs font-medium text-amber-700 mt-2">
              Pending ID verifications across all tenants
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-2 text-slate-700">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
              <EyeOff className="w-4 h-4" /> Identity Rejections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-black text-slate-800">
              {data?.rejectedVerifications || 0}
            </p>
            <p className="text-xs font-medium text-slate-500 mt-2">
              Total historically rejected KYC applications
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldAlert className="w-5 h-5 text-slate-500" />
            Critical Audit Log (AI Flagged)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!data?.suspiciousActivities ||
            data.suspiciousActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" />
                <p className="text-slate-500 font-medium text-sm">
                  No critical risk flags detected securely.
                </p>
              </div>
            ) : (
              data.suspiciousActivities.map((log) => (
                <div
                  key={log.id}
                  className="flex justify-between items-start p-4 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl border border-slate-100"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">
                        {log.action.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Tenant: {log.tenant?.name || "System"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Actor: {log.user?.username || "Automated"}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
