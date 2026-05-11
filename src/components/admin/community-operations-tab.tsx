"use client";

import { reviewMentorshipConnection } from "@/actions/community-actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Handshake,
  MessageSquareText,
  Clock3,
  ShieldCheck,
  Megaphone,
} from "lucide-react";
import {
  getPlatformAnnouncements,
  createPlatformAnnouncement,
  publishPlatformAnnouncement,
} from "@/actions/superadmin-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

type CommunitySummary = Awaited<
  ReturnType<
    typeof import("@/actions/community-actions").getCommunityStaffSummary
  >
>;

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
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    targetAudience: "all" as "all" | "admins" | "lenders" | "members",
    priority: "normal" as "low" | "normal" | "high" | "urgent",
  });

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    const result = await getPlatformAnnouncements();
    if (result.success) {
      setAnnouncements(result.data || []);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      toast.error("Please fill in both title and content");
      return;
    }

    setIsPosting(true);
    try {
      const result = await createPlatformAnnouncement({
        ...newAnnouncement,
        isPublished: false,
      });
      if (result.success) {
        toast.success("Announcement draft created");
        setNewAnnouncement({
          title: "",
          content: "",
          targetAudience: "all",
          priority: "normal",
        });
        loadAnnouncements();
      } else {
        toast.error(result.error || "Failed to create announcement");
      }
    } finally {
      setIsPosting(false);
    }
  };

  const handlePublish = async (id: number) => {
    const result = await publishPlatformAnnouncement(id);
    if (result.success) {
      toast.success("Announcement published across platform");
      loadAnnouncements();
    } else {
      toast.error(result.error || "Failed to publish");
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>;
      case "high":
        return <Badge className="bg-amber-100 text-amber-700">High</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="dashboard-card p-4">
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

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.5fr]">
        <section className="space-y-4">
          <Card className="rounded-[1.75rem] border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-emerald-500" />
                Platform Announcement
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Title
                </label>
                <Input
                  placeholder="e.g., System Maintenance Schedule"
                  value={newAnnouncement.title}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      title: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Content
                </label>
                <textarea
                  className="w-full min-h-[120px] p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Write the announcement body..."
                  value={newAnnouncement.content}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      content: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Audience
                  </label>
                  <Select
                    value={newAnnouncement.targetAudience}
                    onValueChange={(v) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        targetAudience: v as any,
                      })
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="admins">Admins Only</SelectItem>
                      <SelectItem value="members">Members Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase">
                    Priority
                  </label>
                  <Select
                    value={newAnnouncement.priority}
                    onValueChange={(v) =>
                      setNewAnnouncement({
                        ...newAnnouncement,
                        priority: v as any,
                      })
                    }
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-xl mt-2"
                onClick={handleCreateAnnouncement}
                disabled={isPosting}
              >
                {isPosting ? "Drafting..." : "Post Announcement Draft"}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[1.75rem] border-slate-200 shadow-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-sm font-black uppercase tracking-widest">
                Active Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 px-0">
              <div className="divide-y divide-slate-100">
                {announcements.length === 0 ? (
                  <p className="px-6 py-8 text-center text-sm text-slate-400">
                    No announcements yet
                  </p>
                ) : (
                  announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="px-6 py-4 space-y-2 hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900">
                          {ann.title}
                        </h4>
                        {getPriorityBadge(ann.priority)}
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {ann.content}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                          Target: {ann.target_audience} •{" "}
                          {new Date(ann.created_at).toLocaleDateString()}
                        </span>
                        {!ann.is_published ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2 text-[10px] bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-black uppercase"
                            onClick={() => handlePublish(ann.id)}
                          >
                            Publish Now
                          </Button>
                        ) : (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                            Published
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="space-y-4">
          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm h-[320px] overflow-y-auto">
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

          <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm h-[320px] overflow-y-auto">
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
    <div className={`rounded-2xl border px-4 py-4 shadow-sm ${accentClasses}`}>
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
