"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useSwitchChain,
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
import {
  explorerAddressUrl,
  monadTestnet,
} from "@/config/chains";
import { paymentLink } from "@/config/site";
import { cn } from "@/lib/cn";
import {
  describePaymentError,
  jpayPaymentAbi,
  jpayPaymentAddress,
  type JPayPayment,
} from "@/lib/contracts/jpay-payment";
import { formatMon, shortenAddress } from "@/lib/format";
import { formatPoints, merchantLoyaltyPoints } from "@/lib/loyalty";

const MAX_ROWS = 100;
const REFRESH_MS = 5000;

type Invoice = {
  id: bigint;
  payment: JPayPayment;
};

type Filter = "all" | "pending" | "paid";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Unpaid" },
  { value: "paid", label: "Paid" },
];

function formatDateTime(timestamp: bigint | number): string {
  const date = new Date(Number(timestamp) * 1000);

  return date.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function MerchantDashboard() {
  const { ready, authenticated, login } = usePrivy();
  const { address, chain, isConnected } = useAccount();
  const { switchChain, isPending: isSwitching } = useSwitchChain();
  const publicClient = usePublicClient();

  const contractAddress = jpayPaymentAddress;
  const [filter, setFilter] = useState<Filter>("all");
  const [copiedId, setCopiedId] = useState<bigint | null>(null);

  const wrongNetwork = isConnected && chain?.id !== monadTestnet.id;

  const countQuery = useReadContract({
    address: contractAddress ?? undefined,
    abi: jpayPaymentAbi,
    functionName: "paymentCount",
    query: {
      enabled: Boolean(contractAddress && address && !wrongNetwork),
      refetchInterval: REFRESH_MS,
    },
  });

  const total = Number(countQuery.data ?? 0n);
  const ids = useMemo(() => {
    const limit = Math.min(total, MAX_ROWS);
    return Array.from({ length: limit }, (_, index) => BigInt(total - index));
  }, [total]);

  const paymentsQuery = useQuery({
    queryKey: ["jpay-invoices", contractAddress, total],
    enabled: Boolean(publicClient && contractAddress && total > 0 && !wrongNetwork),
    refetchInterval: REFRESH_MS,
    queryFn: async (): Promise<Invoice[]> => {
      if (!publicClient || !contractAddress || ids.length === 0) return [];

      const results = await publicClient.multicall({
        contracts: ids.map((id) => ({
          address: contractAddress,
          abi: jpayPaymentAbi,
          functionName: "getPayment" as const,
          args: [id] as const,
        })),
        allowFailure: true,
      });

      return results.flatMap((item, index) => {
        if (item.status !== "success" || !item.result) return [];
        return [{ id: ids[index]!, payment: item.result as JPayPayment }];
      });
    },
  });

  useEffect(() => {
    if (copiedId === null) return;

    const timer = window.setTimeout(() => setCopiedId(null), 1600);
    return () => window.clearTimeout(timer);
  }, [copiedId]);

  const invoices = useMemo(() => {
    if (!address) return [];

    return (paymentsQuery.data ?? [])
      .filter(
        ({ payment }) =>
          payment.merchant.toLowerCase() === address.toLowerCase(),
      )
      .sort((a, b) => (a.id < b.id ? 1 : -1));
  }, [paymentsQuery.data, address]);

  const stats = useMemo(() => {
    const paid = invoices.filter(({ payment }) => payment.isPaid);
    const pending = invoices.filter(({ payment }) => !payment.isPaid);

    return {
      received: paid.reduce((sum, item) => sum + item.payment.amount, 0n),
      pending: pending.reduce((sum, item) => sum + item.payment.amount, 0n),
      paidCount: paid.length,
      pendingCount: pending.length,
      totalCount: invoices.length,
      points: merchantLoyaltyPoints(paid.length),
    };
  }, [invoices]);

  const visibleInvoices = useMemo(() => {
    if (filter === "all") return invoices;
    return invoices.filter(({ payment }) =>
      filter === "paid" ? payment.isPaid : !payment.isPaid,
    );
  }, [invoices, filter]);

  const isLoading =
    countQuery.isLoading ||
    (total > 0 && paymentsQuery.isLoading && invoices.length === 0);
  const isRefreshing = countQuery.isFetching || paymentsQuery.isFetching;
  const loadError =
    countQuery.error ??
    paymentsQuery.error ??
    null;

  async function handleCopyLink(id: bigint) {
    const link = paymentLink(id);

    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(id);
    } catch {
      // Clipboard blocked — the link is still visible when the invoice opens.
    }
  }

  async function handleRefresh() {
    await Promise.all([countQuery.refetch(), paymentsQuery.refetch()]);
  }

  if (!ready) {
    return <DashboardSkeleton />;
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
            Connect to see your dashboard
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            Sign in with the wallet you use as a merchant. Every invoice you
            created shows up here with its live status.
          </p>
          <button
            type="button"
            onClick={() => login()}
            className="btn-primary mt-5 w-full py-3"
          >
            <WalletIcon className="h-4 w-4" />
            Connect wallet
          </button>
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

  return (
    <div className="space-y-5">
      {wrongNetwork ? (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.07] p-3">
          <p className="flex items-start gap-2 text-xs leading-relaxed text-amber-100">
            <InfoIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Your wallet is on {chain?.name ?? "another network"}. Invoices are
            read from Monad Testnet.
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

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total received"
          value={`${formatMon(stats.received)} MON`}
          accent="emerald"
          hint={`${stats.paidCount} paid invoice${stats.paidCount === 1 ? "" : "s"}`}
        />
        <StatCard
          label="Awaiting payment"
          value={`${formatMon(stats.pending)} MON`}
          accent="amber"
          hint={`${stats.pendingCount} open invoice${stats.pendingCount === 1 ? "" : "s"}`}
        />
        <StatCard
          label="Invoices"
          value={stats.totalCount.toString()}
          accent="monad"
          hint={`Latest ${Math.min(stats.totalCount, MAX_ROWS)} onchain`}
        />
        <StatCard
          label="JPay points"
          value={formatPoints(stats.points)}
          accent="monad"
          hint="10 points per paid invoice"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] p-4">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-emerald-400" />
            <div>
              <h2 className="text-sm font-semibold tracking-tight">
                Your invoices
              </h2>
              <p className="font-mono text-[10px] text-muted">
                {shortenAddress(address, 5)} · {monadTestnet.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] text-muted sm:inline">
              {paymentsQuery.dataUpdatedAt
                ? `Updated ${formatTime(paymentsQuery.dataUpdatedAt)}`
                : "Live"}
            </span>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              title="Refresh now"
              className="btn-ghost px-2.5 py-1.5 text-[11px]"
            >
              <SpinnerIcon
                className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")}
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 border-b border-white/[0.07] px-4 py-2.5">
          {FILTERS.map((item) => {
            const count =
              item.value === "all"
                ? stats.totalCount
                : item.value === "paid"
                  ? stats.paidCount
                  : stats.pendingCount;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-[11px] font-medium transition",
                  filter === item.value
                    ? "bg-monad-500/15 text-monad-200"
                    : "text-muted hover:bg-white/[0.05] hover:text-foreground",
                )}
              >
                {item.label}
                <span className="ml-1.5 text-[10px] opacity-70">{count}</span>
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-16 animate-pulse rounded-xl bg-white/[0.04]"
              />
            ))}
          </div>
        ) : loadError ? (
          <div className="p-6 text-center">
            <p className="text-sm font-medium text-rose-200">
              Could not load your invoices
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-muted">
              {describePaymentError(loadError) ?? "Monad RPC did not respond."}
            </p>
            <button
              type="button"
              onClick={handleRefresh}
              className="btn-primary mt-4 px-4 py-2 text-xs"
            >
              Try again
            </button>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium">No invoices from this wallet yet</p>
            <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-muted">
              Create your first payment and it will appear here with a live
              status.
            </p>
            <Link href="/merchant" className="btn-primary mt-4 px-4 py-2 text-xs">
              Create a payment
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : visibleInvoices.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted">
            No {filter === "paid" ? "paid" : "unpaid"} invoices right now.
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {visibleInvoices.map(({ id, payment }) => (
              <li
                key={id.toString()}
                className="flex flex-col gap-3 p-4 transition hover:bg-white/[0.02] sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-muted">
                      #{id.toString()}
                    </span>
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        payment.isPaid ? "bg-emerald-400" : "bg-amber-400",
                      )}
                    />
                    <span
                      className={cn(
                        "text-[11px] font-medium",
                        payment.isPaid ? "text-emerald-300" : "text-amber-200",
                      )}
                    >
                      {payment.isPaid ? "Paid" : "Unpaid"}
                    </span>
                  </div>

                  <p className="mt-1 truncate text-sm font-medium">
                    {payment.description || "Payment request"}
                  </p>

                  <p className="mt-0.5 text-[11px] text-muted">
                    {formatDateTime(payment.createdAt)}
                    {payment.isPaid ? (
                      <>
                        {" · paid by "}
                        <Link
                          href={explorerAddressUrl(payment.payer, monadTestnet.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-muted underline decoration-white/20 underline-offset-2 hover:text-foreground"
                        >
                          {shortenAddress(payment.payer, 4)}
                        </Link>
                      </>
                    ) : null}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <p className="text-sm font-semibold tabular-nums">
                    {formatMon(payment.amount)}{" "}
                    <span className="text-[11px] font-medium text-muted">MON</span>
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => void handleCopyLink(id)}
                      title={copiedId === id ? "Link copied" : "Copy payment link"}
                      aria-label={copiedId === id ? "Link copied" : "Copy payment link"}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-muted transition hover:border-white/20 hover:text-foreground"
                    >
                      {copiedId === id ? (
                        <CheckIcon className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <CopyIcon className="h-3.5 w-3.5" />
                      )}
                    </button>
                    <Link
                      href={`/pay/${id.toString()}`}
                      target="_blank"
                      rel="noreferrer"
                      title="Open status page"
                      aria-label="Open status page"
                      className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-muted transition hover:border-white/20 hover:text-foreground"
                    >
                      <ExternalLinkIcon className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between gap-2 border-t border-white/[0.07] px-4 py-2.5 text-[11px] text-muted">
          <span className="flex items-center gap-1.5">
            <InfoIcon className="h-3.5 w-3.5" />
            Auto-refresh every {REFRESH_MS / 1000}s
          </span>
          <span>
            {total > MAX_ROWS
              ? `Showing latest ${MAX_ROWS} of ${total}`
              : `${stats.totalCount} invoice${stats.totalCount === 1 ? "" : "s"}`}
          </span>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint: string;
  accent: "emerald" | "amber" | "monad";
}) {
  const accentClass = {
    emerald: "text-emerald-300",
    amber: "text-amber-200",
    monad: "text-monad-200",
  }[accent];

  return (
    <div className="card p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>
      <p className={cn("mt-1 text-[11px]", accentClass)}>{hint}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="card h-24 animate-pulse bg-white/[0.03]" />
        ))}
      </div>
      <div className="card h-72 animate-pulse bg-white/[0.02]" />
    </div>
  );
}
