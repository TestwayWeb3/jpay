"use client";

import { usePrivy } from "@privy-io/react-auth";
import Link from "next/link";
import { useState } from "react";
import { parseEventLogs } from "viem";
import {
  useAccount,
  useBalance,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWriteContract,
} from "wagmi";

import {
  ArrowRightIcon,
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  InfoIcon,
  ShieldIcon,
  SpinnerIcon,
  WalletIcon,
} from "@/components/icons";
import {
  explorerAddressUrl,
  explorerTxUrl,
  monadTestnet,
} from "@/config/chains";
import {
  describePaymentError,
  getContractRevertName,
  jpayPaymentAbi,
  jpayPaymentAddress,
} from "@/lib/contracts/jpay-payment";
import { formatMon, shortenAddress, toUserMessage } from "@/lib/format";

const MAX_UINT256 = 2n ** 256n - 1n;

type PaidState = {
  amount: bigint;
  hash: `0x${string}`;
};

function parsePaymentId(raw: string): bigint | null {
  if (!/^\d+$/.test(raw.trim())) return null;

  try {
    const id = BigInt(raw.trim());
    return id > 0n && id <= MAX_UINT256 ? id : null;
  } catch {
    return null;
  }
}

function formatTimestamp(timestamp: bigint | number): string {
  return `${new Date(Number(timestamp) * 1000)
    .toISOString()
    .replace("T", " ")
    .slice(0, 16)} UTC`;
}

export function CustomerPayment({ paymentId }: { paymentId: string }) {
  const { ready, authenticated, login } = usePrivy();
  const { address, chain, isConnected } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { data: balance } = useBalance({
    address,
    query: { enabled: Boolean(address) },
  });

  const id = parsePaymentId(paymentId);
  const contractAddress = jpayPaymentAddress;

  const paymentQuery = useReadContract({
    address: contractAddress ?? undefined,
    abi: jpayPaymentAbi,
    functionName: "getPayment",
    args: [id ?? 0n],
    query: {
      enabled: Boolean(contractAddress && id),
      refetchInterval: 5000,
    },
  });

  const payment = paymentQuery.data;
  const [paid, setPaid] = useState<PaidState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const wrongNetwork = isConnected && chain?.id !== monadTestnet.id;
  const merchantIsSelf =
    Boolean(payment && address) &&
    payment!.merchant.toLowerCase() === address!.toLowerCase();
  const insufficient =
    Boolean(payment && balance) && balance!.value < payment!.amount;
  const revertName = getContractRevertName(paymentQuery.error);

  async function handleCopyMerchant() {
    if (!payment) return;

    try {
      await navigator.clipboard.writeText(payment.merchant);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked; the address is still visible on the explorer.
    }
  }

  async function handlePay() {
    setError(null);

    if (!ready) return;

    if (!authenticated || !isConnected) {
      login();
      return;
    }

    if (!id || !payment || !contractAddress || !publicClient) {
      setError("This payment is not ready to be paid yet. Refresh and try again.");
      return;
    }

    if (merchantIsSelf) {
      setError("This invoice belongs to your wallet. Pay it from a customer wallet.");
      return;
    }

    if (wrongNetwork) {
      switchChain({ chainId: monadTestnet.id });
      return;
    }

    if (insufficient) {
      setError("You need more MON to cover this payment.");
      return;
    }

    setBusy(true);

    try {
      const hash = await writeContractAsync({
        address: contractAddress,
        abi: jpayPaymentAbi,
        functionName: "pay",
        args: [id],
        value: payment.amount,
        // Monad menagih berdasarkan gas limit. pay ±43k, beri margin kecil.
        gas: 60_000n,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      parseEventLogs({
        abi: jpayPaymentAbi,
        eventName: "PaymentPaid",
        logs: receipt.logs,
      });

      setPaid({ amount: payment.amount, hash });
      void paymentQuery.refetch();
    } catch (payError) {
      setError(describePaymentError(payError));
    } finally {
      setBusy(false);
    }
  }

  if (!contractAddress) {
    return (
      <MessageCard
        title="Payments are not configured"
        body="NEXT_PUBLIC_JPAY_PAYMENT_ADDRESS is missing. Add the contract address to .env.local and restart the app."
      />
    );
  }

  if (!id) {
    return (
      <MessageCard
        title="Invalid payment link"
        body={`"${paymentId}" is not a valid payment id. Payment links look like /pay/1.`}
      />
    );
  }

  if (paid) {
    return (
      <SuccessCard
        amount={paid.amount}
        description={payment?.description}
        merchant={payment?.merchant}
        payer={address ?? payment?.payer}
        hash={paid.hash}
      />
    );
  }

  if (paymentQuery.isLoading) {
    return (
      <div className="card space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 animate-pulse rounded-full bg-white/[0.06]" />
          <div className="h-3 w-16 animate-pulse rounded bg-white/[0.06]" />
        </div>
        <div className="h-12 w-40 animate-pulse rounded-xl bg-white/[0.06]" />
        <div className="h-4 w-56 animate-pulse rounded bg-white/[0.06]" />
        <div className="h-40 w-full animate-pulse rounded-xl bg-white/[0.04]" />
        <div className="h-11 w-full animate-pulse rounded-xl bg-monad-500/20" />
      </div>
    );
  }

  if (paymentQuery.error) {
    if (revertName === "PaymentNotFound") {
      return (
        <MessageCard
          title={`Invoice #${id.toString()} not found`}
          body="This payment does not exist on Monad Testnet. Check the link or ask the merchant to create a new one."
        >
          <Link href="/" className="btn-primary px-4 py-2.5 text-sm">
            Back to JPay
          </Link>
        </MessageCard>
      );
    }

    return (
      <MessageCard
        title="Could not load this payment"
        body={toUserMessage(paymentQuery.error) ?? "The Monad RPC did not respond. Try again."}
      >
        <button
          type="button"
          onClick={() => void paymentQuery.refetch()}
          className="btn-primary px-4 py-2.5 text-sm"
        >
          Try again
        </button>
      </MessageCard>
    );
  }

  if (!payment) return null;

  if (payment.isPaid) {
    return (
      <SuccessCard
        amount={payment.amount}
        description={payment.description}
        merchant={payment.merchant}
        payer={payment.payer}
        hash={null}
      />
    );
  }

  return (
    <div className="card relative animate-fade-up overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-monad-600 via-monad-400 to-monad-500" />

      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="pill !border-amber-400/25 !bg-amber-400/10 !text-amber-200">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-amber-300" />
            Awaiting payment
          </span>
          <span className="text-[11px] text-muted">Invoice #{id.toString()}</span>
        </div>

        <p className="mt-6 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
          Amount due
        </p>
        <p className="mt-1 text-4xl font-semibold tracking-tight text-foreground">
          {formatMon(payment.amount)}{" "}
          <span className="text-lg font-medium text-muted">MON</span>
        </p>
        <p className="mt-2 text-sm leading-relaxed text-foreground/90">
          {payment.description || "Payment request"}
        </p>

        <dl className="mt-6 space-y-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
          <Row label="Status">
            <span className="text-amber-200">Not paid yet</span>
          </Row>

          <Row label="Merchant">
            <span className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] text-foreground">
                {shortenAddress(payment.merchant, 5)}
              </span>
              <button
                type="button"
                onClick={handleCopyMerchant}
                title="Copy merchant address"
                className="text-muted transition hover:text-foreground"
              >
                {copied ? (
                  <CheckIcon className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <CopyIcon className="h-3.5 w-3.5" />
                )}
              </button>
              <Link
                href={explorerAddressUrl(payment.merchant, monadTestnet.id)}
                target="_blank"
                rel="noreferrer"
                title="View merchant on explorer"
                className="text-muted transition hover:text-foreground"
              >
                <ExternalLinkIcon className="h-3.5 w-3.5" />
              </Link>
            </span>
          </Row>

          <Row label="Network">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              {monadTestnet.name}
            </span>
          </Row>

          <Row label="Created">
            <span className="text-[11px]">{formatTimestamp(payment.createdAt)}</span>
          </Row>
        </dl>

        {wrongNetwork ? (
          <div className="mt-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] p-3">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-amber-100">
              <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Your wallet is on {chain?.name ?? "another network"}. This invoice
              lives on Monad Testnet.
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

        {merchantIsSelf ? (
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-muted">
            <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            This is your own invoice. Open the link from a customer wallet to
            pay it.
          </p>
        ) : null}

        {insufficient && !merchantIsSelf ? (
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/25 bg-rose-500/[0.08] p-3 text-xs leading-relaxed text-rose-200">
            <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Your balance is {formatMon(balance?.value)} MON. Top up at{" "}
            <a
              href="https://faucet.monad.xyz"
              target="_blank"
              rel="noreferrer"
              className="underline decoration-rose-300/40 underline-offset-2 hover:text-rose-100"
            >
              faucet.monad.xyz
            </a>
            .
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs leading-relaxed text-rose-200">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={handlePay}
          disabled={busy || (insufficient && !wrongNetwork)}
          className="btn-primary mt-5 w-full py-3 text-[15px]"
        >
          {busy ? (
            <>
              <SpinnerIcon className="h-4 w-4 animate-spin" />
              Confirming payment…
            </>
          ) : !authenticated ? (
            <>
              <WalletIcon className="h-4 w-4" />
              Connect wallet to pay
            </>
          ) : wrongNetwork ? (
            <>
              Switch to Monad Testnet
              <ArrowRightIcon className="h-4 w-4" />
            </>
          ) : (
            <>
              Pay {formatMon(payment.amount)} MON
              <ArrowRightIcon className="h-4 w-4" />
            </>
          )}
        </button>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted">
          <ShieldIcon className="h-3.5 w-3.5" />
          Non-custodial · settles in ~1s on Monad
        </p>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[11px] uppercase tracking-[0.1em] text-muted">
        {label}
      </dt>
      <dd className="text-xs text-foreground">{children}</dd>
    </div>
  );
}

function MessageCard({
  title,
  body,
  children,
}: {
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="card animate-fade-up p-6 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-rose-500/25 bg-rose-500/10 text-rose-200">
        <InfoIcon className="h-5 w-5" />
      </span>
      <h1 className="mt-4 text-lg font-semibold tracking-tight">{title}</h1>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
        {body}
      </p>
      {children ? (
        <div className="mt-5 flex justify-center">{children}</div>
      ) : null}
    </div>
  );
}

function SuccessCard({
  amount,
  description,
  merchant,
  payer,
  hash,
}: {
  amount: bigint;
  description?: string;
  merchant?: `0x${string}`;
  payer?: `0x${string}`;
  hash: `0x${string}` | null;
}) {
  return (
    <div className="card relative animate-fade-up overflow-hidden p-6 text-center">
      <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-56 w-56 rounded-full bg-monad-500/15 blur-3xl" />

      <div className="relative">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-emerald-400/30 bg-emerald-500/15 text-emerald-300 shadow-[0_0_40px_-8px_rgba(16,185,129,0.7)]">
          <CheckIcon className="h-8 w-8" />
        </span>

        <h1 className="mt-5 text-xl font-semibold tracking-tight">
          Payment complete
        </h1>
        <p className="mt-1 text-sm text-muted">
          {description || "Your payment was settled on Monad."}
        </p>

        <p className="mt-6 text-4xl font-semibold tracking-tight">
          {formatMon(amount)}{" "}
          <span className="text-lg font-medium text-muted">MON</span>
        </p>

        <dl className="mt-6 space-y-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-left">
          {merchant ? (
            <Row label="Merchant">
              <span className="flex items-center gap-1.5">
                <span className="font-mono text-[11px]">
                  {shortenAddress(merchant, 5)}
                </span>
                <Link
                  href={explorerAddressUrl(merchant, monadTestnet.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted transition hover:text-foreground"
                  title="View merchant on explorer"
                >
                  <ExternalLinkIcon className="h-3.5 w-3.5" />
                </Link>
              </span>
            </Row>
          ) : null}

          {payer ? (
            <Row label="Paid by">
              <span className="font-mono text-[11px]">
                {shortenAddress(payer, 5)}
              </span>
            </Row>
          ) : null}

          <Row label="Network">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {monadTestnet.name}
            </span>
          </Row>
        </dl>

        {hash ? (
          <div className="mt-4 rounded-xl border border-white/[0.07] bg-black/25 p-3 text-left">
            <p className="text-[11px] uppercase tracking-[0.1em] text-muted">
              Transaction hash
            </p>
            <p className="mt-1 break-all font-mono text-[11px] text-foreground/90">
              {hash}
            </p>
            <Link
              href={explorerTxUrl(hash, monadTestnet.id)}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost mt-3 w-full py-2 text-xs"
            >
              View on explorer
              <ExternalLinkIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <p className="mt-4 text-[11px] text-muted">
            This invoice was already settled onchain.
          </p>
        )}

        <Link href="/" className="btn-primary mt-5 w-full py-3 text-sm">
          Back to JPay
          <ArrowRightIcon className="h-4 w-4" />
        </Link>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-muted">
          <ShieldIcon className="h-3.5 w-3.5" />
          Funds went straight to the merchant wallet
        </p>
      </div>
    </div>
  );
}
