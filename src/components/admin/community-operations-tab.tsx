"use client";

import { reviewMentorshipConnection } from "@/actions/community-actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Handshake,
  MessageSquareText,
  Users,
  Clock3,
  ShieldCheck,
} from "lucide-react";

type CommunitySummary = Awaited<
  ReturnType<
    typeof import("@/actions/community-actions").getCommunityStaffSummary
  >
>;

type PendingMentorshipRequest = {
  id: number;
  requesterName: string;
  mentorName: string;
  focusArea: string | null;
  createdAt: Date;
};

type RecentMessage = {
  id: number;
  content: string;
  createdAt: Date;
  conversationTitle: string;
  senderName: string;
};

export function CommunityOperationsTab({
  summary,
}: {
  summary: CommunitySummary;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900">
              Community Operations
            </h2>
            <p className="text-sm text-slate-500">
              Compact view for mentorship endorsements and tenant message
              activity.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 xl:min-w-[520px]">
            <CompactStatCard
              icon={<Handshake className="h-4 w-4" />}
              label="Pending Mentorships"
              value={summary.pendingMentorships.length}
              accent="amber"
            />
            <CompactStatCard
              icon={<ShieldCheck className="h-4 w-4" />}
              label="Endorsed Connections"
              value={summary.activeMentorships}
              accent="emerald"
            />
            <CompactStatCard
              icon={<MessageSquareText className="h-4 w-4" />}
              label="Tenant Conversations"
              value={summary.conversationCount}
              accent="indigo"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.96fr_1.04fr]">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-col gap-1 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
              Mentorship Endorsement Queue
            </h3>
            <p className="text-xs text-slate-500">
              I-review ang mentor pairings bago sila maging formal sa system.
            </p>
          </div>

          <div className="space-y-3">
            {summary.pendingMentorships.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                Walang naghihintay na mentorship endorsements.
              </p>
            ) : (
              summary.pendingMentorships.map((request: any) => (
                <MentorshipReviewCard key={request.id} request={request} />
              ))
            )}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-col gap-1 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
              Recent Community Activity
            </h3>
            <p className="text-xs text-slate-500">
              Quick pulse ng tenant rooms, direct chats, at active support
              flows.
            </p>
          </div>

          <div className="space-y-2">
            {summary.recentMessages.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                No recent community messages in this scope.
              </p>
            ) : (
              summary.recentMessages.map((message: RecentMessage) => (
                <div
                  key={message.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">
                          {message.senderName}
                        </p>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                          {message.conversationTitle}
                        </span>
                      </div>
                      <p className="text-sm leading-6 text-slate-600">
                        {message.content}
                      </p>
                    </div>
                    <p className="flex shrink-0 items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-slate-400">
                      <Clock3 className="h-3.5 w-3.5" />
                      {new Date(message.createdAt).toLocaleString("en-PH", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function MentorshipReviewCard({ request }: { request: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");

  const handleReview = (status: "endorsed" | "rejected") => {
    startTransition(async () => {
      const result = await reviewMentorshipConnection({
        connectionId: request.id,
        status,
        notes,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(result.success);
      setNotes("");
      router.refresh();
    });
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-slate-900">
              {request.requesterName} - {request.mentorName}
            </p>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">
              Pending
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs text-slate-500 sm:grid-cols-2">
            <div className="rounded-xl bg-white px-3 py-2">
              <p className="mb-1 font-bold uppercase tracking-widest text-slate-400">
                Focus Area
              </p>
              <p className="text-sm text-slate-700">
                {request.focusArea || "General mentorship / guarantor support"}
              </p>
            </div>
            <div className="rounded-xl bg-white px-3 py-2">
              <p className="mb-1 font-bold uppercase tracking-widest text-slate-400">
                Requested
              </p>
              <p className="text-sm text-slate-700">
                {new Date(request.createdAt).toLocaleDateString("en-PH", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Optional staff note para sa endorsement o rejection."
        className="mt-3 min-h-20 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
      />

      <div className="mt-3 flex gap-2">
        <Button
          className="flex-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
          onClick={() => handleReview("endorsed")}
          disabled={isPending}
        >
          Endorse
        </Button>
        <Button
          variant="outline"
          className="flex-1 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50"
          onClick={() => handleReview("rejected")}
          disabled={isPending}
        >
          Reject
        </Button>
      </div>
    </div>
  );
}

function CompactStatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  accent: "amber" | "emerald" | "indigo";
}) {
  const accentClasses = {
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
  }[accent];

  return (
    <div
      className={`rounded-[1.5rem] border px-4 py-4 shadow-sm ${accentClasses}`}
    >
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-[11px] font-black uppercase tracking-[0.18em]">
          {label}
        </p>
      </div>
      <p className="mt-3 text-3xl font-display font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}
