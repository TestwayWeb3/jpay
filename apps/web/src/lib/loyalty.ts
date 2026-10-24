/**
 * Lightweight loyalty layer.
 *
 * Points are derived from onchain invoice data (paid invoices), so there is no
 * extra contract, no extra transaction, and no custody risk. Swap this for an
 * onchain points contract later if the rewards program grows.
 */
export const JPAY_POINTS_PER_SETTLED_INVOICE = 10;

export function merchantLoyaltyPoints(paidInvoiceCount: number): number {
  return Math.max(0, Math.trunc(paidInvoiceCount)) * JPAY_POINTS_PER_SETTLED_INVOICE;
}

export function formatPoints(points: number): string {
  return new Intl.NumberFormat("en-US").format(points);
}
