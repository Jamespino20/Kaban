"use client";

import { FeedbackTab } from "@/components/admin/feedback-tab";

type SupportTicketItem = Parameters<typeof FeedbackTab>[0]["entries"][0];

interface SupportAnalyticsModuleProps {
  role: string;
  feedbackEntries: SupportTicketItem[];
}

export function SupportAnalyticsModule({
  role,
  feedbackEntries,
}: SupportAnalyticsModuleProps) {
  return <FeedbackTab role={role} entries={feedbackEntries} />;
}
