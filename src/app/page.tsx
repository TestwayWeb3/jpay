import Link from "next/link";

import {
  ArrowRightIcon,
  BoltIcon,
  ExternalLinkIcon,
  ShieldIcon,
  SparkIcon,
} from "@/components/icons";
import { PaymentForm } from "@/components/payment-form";
import { siteConfig } from "@/config/site";

const stats = [
  { label: "Block time", value: "400ms" },
  { label: "Finality", value: "800ms" },
  { label: "Throughput", value: "10k TPS" },
];

const features = [
  {
    icon: BoltIcon,
    title: "Settled in a blink",
    body: "Monad confirms blocks every 400ms with single-slot finality, so payments feel instant — no “pending” limbo.",
  },
  {
    icon: SparkIcon,
    title: "Wallet optional",
    body: "Sign in with email or Google and Privy creates an embedded wallet. Already have one? MetaMask, Coinbase and WalletConnect work too.",
  },
  {
    icon: ShieldIcon,
    title: "You keep the keys",
    body: "JPay is non-custodial. Transactions are signed by the user, straight from their wallet to the recipient.",
  },
];

const stack = ["Next.js 14", "TypeScript", "Tailwind CSS", "Privy", "wagmi v2", "viem", "Monad"];

export default function HomePage() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] grid-lines" aria-hidden />

      <section className="relative mx-auto grid w-full max-w-6xl gap-12 px-5 pb-16 pt-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:pb-24 lg:pt-20">
        <div className="animate-fade-up">
          <span className="pill">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-monad-400" />
            Live on Monad Testnet &amp; Mainnet
          </span>

          <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">
            Just Pay <span className="text-gradient">with Monad.</span>
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted">
            JPay is a payment app for people on the move. Connect a wallet — or sign in
            with email — and send MON to anyone in under a second.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/merchant" className="btn-primary px-5 py-3">
              Create a payment
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href={siteConfig.links.docs}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost px-5 py-3"
            >
              Why Monad
              <ExternalLinkIcon className="h-4 w-4" />
            </Link>
          </div>

          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/[0.07] pt-6">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dd className="text-xl font-semibold tracking-tight text-foreground">
                  {stat.value}
                </dd>
                <dt className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-muted">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>

        <div id="pay" className="relative w-full animate-fade-up scroll-mt-24 lg:max-w-md lg:justify-self-end">
          <PaymentForm />
          <p className="mt-3 text-center text-[11px] text-muted">
            Non-custodial — JPay never holds your funds.
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <article key={title} className="card p-5">
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-monad-500/25 bg-monad-500/10 text-monad-200">
                <Icon className="h-4 w-4" />
              </span>
              <h2 className="mt-4 text-sm font-semibold tracking-tight">{title}</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">{body}</p>
            </article>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
          <span className="mr-1 text-[11px] uppercase tracking-[0.12em] text-muted">
            Built with
          </span>
          {stack.map((item) => (
            <span key={item} className="pill !border-white/[0.07] !bg-white/[0.03] !py-0.5 !text-[10px]">
              {item}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
