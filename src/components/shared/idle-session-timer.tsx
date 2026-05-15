"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { signOut } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

const MAX_IDLE_TIME = 15 * 60 * 1000; // 15 minutes
const WARNING_TIME = 60 * 1000; // 60 seconds

export function IdleSessionTimer() {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(WARNING_TIME / 1000);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = useCallback(() => {
    signOut({ callbackUrl: "/login" });
  }, []);

  const resetTimer = useCallback(() => {
    if (showWarning) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    
    timerRef.current = setTimeout(() => {
      setShowWarning(true);
    }, MAX_IDLE_TIME - WARNING_TIME);
  }, [showWarning]);

  useEffect(() => {
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    const handleEvent = () => resetTimer();

    events.forEach((event) => {
      window.addEventListener(event, handleEvent);
    });

    resetTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleEvent);
      });
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [resetTimer]);

  useEffect(() => {
    if (showWarning) {
      setTimeLeft(WARNING_TIME / 1000);
      countdownRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownRef.current) clearInterval(countdownRef.current);
    }

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [showWarning, handleLogout]);

  const staySignedIn = () => {
    setShowWarning(false);
    resetTimer();
  };

  return (
    <Dialog open={showWarning} onOpenChange={setShowWarning}>
      <DialogContent showCloseButton={false} className="max-w-[400px] rounded-3xl border-none shadow-2xl">
        <DialogHeader>
          <div className="mx-auto h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <ShieldAlert className="h-6 w-6 text-amber-600" />
          </div>
          <DialogTitle className="text-center font-bold text-xl">
            Seryoso, andyan ka pa ba?
          </DialogTitle>
          <DialogDescription className="text-center text-slate-500 pt-2">
            Mati-terminate ang iyong session sa loob ng{" "}
            <span className="font-bold text-slate-900">{timeLeft} segundo</span>{" "}
            dahil sa inactivity. Gusto mo bang manatiling naka-login?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="rounded-xl border-slate-200 h-11 font-bold text-slate-600 hover:bg-slate-50 flex-1"
          >
            I-logout Na
          </Button>
          <Button
            onClick={staySignedIn}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-11 font-bold flex-1 border-none"
          >
            Manatiling Naka-login
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
