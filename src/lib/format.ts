import { formatEther } from "viem";

/** 0x1234…abcd */
export function shortenAddress(address?: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars + 2)}…${address.slice(-chars)}`;
}

/** Human friendly MON amount, without trailing zeros. */
export function formatMon(value?: bigint, maxFractionDigits = 4): string {
  if (value === undefined) return "0";

  const [whole, fraction = ""] = formatEther(value).split(".");
  const trimmed = fraction.slice(0, maxFractionDigits).replace(/0+$/, "");

  return trimmed ? `${whole}.${trimmed}` : whole;
}

/** Turn a wallet/RPC error into something a human can read. */
export function toUserMessage(error: unknown): string | null {
  if (!error) return null;

  const candidate = error as { shortMessage?: string; message?: string };
  const message = candidate.shortMessage || candidate.message || "Transaction failed";

  if (/user rejected|rejected the request|denied/i.test(message)) {
    return "You rejected the request in your wallet.";
  }

  if (/insufficient funds/i.test(message)) {
    return "Insufficient MON balance to cover the amount and gas.";
  }

  return message.length > 160 ? `${message.slice(0, 157)}…` : message;
}
