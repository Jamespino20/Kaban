"use client";

import { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Megaphone,
  MessageSquareText,
  Send,
  User,
} from "lucide-react";
import {
  getPlatformAnnouncements,
  createPlatformAnnouncement,
  publishPlatformAnnouncement,
} from "@/actions/superadmin-actions";

export function SuperadminCommunityTab() {
  return (
    <Tabs defaultValue="announcements" className="space-y-4">
      <TabsList className="inline-flex h-auto rounded-2xl bg-slate-100 p-1">
        <TabsTrigger
          value="announcements"
          className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm px-5 py-2 text-sm font-bold"
        >
          <Megaphone className="h-4 w-4 mr-2" />
          Announcements
        </TabsTrigger>
        <TabsTrigger
          value="chat"
          className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm px-5 py-2 text-sm font-bold"
        >
          <MessageSquareText className="h-4 w-4 mr-2" />
          Chat with Operators
        </TabsTrigger>
      </TabsList>

      <TabsContent value="announcements" className="outline-none">
        <AnnouncementsPanel />
      </TabsContent>

      <TabsContent value="chat" className="outline-none">
        <ChatPanel />
      </TabsContent>
    </Tabs>
  );
}

function AnnouncementsPanel() {
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
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.5fr]">
      <Card className="rounded-[1.75rem] border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-emerald-500" />
            New Announcement
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
            <Input
              placeholder="e.g., System Maintenance Schedule"
              value={newAnnouncement.title}
              onChange={(e) =>
                setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Content</label>
            <textarea
              className="w-full min-h-[120px] p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              placeholder="Write the announcement body..."
              value={newAnnouncement.content}
              onChange={(e) =>
                setNewAnnouncement({ ...newAnnouncement, content: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Audience</label>
              <Select
                value={newAnnouncement.targetAudience}
                onValueChange={(v) =>
                  setNewAnnouncement({ ...newAnnouncement, targetAudience: v as any })
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
              <label className="text-xs font-bold text-slate-500 uppercase">Priority</label>
              <Select
                value={newAnnouncement.priority}
                onValueChange={(v) =>
                  setNewAnnouncement({ ...newAnnouncement, priority: v as any })
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
                    <h4 className="font-bold text-slate-900">{ann.title}</h4>
                    {getPriorityBadge(ann.priority)}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2">{ann.content}</p>
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
    </div>
  );
}

function ChatPanel() {
  const [messages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    toast.info("Chat system coming soon");
    setInput("");
  };

  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-[600px]">
      <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <MessageSquareText className="w-4 h-4 text-emerald-500" />
          Tenant Operator Conversations
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Direct messages with tenant operators across all cooperatives
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageSquareText className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No conversations yet</p>
            <p className="text-slate-400 text-sm mt-1">
              Messages from tenant operators will appear here
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200">
                <User className="h-4 w-4 text-slate-500" />
              </div>
              <div className="rounded-2xl bg-slate-100 px-4 py-2 max-w-[70%]">
                <p className="text-sm text-slate-700">{msg.text}</p>
                <p className="text-[10px] text-slate-400 mt-1">{msg.time}</p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-slate-100 p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message to tenant operators..."
            className="rounded-xl"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <Button
            className="rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            onClick={handleSend}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
