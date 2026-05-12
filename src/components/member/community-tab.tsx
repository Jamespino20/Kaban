"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  createGroupConversation,
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
  Layers3,
  PlusCircle,
  ChevronUp,
  Headphones,
} from "lucide-react";
import { useRouter } from "next/navigation";
import EmojiPicker from "emoji-picker-react";
import { MemberProfilePopup } from "@/components/member/member-profile-popup";

const mockUploadFile = async (file: File) => {
  return new Promise<{ url: string }>((resolve) => {
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
      initialData.groupChats?.[0]?.id ||
      initialData.operatorRooms[0]?.id ||
      null,
  );
  const [thread, setThread] = useState<any | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);

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

  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [profilePopupOpen, setProfilePopupOpen] = useState(false);

  const [selectedMentorId, setSelectedMentorId] = useState<string>("");
  const [focusArea, setFocusArea] = useState("");
  const [mentorNotes, setMentorNotes] = useState("");
  const [newGroupTitle, setNewGroupTitle] = useState("");
  const [groupParticipantIds, setGroupParticipantIds] = useState<number[]>([]);
  const [isPending, startTransition] = useTransition();

  const allConversationCount =
    initialData.operatorRooms.length +
    initialData.directConversations.length +
    (initialData.groupChats?.length || 0);
  const unreadCount =
    initialData.operatorRooms.filter((room: any) => room.hasUnread).length +
    initialData.directConversations.filter(
      (conversation: any) => conversation.hasUnread,
    ).length +
    (initialData.groupChats?.filter((group: any) => group.hasUnread).length ||
      0);

  const discoverableDirectory = useMemo(
    () => initialData.discoverableUsers || [],
    [initialData.discoverableUsers],
  );

  useEffect(() => {
    if (!selectedConversationId) {
      setThread(null);
      setHasOlderMessages(false);
      return;
    }

    let cancelled = false;

    startTransition(async () => {
      try {
        const nextThread = await getConversationThread(selectedConversationId);
        if (!cancelled) {
          setThread(nextThread);
          setHasOlderMessages((nextThread.messages?.length || 0) >= 30);
        }
        await markConversationRead(selectedConversationId);
      } catch {
        if (!cancelled) {
          toast.error("Failed to load this conversation.");
        }
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectedConversationId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread?.messages]);

  const activeConversationLabel = useMemo(() => {
    if (!thread) return "Conversation";
    if (thread.title) return thread.title;
    const otherParticipants = thread.participants.filter(
      (participant: any) => participant.role !== "member",
    );
    return (
      otherParticipants
        .map((participant: any) => participant.name)
        .join(", ") || "Conversation"
    );
  }, [thread]);

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

  const handleLoadOlder = () => {
    if (!selectedConversationId || !thread?.messages?.length) return;

    const oldestMessage = thread.messages[thread.messages.length - 1];
    startTransition(async () => {
      const olderThread = await getConversationThread(selectedConversationId, {
        beforeMessageId: oldestMessage.id,
        take: 30,
      });

      if (!olderThread?.messages?.length) {
        setHasOlderMessages(false);
        return;
      }

      setThread((prev: any) => ({
        ...prev,
        messages: [...prev.messages, ...olderThread.messages],
      }));
      setHasOlderMessages(olderThread.messages.length >= 30);
    });
  };

  const handleSendMessage = () => {
    if (
      !selectedConversationId ||
      (!messageDraft.trim() && attachmentDrafts.length === 0)
    ) {
      return;
    }

    startTransition(async () => {
      const finalAttachments = attachmentDrafts.map((draft) => ({
        fileName: draft.fileName,
        fileUrl: draft.fileUrl,
        mimeType: draft.mimeType,
        sizeBytes: draft.sizeBytes,
      }));

      const result = await sendConversationMessage({
        conversationId: selectedConversationId,
        content: messageDraft || "Sent a file",
        replyToMessageId: replyToMessage?.id,
        attachments: finalAttachments.length > 0 ? finalAttachments : undefined,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      const nextThread = await getConversationThread(selectedConversationId);
      setThread(nextThread);
      setHasOlderMessages((nextThread.messages?.length || 0) >= 30);
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
      toast.error("Please select a Ka-Agapay member to chat with.");
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

  const handleCreateGroup = () => {
    if (!newGroupTitle.trim()) {
      toast.error("Please enter a clear group title.");
      return;
    }

    startTransition(async () => {
      const result = await createGroupConversation({
        title: newGroupTitle,
        participantUserIds: groupParticipantIds,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Group chat created successfully.");
      setNewGroupTitle("");
      setGroupParticipantIds([]);
      setSelectedConversationId(result.conversationId ?? null);
      router.refresh();
    });
  };

  const toggleGroupParticipant = (userId: number) => {
    setGroupParticipantIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  if (initialData.requiresTenantContext) {
    return (
      <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50/80 p-5 shadow-sm">
        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-700">
          Tenant Context Needed
        </p>
        <h2 className="mt-2 text-xl font-display font-bold text-slate-900">
          Select a cooperative tenant first before using community tools
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Messaging, mentorship, and guarantor discovery are tenant-scoped
          to keep community support safe and clear.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="space-y-5">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                Community Pulse
              </h2>
              <p className="text-xs text-slate-500">
                A more compact view of conversations, mentorship, and tenant
                support.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 md:min-w-[220px]">
              <PulseStat label="Conversations" value={allConversationCount} />
              <PulseStat label="Unread" value={unreadCount} accent="emerald" />
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-600" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                Support Rooms
              </h2>
              <p className="text-xs text-slate-500">
                Help, announcements, and operator support.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {initialData.operatorRooms.length > 0 && (
              <div className="mb-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
                <p className="text-xs font-bold text-emerald-700">
                  Need help? Contact your cooperative operator directly.
                </p>
                {initialData.operatorRooms.slice(0, 1).map((room: any) => (
                  <Button
                    key={room.id}
                    size="sm"
                    className="mt-2 w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={() => setSelectedConversationId(room.id)}
                  >
                    <Headphones className="mr-2 h-4 w-4" />
                    Message Operator
                  </Button>
                ))}
              </div>
            )}
            {initialData.operatorRooms.map((room: any) => (
              <ConversationButton
                key={room.id}
                title={room.title || "Support Room"}
                subtitle={room.lastMessagePreview || "No new conversations yet."}
                meta={
                  room.lastMessageSender
                    ? `Last: ${room.lastMessageSender}`
                    : "Support room"
                }
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
                Direct Messages
              </h2>
              <p className="text-xs text-slate-500">
                Personal conversation for mentorship and guarantorship.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {initialData.directConversations.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                You don't have any direct conversations yet. Select a Ka-Agapay below
                to start.
              </p>
            ) : (
              initialData.directConversations.map((conversation: any) => (
                <ConversationButton
                  key={conversation.id}
                  title={conversation.counterparty?.name || "Direct Message"}
                  subtitle={
                    conversation.lastMessagePreview ||
                    conversation.counterparty?.subtitle ||
                    "No messages yet."
                  }
                  meta={conversation.counterparty?.role || "direct"}
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
            <Layers3 className="h-4 w-4 text-violet-600" />
            <div>
              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                Group Chats
              </h2>
              <p className="text-xs text-slate-500">
                Small working groups for support, coaching, and
                reminders.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {(initialData.groupChats || []).length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                You don't have any group chats yet. Create a small support group
                below.
              </p>
            ) : (
              (initialData.groupChats || []).map((group: any) => (
                <ConversationButton
                  key={group.id}
                  title={group.title}
                  subtitle={group.lastMessagePreview || "No conversations yet."}
                  meta={`${group.participantCount} participants`}
                  active={group.id === selectedConversationId}
                  unread={group.hasUnread}
                  onClick={() => setSelectedConversationId(group.id)}
                />
              ))
            )}
          </div>

          <div className="mt-4 space-y-3 rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-violet-700">
              Create Group Chat
            </p>
            <Input
              value={newGroupTitle}
              onChange={(event) => setNewGroupTitle(event.target.value)}
              placeholder="Example: Repayment Support Circle"
              className="rounded-xl bg-white"
            />
            <div className="max-h-40 space-y-2 overflow-y-auto pr-1">
              {discoverableDirectory.map((user: any) => (
                <label
                  key={user.userId}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                >
                  <input
                    type="checkbox"
                    checked={groupParticipantIds.includes(user.userId)}
                    onChange={() => toggleGroupParticipant(user.userId)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  <span className="flex-1">
                    <span className="font-semibold text-slate-900">
                      {user.name}
                    </span>{" "}
                    <span className="text-xs text-slate-500">
                      ({user.role})
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <Button
              className="w-full rounded-xl bg-violet-600 text-white hover:bg-violet-700"
              onClick={handleCreateGroup}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="mr-2 h-4 w-4" />
              )}
              Create Group Chat
            </Button>
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
                Find a mentor, guarantor-fit, or chat first before making a request.
              </p>
            </div>
          </div>
          <div className="max-h-[22rem] space-y-2 overflow-y-auto pr-1">
            {discoverableDirectory.map((user: any) => (
              <div
                key={user.userId}
                className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex cursor-pointer items-start gap-3 flex-1 min-w-0"
                    onClick={() => {
                      setSelectedProfile(user);
                      setProfilePopupOpen(true);
                    }}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700">
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500">{user.subtitle}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        {user.role}
                        {typeof user.averageVouchScore === "number"
                          ? ` - vouch ${user.averageVouchScore.toFixed(1)}`
                          : ""}
                      </p>
                    </div>
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
              <option value="">Select a mentor or guarantor-fit</option>
              {discoverableDirectory.map((user: any) => (
                <option key={user.userId} value={String(user.userId)}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
            <Input
              value={focusArea}
              onChange={(event) => setFocusArea(event.target.value)}
              placeholder="Focus area: business, repayment habit, tenant onboarding"
              className="rounded-xl"
            />
            <textarea
              value={mentorNotes}
              onChange={(event) => setMentorNotes(event.target.value)}
              placeholder="Tell us why you want to approach them."
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

      <div className="flex h-[calc(100vh-150px)] max-h-[900px] flex-col space-y-5">
        <section className="flex flex-1 flex-col overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 shrink-0 border-b border-slate-100 pb-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
                  Active Thread
                </h2>
                {thread && (
                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {activeConversationLabel}
                  </p>
                )}
              </div>
              {thread && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
                  {thread.type === "tenant_room"
                    ? "room"
                    : thread.type === "group_chat"
                      ? "group"
                      : "direct"}
                </span>
              )}
            </div>
            {thread?.participants?.length ? (
              <p className="mt-2 text-xs text-slate-500">
                {thread.participants.length} participants
              </p>
            ) : null}
          </div>

          {!selectedConversationId || !thread ? (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              Select a room, direct message, or group chat to view the
              thread.
            </div>
          ) : (
            <>
              <div className="mb-3 shrink-0">
                <Button
                  variant="outline"
                  className="rounded-xl"
                  onClick={handleLoadOlder}
                  disabled={isPending || !hasOlderMessages}
                >
                  <ChevronUp className="mr-2 h-4 w-4" />
                  {hasOlderMessages
                    ? "Load older messages"
                    : "No older messages"}
                </Button>
              </div>

              <div
                ref={scrollRef}
                className="flex-1 space-y-4 overflow-y-auto py-2 pr-2"
              >
                {thread.messages.length === 0 ? (
                  <p className="w-full self-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
                    No messages here yet. Be the first.
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
                          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="group/reaction relative">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full"
                              >
                                <SmilePlus className="h-3 w-3 text-slate-400 hover:text-emerald-600" />
                              </Button>
                              <div className="absolute right-6 top-1/2 z-10 hidden -translate-y-1/2 gap-1 rounded-full border border-slate-100 bg-white px-2 py-1 shadow-md animate-in fade-in zoom-in-95 group-hover/reaction:flex">
                                {QUICK_REACTIONS.map((emoji) => (
                                  <button
                                    key={emoji}
                                    className="flex h-6 w-6 items-center justify-center rounded-full text-sm hover:bg-slate-100"
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
                              <Reply className="h-3 w-3 text-slate-400 hover:text-emerald-600" />
                            </Button>
                          </div>
                        </div>

                        {message.replyTo && (
                          <div className="mt-1 mb-2 rounded-r-lg border-l-2 border-emerald-300 bg-emerald-50/50 py-1 pl-3">
                            <p className="text-xs font-bold text-emerald-800">
                              {message.replyTo.senderName}
                            </p>
                            <p className="line-clamp-1 text-xs text-slate-600">
                              {message.replyTo.content}
                            </p>
                          </div>
                        )}

                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                          {message.content}
                        </p>

                        {message.attachments?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.attachments.map((file: any) => (
                              <a
                                href={file.fileUrl}
                                target="_blank"
                                title={file.fileName}
                                key={file.id}
                                className="flex max-w-[200px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50"
                              >
                                <FileText className="h-4 w-4 shrink-0 text-emerald-600" />
                                <span className="truncate">
                                  {file.fileName}
                                </span>
                              </a>
                            ))}
                          </div>
                        )}

                        {message.reactions?.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {Array.from(
                              new Set(
                                message.reactions.map((r: any) => r.emoji),
                              ),
                            ).map((emoji: any) => {
                              const count = message.reactions.filter(
                                (r: any) => r.emoji === emoji,
                              ).length;
                              return (
                                <button
                                  key={emoji}
                                  onClick={() =>
                                    handleReaction(message.id, emoji)
                                  }
                                  className="flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50 px-2 py-0.5 text-[11px] hover:bg-emerald-50"
                                >
                                  <span>{emoji}</span>
                                  <span className="font-bold text-slate-500">
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

              <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 pt-3">
                {replyToMessage && (
                  <div className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-2">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-emerald-800">
                        Replying to {replyToMessage.senderName}
                      </span>
                      <span className="line-clamp-1 text-xs text-slate-500">
                        {replyToMessage.content}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full hover:bg-emerald-100"
                      onClick={() => setReplyToMessage(null)}
                    >
                      <X className="h-4 w-4 text-emerald-700" />
                    </Button>
                  </div>
                )}

                {attachmentDrafts.length > 0 && (
                  <div className="flex items-center justify-start gap-2 overflow-x-auto pb-1">
                    {attachmentDrafts.map((draft, idx) => (
                      <div
                        key={idx}
                        className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs"
                      >
                        <FileText className="h-3 w-3 text-slate-500" />
                        <span className="max-w-[100px] truncate">
                          {draft.fileName}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(idx)}
                        >
                          <X className="h-3 w-3 text-slate-400 hover:text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-end gap-2">
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    multiple
                    onChange={handleFileSelect}
                  />
                  <Button
                    variant="outline"
                    className="h-10 w-10 shrink-0 rounded-xl border-slate-200 bg-slate-50 text-slate-400 hover:bg-white hover:text-emerald-600 focus:outline-none"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isPending || isUploading}
                    title="Attach file"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Paperclip className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="relative">
                    <Button
                      variant="outline"
                      className="h-10 w-10 shrink-0 rounded-xl border-slate-200 bg-slate-50 text-slate-400 hover:bg-white hover:text-emerald-600 focus:outline-none"
                      onClick={() => setShowEmojiPicker((prev) => !prev)}
                      disabled={isPending}
                      title="Add Emoji"
                      type="button"
                    >
                      <SmilePlus className="h-4 w-4" />
                    </Button>
                    {showEmojiPicker && (
                      <div className="absolute bottom-12 left-0 z-50 shadow-xl rounded-2xl overflow-hidden border border-slate-200">
                        <EmojiPicker
                          onEmojiClick={(emojiData) => {
                            setMessageDraft((prev) => prev + emojiData.emoji);
                            setShowEmojiPicker(false);
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <textarea
                    value={messageDraft}
                    onChange={(event) => setMessageDraft(event.target.value)}
                    placeholder="Type your message here..."
                    className="max-h-32 min-h-10 w-full flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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

        <section className="shrink-0 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-500">
            Mentorship Status
          </h2>
          <div className="mt-3 space-y-2">
            {initialData.mentorships.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                You don't have any active or pending mentorship relationships.
              </p>
            ) : (
              initialData.mentorships.map((mentorship: any) => (
                <div
                  key={mentorship.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {mentorship.requesterName} - {mentorship.mentorName}
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

      <MemberProfilePopup
        profile={selectedProfile}
        open={profilePopupOpen}
        onOpenChange={setProfilePopupOpen}
        onStartConversation={handleStartConversation}
      />
    </div>
  );
}

function ConversationButton({
  title,
  subtitle,
  meta,
  active,
  unread,
  onClick,
}: {
  title: string;
  subtitle: string;
  meta?: string;
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
        {meta ? (
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            {meta}
          </p>
        ) : null}
      </div>
      {unread ? (
        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
      ) : null}
    </button>
  );
}

function PulseStat({
  label,
  value,
  accent = "slate",
}: {
  label: string;
  value: number;
  accent?: "slate" | "emerald";
}) {
  const accentClasses =
    accent === "emerald"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-slate-200 bg-slate-50 text-slate-700";

  return (
    <div className={`rounded-xl border px-3 py-2 ${accentClasses}`}>
      <p className="text-[11px] font-semibold uppercase tracking-wide">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}
