"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { JPayMark } from "@/components/jpay-mark";
import { cn } from "@/lib/cn";

const SPLASH_HOLD_MS = 1600;
const SPLASH_FADE_MS = 500;

export function SplashScreen() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);
  const [runId, setRunId] = useState(0);
  const previousPath = useRef(pathname);

  useEffect(() => {
    const changed = previousPath.current !== pathname;
    previousPath.current = pathname;

    if (!changed) return;

    const enteringDashboard =
      pathname === "/dashboard" || pathname.startsWith("/dashboard/");

    if (enteringDashboard) {
      setVisible(true);
      setFading(false);
      setRunId((id) => id + 1);
    }
  }, [pathname]);

  useEffect(() => {
    if (!visible) return;

    const fadeTimer = setTimeout(() => setFading(true), SPLASH_HOLD_MS);
    const hideTimer = setTimeout(
      () => setVisible(false),
      SPLASH_HOLD_MS + SPLASH_FADE_MS,
    );

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [runId, visible]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#23105B] transition-opacity duration-500",
        fading && "pointer-events-none opacity-0",
      )}
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,rgba(110,84,255,0.55),transparent_70%)]" />
      <div className="relative flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-32 w-32 rounded-full bg-monad/50 blur-2xl animate-splash-glow" />
          <JPayMark className="relative h-24 w-24 animate-splash-logo" />
        </div>
        <span className="animate-splash-text text-2xl font-semibold tracking-tight text-white">
          JPay
        </span>
      </div>
    </div>
  );
}
