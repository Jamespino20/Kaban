"use client";

import { useEffect, useMemo, useState, useTransition, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  getConversationThread,
  markConversationRead,
  openDirectConversation,
  requestMentorship,
  sendConversationMessage,
  toggleMessageReaction,
} from "@/actions/community-actions";
import {
  Handshake,
  Loader2,
  MessageSquareText,
  Send,
  Users,
  Paperclip,
  X,
  Reply,
  SmilePlus,
  FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";

// Utility to mock file upload
const mockUploadFile = async (file: File) => {
  return new Promise<{ url: string }>((resolve) => {
    // In actual production, upload to S3/Blob and return real URL.
    setTimeout(() => {
      resolve({ url: URL.createObjectURL(file) });
    }, 1000);
  });
};

type CommunityOverview = Awaited<
  ReturnType<
    typeof import("@/actions/community-actions").getCommunityDashboardData
  >
>;

// Predefined quick reactions
const QUICK_REACTIONS = ["👍", "❤️", "🙏", "👏"];

export function CommunityTab({
  initialData,
}: {
  initialData: CommunityOverview;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(
    initialData.directConversations[0]?.id ||
      initialData.branchRooms[0]?.id ||
      null,
  );
  const [thread, setThread] = useState<any | null>(null);
  const [messageDraft, setMessageDraft] = useState("");

  const [replyToMessage, setReplyToMessage] = useState<{
    id: string;
    senderName: string;
    content: string;
  } | null>(null);
  const [attachmentDrafts, setAttachmentDrafts] = useState<
    Array<{
      fileName: string;
      fileUrl: string;
      mimeType: string;
      sizeBytes: number;
      file: File;
    }>
  >([]);
  const [isUploading, setIsUploading] = useState(false);

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

  useEffect(() => {
    // Auto-scroll to bottom of chat
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread?.messages]);

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newDrafts: Array<{
      fileName: string;
      fileUrl: string;
      mimeType: string;
      sizeBytes: number;
      file: File;
    }> = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const res = await mockUploadFile(file);
      newDrafts.push({
        fileName: file.name,
        fileUrl: res.url,
        mimeType: file.type,
        sizeBytes: file.size,
        file,
      });
    }
    setAttachmentDrafts((prev) => [...prev, ...newDrafts]);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachmentDrafts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = () => {
    if (
      !selectedConversationId ||
      (!messageDraft.trim() && attachmentDrafts.length === 0)
    )
      return;

    startTransition(async () => {
      const finalAttachments = attachmentDrafts.map((draft) => ({
        fileName: draft.fileName,
        fileUrl: draft.fileUrl,
        mimeType: draft.mimeType,
        sizeBytes: draft.sizeBytes,
      }));

      const result = await sendConversationMessage({
        conversationId: selectedConversationId,
        content: messageDraft || "Nagpadala ng file",
        replyToMessageId: replyToMessage?.id,
        attachments: finalAttachments.length > 0 ? finalAttachments : undefined,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      const nextThread = await getConversationThread(selectedConversationId);
      setThread(nextThread);
      setMessageDraft("");
      setReplyToMessage(null);
      setAttachmentDrafts([]);
      router.refresh();
    });
  };

  const handleReaction = (messageId: string, emoji: string) => {
    startTransition(async () => {
      const result = await toggleMessageReaction({ messageId, emoji });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      const nextThread = await getConversationThread(selectedConversationId!);
      setThread(nextThread);
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

      <div className="space-y-5 flex flex-col h-[calc(100vh-150px)] max-h-[900px]">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm flex flex-col flex-1 overflow-hidden">
          <div className="mb-3 flex items-center justify-between gap-3 shrink-0 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                Active Thread
              </h2>
              {thread && (
                <p className="text-sm font-bold text-slate-900 mt-1">
                  {thread.title ||
                    thread.participants
                      .filter(
                        (participant: any) => participant.role !== "member",
                      )
                      .map((participant: any) => participant.name)
                      .join(", ") ||
                    "Conversation"}
                </p>
              )}
            </div>
            {thread && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                {thread.type === "branch_room" ? "ROOM" : "DIRECT"}
              </span>
            )}
          </div>

          {!selectedConversationId || !thread ? (
            <div className="flex-1 flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              Pumili ng room o direct conversation para makita ang thread.
            </div>
          ) : (
            <>
              {/* Message List */}
              <div
                ref={scrollRef}
                className="flex-1 space-y-4 overflow-y-auto pr-2 py-2 flex flex-col-reverse"
              >
                {/* Messages usually come descedning from findMany so we might need to map them back to chronological order for flex-col-reverse or normal list */}
                {thread.messages.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500 self-center w-full text-center">
                    Wala pang messages dito. Mauna ka na.
                  </p>
                ) : (
                  thread.messages
                    .slice()
                    .reverse()
                    .map((message: any) => (
                      <div
                        key={message.id}
                        className="group rounded-2xl border border-slate-100 bg-white px-4 py-3 transition-colors hover:bg-slate-50"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900">
                              {message.senderName}
                            </p>
                            <p className="text-[10px] uppercase tracking-[0.16em] text-emerald-600/70">
                              {new Date(message.createdAt).toLocaleString(
                                "en-PH",
                                {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          </div>
                          {/* Quick Actions (Reply/React) */}
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <div className="relative group/reaction">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full"
                              >
                                <SmilePlus className="w-3 h-3 text-slate-400 hover:text-emerald-600" />
                              </Button>
                              <div className="absolute top-1/2 -translate-y-1/2 right-6 hidden group-hover/reaction:flex bg-white shadow-md border border-slate-100 rounded-full py-1 px-2 gap-1 z-10 animate-in fade-in zoom-in-95">
                                {QUICK_REACTIONS.map((emoji) => (
                                  <button
                                    key={emoji}
                                    className="h-6 w-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-sm"
                                    onClick={() =>
                                      handleReaction(message.id, emoji)
                                    }
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full"
                              onClick={() =>
                                setReplyToMessage({
                                  id: message.id,
                                  senderName: message.senderName,
                                  content: message.content,
                                })
                              }
                            >
                              <Reply className="w-3 h-3 text-slate-400 hover:text-emerald-600" />
                            </Button>
                          </div>
                        </div>

                        {/* Reply Context Render */}
                        {message.replyTo && (
                          <div className="mt-1 mb-2 border-l-2 border-emerald-300 pl-3 py-1 bg-emerald-50/50 rounded-r-lg">
                            <p className="text-xs font-bold text-emerald-800">
                              {message.replyTo.senderName}
                            </p>
                            <p className="text-xs text-slate-600 line-clamp-1">
                              {message.replyTo.content}
                            </p>
                          </div>
                        )}

                        <p className="mt-1 text-sm leading-6 text-slate-700 whitespace-pre-wrap">
                          {message.content}
                        </p>

                        {/* Attachments Preview */}
                        {message.attachments?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.attachments.map((file: any) => (
                              <a
                                href={file.fileUrl}
                                target="_blank"
                                title={file.fileName}
                                key={file.id}
                                className="flex items-center gap-2 px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition-colors text-xs text-slate-700 max-w-[200px]"
                              >
                                <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span className="truncate">
                                  {file.fileName}
                                </span>
                              </a>
                            ))}
                          </div>
                        )}

                        {/* Reactions Render */}
                        {message.reactions?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {/* Grouping reactions logic can be complex, mapped simple for now */}
                            {Array.from(
                              new Set(
                                message.reactions.map((r: any) => r.emoji),
                              ),
                            ).map((emoji: any) => {
                              const count = message.reactions.filter(
                                (r: any) => r.emoji === emoji,
                              ).length;
                              const isUserReacted = message.reactions.some(
                                (r: any) =>
                                  r.emoji === emoji &&
                                  r.user_id /* this requires current user id, but clicking toggles so it's fine */,
                              );
                              return (
                                <button
                                  key={emoji}
                                  onClick={() =>
                                    handleReaction(message.id, emoji)
                                  }
                                  className="px-2 py-0.5 rounded-full bg-slate-50 border border-slate-100 hover:bg-emerald-50 text-[11px] flex items-center gap-1.5"
                                >
                                  <span>{emoji}</span>
                                  <span className="text-slate-500 font-bold">
                                    {count}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>

              {/* Composition Area */}
              <div className="pt-3 border-t border-slate-100 shrink-0 flex flex-col gap-2">
                {replyToMessage && (
                  <div className="flex items-center justify-between bg-emerald-50/50 rounded-xl px-4 py-2 border border-emerald-100">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-emerald-800">
                        Replying to {replyToMessage.senderName}
                      </span>
                      <span className="text-xs text-slate-500 line-clamp-1">
                        {replyToMessage.content}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full hover:bg-emerald-100"
                      onClick={() => setReplyToMessage(null)}
                    >
                      <X className="w-4 h-4 text-emerald-700" />
                    </Button>
                  </div>
                )}

                {attachmentDrafts.length > 0 && (
                  <div className="flex items-center justify-start gap-2 overflow-x-auto pb-1">
                    {attachmentDrafts.map((draft, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-slate-100 text-xs px-3 py-1.5 rounded-xl border border-slate-200 shrink-0"
                      >
                        <FileText className="w-3 h-3 text-slate-500" />
                        <span className="max-w-[100px] truncate">
                          {draft.fileName}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                        >
                          <X className="w-3 h-3 text-slate-400 hover:text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 items-end">
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    multiple
                    onChange={handleFileSelect}
                  />
                  <Button
                    variant="outline"
                    className="h-10 w-10 shrink-0 rounded-xl border-slate-200 bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-white"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending || isUploading}
                    title="Attach file"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Paperclip className="w-4 h-4" />
                    )}
                  </Button>
                  <textarea
                    value={messageDraft}
                    onChange={(event) => setMessageDraft(event.target.value)}
                    placeholder="Ilagay ang mensahe dito..."
                    className="flex-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 resize-none min-h-10 max-h-32 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    className="h-10 shrink-0 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={handleSendMessage}
                    disabled={
                      isPending ||
                      (!messageDraft.trim() && attachmentDrafts.length === 0)
                    }
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm shrink-0">
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
        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
      ) : null}
    </button>
  );
}
