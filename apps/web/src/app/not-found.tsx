import Link from "next/link";

import { ArrowRightIcon, InfoIcon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] grid-lines"
        aria-hidden
      />

      <section className="relative mx-auto grid w-full max-w-md place-items-center px-5 pb-16 pt-16 sm:px-8 sm:pt-24">
        <div className="card w-full animate-fade-up p-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-monad-500/30 bg-monad-500/10 text-monad-200">
            <InfoIcon className="h-5 w-5" />
          </span>

          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
            404
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">
            This page is not on Monad
          </h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">
            The link may be mistyped. If you were opening an invoice, scan the QR
            again or ask the merchant for a fresh payment link.
          </p>

          <div className="mt-5 grid gap-2">
            <Link href="/merchant" className="btn-primary py-3 text-sm">
              Create a payment
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link href="/" className="btn-ghost py-2.5 text-xs">
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
