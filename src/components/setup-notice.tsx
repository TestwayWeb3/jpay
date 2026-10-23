import Link from "next/link";

import { JPayMark } from "@/components/jpay-mark";
import { ExternalLinkIcon } from "@/components/icons";

const steps = [
  {
    title: "Create a Privy app",
    body: "Sign in at dashboard.privy.io, create an app and copy its App ID.",
  },
  {
    title: "Enable login methods",
    body: "Turn on Email, Google and Wallet in Authentication → Login methods.",
  },
  {
    title: "Allow localhost",
    body: "Add http://localhost:3000 to Allowed origins so the modal can load.",
  },
  {
    title: "Add the App ID to .env.local",
    body: "Set NEXT_PUBLIC_PRIVY_APP_ID, then restart `npm run dev`.",
  },
];

export function SetupNotice() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-16">
      <div className="card w-full max-w-xl animate-fade-up p-7 sm:p-9">
        <div className="flex items-center gap-3">
          <JPayMark />
          <div>
            <p className="text-sm font-semibold tracking-tight">JPay</p>
            <p className="text-xs text-muted">Just Pay with Monad</p>
          </div>
        </div>

        <h1 className="mt-8 text-2xl font-semibold tracking-tight">
          Add your Privy App ID to finish setup
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Wallet connection is powered by Privy. Until an App ID is configured, the app
          shows this screen instead of the payment UI.
        </p>

        <ol className="mt-7 space-y-4">
          {steps.map((step, index) => (
            <li key={step.title} className="flex gap-3.5">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-monad-500/40 bg-monad-500/10 text-[11px] font-semibold text-monad-200">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-medium">{step.title}</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <pre className="mt-7 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 text-xs leading-relaxed text-monad-200">
          <code>{`# .env.local
NEXT_PUBLIC_PRIVY_APP_ID=clp_your_app_id_here`}</code>
        </pre>

        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link
            href="https://dashboard.privy.io"
            target="_blank"
            rel="noreferrer"
            className="btn-primary"
          >
            Open Privy dashboard
            <ExternalLinkIcon className="h-4 w-4" />
          </Link>
          <span className="text-xs text-muted">
            The full setup guide is in <code className="text-foreground">README.md</code>.
          </span>
        </div>
      </div>
    </main>
  );
}
