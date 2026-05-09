"use client";

import { useState } from "react";
import { FeedbackTab } from "@/components/admin/feedback-tab";
import { AuditLogViewer } from "@/components/admin/audit-log-viewer";

type FeedbackEntry = Parameters<typeof FeedbackTab>[0]["entries"][0];

interface SupportAnalyticsModuleProps {
  role: string;
  feedbackEntries: FeedbackEntry[];
  tenantId: number | undefined;
}

const TABS = [
  { value: "feedback", label: "Support & Feedback" },
  { value: "audit", label: "Audit Logs" },
] as const;

export function SupportAnalyticsModule({
  role,
  feedbackEntries,
  tenantId,
}: SupportAnalyticsModuleProps) {
  const [activeTab, setActiveTab] = useState("feedback");

  return (
    <div className="space-y-4">
      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-2xl text-sm font-bold transition-all duration-200 cursor-pointer ${
              activeTab === tab.value
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white/70 text-slate-600 border border-slate-200/80 hover:bg-white hover:text-slate-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sub-Tab Content */}
      <div>
        {activeTab === "feedback" && (
          <FeedbackTab role={role} entries={feedbackEntries} />
        )}
        {activeTab === "audit" && <AuditLogViewer tenantId={tenantId} />}
      </div>
    </div>
  );
}
