/**
 * Demo staging values.
 *
 * Judges and presenters can open `/demo` (or `/merchant?demo=1`) and get a
 * ready-to-record flow without typing. These values are intentionally small so
 * the demo can be repeated on testnet without draining a faucet balance.
 */
export const DEMO_PRESET = {
  amount: "1",
  description: "Kopi Susu - Kedai Jogja",
} as const;

export function demoMerchantHref(): string {
  const params = new URLSearchParams({
    demo: "1",
    amount: DEMO_PRESET.amount,
    description: DEMO_PRESET.description,
  });

  return `/merchant?${params.toString()}`;
}

export const DEMO_STEPS = [
  {
    step: "01",
    title: "Merchant creates the invoice",
    body: "Open the prefilled merchant console and sign one createPayment transaction.",
  },
  {
    step: "02",
    title: "Customer scans and pays",
    body: "Use a second wallet to open the QR/link and send exactly 1 MON on Monad Testnet.",
  },
  {
    step: "03",
    title: "Dashboard updates live",
    body: "The invoice flips to Paid, the merchant wallet receives 1 MON, and loyalty points increase.",
  },
] as const;
