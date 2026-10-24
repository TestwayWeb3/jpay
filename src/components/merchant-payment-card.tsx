"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState, type FormEvent } from "react";
import { parseEther, parseEventLogs } from "viem";
import {
  useAccount,
  usePublicClient,
  useSwitchChain,
  useWriteContract,
} from "wagmi";

import {
  ArrowRightIcon,
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  InfoIcon,
  SpinnerIcon,
  WalletIcon,
} from "@/components/icons";
import { explorerTxUrl, monadTestnet } from "@/config/chains";
import { cn } from "@/lib/cn";
import {
  JPAY_MAX_DESCRIPTION_LENGTH,
  describePaymentError,
  jpayPaymentAbi,
  jpayPaymentAddress,
} from "@/lib/contracts/jpay-payment";
import { formatMon, shortenAddress } from "@/lib/format";

const QUICK_AMOUNTS = ["1", "5", "10", "25"];

type CreatedPayment = {
  id: bigint;
  amount: bigint;
  description: string;
  hash: `0x${string}`;
};

function parseAmount(input: string): bigint | null {
  if (!input.trim()) return null;

  try {
    const value = parseEther(input.trim());
    return value > 0n ? value : null;
  } catch {
    return null;
  }
}

export function MerchantPaymentCard() {
  const { ready, authenticated, login } = usePrivy();
  const { address, chain, isConnected } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [created, setCreated] = useState<CreatedPayment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const wrongNetwork = isConnected && chain?.id !== monadTestnet.id;
  const paymentLink = created ? `${origin}/pay/${created.id.toString()}` : "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!authenticated || !isConnected) {
      login();
      return;
    }

    if (wrongNetwork) {
      switchChain({ chainId: monadTestnet.id });
      return;
    }

    if (!jpayPaymentAddress) {
      setError(
        "Contract address is missing. Set NEXT_PUBLIC_JPAY_PAYMENT_ADDRESS in .env.local and restart the dev server.",
      );
      return;
    }

    if (!publicClient) {
      setError("Network is not ready yet. Try again in a moment.");
      return;
    }

    const value = parseAmount(amount);
    if (!value) {
      setError("Enter an amount greater than zero.");
      return;
    }

    const label = description.trim();
    if (!label) {
      setError("Add a short description so the customer knows what they pay for.");
      return;
    }

    if (label.length > JPAY_MAX_DESCRIPTION_LENGTH) {
      setError(`Keep the description under ${JPAY_MAX_DESCRIPTION_LENGTH} characters.`);
      return;
    }

    const contractAddress = jpayPaymentAddress;
    setBusy(true);

    try {
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: jpayPaymentAbi,
        functionName: "createPayment",
        args: [value, label],
        // Monad menagih berdasarkan gas limit. createPayment ±136k, beri margin kecil.
        gas: 160_000n,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      const [createdEvent] = parseEventLogs({
        abi: jpayPaymentAbi,
        eventName: "PaymentCreated",
        logs: receipt.logs,
      });

      const paymentId =
        createdEvent?.args.paymentId ??
        (await publicClient.readContract({
          address: contractAddress,
          abi: jpayPaymentAbi,
          functionName: "paymentCount",
        }));

      setCreated({ id: paymentId, amount: value, description: label, hash });
      setCopied(false);
    } catch (submitError) {
      setError(describePaymentError(submitError));
    } finally {
      setBusy(false);
    }
  }

  async function handleCopyLink() {
    if (!paymentLink) return;

    try {
      await navigator.clipboard.writeText(paymentLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Could not copy automatically. Select the link and copy it manually.");
    }
  }

  function handleReset() {
    setCreated(null);
    setAmount("");
    setDescription("");
    setError(null);
    setCopied(false);
  }

  if (!ready) {
    return (
      <div className="card space-y-3 p-6">
        <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-white/[0.06]" />
        <div className="h-10 w-full animate-pulse rounded-xl bg-white/[0.06]" />
        <div className="h-11 w-full animate-pulse rounded-xl bg-monad-500/20" />
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="card relative overflow-hidden p-6 text-center">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-monad-500/25 blur-3xl" />

        <div className="relative">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-monad-500/30 bg-monad-500/10 text-monad-200">
            <WalletIcon className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-lg font-semibold tracking-tight">
            Connect to create a payment
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">
            Your wallet is the merchant account. MON from every payment lands
            directly in it — JPay never holds your funds.
          </p>

          <button
            type="button"
            onClick={() => login()}
            className="btn-primary mt-5 w-full py-3"
          >
            <WalletIcon className="h-4 w-4" />
            Connect wallet
          </button>

          <p className="mt-3 text-[11px] text-muted">
            Email or Google works too — Privy creates a wallet for you.
          </p>
        </div>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="card flex items-center gap-3 p-6 text-sm text-muted">
        <SpinnerIcon className="h-4 w-4 animate-spin text-monad-300" />
        Setting up your wallet…
      </div>
    );
  }

  if (created) {
    return (
      <div className="card relative animate-fade-up overflow-hidden p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-emerald-500/15 blur-3xl" />

        <div className="relative">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                Payment created
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">
                {formatMon(created.amount)} MON
              </h2>
              <p className="mt-0.5 text-xs text-muted">
                Invoice #{created.id.toString()} · {shortenAddress(address, 4)}
              </p>
            </div>
            <span className="pill shrink-0 !border-amber-400/25 !bg-amber-400/10 !text-amber-200">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-amber-300" />
              Awaiting payment
            </span>
          </div>

          <div className="mt-5 flex flex-col items-center rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <div className="rounded-2xl bg-white p-3 shadow-glow">
              <QRCodeSVG
                value={paymentLink}
                size={196}
                level="M"
                marginSize={2}
                bgColor="#ffffff"
                fgColor="#0d0b16"
                title={`JPay invoice #${created.id.toString()}`}
              />
            </div>
            <p className="mt-3 text-center text-sm font-medium text-foreground">
              {created.description}
            </p>
            <p className="mt-1 text-center text-[11px] text-muted">
              Scan to pay on Monad Testnet
            </p>
          </div>

          <div className="mt-4">
            <label htmlFor="payment-link" className="label">
              Payment link
            </label>
            <div className="flex items-stretch gap-2">
              <input
                id="payment-link"
                readOnly
                value={paymentLink}
                onFocus={(event) => event.currentTarget.select()}
                className="input min-w-0 font-mono text-[11px]"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={cn(
                  "btn shrink-0 px-3",
                  copied
                    ? "bg-emerald-500 text-white"
                    : "bg-monad text-white hover:bg-monad-600",
                )}
              >
                {copied ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <CopyIcon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {copied ? "Copied" : "Copy link"}
                </span>
              </button>
            </div>
          </div>

          {error ? (
            <p className="mt-3 rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs leading-relaxed text-rose-200">
              {error}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="btn-primary px-3 py-2 text-xs"
            >
              New payment
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </button>
            <Link
              href={`/pay/${created.id.toString()}`}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost px-3 py-2 text-xs"
            >
              Open payment page
              <ExternalLinkIcon className="h-3.5 w-3.5" />
            </Link>
            <Link
              href={explorerTxUrl(created.hash, monadTestnet.id)}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost px-3 py-2 text-xs"
            >
              View transaction
              <ExternalLinkIcon className="h-3.5 w-3.5" />
            </Link>
          </div>

          <p className="mt-4 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted">
            <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Keep this screen open or share the link. Status changes to paid the
            moment the customer pays onchain.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card relative overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-monad-500/25 blur-3xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
            New payment
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight">
            Create an invoice
          </h2>
        </div>
        <span className="pill shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          Monad Testnet
        </span>
      </div>

      <form onSubmit={handleSubmit} className="relative mt-5 space-y-4">
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="merchant-amount" className="label">
              Amount
            </label>
            <span className="text-[11px] text-muted">Settles in MON</span>
          </div>
          <div className="relative">
            <input
              id="merchant-amount"
              name="amount"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setError(null);
              }}
              inputMode="decimal"
              placeholder="0.00"
              autoComplete="off"
              disabled={busy}
              className="input pr-14 text-base font-medium"
            />
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">
              MON
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {QUICK_AMOUNTS.map((value) => (
              <button
                key={value}
                type="button"
                disabled={busy}
                onClick={() => {
                  setAmount(value);
                  setError(null);
                }}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-muted transition hover:border-monad-400/50 hover:text-foreground disabled:opacity-40"
              >
                {value} MON
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="merchant-description" className="label">
              Description
            </label>
            <span
              className={cn(
                "text-[11px]",
                description.length > 180 ? "text-amber-300" : "text-muted",
              )}
            >
              {description.length}/{JPAY_MAX_DESCRIPTION_LENGTH}
            </span>
          </div>
          <input
            id="merchant-description"
            name="description"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setError(null);
            }}
            maxLength={JPAY_MAX_DESCRIPTION_LENGTH}
            placeholder="Kopi Susu - Kedai Jogja"
            autoComplete="off"
            disabled={busy}
            className="input"
          />
        </div>

        {wrongNetwork ? (
          <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.07] p-3">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-amber-100">
              <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Your wallet is on {chain?.name ?? "another network"}. JPay
              invoices live on Monad Testnet.
            </p>
            <button
              type="button"
              onClick={() => switchChain({ chainId: monadTestnet.id })}
              disabled={isSwitching}
              className="btn-ghost mt-2 w-full py-2 text-xs"
            >
              {isSwitching ? (
                <SpinnerIcon className="h-3.5 w-3.5 animate-spin" />
              ) : null}
              Switch to Monad Testnet
            </button>
          </div>
        ) : null}

        {error ? (
          <p className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs leading-relaxed text-rose-200">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={busy || wrongNetwork}
          className="btn-primary w-full py-3 text-[15px]"
        >
          {busy ? (
            <>
              <SpinnerIcon className="h-4 w-4 animate-spin" />
              Creating payment…
            </>
          ) : (
            <>
              Create payment
              <ArrowRightIcon className="h-4 w-4" />
            </>
          )}
        </button>

        <div className="flex items-center justify-between gap-2 text-[11px] text-muted">
          <span>
            Settles to <span className="font-mono">{shortenAddress(address, 4)}</span>
          </span>
          <span>Gas paid by you</span>
        </div>
      </form>
    </div>
  );
}
