import type { Metadata } from "next";
import Link from "next/link";

import {
  ArrowRightIcon,
  BoltIcon,
  CheckIcon,
  ShieldIcon,
  SparkIcon,
  WalletIcon,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/input";
import { DEMO_PRESET, DEMO_STEPS, demoMerchantHref } from "@/config/demo";

export const metadata: Metadata = {
  title: "Demo",
  description:
    "A guided 60-second JPay demo: create an invoice, pay it on Monad, and watch the merchant dashboard update live.",
};

const highlights = [
  {
    icon: ShieldIcon,
    title: "Non-custodial",
    body: "MON moves from the customer wallet directly to the merchant wallet. JPay never holds the funds.",
  },
  {
    icon: BoltIcon,
    title: "Live onchain state",
    body: "Every status, payer address, and total is read from the JPayPayment contract on Monad Testnet.",
  },
  {
    icon: SparkIcon,
    title: "Loyalty layer",
    body: "Each settled invoice earns 10 JPay points for the merchant — computed from onchain invoice data.",
  },
];

export default function DemoPage() {
  const merchantHref = demoMerchantHref();

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[30rem] grid-lines"
        aria-hidden
      />

      <section className="relative mx-auto w-full max-w-6xl px-5 pb-12 pt-12 sm:px-8 lg:pt-16">
        <div className="max-w-3xl animate-fade-up">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="monad">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-monad-300" />
              Monad Blitz demo mode
            </Badge>
            <Link
              href="/merchant"
              className="inline-flex items-center gap-1 text-xs font-medium text-muted transition hover:text-foreground"
            >
              Start without the preset
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            Record the <span className="text-gradient">60-second story.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            Pay with crypto at any local merchant in Yogyakarta using Monad.
            This page preloads a 1 MON invoice so the presenter can focus on the
            product, not on typing.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href={merchantHref} className={buttonStyles({ size: "lg" })}>
              Open prefilled merchant
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard"
              className={buttonStyles({ variant: "secondary", size: "lg" })}
            >
              Open dashboard
            </Link>
          </div>

          <p className="mt-3 text-[11px] text-muted">
            Tip: open the merchant page in one browser profile and the payment
            link in a second wallet/profile. The dashboard refreshes every 5s.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-5 px-5 pb-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <Card variant="glow" className="relative overflow-hidden p-5 sm:p-6">
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-monad-500/25 blur-3xl" />

          <div className="relative">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                  Demo preset
                </p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight">
                  Ready to record
                </h2>
              </div>
              <Badge tone="success">
                <CheckIcon className="h-3.5 w-3.5" />
                Prefilled
              </Badge>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Amount" htmlFor="demo-amount" hint="Native MON">
                <Input
                  id="demo-amount"
                  readOnly
                  value={`${DEMO_PRESET.amount} MON`}
                  className="font-medium"
                />
              </Field>
              <Field label="Description" htmlFor="demo-description" hint="Local merchant">
                <Input
                  id="demo-description"
                  readOnly
                  value={DEMO_PRESET.description}
                />
              </Field>
            </div>

            <div className="mt-4 rounded-xl border border-white/[0.07] bg-black/20 p-4">
              <p className="flex items-start gap-2 text-xs leading-relaxed text-muted">
                <WalletIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-monad-200" />
                On the merchant page, the same values are already in the form.
                Hit <span className="font-medium text-foreground">Create payment</span>,
                then scan the QR with a second wallet that holds testnet MON.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Link
                href={merchantHref}
                className={buttonStyles({ size: "sm", className: "px-3" })}
              >
                Launch demo invoice
                <ArrowRightIcon className="h-3.5 w-3.5" />
              </Link>
              <Badge tone="neutral">
                <span className="font-mono text-[10px]">?demo=1</span>
              </Badge>
            </div>
          </div>
        </Card>

        <Card variant="muted" className="p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold tracking-tight">
              Recording checklist
            </h2>
            <Badge tone="warning">Testnet</Badge>
          </div>

          <ol className="mt-4 space-y-4">
            {DEMO_STEPS.map((item) => (
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

          <div className="mt-5 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-3">
            <p className="text-[11px] leading-relaxed text-amber-100">
              Backup plan: if the public RPC is slow, switch to a funded wallet,
              refresh the dashboard, and show the already-recorded invoice
              history. Never edit the contract address live.
            </p>
          </div>
        </Card>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {highlights.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="p-5">
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-monad-500/25 bg-monad-500/10 text-monad-200">
                <Icon className="h-4 w-4" />
              </span>
              <h2 className="mt-4 text-sm font-semibold tracking-tight">
                {title}
              </h2>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                {body}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
          <p className="text-[11px] text-muted">
            Demo copy: “Pay with crypto at any local merchant in Yogyakarta
            using Monad.”
          </p>
          <Link
            href={merchantHref}
            className="inline-flex items-center gap-1 text-xs font-medium text-monad-200 transition hover:text-monad-100"
          >
            Start the demo
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
