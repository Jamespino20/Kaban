"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  getConversationThread,
  markConversationRead,
  openDirectConversation,
  requestMentorship,
  sendConversationMessage,
} from "@/actions/community-actions";
import {
  Handshake,
  Loader2,
  MessageSquareText,
  Send,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";

type CommunityOverview = Awaited<
  ReturnType<typeof import("@/actions/community-actions").getCommunityDashboardData>
>;

export function CommunityTab({
  initialData,
}: {
  initialData: CommunityOverview;
}) {
  const router = useRouter();
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(
    initialData.directConversations[0]?.id ||
      initialData.branchRooms[0]?.id ||
      null,
  );
  const [thread, setThread] = useState<any | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [selectedMentorId, setSelectedMentorId] = useState<string>("");
  const [focusArea, setFocusArea] = useState("");
  const [mentorNotes, setMentorNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const conversationDirectory = useMemo(
    () => [...initialData.branchRooms, ...initialData.directConversations],
    [initialData.branchRooms, initialData.directConversations],
  );

  useEffect(() => {
    if (!selectedConversationId) {
      setThread(null);
      return;
    }

    let cancelled = false;

    startTransition(async () => {
      try {
        const nextThread = await getConversationThread(selectedConversationId);
        if (!cancelled) {
          setThread(nextThread);
        }
        await markConversationRead(selectedConversationId);
      } catch (error) {
        if (!cancelled) {
          toast.error("Hindi ma-load ang conversation na ito.");
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectedConversationId]);

  const handleStartConversation = (targetUserId: number) => {
    startTransition(async () => {
      const result = await openDirectConversation(targetUserId);
      if (result.error) {
        toast.error(result.error);
        return;
      }

      setSelectedConversationId(result.conversationId ?? null);
      router.refresh();
    });
  };

  const handleSendMessage = () => {
    if (!selectedConversationId || !messageDraft.trim()) return;

    startTransition(async () => {
      const result = await sendConversationMessage({
        conversationId: selectedConversationId,
        content: messageDraft,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      const nextThread = await getConversationThread(selectedConversationId);
      setThread(nextThread);
      setMessageDraft("");
      router.refresh();
    });
  };

  const handleRequestMentorship = () => {
    if (!selectedMentorId) {
      toast.error("Pumili muna ng Ka-Agapay na gusto mong lapitan.");
      return;
    }

    startTransition(async () => {
      const result = await requestMentorship({
        mentorUserId: Number(selectedMentorId),
        focusArea,
        notes: mentorNotes,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(result.success);
      setSelectedMentorId("");
      setFocusArea("");
      setMentorNotes("");
      router.refresh();
    });
  };

  if (initialData.requiresTenantContext) {
    return (
      <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50/80 p-5 shadow-sm">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-700">
          Branch Context Needed
        </p>
        <h2 className="mt-2 text-xl font-display font-bold text-slate-900">
          Pumili muna ng branch bago gamitin ang community tools
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Ang messaging, mentorship, at guarantor discovery ay tenant-scoped
          para manatiling ligtas at malinaw ang community support.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.95fr_1.15fr]">
      <div className="space-y-5">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-600" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                Branch Rooms
              </h2>
              <p className="text-xs text-slate-500">
                Tulong, announcements, at guarantor discussions.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {initialData.branchRooms.map((room) => (
              <ConversationButton
                key={room.id}
                title={room.title || "Branch Room"}
                subtitle={room.lastMessagePreview || "Wala pang bagong usapan."}
                active={room.id === selectedConversationId}
                unread={room.hasUnread}
                onClick={() => setSelectedConversationId(room.id)}
              />
            ))}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <MessageSquareText className="h-4 w-4 text-indigo-600" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                Direct Conversations
              </h2>
              <p className="text-xs text-slate-500">
                Mas personal na usapan para sa mentorship at guarantorship.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {initialData.directConversations.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Wala ka pang direct conversations. Pumili ng Ka-Agapay sa ibaba
                para magsimula.
              </p>
            ) : (
              initialData.directConversations.map((conversation) => (
                <ConversationButton
                  key={conversation.id}
                  title={conversation.counterparty?.name || "Direct Message"}
                  subtitle={
                    conversation.lastMessagePreview ||
                    conversation.counterparty?.subtitle ||
                    "Wala pang message."
                  }
                  active={conversation.id === selectedConversationId}
                  unread={conversation.hasUnread}
                  onClick={() => setSelectedConversationId(conversation.id)}
                />
              ))
            )}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Handshake className="h-4 w-4 text-amber-600" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                Ka-Agapay Discovery
              </h2>
              <p className="text-xs text-slate-500">
                Humanap ng mentor, guarantor-fit, o kausap muna bago humiling.
              </p>
            </div>
          </div>
          <div className="max-h-[26rem] space-y-2 overflow-y-auto pr-1">
            {initialData.discoverableUsers.map((user) => (
              <div
                key={user.userId}
                className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500">{user.subtitle}</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                      {user.role}
                      {typeof user.averageVouchScore === "number"
                        ? ` • vouch ${user.averageVouchScore.toFixed(1)}`
                        : ""}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => handleStartConversation(user.userId)}
                    disabled={isPending}
                  >
                    Message
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">
              Formal Mentorship Request
            </p>
            <select
              value={selectedMentorId}
              onChange={(event) => setSelectedMentorId(event.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700"
            >
              <option value="">Pumili ng mentor o guarantor-fit</option>
              {initialData.discoverableUsers.map((user) => (
                <option key={user.userId} value={String(user.userId)}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
            <Input
              value={focusArea}
              onChange={(event) => setFocusArea(event.target.value)}
              placeholder="Focus area: negosyo, repayment habit, branch onboarding"
              className="rounded-xl"
            />
            <textarea
              value={mentorNotes}
              onChange={(event) => setMentorNotes(event.target.value)}
              placeholder="Ikuwento kung bakit siya ang gusto mong lapitan."
              className="min-h-20 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
            />
            <Button
              className="w-full rounded-xl bg-amber-500 text-white hover:bg-amber-600"
              onClick={handleRequestMentorship}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Handshake className="mr-2 h-4 w-4" />
              )}
              Request mentorship endorsement
            </Button>
          </div>
        </section>
      </div>

      <div className="space-y-5">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                Active Thread
              </h2>
              <p className="text-xs text-slate-500">
                Gumamit muna ng message bago humiling ng guarantor support.
              </p>
            </div>
          </div>

          {!selectedConversationId || !thread ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              Pumili ng room o direct conversation para makita ang thread.
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-sm font-bold text-slate-900">
                  {thread.title ||
                    thread.participants
                      .filter((participant: any) => participant.role !== "member")
                      .map((participant: any) => participant.name)
                      .join(", ") ||
                    "Conversation"}
                </p>
                <p className="text-xs text-slate-500">
                  {thread.type === "branch_room"
                    ? "Branch room"
                    : "Direct conversation"}
                </p>
              </div>

              <div className="mt-3 max-h-[26rem] space-y-3 overflow-y-auto pr-1">
                {thread.messages.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    Wala pang messages dito. Mauna ka na.
                  </p>
                ) : (
                  thread.messages.map((message: any) => (
                    <div
                      key={message.id}
                      className="rounded-2xl border border-slate-100 bg-white px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-slate-900">
                          {message.senderName}
                        </p>
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

              <div className="mt-4 flex gap-2">
                <Input
                  value={messageDraft}
                  onChange={(event) => setMessageDraft(event.target.value)}
                  placeholder="Magtanong tungkol sa guarantor fit, repayment habits, o branch support..."
                  className="rounded-xl"
                />
                <Button
                  className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={handleSendMessage}
                  disabled={isPending || !messageDraft.trim()}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </>
          )}
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
            Mentorship Status
          </h2>
          <div className="mt-3 space-y-2">
            {initialData.mentorships.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                Wala ka pang active o pending mentorship relationships.
              </p>
            ) : (
              initialData.mentorships.map((mentorship) => (
                <div
                  key={mentorship.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {mentorship.requesterName} → {mentorship.mentorName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {mentorship.focusArea || "General community support"}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white">
                      {mentorship.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  {mentorship.endorsedBy ? (
                    <p className="mt-2 text-[11px] text-slate-500">
                      Endorsed by {mentorship.endorsedBy}
                    </p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function ConversationButton({
  title,
  subtitle,
  active,
  unread,
  onClick,
}: {
  title: string;
  subtitle: string;
  active: boolean;
  unread: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start justify-between gap-3 rounded-2xl border px-3 py-3 text-left transition-all ${
        active
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-white"
      }`}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-900">{title}</p>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
          {subtitle}
        </p>
      </div>
      {unread ? (
        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
      ) : null}
    </button>
  );
}
