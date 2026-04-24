"use client";

import { reviewMentorshipConnection } from "@/actions/community-actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Handshake, MessageSquareText, Users } from "lucide-react";

type CommunitySummary = Awaited<
  ReturnType<typeof import("@/actions/community-actions").getCommunityStaffSummary>
>;

export function CommunityOperationsTab({
  summary,
}: {
  summary: CommunitySummary;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <CompactStatCard
          icon={<Handshake className="h-4 w-4" />}
          label="Pending Mentorships"
          value={summary.pendingMentorships.length}
          accent="amber"
        />
        <CompactStatCard
          icon={<Users className="h-4 w-4" />}
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

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3">
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
              Mentorship Endorsement Queue
            </h2>
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
              summary.pendingMentorships.map((request) => (
                <MentorshipReviewCard key={request.id} request={request} />
              ))
            )}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3">
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
              Recent Community Activity
            </h2>
            <p className="text-xs text-slate-500">
              Quick pulse ng branch rooms at direct conversations.
            </p>
          </div>

          <div className="max-h-[30rem] space-y-3 overflow-y-auto pr-1">
            {summary.recentMessages.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                Wala pang recent community messages sa scope na ito.
              </p>
            ) : (
              summary.recentMessages.map((message) => (
                <div
                  key={message.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {message.senderName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {message.conversationTitle}
                      </p>
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                      {new Date(message.createdAt).toLocaleString("en-PH", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {message.content}
                  </p>
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
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-900">
            {request.requesterName} → {request.mentorName}
          </p>
          <p className="text-xs text-slate-500">
            {request.focusArea || "General mentorship / guarantor support"}
          </p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-slate-400">
            {new Date(request.createdAt).toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-700">
          Pending
        </span>
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
    <div className={`rounded-[1.5rem] border px-4 py-4 shadow-sm ${accentClasses}`}>
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
