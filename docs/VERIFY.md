# Verify the JPay contract

The deployed contract is **not verified yet** on Monadscan/Sourcify. Verification
does not change the contract or the address — it only publishes the source so
judges and users can read it on the explorer.

| Item | Value |
| --- | --- |
| Network | Monad Testnet (`10143`) |
| Contract | `JPayPayment` |
| Address | `0x654DDF8dc6e31C9e024E4009DBb3830b5E506E9a` |
| Deployer (not the contract) | `0xad53015d98278C4c0EDEB3eDe0bE00D757Fa36a4` |
| Source | `packages/contracts/contracts/JPayPayment.sol` |
| Compiler | Solidity `0.8.28` |
| Optimizer | enabled, `runs: 200` |
| EVM version | `shanghai` |
| Constructor arguments | none |
| License | MIT |

> Do **not** paste `DEPLOYER_PRIVATE_KEY` into an explorer form. Verification only
> needs public source code and compiler settings.

## 1. Build the exact artifacts first

From the repo root:

```bash
npm run contracts:compile
```

This produces `packages/contracts/artifacts/` and
`packages/contracts/artifacts/build-info/<hash>.json`. The build-info file
contains the exact compiler input, which is the safest thing to submit.

## 2. Option A — verify in the Monadscan UI (recommended)

1. Open the contract on the explorer:
   <https://testnet.monadscan.com/address/0x654DDF8dc6e31C9e024E4009DBb3830b5E506E9a>
2. Open the **Contract** tab and choose **Verify & Publish** (the label may be
   **Verify Contract** depending on the explorer version).
3. Choose **Solidity (Standard-Json-Input)** if available. Otherwise choose
   **Solidity (Single file)**.
4. Fill in:
   - Compiler: `0.8.28`
   - Optimization: **enabled**, runs `200`
   - EVM version: `shanghai`
   - License: MIT
   - Constructor arguments: leave empty
5. For **Standard-Json-Input**, open
   `packages/contracts/artifacts/build-info/<hash>.json`, copy the value of the
   `input` field, and paste it as the standard JSON input. Do not copy the whole
   build-info object — only the `input` object.
6. For **Single file**, paste the full contents of
   `packages/contracts/contracts/JPayPayment.sol`. The contract has no imports,
   so a single file is enough.
7. Submit and wait for the explorer to index the result. Refresh the contract
   page until the **Contract** tab shows the source.

## 3. Option B — Hardhat verify (optional)

The project intentionally does not ship a verification plugin because no
Monadscan API key is configured. If you want to verify from the CLI:

```bash
npm i -D @nomicfoundation/hardhat-verify
```

Add the plugin to `packages/contracts/hardhat.config.ts`:

```ts
import "@nomicfoundation/hardhat-verify";
```

Then try the Sourcify verifier:

```bash
cd packages/contracts
npx hardhat verify \
  --network monadTestnet \
  0x654DDF8dc6e31C9e024E4009DBb3830b5E506E9a \
  --verifier sourcify \
  --verifier-url https://sourcify-api-monad.blockvision.org/
```

If Monadscan gives you an Etherscan-compatible API URL and key, add a
`customChains` entry plus `etherscan.apiKey` to `hardhat.config.ts` and run:

```bash
npx hardhat verify --network monadTestnet 0x654DDF8dc6e31C9e024E4009DBb3830b5E506E9a
```

Use the explorer UI first if the CLI route is not supported by your Hardhat
version. Verification is a nice-to-have; the live app and transaction receipts
already prove the contract works.

## 4. After verification

1. Open the explorer link and confirm the **Contract** tab shows
   `JPayPayment`.
2. Update the **Smart contract** section in the root `README.md` with the
   verified link and a “Verified” note.
3. Optionally add a screenshot of the verified source to `docs/screenshots/`.
4. Do **not** redeploy or change `NEXT_PUBLIC_JPAY_PAYMENT_ADDRESS` just to make
   verification easier. The current address already has bytecode and live
   invoices.

## 5. Troubleshooting

| Symptom | Fix |
| --- | --- |
| “Bytecode does not match” | Re-check compiler `0.8.28`, optimizer `200`, EVM `shanghai`; recompile and use the fresh build-info input |
| “Already verified” | Open the Contract tab; no action needed |
| Constructor args rejected | JPayPayment has no constructor arguments — leave the field empty |
| Source file not found | Use `packages/contracts/contracts/JPayPayment.sol`, not the old root `contracts/` path |
| Sourcify says unsupported | Use the Monadscan UI path in section 2 |
| You are about to paste a private key | Stop. Verification never needs a private key |
