"use client";

import Link from "next/link";
import { useEffect } from "react";

import { ArrowRightIcon, InfoIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Keep the console useful during the demo without exposing internals in the UI.
    console.error(error);
  }, [error]);

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] grid-lines"
        aria-hidden
      />

      <section className="relative mx-auto grid w-full max-w-md place-items-center px-5 pb-16 pt-16 sm:px-8 sm:pt-24">
        <div className="card w-full animate-fade-up p-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-rose-500/25 bg-rose-500/10 text-rose-200">
            <InfoIcon className="h-5 w-5" />
          </span>

          <h1 className="mt-4 text-xl font-semibold tracking-tight">
            Something went sideways
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">
            {siteConfig.name} hit an unexpected error. Your funds are untouched —
            every payment is signed by your own wallet.
          </p>

          <div className="mt-5 grid gap-2">
            <button
              type="button"
              onClick={reset}
              className="btn-primary py-3 text-sm"
            >
              Try again
            </button>
            <Link href="/" className="btn-ghost py-2.5 text-xs">
              Back to home
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          {error.digest ? (
            <p className="mt-4 font-mono text-[10px] text-muted/70">
              ref {error.digest}
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
