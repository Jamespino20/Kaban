"use client";

import { useState, useTransition, useMemo, useEffect, useRef } from "react";
import {
  MessageSquareText,
  Handshake,
  Megaphone,
  Search,
  MoreVertical,
  ShieldCheck,
  Send,
  Paperclip,
  SmilePlus,
  X,
  FileText,
  ChevronUp,
  Headphones,
  Reply,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  getConversationThread,
  markConversationRead,
  sendConversationMessage,
  toggleMessageReaction,
  reviewMentorshipConnection,
  sendTenantAnnouncement,
} from "@/actions/community-actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import EmojiPicker from "emoji-picker-react";

type CommunitySummary = Awaited<
  ReturnType<
    typeof import("@/actions/community-actions").getCommunityStaffSummary
  >
>;
type CommunityOverview = Awaited<
  ReturnType<
    typeof import("@/actions/community-actions").getCommunityDashboardData
  >
>;

type ViewMode = "chat" | "mentorship_queue" | "announcements";

export function OperatorCommunityTab({
  summary,
  initialData,
}: {
  summary: CommunitySummary;
  initialData: CommunityOverview;
}) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  // Navigation & View State
  const [viewMode, setViewMode] = useState<ViewMode>("chat");
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(
    initialData.directConversations[0]?.id ||
      initialData.operatorRooms[0]?.id ||
      null,
  );

  // Chat State
  const [thread, setThread] = useState<any | null>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<any>(null);

  // Announcements State
  const [isPostingAnnouncement, setIsPostingAnnouncement] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
  });

  // Mentorship State
  const [reviewNotes, setReviewNotes] = useState("");

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  const handleSendAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      toast.error("Please fill in both title and content");
      return;
    }

    setIsPostingAnnouncement(true);
    try {
      const result = await sendTenantAnnouncement({
        title: newAnnouncement.title,
        content: newAnnouncement.content,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(`Announcement sent to ${result.recipientCount || 0} members`);
      setNewAnnouncement({ title: "", content: "" });
      setIsPostingAnnouncement(false);
    } catch {
      toast.error("Failed to send announcement");
      setIsPostingAnnouncement(false);
    }
  };

  useEffect(() => {
    if (viewMode !== "chat" || !selectedConversationId) {
      setThread(null);
      return;
    }

    let cancelled = false;
    startTransition(async () => {
      try {
        const nextThread = await getConversationThread(selectedConversationId);
        if (!cancelled) {
          setThread(nextThread);
          await markConversationRead(selectedConversationId);
        }
      } catch {
        if (!cancelled) toast.error("Failed to load conversation");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectedConversationId, viewMode]);

  useEffect(() => {
    if (scrollRef.current && viewMode === "chat") {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread?.messages, viewMode]);

  const handleSendMessage = () => {
    if (!selectedConversationId || !messageDraft.trim()) return;

    startTransition(async () => {
      const result = await sendConversationMessage({
        conversationId: selectedConversationId,
        content: messageDraft,
        replyToMessageId: replyToMessage?.id,
      });

      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }

      const nextThread = await getConversationThread(selectedConversationId);
      setThread(nextThread);
      setMessageDraft("");
      setReplyToMessage(null);
      router.refresh();
    });
  };

  const handleReviewMentorship = (
    connectionId: string,
    status: "endorsed" | "rejected",
  ) => {
    startTransition(async () => {
      const result = await reviewMentorshipConnection({
        connectionId,
        status,
        notes: reviewNotes,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(result.success);
      setReviewNotes("");
      router.refresh();
    });
  };

  const currentChatLabel = useMemo(() => {
    if (!thread) return "Select Chat";
    if (thread.title) return thread.title;
    const other = thread.participants.find((p: any) => p.name !== "Operator");
    return other?.name || "Direct Message";
  }, [thread]);

  const filteredDMs = initialData.directConversations.filter(
    (c: { counterparty: { name: string } }) =>
      c.counterparty?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex h-[calc(100vh-180px)] min-h-[600px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      {/* PANE 1: NAVIGATION */}
      <aside className="w-64 shrink-0 flex flex-col border-r border-slate-100 bg-slate-50/50">
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 rounded-xl bg-white border-slate-200 text-xs focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <h3 className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Operations
            </h3>
            <button
              onClick={() => setViewMode("mentorship_queue")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === "mentorship_queue"
                  ? "bg-amber-100 text-amber-700 shadow-sm"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              <Handshake className="h-4 w-4" />
              <span>Mentorship Queue</span>
              {summary.pendingMentorships.length > 0 && (
                <Badge className="ml-auto bg-amber-500 h-5 min-w-5 flex items-center justify-center p-0 rounded-full">
                  {summary.pendingMentorships.length}
                </Badge>
              )}
            </button>
            <button
              onClick={() => setViewMode("announcements")}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === "announcements"
                  ? "bg-emerald-100 text-emerald-700 shadow-sm"
                  : "hover:bg-slate-100 text-slate-600"
              }`}
            >
              <Megaphone className="h-4 w-4" />
              <span>Announcements</span>
            </button>
          </div>

          {/* Support Channels */}
          <div className="pt-2">
            <h3 className="mb-1 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <Headphones className="h-3 w-3 inline mr-1" /> Support
            </h3>
            <div className="space-y-0.5 ml-1 border-l-2 border-slate-100 pl-2">
              {initialData.operatorRooms.map((room: any) => {
                const isActive = room.id === selectedConversationId && viewMode === "chat";
                return (
                  <button
                    key={room.id}
                    onClick={() => {
                      setSelectedConversationId(room.id);
                      setViewMode("chat");
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-emerald-100 text-emerald-900 border-l-[3px] border-emerald-500 -ml-[1px]"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <Headphones className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate text-xs font-semibold">{room.title}</span>
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

          <div className="pt-2">
            <h3 className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Direct Messages
            </h3>
            <div className="space-y-0.5">
              {filteredDMs.map((dm: any) => (
                <button
                  key={dm.id}
                  onClick={() => {
                    setSelectedConversationId(dm.id);
                    setViewMode("chat");
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all ${
                    selectedConversationId === dm.id && viewMode === "chat"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20"
                      : "hover:bg-slate-100 text-slate-600"
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-[10px] ${
                      selectedConversationId === dm.id && viewMode === "chat"
                        ? "bg-white/20"
                        : "bg-slate-200"
                    }`}
                  >
                    {dm.counterparty?.name.charAt(0)}
                  </div>
                  <div className="flex-1 text-left truncate">
                    <p className="font-bold">{dm.counterparty?.name}</p>
                    <p
                      className={`text-[10px] truncate ${selectedConversationId === dm.id && viewMode === "chat" ? "text-white/70" : "text-slate-400"}`}
                    >
                      {dm.lastMessage || "No messages yet"}
                    </p>
                  </div>
                  {dm.hasUnread && (
                    <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* PANE 2: MIDDLE DECK */}
      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {viewMode === "chat" ? (
          <>
            <header className="h-16 border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <Headphones className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    {currentChatLabel}
                  </h2>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    Direct Message
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Search className="h-4 w-4 text-slate-400" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <MoreVertical className="h-4 w-4 text-slate-400" />
                </Button>
              </div>
            </header>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6"
            >
              {thread?.messages?.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-50">
                  <MessageSquareText className="h-12 w-12 text-slate-200" />
                  <p className="text-sm text-slate-400">
                    Walang mensahe rito. Magsimula ng usapan.
                  </p>
                </div>
              ) : (
                thread?.messages
                  ?.slice()
                  .reverse()
                  .map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`flex gap-4 ${msg.senderName === "Operator" ? "flex-row-reverse" : ""}`}
                    >
                      <div
                        className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center font-bold text-[10px] ${
                          msg.senderName === "Operator"
                            ? "bg-slate-900 text-white"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {msg.senderName.charAt(0)}
                      </div>
                      <div
                        className={`max-w-[70%] space-y-1 ${msg.senderName === "Operator" ? "items-end" : ""}`}
                      >
                        <div
                          className={`p-4 rounded-2xl text-sm leading-relaxed ${
                            msg.senderName === "Operator"
                              ? "bg-slate-900 text-white rounded-tr-none shadow-sm"
                              : "bg-slate-100 text-slate-800 rounded-tl-none"
                          }`}
                        >
                          {msg.content}
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <footer className="p-4 border-t border-slate-100">
              <div className="bg-slate-50 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all border border-slate-200 focus-within:border-emerald-500">
                <textarea
                  value={messageDraft}
                  onChange={(e) => setMessageDraft(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-transparent border-none focus:ring-0 text-sm p-2 min-h-[40px] max-h-[120px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <div className="flex items-center justify-between px-2 pb-1">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-slate-400 hover:text-emerald-600"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-slate-400 hover:text-emerald-600"
                    >
                      <SmilePlus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageDraft.trim() || isPending}
                    className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 text-xs font-bold"
                  >
                    {isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </footer>
          </>
        ) : viewMode === "mentorship_queue" ? (
          <div className="flex-1 flex flex-col min-h-0">
            <header className="h-16 border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-50 flex items-center justify-center">
                  <Handshake className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Mentorship Operations
                  </h2>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    Endorsement Queue
                  </p>
                </div>
              </div>
            </header>
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-3xl mx-auto space-y-4">
                {summary.pendingMentorships.length === 0 ? (
                  <div className="p-12 text-center space-y-4">
                    <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-10 w-10 text-slate-200" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium italic">
                      All mentorship requests are cleared!
                    </p>
                  </div>
                ) : (
                  summary.pendingMentorships.map((req: any) => (
                    <div
                      key={req.id}
                      className="p-5 rounded-3xl border border-slate-100 bg-slate-50/50 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-white rounded-xl shadow-sm text-[10px] font-bold flex items-center justify-center">
                            {req.requesterName.charAt(0)}
                            {req.mentorName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {req.requesterName} & {req.mentorName}
                            </p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                              Request ID: #{req.id}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none">
                          Pending Endorsement
                        </Badge>
                      </div>
                      <div className="bg-white p-4 rounded-2xl border border-slate-100 space-y-2">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                          Focus Area
                        </p>
                        <p className="text-sm text-slate-700">
                          {req.focusArea || "General Support"}
                        </p>
                      </div>
                      <textarea
                        placeholder="Optional staff notes for this endorsement..."
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs min-h-[80px]"
                      />
                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={() =>
                            handleReviewMentorship(req.id, "endorsed")
                          }
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 font-bold text-xs"
                        >
                          Endorse Connection
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() =>
                            handleReviewMentorship(req.id, "rejected")
                          }
                          className="flex-1 border-rose-100 text-rose-600 hover:bg-rose-50 rounded-xl h-10 font-bold text-xs"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <header className="h-16 border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <Megaphone className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Send Member Announcement
                  </h2>
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    Broadcast to all members
                  </p>
                </div>
              </div>
            </header>
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="p-6 rounded-3xl border border-slate-100 bg-white shadow-sm space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                    <input
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                      placeholder="e.g., Important Update on Loan Applications"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Message</label>
                    <textarea
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                      placeholder="Write your announcement message here..."
                      rows={6}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                    />
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <span>
                      This announcement will be sent as an in-app notification to <strong>all active members</strong> of your cooperative. They cannot reply to this broadcast.
                    </span>
                  </div>
                  <Button
                    onClick={handleSendAnnouncement}
                    disabled={isPostingAnnouncement || !newAnnouncement.title.trim() || !newAnnouncement.content.trim()}
                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 text-sm"
                  >
                    {isPostingAnnouncement ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Megaphone className="h-4 w-4 mr-2" />
                    )}
                    {isPostingAnnouncement ? "Sending..." : "Send Announcement to All Members"}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </main>

      {/* PANE 3: INTELLIGENCE PANEL */}
      <aside className="w-80 shrink-0 border-l border-slate-100 bg-slate-50/30 flex flex-col">
        <header className="h-16 px-6 flex items-center border-b border-slate-100 shrink-0">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Context Panel
          </h3>
        </header>

        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            {thread && viewMode === "chat" ? (
              (() => {
                const otherParticipant = thread.participants?.find(
                  (p: any) => p.name !== "Operator" && p.role !== "operator" && p.role !== "superadmin"
                );
                const displayName = otherParticipant?.name || currentChatLabel;
                const displayRole = otherParticipant?.role || "member";
                const firstMessage = thread.messages?.[thread.messages.length - 1];
                return (
                  <>
                    <div className="text-center space-y-4">
                      <div className="h-24 w-24 rounded-3xl bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center text-3xl font-bold mx-auto border-4 border-emerald-50 overflow-hidden">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">
                          {displayName}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium capitalize">
                          {displayRole}
                        </p>
                      </div>
                      <div className="flex justify-center gap-2">
                        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none px-3 font-bold">
                          ACTIVE
                        </Badge>
                        <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 border-none px-3 font-bold">
                          {displayRole === "member" ? "MEMBER" : displayRole.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        Conversation Info
                      </h5>
                      <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3">
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Type</span>
                          <span className="text-[10px] font-bold text-slate-900 uppercase">
                            {thread.type === "direct" ? "Direct Message" : thread.type === "operator_room" ? "Support Room" : "Group"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Messages</span>
                          <span className="text-[10px] font-bold text-slate-900">{thread.messages?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Participants</span>
                          <span className="text-[10px] font-bold text-slate-900">{thread.participants?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Last Active</span>
                          <span className="text-[10px] font-bold text-slate-900">
                            {firstMessage
                              ? new Date(firstMessage.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" })
                              : "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        variant="outline"
                        className="w-full rounded-xl border-slate-200 text-xs font-bold text-slate-600 h-10 hover:bg-slate-100"
                        onClick={() => setViewMode("mentorship_queue")}
                      >
                        View Mentorship Queue
                      </Button>
                    </div>
                  </>
                );
              })()
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 pt-12 grayscale opacity-40">
                <ShieldCheck className="h-16 w-16 text-slate-200" />
                <p className="text-xs font-medium text-slate-500 max-w-[160px]">
                  Select a session to view staff intelligence and member
                  context.
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>
    </div>
  );
}
