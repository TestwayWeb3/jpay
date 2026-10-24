import type { Metadata } from "next";
import Link from "next/link";

import {
  ArrowRightIcon,
  BoltIcon,
  ExternalLinkIcon,
  InfoIcon,
  ShieldIcon,
} from "@/components/icons";
import { MerchantPaymentCard } from "@/components/merchant-payment-card";
import { Badge } from "@/components/ui/badge";
import { explorerAddressUrl, monadTestnet } from "@/config/chains";
import { DEMO_PRESET } from "@/config/demo";
import { jpayPaymentAddress } from "@/lib/contracts/jpay-payment";
import { shortenAddress } from "@/lib/format";

export const metadata: Metadata = {
  title: "Merchant",
  description:
    "Create a MON payment invoice for your Yogyakarta storefront, share the QR, and get paid instantly on Monad.",
};

const steps = [
  {
    step: "01",
    title: "Set the amount",
    body: "Enter the price in MON and a short description — that becomes the invoice.",
  },
  {
    step: "02",
    title: "Show the QR",
    body: "The customer scans it or opens the link. No app install, no account.",
  },
  {
    step: "03",
    title: "Get paid instantly",
    body: "MON lands straight in your wallet, confirmed on Monad in about a second.",
  },
];

type MerchantPageProps = {
  searchParams?: {
    amount?: string | string[];
    description?: string | string[];
    demo?: string | string[];
  };
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function MerchantPage({ searchParams }: MerchantPageProps) {
  const demoMode = searchParams?.demo === "1";
  const initialAmount =
    firstValue(searchParams?.amount) ?? (demoMode ? DEMO_PRESET.amount : "");
  const initialDescription =
    firstValue(searchParams?.description) ??
    (demoMode ? DEMO_PRESET.description : "");

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] grid-lines"
        aria-hidden
      />

      <section className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-12 sm:px-8 lg:pt-16">
        <div className="max-w-2xl animate-fade-up">
          <div className="flex flex-wrap items-center gap-3">
            <span className="pill">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-monad-400" />
              Merchant console
            </span>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-xs font-medium text-muted transition hover:text-foreground"
            >
              View dashboard
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            Turn every phone into a{" "}
            <span className="text-gradient">checkout.</span>
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
            Create a MON invoice for your Yogyakarta storefront, show the QR,
            and the money is in your wallet before the customer puts their phone
            down. Non-custodial by design.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,27rem)_minmax(0,1fr)] lg:items-start">
          <div className="animate-fade-up">
            {demoMode ? (
              <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-monad-500/25 bg-monad-500/[0.07] px-3 py-2">
                <Badge tone="monad">
                  <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-monad-300" />
                  Demo mode
                </Badge>
                <p className="text-[11px] leading-relaxed text-muted">
                  Preset loaded. You can still edit the amount or description
                  before creating the invoice.
                </p>
              </div>
            ) : null}

            <MerchantPaymentCard
              key={`${initialAmount}|${initialDescription}|${demoMode}`}
              initialAmount={initialAmount}
              initialDescription={initialDescription}
              demoMode={demoMode}
            />
            <p className="mt-3 text-center text-[11px] text-muted">
              Payments settle directly to your wallet — JPay never holds funds.
            </p>
          </div>

          <aside className="space-y-4 animate-fade-up">
            <article className="card p-5 sm:p-6">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl border border-monad-500/25 bg-monad-500/10 text-monad-200">
                  <BoltIcon className="h-4 w-4" />
                </span>
                <h2 className="text-sm font-semibold tracking-tight">
                  How it works
                </h2>
              </div>

              <ol className="mt-4 space-y-4">
                {steps.map((item) => (
                  <li key={item.step} className="flex gap-3">
                    <span className="mt-0.5 font-mono text-[11px] font-semibold text-monad-300">
                      {item.step}
                    </span>
                    <div>
                      <p className="text-[13px] font-medium text-foreground">
                        {item.title}
                      </p>
                      <p className="mt-1 text-[12px] leading-relaxed text-muted">
                        {item.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </article>

            <article className="card p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold tracking-tight">
                  Settlement
                </h2>
                <span className="pill">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  {monadTestnet.name}
                </span>
              </div>

              <dl className="mt-4 space-y-3">
                <div>
                  <dt className="text-[11px] uppercase tracking-[0.12em] text-muted">
                    Contract
                  </dt>
                  <dd className="mt-1 flex items-center gap-2">
                    {jpayPaymentAddress ? (
                      <>
                        <span className="font-mono text-xs text-foreground">
                          {shortenAddress(jpayPaymentAddress, 6)}
                        </span>
                        <Link
                          href={explorerAddressUrl(
                            jpayPaymentAddress,
                            monadTestnet.id,
                          )}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-monad-300 hover:text-monad-200"
                        >
                          Explorer
                          <ExternalLinkIcon className="h-3 w-3" />
                        </Link>
                      </>
                    ) : (
                      <span className="text-xs text-amber-200">
                        Set NEXT_PUBLIC_JPAY_PAYMENT_ADDRESS
                      </span>
                    )}
                  </dd>
                </div>

                <div>
                  <dt className="text-[11px] uppercase tracking-[0.12em] text-muted">
                    Currency
                  </dt>
                  <dd className="mt-1 text-xs text-foreground">
                    Native MON — no bridge, no token approval
                  </dd>
                </div>

                <div>
                  <dt className="text-[11px] uppercase tracking-[0.12em] text-muted">
                    Custody
                  </dt>
                  <dd className="mt-1 flex items-center gap-1.5 text-xs text-foreground">
                    <ShieldIcon className="h-3.5 w-3.5 text-emerald-400" />
                    Funds go straight to your wallet
                  </dd>
                </div>
              </dl>

              <p className="mt-4 flex items-start gap-1.5 border-t border-white/[0.07] pt-3 text-[11px] leading-relaxed text-muted">
                <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                Testnet only for now. Switch your wallet to Monad Testnet before
                creating an invoice.
              </p>
            </article>
          </aside>
        </div>
      </section>
    </div>
  );
}
