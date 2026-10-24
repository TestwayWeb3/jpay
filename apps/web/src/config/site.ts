const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";

/**
 * Optional canonical URL (e.g. https://jpay.vercel.app).
 * Only used for metadata / OpenGraph. Payment links and QR codes always use
 * the browser origin so they follow whatever domain is serving the app.
 */
export const siteUrl = configuredSiteUrl.replace(/\/+$/, "");

export const siteConfig = {
  name: "JPay",
  tagline: "Just Pay with Monad",
  description:
    "JPay lets local merchants in Yogyakarta accept crypto in seconds. Customers scan a QR, pay native MON, and funds settle directly to the merchant wallet on Monad — non-custodial.",
  links: {
    monad: "https://monad.xyz",
    docs: "https://docs.monad.xyz",
    faucet: "https://faucet.monad.xyz",
  },
} as const;

/** `/pay/12` */
export function paymentPath(paymentId: string | bigint): string {
  return `/pay/${paymentId.toString()}`;
}

/**
 * Absolute payment link for QR codes and sharing.
 *
 * Runs in the browser, so `window.location.origin` automatically matches
 * localhost during dev and the Vercel domain in production (including previews).
 * NEXT_PUBLIC_SITE_URL is only a server-side fallback.
 */
export function paymentLink(paymentId: string | bigint): string {
  const path = paymentPath(paymentId);

  if (typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }

  return siteUrl ? `${siteUrl}${path}` : path;
}

/**
 * Canonical base URL for metadata. Prefers the explicit env var, then the
 * Vercel-provided deployment URL, and returns undefined instead of hardcoding
 * localhost into a production build.
 */
export function siteBaseUrl(): URL | undefined {
  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();
  const candidate =
    siteUrl ||
    (vercelHost ? `https://${vercelHost.replace(/^https?:\/\//, "").replace(/\/+$/, "")}` : "");

  if (!candidate) return undefined;

  try {
    return new URL(candidate);
  } catch {
    return undefined;
  }
}
