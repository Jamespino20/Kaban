"use client";

import { useEffect, useCallback, useState, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Timer } from "lucide-react";

const IDLE_TIMEOUT = 60 * 60 * 1000; // 1 hour
const WARNING_BEFORE = 60 * 1000; // 1 minute warning before timeout

export function IdleSessionTimer() {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // seconds
  const { data: session } = useSession();

  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: "/auth/login?reason=idle" });
  }, []);

  const resetTimer = useCallback(() => {
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    setShowWarning(false);

    if (session) {
      warningTimerRef.current = setTimeout(() => {
        setShowWarning(true);
        setTimeLeft(60);
        countdownRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              handleSignOut();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, IDLE_TIMEOUT - WARNING_BEFORE);

      logoutTimerRef.current = setTimeout(handleSignOut, IDLE_TIMEOUT);
    }
  }, [session, handleSignOut]);

  useEffect(() => {
    if (!session) return;

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    const handleEvent = () => {
      if (!showWarning) resetTimer();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleEvent);
    });

    resetTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleEvent);
      });
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [session, resetTimer, showWarning]);

  return (
    <Dialog
      open={showWarning}
      onOpenChange={(open) => {
        if (!open) resetTimer();
      }}
    >
      <DialogContent className="sm:max-w-md border-emerald-500/20 bg-white/95 backdrop-blur-xl">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Timer className="h-6 w-6 animate-pulse" />
          </div>
          <DialogTitle className="text-center text-xl font-bold text-slate-900">
            Babala: Inactivity sa Session
          </DialogTitle>
          <DialogDescription className="text-center text-slate-500">
            Ikaw ay naging inactive nang matagal. Para sa iyong seguridad, ikaw
            ay awtomatikong mag-lo-logout sa loob ng{" "}
            <span className="font-bold text-emerald-600">
              {timeLeft} segundo
            </span>
            .
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-slate-200"
            onClick={handleSignOut}
          >
            Mag-sign Out Na
          </Button>
          <Button
            type="button"
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            onClick={() => resetTimer()}
          >
            Manatiling Naka-login
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
