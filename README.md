# JPay — Just Pay with Monad

Aplikasi pembayaran non-custodial di Monad. Connect wallet (atau login email/Google via Privy), lalu kirim MON.

**Status:** Step 1 selesai — setup Next.js 14 + Privy + wagmi v2 + Monad Testnet/Mainnet.

## Stack

| Layer | Teknologi |
| --- | --- |
| Framework | Next.js 14 (App Router) |
| Bahasa | TypeScript |
| Styling | Tailwind CSS + warna Monad `#6E54FF` |
| Auth & Wallet | Privy (`@privy-io/react-auth`) |
| Blockchain | wagmi v2 + viem + `@privy-io/wagmi` |
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
```

> Tanpa App ID, app menampilkan halaman setup (tidak crash).

## 4. Jalankan

```bash
npm run dev
```

Buka http://localhost:3000 → klik **Connect Wallet** → login → saldo MON tampil di header.

Butuh MON testnet: https://faucet.monad.xyz

## Scripts

| Command | Fungsi |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Jalankan hasil build |
| `npm run lint` | ESLint |

## Struktur Folder

```
src/
├─ app/
│  ├─ layout.tsx          # Root layout + Providers + header/footer
│  ├─ page.tsx            # Landing + form pembayaran
│  └─ globals.css         # Theme, token warna, komponen dasar
├─ components/
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
2. ⬜ Smart contract `createPayment` + `pay` + `getPayment`
3. ⬜ Halaman merchant + QR (`qrcode.react`)
4. ⬜ Halaman customer `/pay/[paymentId]`
5. ⬜ Dashboard status pembayaran
6. ⬜ Polish UI & testing
