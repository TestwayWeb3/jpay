# JPay — agent guide

QR payments for merchants on Monad. Customers scan, pay native MON, merchant wallet receives it directly (non-custodial).

## Stack

- Next.js 14 App Router + TypeScript + Tailwind CSS
- Privy (auth / embedded wallet) + wagmi v2 + viem
- Monad Testnet (10143) by default, Monad Mainnet (143) supported
- Hardhat project in `contracts/` (separate tsconfig, excluded from root typecheck)
- Primary color `#6E54FF`, UI copy in English, mobile-first

## Commands

```bash
npm run dev            # dev server on :3000
npx tsc --noEmit       # typecheck — must pass
npm run lint           # ESLint — must pass
npm run build          # production build

cd contracts
npm run compile
npm run test
npm run deploy:testnet
npm run create-payment:testnet
```

## Routes

- `/` — landing
- `/merchant` — connect wallet, create invoice, show QR + copy link
- `/pay/[paymentId]` — customer checkout (pay exact `amount`, success screen with tx hash)
- `/dashboard` — merchant invoices, stats, filters, 5s auto-refresh

## Key files

- `src/lib/contracts/jpay-payment.ts` — ABI, deployed address, error helpers, `JPayPayment` type
- `src/config/chains.ts` — Monad chain metadata, explorer URL helpers
- `src/components/merchant-payment-card.tsx` — invoice creation + QR
- `src/components/customer-payment.tsx` — customer pay flow
- `src/components/merchant-dashboard.tsx` — dashboard (`paymentCount` + multicall `getPayment`)
- `contracts/JPayPayment.sol` — payment registry

## Onchain facts

- Contract: `0x654DDF8dc6e31C9e024E4009DBb3830b5E506E9a` (Monad Testnet)
- Testnet RPC: `https://testnet-rpc.monad.xyz`, explorer: `https://testnet.monadscan.com`
- Payments are native MON only; `amount` is sent as `msg.value`
- `pay()` reverts if the merchant tries to pay their own invoice
- No backend or indexer: read state directly with wagmi/viem

## Rules

- Never print, hardcode, or commit private keys. Use `.env.local` and `contracts/.env`; keep `.env.example` placeholders only.
- Keep the existing component/helper patterns (`cn`, `formatMon`, `shortenAddress`, `describePaymentError`) instead of adding new abstractions.
- Every async UI path needs loading, error, success, and empty states; handle wrong network and insufficient balance.
- Contract calls: set an explicit `gas` only when there is a measured reason; do not guess.
- Do not edit generated output: `.next/`, `contracts/artifacts/`, `contracts/cache/`, `node_modules/`.
- Before finishing a task, run `npx tsc --noEmit` and `npm run lint`.
