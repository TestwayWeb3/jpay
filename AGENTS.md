# JPay — agent guide

QR payments for merchants on Monad. Customers scan, pay native MON, merchant wallet receives it directly (non-custodial).

## Stack

- Next.js 14 App Router + TypeScript + Tailwind CSS in `apps/web`
- Privy (auth / embedded wallet) + wagmi v2 + viem
- Monad Testnet (10143) by default, Monad Mainnet (143) supported
- Hardhat project in `packages/contracts` (npm workspace `@jpay/contracts`)
- Primary color `#6E54FF`, UI copy in English, mobile-first

## Commands

```bash
npm run dev            # dev server on :3000 (workspace-aware)
npm run typecheck      # tsc --noEmit — must pass
npm run lint           # ESLint — must pass
npm run build          # production build
npm run check:chain    # contract preflight

npm run contracts:compile
npm run contracts:test
npm run contracts:deploy:testnet
npm run contracts:create-payment:testnet
```

## Routes

- `/` — landing
- `/merchant` — connect wallet, create invoice, show QR + copy link; supports `?demo=1&amount=…&description=…`
- `/pay/[paymentId]` — customer checkout (pay exact `amount`, success screen with tx hash)
- `/dashboard` — merchant invoices, stats, filters, loyalty points, 5s auto-refresh
- `/demo` — guided 60-second demo, prefilled merchant CTA

## Key files

- `apps/web/src/lib/contracts/jpay-payment.ts` — ABI, deployed address, error helpers, `JPayPayment` type
- `apps/web/src/config/chains.ts` — Monad chain metadata, explorer URL helpers
- `apps/web/src/config/demo.ts` — demo preset and `/merchant?demo=1` URL helper
- `apps/web/src/components/ui/` — Button, Card, Badge, Input, Field primitives
- `apps/web/src/components/merchant-payment-card.tsx` — invoice creation + QR + **Load Demo Data**
- `apps/web/src/components/customer-payment.tsx` — customer pay flow
- `apps/web/src/components/merchant-dashboard.tsx` — dashboard (`paymentCount` + multicall `getPayment`) + loyalty points
- `packages/contracts/contracts/JPayPayment.sol` — payment registry

## Onchain facts

- Contract: `0x654DDF8dc6e31C9e024E4009DBb3830b5E506E9a` (Monad Testnet)
- Testnet RPC: `https://testnet-rpc.monad.xyz`, explorer: `https://testnet.monadscan.com`
- Payments are native MON only; `amount` is sent as `msg.value`
- `pay()` reverts if the merchant tries to pay their own invoice
- No backend or indexer: read state directly with wagmi/viem

## Rules

- Never print, hardcode, or commit private keys. Use `apps/web/.env.local` and `packages/contracts/.env`; keep `.env.example` placeholders only.
- Keep the existing component/helper patterns (`cn`, `formatMon`, `shortenAddress`, `describePaymentError`) instead of adding new abstractions.
- Every async UI path needs loading, error, success, and empty states; handle wrong network and insufficient balance.
- Contract calls: set an explicit `gas` only when there is a measured reason; do not guess.
- Do not edit generated output: `apps/web/.next/`, `packages/contracts/artifacts/`, `packages/contracts/cache/`, `node_modules/`.
- Before finishing a task, run `npx tsc --noEmit` and `npm run lint`.
