"use client";

import { useEffect, useMemo, useRef, useState, useTransition, useCallback } from "react";
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

function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function shouldGroupMessages(a: any, b: any) {
  if (!a || !b) return false;
  if (a.senderName !== b.senderName) return false;
  const timeA = new Date(a.createdAt).getTime();
  const timeB = new Date(b.createdAt).getTime();
  return Math.abs(timeA - timeB) < 300000; // 5 minutes
}

function formatDateSeparator(date: Date) {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) return "Today";
  if (isSameDay(date, yesterday)) return "Yesterday";
  return date.toLocaleDateString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

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
          toast.error("Failed to load this conversation. Please try refreshing or selecting a different conversation.");
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
      if (!selectedConversationId) return;
      const nextThread = await getConversationThread(selectedConversationId);
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
      <div className="dashboard-card border-amber-200 bg-amber-50/80 p-5">
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
    <>
    <div className="flex h-[calc(100vh-120px)] max-h-[860px] gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Discord-style Sidebar: Channels & DMs */}
      <aside className="flex w-[280px] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h2 className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Agapay Community
          </h2>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                {unreadCount} new
              </span>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 p-3">
          {/* Support Rooms */}
          <div>
            <h3 className="mb-1 flex items-center gap-1.5 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <Users className="h-3 w-3" /> Support
            </h3>
            <div className="space-y-0.5 ml-1 border-l-2 border-slate-100 pl-2">
              {initialData.operatorRooms.map((room: any) => {
                const isActive = room.id === selectedConversationId;
                return (
                <button
                  key={room.id}
                  onClick={() => setSelectedConversationId(room.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-emerald-100 text-emerald-900 border-l-[3px] border-emerald-500 -ml-[1px]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Headphones className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate text-xs font-semibold">
                    {room.title || "Operator"}
                  </span>
                  {room.hasUnread && (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </span>
                  )}
                </button>
                );
              })}
              {initialData.operatorRooms.length === 0 && (
                <p className="px-3 py-2 text-xs text-slate-400">No support channels</p>
              )}
            </div>
          </div>

          {/* Direct Messages */}
          <div>
            <h3 className="mb-1 flex items-center gap-1.5 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <MessageSquareText className="h-3 w-3" /> Direct Messages
            </h3>
            <div className="space-y-0.5 ml-1 border-l-2 border-slate-100 pl-2">
              {initialData.directConversations.map((conversation: any) => {
                const isActive = conversation.id === selectedConversationId;
                return (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversationId(conversation.id)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    isActive
                      ? "bg-indigo-100 text-indigo-900 border-l-[3px] border-indigo-500 -ml-[1px]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                    {(conversation.counterparty?.name || "?").charAt(0)}
                  </div>
                  <span className="flex-1 truncate text-xs font-semibold">
                    {conversation.counterparty?.name || "Direct Message"}
                  </span>
                  {conversation.hasUnread && (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500" />
                    </span>
                  )}
                </button>
                );
              })}
              {initialData.directConversations.length === 0 && (
                <p className="px-3 py-2 text-xs text-slate-400">No conversations yet</p>
              )}
            </div>
          </div>

          {/* Group Chats */}
          {(initialData.groupChats || []).length > 0 && (
            <div>
              <h3 className="mb-1 flex items-center gap-1.5 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <Layers3 className="h-3 w-3" /> Groups
              </h3>
              <div className="space-y-0.5 ml-1 border-l-2 border-slate-100 pl-2">
                {(initialData.groupChats || []).map((group: any) => {
                  const isActive = group.id === selectedConversationId;
                  return (
                  <button
                    key={group.id}
                    onClick={() => setSelectedConversationId(group.id)}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-violet-100 text-violet-900 border-l-[3px] border-violet-500 -ml-[1px]"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Layers3 className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate text-xs font-semibold">{group.title}</span>
                    {group.hasUnread && (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-violet-500" />
                      </span>
                    )}
                  </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="border-t border-slate-200 pt-3">
            <h3 className="mb-1 flex items-center gap-1.5 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <Handshake className="h-3 w-3" /> Discover
            </h3>
            <div className="space-y-0.5 ml-1 border-l-2 border-slate-100 pl-2">
              {discoverableDirectory.slice(0, 8).map((user: any) => (
                <button
                  key={user.userId}
                  onClick={() => handleStartConversation(user.userId)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-left text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                >
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[8px] font-bold text-amber-700">
                    {user.name.charAt(0)}
                  </div>
                  <span className="truncate">{user.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat Area + Mentorship */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 shrink-0">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {activeConversationLabel}
            </h2>
            {thread && (
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
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
                  (() => {
                    const reversed = thread.messages.slice().reverse();
                    const grouped: { date: string; items: any[] }[] = [];
                    let lastDate = "";

                    reversed.forEach((msg: any, idx: number) => {
                      const msgDate = new Date(msg.createdAt);
                      const dateKey = msgDate.toDateString();

                      if (dateKey !== lastDate) {
                        lastDate = dateKey;
                        grouped.push({ date: dateKey, items: [msg] });
                      } else {
                        const prev = reversed[idx - 1];
                        if (shouldGroupMessages(prev, msg)) {
                          grouped[grouped.length - 1].items.push(msg);
                        } else {
                          grouped.push({ date: dateKey, items: [msg] });
                        }
                      }
                    });

                    return grouped.map((group, gi) => (
                      <div key={group.date + "-" + gi}>
                        <div className="flex items-center gap-3 py-3">
                          <div className="flex-1 h-px bg-slate-100" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-2">
                            {formatDateSeparator(new Date(group.date))}
                          </span>
                          <div className="flex-1 h-px bg-slate-100" />
                        </div>
                        {group.items.map((message: any, mi: number) => {
                          const isGrouped = mi > 0 && shouldGroupMessages(group.items[mi - 1], message);
                          return (
                            <div
                              key={message.id}
                              className={`group transition-colors ${isGrouped ? "pt-0.5" : "pt-3"}`}
                            >
                              <div className={`flex items-start gap-3 ${isGrouped ? "ml-12" : ""}`}>
                                {!isGrouped && (
                                  <div
                                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-700 hover:bg-emerald-200 transition-colors mt-0.5"
                                    onClick={() => {
                                      setSelectedProfile({
                                        userId: message.senderId,
                                        name: message.senderName,
                                        role: message.senderRole || "member",
                                        subtitle:
                                          message.senderProfile?.subtitle ||
                                          "Ka-Agapay",
                                      });
                                      setProfilePopupOpen(true);
                                    }}
                                    title={message.senderName}
                                  >
                                    {message.senderName
                                      ?.substring(0, 2)
                                      .toUpperCase()}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className={`flex items-center gap-2 ${isGrouped ? "justify-between" : ""}`}>
                                    {!isGrouped && (
                                      <p className="text-sm font-bold text-slate-900">
                                        {message.senderName}
                                      </p>
                                    )}
                                    <p className={`text-[10px] uppercase tracking-[0.16em] text-slate-400 ${isGrouped ? "" : "ml-auto"}`}>
                                      {new Date(message.createdAt).toLocaleTimeString("en-PH", {
                                        hour: "numeric",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  </div>

                                  {message.replyTo && (
                                    <div className="mt-1 mb-1.5 rounded-r-lg border-l-2 border-emerald-300 bg-emerald-50/50 py-1 pl-3">
                                      <p className="text-xs font-bold text-emerald-800">
                                        {message.replyTo.senderName}
                                      </p>
                                      <p className="line-clamp-1 text-xs text-slate-600">
                                        {message.replyTo.content}
                                      </p>
                                    </div>
                                  )}

                                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700 break-words">
                                    {message.content}
                                  </p>

                                  {message.attachments?.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
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
                                    <div className="mt-1.5 flex flex-wrap gap-1">
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
                                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 shrink-0">
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
                            </div>
                          );
                        })}
                      </div>
                    ));
                  })()
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
        </div>

        {/* Mentorship Status inline */}
        <details className="border-t border-slate-100 shrink-0">
          <summary className="flex cursor-pointer items-center gap-2 px-5 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 hover:bg-slate-50 transition-colors">
            <Handshake className="h-3 w-3" />
            Mentorship Status
            {initialData.mentorships.length > 0 && (
              <span className="ml-auto rounded-full bg-amber-100 px-2 py-0.5 text-[9px] text-amber-700">
                {initialData.mentorships.length}
              </span>
            )}
          </summary>
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 space-y-2 max-h-32 overflow-y-auto">
            {initialData.mentorships.length === 0 ? (
              <p className="text-xs text-slate-400">No mentorship relationships yet</p>
            ) : (
              initialData.mentorships.map((mentorship: any) => (
                <div key={mentorship.id} className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-xs shadow-sm">
                  <div>
                    <span className="font-semibold text-slate-900">{mentorship.mentorName}</span>
                    <span className="text-slate-500"> — {mentorship.focusArea || "General"}</span>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    mentorship.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {mentorship.status.replaceAll("_", " ")}
                  </span>
                </div>
              ))
            )}
          </div>
        </details>
      </div>

      <MemberProfilePopup
        profile={selectedProfile}
        open={profilePopupOpen}
        onOpenChange={setProfilePopupOpen}
        onStartConversation={handleStartConversation}
      />
    </>
  );
}


