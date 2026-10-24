import type { Metadata } from "next";
import Link from "next/link";

import { ArrowRightIcon } from "@/components/icons";
import { MerchantDashboard } from "@/components/merchant-dashboard";
import { monadTestnet } from "@/config/chains";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Track every JPay invoice, its live onchain status, and what has settled to your wallet.",
};

export default function DashboardPage() {
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[26rem] grid-lines"
        aria-hidden
      />

      <section className="relative mx-auto w-full max-w-5xl px-5 pb-16 pt-12 sm:px-8 lg:pt-16">
        <div className="flex flex-wrap items-end justify-between gap-4 animate-fade-up">
          <div className="max-w-xl">
            <span className="pill">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
              Merchant dashboard
            </span>

            <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              Every invoice, <span className="text-gradient">live.</span>
            </h1>

            <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
              Read straight from the contract on {monadTestnet.name}. Status
              flips to paid the moment a customer settles — no polling the
              explorer needed.
            </p>
          </div>

          <Link href="/merchant" className="btn-primary px-4 py-2.5 text-sm">
            New payment
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 animate-fade-up">
          <MerchantDashboard />
        </div>
      </section>
    </div>
  );
}
