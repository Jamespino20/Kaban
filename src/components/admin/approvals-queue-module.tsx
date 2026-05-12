"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VerificationQueueTab } from "@/components/admin/verification-queue-tab";
import { POSSystemTab } from "@/components/admin/pos-system-tab";
import { TopUpQueueTab } from "@/components/admin/topup-queue-tab";
import { CompassionActionsTab } from "@/components/admin/compassion-actions-tab";
import { usePolling } from "@/hooks/use-polling";

type ApprovalsPendingData = Parameters<typeof VerificationQueueTab>[0]["data"];
type Member = Parameters<typeof POSSystemTab>[0]["members"][0];
type TopUpRequest = Parameters<typeof TopUpQueueTab>[0]["requests"][0];
type CompassionAction = Parameters<
  typeof CompassionActionsTab
>[0]["actions"][0];

interface ApprovalsQueueModuleProps {
  data: ApprovalsPendingData;
  members: Member[];
  pendingTopUps: TopUpRequest[];
  compassionActions: CompassionAction[];
  isOperator: boolean;
}

const TABS = [
  { value: "verification", label: "Verification Queue" },
  { value: "payment-intake", label: "Payment Intake" },
  { value: "topup", label: "Capital Top-Up" },
  { value: "compassion", label: "Compassion Actions" },
] as const;

const SUPERADMIN_TABS = [
  { value: "verification", label: "Verification Queue" },
] as const;

export function ApprovalsQueueModule({
  data,
  members,
  pendingTopUps,
  compassionActions,
  isOperator,
}: ApprovalsQueueModuleProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("verification");
  const tabs = isOperator ? TABS : SUPERADMIN_TABS;

  usePolling(async () => {
    router.refresh();
  }, 30_000);

  return (
    <div className="space-y-4">
      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer ${
              activeTab === tab.value
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white/70 text-slate-600 border border-slate-200/80 hover:bg-white hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sub-Tab Content */}
      <div>
        {activeTab === "verification" && <VerificationQueueTab data={data} />}
        {isOperator && activeTab === "payment-intake" && (
          <POSSystemTab members={members} />
        )}
        {isOperator && activeTab === "topup" && (
          <TopUpQueueTab requests={pendingTopUps as any} />
        )}
        {isOperator && activeTab === "compassion" && (
          <CompassionActionsTab actions={compassionActions} />
        )}
      </div>
    </div>
  );
}
