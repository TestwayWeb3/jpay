# Deploy JPay to Vercel

Target: **Monad Testnet (chain id 10143)**. The smart contract is already deployed; Vercel only hosts the Next.js frontend.

## 0. What you need

- This repository pushed to GitHub (`https://github.com/TestwayWeb3/jpay`)
- A Vercel account
- Your Privy App ID
- Two funded Monad Testnet wallets for the final test

## 1. Pre-flight (local, must pass)

Run these **sequentially** — do not run `typecheck` and `build` at the same time:

```bash
npm run typecheck
npm run lint
npm run build
npm run check:chain
```

Expected:

- `typecheck` and `lint` finish with no errors/warnings.
- `build` prints the route table and no warnings.
- `check:chain` prints the contract bytecode size and ends with `✓ Ready to demo`.

`check:chain` is the fastest way to catch a wrong contract address: if bytecode is `0x`, the address has no code.

## 2. Commit and push

```bash
git add -A
git commit -m "feat: finalize JPay for demo"
git push origin main
```

`apps/web/.env.local`, `packages/contracts/.env` and `.vercel` are git-ignored. Never commit private keys.

## 3. Create the Vercel project

### Option A — Vercel Dashboard (recommended)

1. Open https://vercel.com/new.
2. Import the GitHub repository `TestwayWeb3/jpay`.
3. Framework Preset: **Next.js** (auto-detected).
4. Root Directory: **`apps/web`** (important — this is a monorepo).
5. Install Command: `cd ../.. && npm install` (already set in `apps/web/vercel.json`).
6. Build Command: `cd ../.. && npm run build -w @jpay/web` (already set in `apps/web/vercel.json`).
7. Output Directory: leave the default (`.next` inside `apps/web`).
8. Add the environment variables from section 4.
9. Click **Deploy**.

`apps/web/vercel.json` contains the project-level Vercel config, including workspace-aware install/build commands. Vercel still needs the **Root Directory** set to `apps/web` in the dashboard.

### Option B — Vercel CLI

The dashboard is recommended for the monorepo because the Root Directory setting is explicit. If you prefer the CLI:

```bash
npm i -g vercel
vercel login
cd apps/web
vercel link
```

Then set the project Root Directory to `apps/web` in the Vercel dashboard before the first production deploy.

Add the required variables to Production:

```bash
vercel env add NEXT_PUBLIC_PRIVY_APP_ID production
vercel env add NEXT_PUBLIC_JPAY_PAYMENT_ADDRESS production
```

`vercel env add` prompts for the value. Repeat with `preview` and `development` if you also deploy previews or use `vercel dev`. The dashboard is faster if you want to add all environments at once.

Deploy to production:

```bash
vercel --prod
```

## 4. Environment variables

Set these in **Vercel → Project → Settings → Environment Variables** for **Production** (and **Preview** if you test preview URLs):

| Variable | Required | Value |
| --- | --- | --- |
| `NEXT_PUBLIC_PRIVY_APP_ID` | **Yes** | App ID from https://dashboard.privy.io |
| `NEXT_PUBLIC_JPAY_PAYMENT_ADDRESS` | **Yes** | `0x654DDF8dc6e31C9e024E4009DBb3830b5E506E9a` |

Optional:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_PRIVY_CLIENT_ID` | Only if your Privy project uses a client ID |
| `NEXT_PUBLIC_MONAD_TESTNET_RPC_URL` | Dedicated testnet RPC |
| `NEXT_PUBLIC_MONAD_RPC_URL` | Dedicated mainnet RPC |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata/OG only, e.g. `https://jpay.vercel.app` |

Rules:

- Only `NEXT_PUBLIC_*` variables belong in Vercel. Never add `DEPLOYER_PRIVATE_KEY` or any secret.
- `NEXT_PUBLIC_*` values are inlined at build time. **Redeploy after changing one.**
- `NEXT_PUBLIC_SITE_URL` does **not** control payment links or QR codes. Links use `window.location.origin`, so they follow the domain serving the app automatically.
- Use the contract address, not the deployer wallet. `0xad53…36a4` is the deployer EOA and has no bytecode.

## 5. Post-deploy: Privy Allowed Origins

1. Open https://dashboard.privy.io → select your app.
2. Go to **Settings → Allowed origins** (or **Domains**, depending on the dashboard version).
3. Add your exact production origin, without a trailing slash:

   ```text
   https://your-project.vercel.app
   ```

4. If you demo from a preview deployment, add that preview origin too:

   ```text
   https://your-project-git-main-your-team.vercel.app
   ```

5. Save, then hard-refresh the deployed app.

Without this step the login modal may open but the embedded wallet cannot initialize. `http://localhost:3000` is only needed for local development; keep it in the list if you use the localhost backup plan.

## 6. Verify QR and payment links use the production domain

1. Open `https://your-project.vercel.app/merchant` (not localhost).
2. Connect the merchant wallet and create a small invoice.
3. Click **Copy link**. It must look like:

   ```text
   https://your-project.vercel.app/pay/5
   ```

4. Scan the QR with a phone. It must open the same production URL.
5. If it shows `localhost`, you are creating the invoice from the local dev server, not the Vercel URL. There is nothing to configure — the app uses `window.location.origin` at runtime.
6. If you use a custom domain, add that domain to Privy Allowed Origins and open the app through it.

## 7. Full flow test on production

Use two different wallets: **A = merchant**, **B = customer**. Both must be on Monad Testnet and funded.

1. Open the production URL. Confirm you see the app, not the “Add your Privy App ID” setup screen.
2. Go to `/demo`, click **Open prefilled merchant**, connect wallet A, and create the preset `1 MON` invoice. (Or use `/merchant` and click **Load Demo Data**.)
3. Confirm the QR and copied link use the Vercel domain.
4. Open the link in an incognito window or on your phone, connect wallet B.
5. Confirm amount, description and merchant address are correct.
6. Click **Pay 1 MON**, approve in the wallet, wait for the receipt.
7. Confirm the success screen shows invoice id, amount, merchant, payer and tx hash.
8. Open the tx hash on https://testnet.monadscan.com and confirm it succeeded.
9. Return to the merchant tab: status must become **Paid** within ~5 seconds.
10. Open `/dashboard`: the invoice, totals, filters, and **JPay loyalty points** must be correct. Refresh — data persists because it is read from the chain.
11. Open `/pay/999999`: a friendly “Invoice not found” screen must appear.
12. Open `/demo` and confirm the judge-friendly demo page loads without console errors.
13. Check DevTools Console and Network: no red errors.

## 8. Troubleshooting

| Symptom | Fix |
| --- | --- |
| Vercel build fails with missing env var | Add both required variables to the correct environment, then redeploy |
| App shows the Privy setup screen in production | `NEXT_PUBLIC_PRIVY_APP_ID` is missing or the deployment was built before it was added |
| Privy login fails / embedded wallet never loads | Add the exact production origin to Privy Allowed Origins, save, hard-refresh |
| QR or link shows localhost | You are on localhost. Open the Vercel URL and create a new invoice |
| “Invoice not found” for a real invoice | `NEXT_PUBLIC_JPAY_PAYMENT_ADDRESS` is wrong or points to the deployer wallet |
| `IncorrectAmount` revert | Amount changed or the invoice was already paid; refresh and use the exact amount |
| `OwnInvoice` revert | Wallet A is paying its own invoice; use wallet B |
| Dashboard is empty | Connect the same wallet that created the invoices, and confirm Monad Testnet |
| RPC timeout | Retry; optionally set `NEXT_PUBLIC_MONAD_TESTNET_RPC_URL` and redeploy |
| 404 after refresh | Confirm the project is deployed as Next.js and the domain points to the latest production deployment |

## 9. Contract reference

- Network: Monad Testnet (chain id `10143`)
- Contract: `JPayPayment`
- Address: `0x654DDF8dc6e31C9e024E4009DBb3830b5E506E9a`
- Explorer: https://testnet.monadscan.com/address/0x654DDF8dc6e31C9e024E4009DBb3830b5E506E9a
- Source of truth: `packages/contracts/deployments/monadTestnet.json`
- Verification guide: [`docs/VERIFY.md`](./VERIFY.md)
- `0xad53015d98278C4c0EDEB3eDe0bE00D757Fa36a4` is the **deployer wallet**, not the contract. It has no bytecode.

## 10. After the demo

- Keep the production deployment and the GitHub tag/commit that was demoed.
- Do not change the contract address or env vars during the demo.
- If you rotate the Privy App ID, redeploy and re-test the full flow.
