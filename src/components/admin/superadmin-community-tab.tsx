"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Megaphone,
  MessageSquareText,
  Send,
  Loader2,
  Radio,
  Users,
  Building2,
  ChevronUp,
} from "lucide-react";
import {
  getPlatformAnnouncements,
  createPlatformAnnouncement,
  publishPlatformAnnouncement,
  broadcastPlatformMessage,
} from "@/actions/superadmin-actions";

type ViewMode = "announcements" | "all-operators" | "tenant-operator";

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

export function SuperadminCommunityTab() {
  const [viewMode, setViewMode] = useState<ViewMode>("all-operators");
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [thread, setThread] = useState<any>(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isLoadingThread, setIsLoadingThread] = useState(false);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    targetAudience: "all" as "all" | "admins" | "lenders" | "members",
    priority: "normal" as "low" | "normal" | "high" | "urgent",
  });

  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastTarget, setBroadcastTarget] = useState("all");
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    loadAnnouncements();
  }, []);

  const loadConversations = async () => {
    try {
      const { getAllTenantConversations } = await import(
        "@/actions/superadmin-actions"
      );
      const result = await getAllTenantConversations();
      if (result.success && result.data) {
        const convs = result.data;
        const withPreviews = await Promise.all(
          convs.map(async (c: any) => {
            try {
              const { getConversationThread } = await import(
                "@/actions/community-actions"
              );
              const threadData = await getConversationThread(c.id, {
                take: 1,
              });
              return {
                ...c,
                lastMessage: threadData?.messages?.[0] || null,
                hasUnread: false,
              };
            } catch {
              return { ...c, lastMessage: null, hasUnread: false };
            }
          }),
        );
        setConversations(withPreviews);
        if (withPreviews.length > 0) {
          setSelectedConvId(withPreviews[0].id);
        }
      }
    } catch {
      // silent
    }
  };

  const loadAnnouncements = async () => {
    const result = await getPlatformAnnouncements();
    if (result.success) {
      setAnnouncements(result.data || []);
    }
  };

  useEffect(() => {
    if (!selectedConvId || viewMode !== "tenant-operator") {
      setThread(null);
      setHasOlderMessages(false);
      return;
    }

    let cancelled = false;

    const fetchThread = async () => {
      setIsLoadingThread(true);
      try {
        const { getConversationThread, markConversationRead } = await import(
          "@/actions/community-actions"
        );
        const nextThread = await getConversationThread(selectedConvId);
        if (!cancelled) {
          setThread(nextThread);
          setHasOlderMessages((nextThread.messages?.length || 0) >= 30);
        }
        await markConversationRead(selectedConvId);
      } catch {
        if (!cancelled) {
          toast.error("Failed to load conversation");
        }
      } finally {
        if (!cancelled) setIsLoadingThread(false);
      }
    };

    fetchThread();

    const interval = setInterval(fetchThread, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [selectedConvId, viewMode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread?.messages]);

  const activeLabel = useMemo(() => {
    if (viewMode === "announcements") return "Announcements";
    if (viewMode === "all-operators") return "All Operators";
    if (viewMode === "tenant-operator") {
      if (thread?.title) return thread.title;
      const conv = conversations.find((c: any) => c.id === selectedConvId);
      return conv?.title || "Operator Chat";
    }
    return "Community";
  }, [viewMode, thread, conversations, selectedConvId]);

  const selectedConvDetails = useMemo(() => {
    if (viewMode !== "tenant-operator" || !selectedConvId) return null;
    return conversations.find((c: any) => c.id === selectedConvId) || null;
  }, [viewMode, selectedConvId, conversations]);

  const handleLoadOlder = async () => {
    if (!selectedConvId || !thread?.messages?.length) return;
    const oldestMessage = thread.messages[thread.messages.length - 1];
    try {
      const { getConversationThread } = await import(
        "@/actions/community-actions"
      );
      const olderThread = await getConversationThread(selectedConvId, {
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
    } catch {
      toast.error("Failed to load older messages");
    }
  };

  const handleSendMessage = async () => {
    if (!selectedConvId || !messageDraft.trim()) return;
    setIsSending(true);
    try {
      const { sendConversationMessage, getConversationThread } = await import(
        "@/actions/community-actions"
      );
      const result = await sendConversationMessage({
        conversationId: selectedConvId,
        content: messageDraft,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      const nextThread = await getConversationThread(selectedConvId);
      setThread(nextThread);
      setHasOlderMessages((nextThread.messages?.length || 0) >= 30);
      setMessageDraft("");
    } catch {
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
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
      const ann = announcements.find((a: any) => a.id === id);
      if (ann) {
        const broadcastRes = await broadcastPlatformMessage({
          subject: ann.title,
          message: ann.content,
          targetAudience: ann.target_audience || "all",
          channels: ["in_app"],
        });
        if (broadcastRes.success) {
          toast.success(
            `Announcement published & sent to ${broadcastRes.data?.recipientCount || 0} users`,
          );
        } else {
          toast.success("Announcement published (notification broadcast skipped)");
        }
      }
      loadAnnouncements();
    } else {
      toast.error(result.error || "Failed to publish");
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastSubject.trim() || !broadcastMessage.trim()) {
      toast.error("Please provide both subject and message");
      return;
    }
    setIsBroadcasting(true);
    try {
      const result = await broadcastPlatformMessage({
        subject: broadcastSubject,
        message: broadcastMessage,
        targetAudience:
          broadcastTarget === "all"
            ? "all"
            : broadcastTarget === "admins"
              ? "admins"
              : "members",
        channels: ["in_app", "email"],
      });
      if (result.success) {
        toast.success(
          `Broadcast sent to ${result.data?.recipientCount || 0} operators`,
        );
        setBroadcastSubject("");
        setBroadcastMessage("");
      } else {
        toast.error(result.error || "Failed to broadcast");
      }
    } catch {
      toast.error("Failed to send broadcast");
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] max-h-[860px] gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Left Pane */}
      <aside className="flex w-[280px] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
          <h2 className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Superadmin
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 p-3">
          {/* Platform Channels */}
          <div>
            <h3 className="mb-1 flex items-center gap-1.5 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <Radio className="h-3 w-3" /> Platform Channels
            </h3>
            <div className="space-y-0.5 ml-1 border-l-2 border-slate-100 pl-2">
              <button
                onClick={() => {
                  setViewMode("announcements");
                  setSelectedConvId(null);
                  setThread(null);
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  viewMode === "announcements"
                    ? "bg-amber-100 text-amber-900 border-l-[3px] border-amber-500 -ml-[1px]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Megaphone className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate text-xs font-semibold">
                  Announcements
                </span>
              </button>

              <button
                onClick={() => {
                  setViewMode("all-operators");
                  setSelectedConvId(null);
                  setThread(null);
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  viewMode === "all-operators"
                    ? "bg-emerald-100 text-emerald-900 border-l-[3px] border-emerald-500 -ml-[1px]"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Users className="h-4 w-4 shrink-0" />
                <span className="flex-1 truncate text-xs font-semibold">
                  All Operators
                </span>
              </button>
            </div>
          </div>

          {/* Tenant Operators */}
          <div>
            <h3 className="mb-1 flex items-center gap-1.5 px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <Building2 className="h-3 w-3" /> Tenant Operators
            </h3>
            <div className="space-y-0.5 ml-1 border-l-2 border-slate-100 pl-2">
              {conversations.length === 0 && (
                <p className="px-3 py-2 text-xs text-slate-400">
                  No operator conversations
                </p>
              )}
              {conversations.map((conv: any) => {
                const isActive =
                  viewMode === "tenant-operator" &&
                  conv.id === selectedConvId;
                return (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setViewMode("tenant-operator");
                      setSelectedConvId(conv.id);
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-indigo-100 text-indigo-900 border-l-[3px] border-indigo-500 -ml-[1px]"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600">
                      {(conv.title || "?").charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="block truncate text-xs font-semibold">
                        {conv.title}
                      </span>
                      {conv.lastMessage && (
                        <span className="block truncate text-[10px] text-slate-400 mt-0.5">
                          {conv.lastMessage.content}
                        </span>
                      )}
                    </div>
                    {conv.hasUnread && (
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-indigo-500" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* Middle Pane */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 shrink-0">
          <h2 className="text-sm font-bold text-slate-900">{activeLabel}</h2>
          {viewMode === "tenant-operator" && thread && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              {thread.type === "operator_room"
                ? "operator room"
                : "conversation"}
            </span>
          )}
        </div>

        {/* Announcements List */}
        {viewMode === "announcements" && (
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {announcements.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-slate-400">No announcements yet</p>
              </div>
            ) : (
              announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="px-5 py-4 space-y-2 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900">
                      {ann.title}
                    </h4>
                    {getPriorityBadge(ann.priority)}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {ann.content}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                      Target: {ann.target_audience} &bull;{" "}
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
        )}

        {/* All Operators Broadcast */}
        {viewMode === "all-operators" && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
            <div className="max-w-lg w-full space-y-5">
              <div className="text-center">
                <Users className="h-10 w-10 mx-auto text-emerald-500 mb-3" />
                <h3 className="text-lg font-bold text-slate-900">
                  Broadcast to All Operators
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Send a platform-wide message to every operator across all
                  tenants.
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Subject
                </label>
                <Input
                  placeholder="e.g., Platform Update"
                  value={broadcastSubject}
                  onChange={(e) => setBroadcastSubject(e.target.value)}
                  className="rounded-xl border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Message
                </label>
                <textarea
                  className="w-full min-h-[140px] rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                  placeholder="Write your broadcast message..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Target Audience
                </label>
                <Select
                  value={broadcastTarget}
                  onValueChange={(v) => setBroadcastTarget(v)}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="admins">Admins & Operators</SelectItem>
                    <SelectItem value="members">Members Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 h-11"
                onClick={handleBroadcast}
                disabled={isBroadcasting}
              >
                {isBroadcasting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Broadcasting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Broadcast
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Tenant Operator Chat */}
        {viewMode === "tenant-operator" &&
          (!selectedConvId || !thread ? (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500 m-4">
              {isLoadingThread
                ? "Loading conversation..."
                : "Select an operator conversation to view the thread."}
            </div>
          ) : (
            <>
              {hasOlderMessages && (
                <div className="px-4 pt-3 shrink-0">
                  <Button
                    variant="outline"
                    className="rounded-xl w-full text-xs"
                    onClick={handleLoadOlder}
                  >
                    <ChevronUp className="mr-2 h-4 w-4" />
                    Load older messages
                  </Button>
                </div>
              )}

              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto space-y-4 px-5 py-4"
              >
                {thread.messages.length === 0 ? (
                  <p className="w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
                    No messages here yet. Start the conversation.
                  </p>
                ) : (
                  thread.messages
                    .slice()
                    .reverse()
                    .map((message: any, idx: number) => (
                      <div key={message.id || idx} className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700 mt-0.5">
                          {message.senderName?.substring(0, 2).toUpperCase() ||
                            "UN"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900">
                              {message.senderName || "Unknown"}
                            </p>
                            <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400 ml-auto">
                              {new Date(
                                message.createdAt,
                              ).toLocaleTimeString("en-PH", {
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700 break-words mt-0.5">
                            {message.content}
                          </p>
                          {message.attachments?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {message.attachments.map((file: any) => (
                                <a
                                  key={file.id}
                                  href={file.fileUrl}
                                  target="_blank"
                                  className="flex max-w-[200px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50"
                                >
                                  <MessageSquareText className="h-4 w-4 shrink-0 text-indigo-600" />
                                  <span className="truncate">
                                    {file.fileName}
                                  </span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>

              <div className="border-t border-slate-100 p-4">
                <div className="flex items-end gap-2">
                  <textarea
                    value={messageDraft}
                    onChange={(e) => setMessageDraft(e.target.value)}
                    placeholder="Type your message..."
                    className="max-h-32 min-h-10 w-full flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    rows={1}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    className="h-10 shrink-0 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700"
                    onClick={handleSendMessage}
                    disabled={isSending || !messageDraft.trim()}
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ))}
      </div>

      {/* Right Pane - Context Panel */}
      <aside className="flex w-[280px] shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-slate-50">
        {viewMode === "announcements" && (
          <div className="flex flex-col h-full">
            <div className="border-b border-slate-200 px-5 py-3">
              <h3 className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 flex items-center gap-2">
                <Megaphone className="h-3.5 w-3.5 text-amber-500" />
                New Announcement
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Title
                </label>
                <Input
                  placeholder="e.g., System Maintenance"
                  value={newAnnouncement.title}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      title: e.target.value,
                    })
                  }
                  className="rounded-xl border-slate-200 h-9 text-xs"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Content
                </label>
                <textarea
                  className="w-full min-h-[100px] rounded-xl border border-slate-200 p-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                  placeholder="Write announcement body..."
                  value={newAnnouncement.content}
                  onChange={(e) =>
                    setNewAnnouncement({
                      ...newAnnouncement,
                      content: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
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
                  <SelectTrigger className="rounded-xl h-9 text-xs">
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
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
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
                  <SelectTrigger className="rounded-xl h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full rounded-xl bg-amber-600 text-white hover:bg-amber-700 text-xs h-9"
                onClick={handleCreateAnnouncement}
                disabled={isPosting}
              >
                {isPosting ? "Drafting..." : "Post Draft"}
              </Button>
            </div>
          </div>
        )}

        {viewMode === "all-operators" && (
          <div className="p-5">
            <h3 className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 flex items-center gap-2 mb-4">
              <Users className="h-3.5 w-3.5 text-emerald-500" />
              Broadcast Info
            </h3>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Messages sent through this channel will be broadcast to all
                operators and admins across every tenant cooperative.
              </p>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="font-bold text-slate-900 text-[10px] uppercase tracking-wider mb-1">
                  Delivery Methods
                </p>
                <ul className="space-y-1 text-slate-500">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    In-app notification
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                    Email notification
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {viewMode === "tenant-operator" && selectedConvDetails && (
          <div className="p-5">
            <h3 className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 flex items-center gap-2 mb-4">
              <Building2 className="h-3.5 w-3.5 text-indigo-500" />
              Operator Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">
                  {(selectedConvDetails.title || "?").charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {selectedConvDetails.title || "Operator Room"}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Operator Room
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
                <div className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Messages
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {selectedConvDetails.messageCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between px-3 py-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Last Activity
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {selectedConvDetails.updatedAt
                      ? new Date(
                          selectedConvDetails.updatedAt,
                        ).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                        })
                      : "N/A"}
                  </span>
                </div>
              </div>

              {thread?.participants?.length > 0 && (
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400 mb-2">
                    Participants ({thread.participants.length})
                  </h4>
                  <div className="space-y-2">
                    {thread.participants.map((p: any) => (
                      <div
                        key={p.userId}
                        className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 border border-slate-100"
                      >
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[9px] font-bold text-slate-600">
                          {(p.name || "?").charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {p.name}
                          </p>
                          {p.role && (
                            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                              {p.role}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
