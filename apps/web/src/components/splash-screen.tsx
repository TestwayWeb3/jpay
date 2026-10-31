"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { JPayMark } from "@/components/jpay-mark";
import { cn } from "@/lib/cn";

const SPLASH_LOGO_MS = 800;
const SPLASH_HOLD_MS = 1500;
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

    const fadeTimer = setTimeout(
      () => setFading(true),
      SPLASH_LOGO_MS + SPLASH_HOLD_MS,
    );
    const hideTimer = setTimeout(
      () => setVisible(false),
      SPLASH_LOGO_MS + SPLASH_HOLD_MS + SPLASH_FADE_MS,
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
        "fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-background transition-opacity duration-500 ease-out",
        fading && "pointer-events-none opacity-0",
      )}
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_45%_at_50%_45%,rgba(110,84,255,0.22),transparent_70%)]" />
      <div className="relative flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-40 w-40 rounded-full bg-monad/30 blur-3xl animate-splash-glow" />
          <JPayMark className="relative h-28 w-28 animate-splash-logo" />
        </div>
        <span className="animate-splash-text text-2xl font-semibold tracking-tight text-white">
          JPay
        </span>
        <div className="flex items-center gap-2" aria-hidden="true">
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className="h-1.5 w-1.5 rounded-full bg-monad-300 animate-splash-dot"
              style={{ animationDelay: `${index * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
