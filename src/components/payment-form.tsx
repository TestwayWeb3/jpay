"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { isAddress, parseEther } from "viem";
import { useAccount, useBalance, useSendTransactionSync } from "wagmi";

import {
  ArrowRightIcon,
  CheckIcon,
  ExternalLinkIcon,
  InfoIcon,
  SpinnerIcon,
  WalletIcon,
} from "@/components/icons";
import { explorerTxUrl, getNetwork } from "@/config/chains";
import { cn } from "@/lib/cn";
import { formatMon, shortenAddress, toUserMessage } from "@/lib/format";

const QUICK_AMOUNTS = ["1", "5", "10"];

function parseAmount(input: string): bigint | null {
  if (!input.trim()) return null;

  try {
    const value = parseEther(input.trim());
    return value > 0n ? value : null;
  } catch {
    return null;
  }
}

type LastPayment = {
  to: `0x${string}`;
  amount: bigint;
  hash: string;
};

export function PaymentForm() {
  const { ready, authenticated, login } = usePrivy();
  const { address, chain, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address,
    query: { enabled: Boolean(address) },
  });

  const {
    sendTransactionSyncAsync,
    isPending,
    error: sendError,
    reset,
  } = useSendTransactionSync();

  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [lastPayment, setLastPayment] = useState<LastPayment | null>(null);

  const network = getNetwork(chain?.id);
  const recipientIsValid = to.length === 0 || isAddress(to);

  const errorMessage = formError ?? toUserMessage(sendError);

  function handleMax() {
    if (!balance) return;

    const buffer = parseEther("0.01");
    const max = balance.value > buffer ? balance.value - buffer : 0n;
    setAmount(formatMon(max, 6));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!authenticated) {
      login();
      return;
    }

    const target = to.trim();
    if (!isAddress(target)) {
      setFormError("Enter a valid 0x wallet address.");
      return;
    }

    const value = parseAmount(amount);
    if (!value) {
      setFormError("Enter an amount greater than zero.");
      return;
    }

    if (balance && value > balance.value) {
      setFormError("Amount is higher than your spendable MON balance.");
      return;
    }

    reset();
    setLastPayment(null);

    try {
      const receipt = await sendTransactionSyncAsync({ to: target, value });
      setLastPayment({ to: target, amount: value, hash: receipt.transactionHash });
      setTo("");
      setAmount("");
    } catch {
      // The mutation exposes the error via `sendError`, which we render below.
    }
  }

  function handleNewPayment() {
    reset();
    setLastPayment(null);
    setFormError(null);
  }

  if (lastPayment) {
    return (
      <div className="card relative overflow-hidden p-5 sm:p-6">
        <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/15">
              <CheckIcon className="h-3.5 w-3.5" />
            </span>
            Payment confirmed
          </div>
          <p className="mt-2 text-sm">
            Sent <span className="font-semibold">{formatMon(lastPayment.amount)} MON</span> to{" "}
            <span className="font-mono text-xs">{shortenAddress(lastPayment.to, 6)}</span>
          </p>
          <p className="mt-1 text-xs text-muted">Settled on {network.name}.</p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Link
              href={explorerTxUrl(lastPayment.hash, chain?.id)}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost px-3 py-2 text-xs"
            >
              View transaction
              <ExternalLinkIcon className="h-3.5 w-3.5" />
            </Link>
            <button type="button" onClick={handleNewPayment} className="btn-primary px-3 py-2 text-xs">
              New payment
            </button>
          </div>
        </div>

        <p className="mt-4 flex items-center gap-1.5 text-[11px] text-muted">
          <InfoIcon className="h-3.5 w-3.5" />
          Receipt received in the same RPC call via eth_sendRawTransactionSync.
        </p>
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
          <h2 className="mt-1 text-lg font-semibold tracking-tight">Send MON</h2>
        </div>
        <span className="pill shrink-0">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              network.isTestnet ? "bg-amber-400" : "bg-emerald-400",
            )}
          />
          {network.name}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="relative mt-5 space-y-4">
        <div>
          <label htmlFor="recipient" className="label">
            Recipient
          </label>
          <input
            id="recipient"
            name="recipient"
            value={to}
            onChange={(event) => {
              setTo(event.target.value);
              setFormError(null);
            }}
            placeholder="0x…"
            spellCheck={false}
            autoComplete="off"
            aria-invalid={!recipientIsValid}
            className={cn("input font-mono text-xs", !recipientIsValid && "border-rose-500/60")}
          />
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor="amount" className="label">
              Amount
            </label>
            <span className="text-[11px] text-muted">
              Balance {formatMon(balance?.value)} MON
            </span>
          </div>
          <div className="relative">
            <input
              id="amount"
              name="amount"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setFormError(null);
              }}
              inputMode="decimal"
              placeholder="0.00"
              autoComplete="off"
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
                onClick={() => {
                  setAmount(value);
                  setFormError(null);
                }}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-muted transition hover:border-monad-400/50 hover:text-foreground"
              >
                {value} MON
              </button>
            ))}
            <button
              type="button"
              onClick={handleMax}
              disabled={!isConnected || !balance}
              className="rounded-lg border border-monad-500/30 bg-monad-500/10 px-2.5 py-1 text-[11px] font-medium text-monad-200 transition hover:bg-monad-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Max
            </button>
          </div>
        </div>

        {errorMessage ? (
          <p className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs leading-relaxed text-rose-200">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!ready || isPending}
          className="btn-primary w-full py-3 text-[15px]"
        >
          {!authenticated ? (
            <>
              <WalletIcon className="h-4 w-4" />
              Connect wallet to pay
            </>
          ) : isPending ? (
            <>
              <SpinnerIcon className="h-4 w-4 animate-spin" />
              Confirm in your wallet…
            </>
          ) : (
            <>
              Pay {amount.trim() ? `${amount.trim()} MON` : "now"}
              <ArrowRightIcon className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted">
          <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Monad charges gas on the gas limit, so JPay estimates it before sending. Payments
          settle in ~400ms.
        </p>
      </form>
    </div>
  );
}
