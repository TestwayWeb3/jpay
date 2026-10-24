# JPay — Just Pay with Monad

Aplikasi pembayaran non-custodial di Monad. Connect wallet (atau login email/Google via Privy), lalu kirim MON.

**Status:** Step 4 selesai — halaman merchant (invoice + QR) dan halaman customer `/pay/[paymentId]` dengan pembayaran MON.

## Stack

| Layer | Teknologi |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| Bahasa | TypeScript |
| Styling | Tailwind CSS + warna Monad `#6E54FF` |
| Auth & Wallet | Privy (`@privy-io/react-auth`) |
| Blockchain | wagmi v2 + viem + `@privy-io/wagmi` |
| QR Code | `qrcode.react` |
| Chain | Monad Testnet (10143) — default, Monad Mainnet (143) |

## 1. Install

```bash
npm install
```

## 2. Buat Privy App

1. Buka https://dashboard.privy.io → **Create app**.
2. Copy **App ID**.
3. **Authentication → Login methods**: aktifkan **Email**, **Google**, dan **Wallet**.
4. **Settings → Allowed origins**: tambahkan `http://localhost:3000` (dan domain Vercel nanti).

## 3. Isi environment

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_PRIVY_APP_ID=clp_xxxxxxxxxxxxxxxx
```

Opsional:

```env
NEXT_PUBLIC_PRIVY_CLIENT_ID=
NEXT_PUBLIC_MONAD_TESTNET_RPC_URL=
NEXT_PUBLIC_MONAD_RPC_URL=
NEXT_PUBLIC_JPAY_PAYMENT_ADDRESS=
```

> Tanpa App ID, app menampilkan halaman setup (tidak crash).

## 4. Jalankan

```bash
npm run dev
```

Buka http://localhost:3000 → klik **Connect Wallet** → login → saldo MON tampil di header.

Butuh MON testnet: https://faucet.monad.xyz

## 5. Smart Contract

Kontrak dan tooling deploy ada di `contracts/` (proyek Hardhat terpisah, dependency tidak bentrok dengan Next.js).

```powershell
cd contracts
npm install
Copy-Item .env.example .env      # isi DEPLOYER_PRIVATE_KEY
npm run compile
npm run test
npm run deploy:testnet           # tulis deployments/monadTestnet.json
```

Setelah deploy, copy `address` dari `contracts/deployments/monadTestnet.json` ke `NEXT_PUBLIC_JPAY_PAYMENT_ADDRESS` di `.env.local`.

| Fungsi | Kegunaan |
| --- | --- |
| `createPayment(amount, description)` | Merchant membuat invoice, return `paymentId` |
| `pay(paymentId)` | Customer bayar tepat sesuai `amount`, dana langsung ke merchant |
| `getPayment(paymentId)` | Baca detail + status invoice |

Detail lengkap (gas, keamanan, contoh viem/ethers) ada di [`contracts/README.md`](contracts/README.md).

**Deployed (Monad Testnet):** [`0x654DDF8dc6e31C9e024E4009DBb3830b5E506E9a`](https://testnet.monadscan.com/address/0x654DDF8dc6e31C9e024E4009DBb3830b5E506E9a)

## 6. Merchant

Buka http://localhost:3000/merchant

1. Connect wallet (Privy).
2. Isi nominal MON + deskripsi → **Create payment**.
3. `createPayment` dieksekusi onchain, lalu QR + payment link muncul.
4. Klik **Copy link** untuk membagikan `/pay/[paymentId]`.

ABI ada di `src/lib/contracts/jpay-payment.ts`; address dibaca dari `NEXT_PUBLIC_JPAY_PAYMENT_ADDRESS`.

## 7. Customer

Buka `/pay/[paymentId]` (dari QR / link yang dibuat merchant).

1. Halaman memanggil `getPayment(paymentId)` dan menampilkan nominal, deskripsi, status, dan merchant.
2. Jika belum dibayar → tombol **Pay** memanggil `pay(paymentId)` dengan `value = amount`, gas limit 60k.
3. Setelah sukses → layar sukses berisi nominal, tx hash, dan link explorer.
4. ID tidak valid / tidak ada → pesan error yang jelas.

Catatan: merchant tidak bisa membayar invoice-nya sendiri (dijaga di kontrak dan UI), jadi siapkan wallet customer terpisah saat demo.

## Scripts

| Command | Fungsi |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Jalankan hasil build |
| `npm run lint` | ESLint |

## Struktur Folder

```
contracts/                # Proyek Hardhat: kontrak JPayPayment + deploy script
├─ contracts/JPayPayment.sol
├─ scripts/deploy.ts
├─ scripts/create-payment.ts
├─ test/JPayPayment.ts
└─ hardhat.config.ts

src/
├─ app/
│  ├─ layout.tsx          # Root layout + Providers + header/footer
│  ├─ page.tsx            # Landing + form pembayaran
│  ├─ merchant/page.tsx   # Halaman merchant: invoice + QR
│  ├─ pay/[paymentId]/page.tsx  # Halaman customer: bayar invoice
│  └─ globals.css         # Theme, token warna, komponen dasar
├─ components/
│  ├─ merchant-payment-card.tsx  # Form createPayment + QR + copy link
│  ├─ customer-payment.tsx       # getPayment + pay + success screen
│  ├─ connect-wallet-button.tsx  # Tombol Connect Wallet + menu wallet
│  ├─ network-switcher.tsx       # Switch Testnet ↔ Mainnet
│  ├─ payment-form.tsx           # Kirim MON (useSendTransactionSync)
│  ├─ setup-notice.tsx           # Fallback jika App ID belum diisi
│  ├─ site-header.tsx / site-footer.tsx
│  ├─ jpay-mark.tsx / icons.tsx
├─ config/
│  ├─ chains.ts           # Chain Monad, explorer, helper
│  └─ site.ts             # Metadata app
├─ lib/
│  ├─ wagmi.ts            # createConfig (Privy) + RPC overrides
│  ├─ contracts/
│  │  └─ jpay-payment.ts  # ABI + address + error mapping
│  ├─ format.ts           # format MON, shorten address, error message
│  └─ cn.ts
└─ providers/
   └─ providers.tsx       # PrivyProvider → QueryClient → WagmiProvider
```

## Ganti network default

Edit `src/config/chains.ts`:

```ts
// default = Monad Testnet
export const supportedChains = [monadTestnet, monad] as const;

// default = Monad Mainnet
export const supportedChains = [monad, monadTestnet] as const;
```

User tetap bisa switch lewat dropdown di header.

## Catatan Monad

- Gas dihitung dari **gas limit**, bukan gas used → jangan set limit asal besar.
- `useSendTransactionSync` memakai `eth_sendRawTransactionSync`, jadi receipt balik dalam satu call.
- Block 400ms, finality ~800ms.

## Troubleshooting

| Masalah | Solusi |
| --- | --- |
| Layar "Add your Privy App ID" | Isi `NEXT_PUBLIC_PRIVY_APP_ID` di `.env.local`, restart dev server |
| Modal Privy kosong / error origin | Tambahkan origin di dashboard Privy |
| Google login tidak muncul | Aktifkan Google di dashboard Privy |
| Saldo 0 | Ambil faucet testnet, pastikan network = Monad Testnet |
| `BigInt literals` error | Pastikan `target: "ES2020"` di `tsconfig.json` |

## Deploy (Vercel)

```bash
npx vercel
```

Tambahkan `NEXT_PUBLIC_PRIVY_APP_ID` di Environment Variables Vercel, lalu daftarkan domain produksi ke Allowed origins Privy.

## Next Steps (sesuai SKILLS.md)

1. ✅ Setup project
2. ✅ Smart contract `createPayment` + `pay` + `getPayment`
3. ✅ Halaman merchant + QR (`qrcode.react`)
4. ✅ Halaman customer `/pay/[paymentId]`
5. ⬜ Dashboard status pembayaran
6. ⬜ Polish UI & testing
