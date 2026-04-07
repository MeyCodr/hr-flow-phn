"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { withBasePath } from "@/lib/base-path";

interface UseSessionManagerOptions {
  timeout?: number; // In milliseconds, default 1 hour
}

export default function useSessionManager({ timeout = 60 * 60 * 1000 }: UseSessionManagerOptions = {}) {
  const { data: session, status } = useSession();
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (!session && status === "unauthenticated") {
      setShowPopup(true); // Show popup immediately if session expired
    }

    let logoutTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(logoutTimer);
      logoutTimer = setTimeout(() => {
        setShowPopup(true);
      }, timeout);
    };

    // Reset timer on user activity
    const activityEvents = ["click", "keydown", "mousemove", "scroll"];
    activityEvents.forEach((event) => window.addEventListener(event, resetTimer));

    // Start initial timer
    resetTimer();

    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, resetTimer));
      clearTimeout(logoutTimer);
    };
  }, [session, status, timeout]);

  const handleClosePopup = () => {
    setShowPopup(false);
    signOut({ redirect: true, callbackUrl: withBasePath("/login") });
  };

  return {
    session,
    showPopup,
    handleClosePopup,
  };
}
