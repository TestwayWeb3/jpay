# JPay — 400-point submission checklist

This is a working checklist mapped to the four 100-point areas described in the
brief. Category names can differ slightly from the official rubric; the goal is
to keep every piece of evidence easy for a judge to find.

Legend: **Done** = implemented in this repo · **Manual** = must be done by the
submitter (deploy, record, post) · **Optional** = extra polish.

## Score overview

| Area | Points | Status | Main evidence |
| --- | --- | --- | --- |
| Submission fundamentals | 100 | Mostly done; deploy is manual | Monorepo, README, `.gitignore`, env docs, contract link |
| Product functionality | 100 | Done; test on production | Wallet → invoice → QR → pay → dashboard, demo staging |
| Build in public & demo | 100 | Partly manual | `/demo`, demo script, video/X placeholders |
| Innovation & differentiation | 100 | Done | Non-custodial flow, Yogyakarta positioning, loyalty points, design system |

---

## 1. Submission fundamentals — 100 points

- [x] Clean monorepo: `apps/web`, `packages/contracts`, `docs/`.
- [x] Root `package.json` with npm workspaces and one-command scripts.
- [x] Root `README.md` in English with problem, solution, features, architecture,
  stack, contract address, setup, env vars, demo flow, video/social sections.
- [x] `.gitignore` covers `.env`, `.env.local`, generated Next/Hardhat output,
  and `.vercel`; `.env.example` files remain tracked.
- [x] Local setup is documented and runnable from the repo root.
- [x] Smart contract address and explorer link are documented.
- [x] Deployer wallet is clearly separated from the contract address.
- [x] Contract source, tests, deploy scripts, and deployment JSON are included.
- [x] Public demo URL placeholder is in the README.
- [x] Demo flow is documented with a judge-friendly `/demo` page.
- [ ] **Manual:** deploy to Vercel with Root Directory `apps/web` and add the
  production URL to the README.
- [ ] **Manual:** verify the contract on Monadscan/Sourcify (see
  [`VERIFY.md`](./VERIFY.md)) and paste the verified link into the README.
- [ ] **Manual:** add screenshots to `docs/screenshots/` and reference them in
  the README.

## 2. Product functionality — 100 points

- [x] Connect wallet via Privy, injected wallet, Coinbase, or WalletConnect.
- [x] Embedded wallet login with email/Google for users without a wallet.
- [x] Merchant creates an invoice with a MON amount and description.
- [x] Invoice is written onchain by `createPayment`.
- [x] QR code and shareable payment link are generated from the browser origin.
- [x] Customer sees amount, description, merchant, network, and status.
- [x] Customer pays the exact amount with native MON.
- [x] Contract rejects underpay/overpay, double payment, and self-payment.
- [x] Success screen shows invoice ID, amount, merchant, payer, and tx hash.
- [x] Merchant status flips to **Paid** automatically from onchain reads.
- [x] Dashboard shows invoices, totals, filters, payer, and 5s auto-refresh.
- [x] Wrong-network, low-balance, rejected-transaction, and not-found states.
- [x] Mobile-first layout with QR, copy, share, and wallet actions.
- [x] Demo Staging: `/demo` + prefilled `/merchant?demo=1` + **Load Demo Data**.
- [x] Contract test suite (`npm run contracts:test`) passes locally.
- [ ] **Manual:** run the full two-wallet flow on the production URL and keep
  the tx hash/screenshot as proof.

## 3. Build in public & demo — 100 points

- [x] `/demo` page with a 60-second script and prefilled invoice.
- [x] Presenter checklist and backup plan in [`DEMO.md`](./DEMO.md).
- [x] Deployment instructions in [`DEPLOY.md`](./DEPLOY.md).
- [x] README sections for **Demo Video** and **Social Proof**.
- [x] Clear, repeatable demo data (`1 MON`, `Kopi Susu - Kedai Jogja`).
- [x] Non-custodial and Yogyakarta messaging repeated in UI and docs.
- [ ] **Manual:** record a 60–90 second demo video (create → QR → pay → Paid →
  dashboard → loyalty points).
- [ ] **Manual:** upload the video somewhere public and add the link to the
  README “Demo Video” section.
- [ ] **Manual:** publish an X/Twitter thread or post with the demo video,
  screenshots, repo link, and contract link.
- [ ] **Manual:** add the X post link and any likes/reposts to “Social Proof”.
- [ ] **Manual:** add 3–5 screenshots (landing, merchant QR, success receipt,
  dashboard, explorer tx).
- [ ] **Optional:** post a short “build in public” update after deployment.

## 4. Innovation & differentiation — 100 points

- [x] Non-custodial by design: `pay()` forwards MON directly to the merchant.
- [x] No backend, database, or indexer — the chain is the source of truth.
- [x] QR payment UX for local merchants instead of a generic wallet transfer.
- [x] Explicit Yogyakarta positioning: “Pay with crypto at any local merchant
  in Yogyakarta using Monad.”
- [x] JPay loyalty points: 10 points per settled invoice, derived from onchain
  data (no extra contract risk).
- [x] Design system primitives: `Button`, `Card`, `Badge`, `Input`, `Field`.
- [x] Consistent primary color `#6E54FF`, dark theme, mobile-first layout.
- [x] Monorepo + docs make the project easy for the next developer to extend.
- [x] Contract is intentionally small: no owner, no upgrade, no custody.
- [x] Mainnet chain metadata (`143`) is already supported.
- [ ] **Optional future:** onchain loyalty counter/event, merchant profiles,
  USDC settlement, receipt NFT.

---

## Manual actions in the right order

1. **Push the repo** (after `npm run typecheck`, `npm run lint`, `npm run build`).
2. **Deploy to Vercel** with Root Directory `apps/web`; add
   `NEXT_PUBLIC_PRIVY_APP_ID` and `NEXT_PUBLIC_JPAY_PAYMENT_ADDRESS`.
3. **Add the production origin to Privy Allowed Origins.**
4. **Run the full production test** with two funded wallets (see
   [`DEPLOY.md`](./DEPLOY.md) section 7).
5. **Verify the contract** (see [`VERIFY.md`](./VERIFY.md)) and paste the
   explorer link into the README.
6. **Capture screenshots** for `docs/screenshots/` and update the README.
7. **Record the 60–90 second demo video** using `/demo` as the starting point.
8. **Post on X** with the video, screenshots, repo, live URL, and contract link.
9. **Update the README placeholders**: live URL, video URL, X post, social proof.
10. **Submit** the repo + live URL + video + social post.

## Evidence to keep ready

| Evidence | Where |
| --- | --- |
| Live app | Vercel production URL (add to README) |
| Contract | <https://testnet.monadscan.com/address/0x654DDF8dc6e31C9e024E4009DBb3830b5E506E9a> |
| Successful payment tx | Monadscan tx link (add to README/social post) |
| Demo video | X/YouTube/Loom link (add to README) |
| Social post | X link (add to README) |
| Screenshots | `docs/screenshots/` |
| Local proof | `npm run check:chain`, `npm run contracts:test` output |

## Final submission check

- [ ] README has no `TODO`/placeholder left except clearly marked optional items.
- [ ] Every env var in the README exists in `apps/web/.env.example`.
- [ ] `.env.local` and private keys are not in git history.
- [ ] `npm run typecheck`, `npm run lint`, and `npm run build` pass from root.
- [ ] `/`, `/merchant`, `/dashboard`, `/demo`, and `/pay/[id]` work on mobile.
- [ ] Contract address in the README, Vercel env, and `.env.example` is
  `0x654DDF8dc6e31C9e024E4009DBb3830b5E506E9a`.
- [ ] A judge can understand the project in under two minutes from the README.
