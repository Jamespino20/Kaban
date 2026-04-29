"use client";

import { useEffect, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";

const IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes

export function IdleSessionTimer() {
  const { data: session } = useSession();

  const handleSignOut = useCallback(() => {
    if (session) {
      signOut({ callbackUrl: "/auth/login?reason=idle" });
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleSignOut, IDLE_TIMEOUT);
    };

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
      clearTimeout(timeoutId);
    };
  }, [session, handleSignOut]);

  return null;
}
