import type { Metadata } from "next";

import { CustomerPayment } from "@/components/customer-payment";
import { monadTestnet } from "@/config/chains";

/**
 * Invoice pages are always dynamic; never index them.
 */
export function generateMetadata({
  params,
}: {
  params: { paymentId: string };
}): Metadata {
  const validId = /^\d+$/.test(params.paymentId);

  return {
    title: validId ? `Pay invoice #${params.paymentId}` : "Pay",
    description:
      "Scan, review, and pay a JPay invoice with MON on Monad. Non-custodial and settled in about a second.",
    robots: { index: false, follow: false },
  };
}

export default function PayPage({
  params,
}: {
  params: { paymentId: string };
}) {
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] grid-lines"
        aria-hidden
      />

      <section className="relative mx-auto w-full max-w-md px-5 pb-16 pt-10 sm:px-8 sm:pt-14">
        <div className="mb-5 flex items-center justify-between gap-3">
          <span className="pill">
            <span className="h-1.5 w-1.5 rounded-full bg-monad-400" />
            Payment request
          </span>
          <span className="text-[11px] text-muted">{monadTestnet.name}</span>
        </div>

        <CustomerPayment paymentId={params.paymentId} />

        <p className="mt-4 text-center text-[11px] text-muted">
          Powered by JPay · Just Pay with Monad
        </p>
      </section>
    </div>
  );
}
