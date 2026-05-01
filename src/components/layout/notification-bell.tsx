"use client";

import { useState, useEffect, useTransition } from "react";
import { Bell, CheckSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/actions/notifications";
import { toast } from "sonner";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fetchNotifications = async () => {
    const [notifsData, countData] = await Promise.all([
      getUserNotifications(),
      getUnreadNotificationCount(),
    ]);

    if (notifsData.data) {
      setNotifications(notifsData.data);
    }
    if (countData.count !== undefined) {
      setUnreadCount(countData.count);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // In a real app we might use websockets or SWR. Using a simple poll here if needed,
    // or just fetch on mount is fine for Phase 7 implementation.
    const interval = setInterval(() => {
      fetchNotifications();
    }, 60000); // Polling every minute

    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = (id: string, redirectUrl?: string | null) => {
    startTransition(async () => {
      const res = await markNotificationAsRead(id);
      if (res?.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      // If there's an actionURL, we close modal and let Next's Link or normal navigation handle it if wrapped.
      // Easiest is just window.location if actionUrl exists and user clicks the card
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    });
  };

  const handleMarkAllAsRead = () => {
    startTransition(async () => {
      const res = await markAllNotificationsAsRead();
      if (res?.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
        setUnreadCount(0);
        toast.success("All notifications marked as read.");
      }
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative size-10 rounded-full border border-slate-200/80 bg-white text-slate-700 shadow-sm transition-colors hover:border-primary/20 hover:bg-primary/8 hover:text-primary"
        >
          <Bell className="w-5 h-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-2 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border-2 border-white translate-x-1/2 -translate-y-1/2">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[380px] p-0 rounded-2xl shadow-xl overflow-hidden border-slate-100"
      >
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/50 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isPending}
              className="h-8 px-2 text-xs text-primary hover:bg-primary/10 hover:text-primary"
            >
              <CheckSquare className="w-3 h-3 mr-1" />
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-slate-400 gap-2">
              <Bell className="w-8 h-8 opacity-20" />
              <p className="text-sm font-medium">You have no notifications</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() =>
                    handleMarkAsRead(notification.id, notification.action_url)
                  }
                  className={`flex flex-col gap-1 p-4 border-b border-slate-50 cursor-pointer transition-colors ${
                    !notification.is_read
                      ? "bg-primary/8 hover:bg-primary/12"
                      : "bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm ${!notification.is_read ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}
                    >
                      {notification.title}
                    </p>
                    {!notification.is_read && (
                      <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {notification.body}
                  </p>
                  <span className="text-[10px] text-slate-400 font-medium mt-1">
                    {formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
