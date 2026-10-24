# JPay — Demo Script (3 menit)

## Final Demo Checklist (production)

Centang semuanya sebelum tampil di depan juri.

> **Demo staging:** buka `/demo` untuk halaman panduan 60 detik, lalu klik **Open prefilled merchant**. Form merchant sudah terisi `1 MON` + `Kopi Susu - Kedai Jogja`. Di halaman merchant juga ada tombol **Load Demo Data** kapan saja.

### Deploy & akses

- [ ] URL production Vercel terbuka dan menampilkan aplikasi, bukan halaman setup Privy.
- [ ] Domain production sudah ditambahkan ke **Privy → Allowed origins**.
- [ ] `NEXT_PUBLIC_JPAY_PAYMENT_ADDRESS` di Vercel = `0x654DDF8dc6e31C9e024E4009DBb3830b5E506E9a` (bukan wallet deployer `0xad53…36a4`).
- [ ] `npm run check:chain` di laptop → “✓ Ready to demo”.

### Wallet

- [ ] Wallet merchant (A) connect tanpa error dan berada di **Monad Testnet**.
- [ ] Wallet customer (B) di browser incognito/HP, connect tanpa error dan berada di **Monad Testnet**.
- [ ] Kedua wallet punya MON testnet cukup (minimal 2–3 MON).
- [ ] Wallet A ≠ wallet B — kontrak menolak merchant membayar invoice sendiri.
- [ ] Faucet sudah disiapkan: https://faucet.monad.xyz (jangan klaim saat demo).

### Flow utama

- [ ] **Full flow berjalan di production** (bukan localhost).
- [ ] **Wallet connect lancar** untuk merchant dan customer.
- [ ] `/demo` terbuka dan tombol **Open prefilled merchant** mengisi form otomatis.
- [ ] **Buat pembayaran → muncul QR** beserta tombol **Copy link**.
- [ ] QR dan link memakai domain production (`https://...`), bukan localhost.
- [ ] Buka link di wallet B → nominal, deskripsi, dan merchant benar.
- [ ] **Bayar dari wallet lain berhasil** dan transaksi muncul di wallet.
- [ ] **Halaman success muncul**: invoice id, amount, merchant, payer, tx hash.
- [ ] Tx hash bisa dibuka di https://testnet.monadscan.com dan statusnya sukses.

### Merchant dashboard

- [ ] **Merchant dashboard menampilkan data**: invoice yang sama muncul.
- [ ] Status merchant berubah **Paid** dalam ±5 detik.
- [ ] **Total received** bertambah dan filter All/Unpaid/Paid berfungsi.
- [ ] **JPay points** bertambah 10 untuk invoice yang paid.
- [ ] Refresh dashboard → data tetap benar.

### Console & edge cases

- [ ] **Tidak ada error di console** (DevTools Console dan Network bersih).
- [ ] `/pay/999999` menampilkan “Invoice not found” yang ramah.
- [ ] Wallet di network salah → banner + tombol switch Monad Testnet.
- [ ] Saldo kurang → peringatan saldo + link faucet.
- [ ] Tombol **Create payment** dan **Pay** punya loading state yang jelas.

## Logistik 15 menit sebelum tampil

- [ ] Buka URL production Vercel (bukan localhost), lalu hard-refresh.
- [ ] Jalankan `npm run check:chain` di laptop → “✓ Ready to demo”.
- [ ] Siapkan dua browser/profile: wallet A (merchant) dan B (customer).
- [ ] Tutup tab yang tidak perlu, zoom browser ~110% untuk layar proyektor.
- [ ] Siapkan invoice cadangan (satu Unpaid, satu Paid) dan video backup.
- [ ] Siapkan hotspot HP dan charger laptop.

## Alur demo

### 0:00 — Hook (20 detik)

Buka `/`:

> “JPay is QR payments for merchants on Monad. The customer scans, pays native MON, and the money lands directly in the merchant's wallet — no custodian, no backend, settlement under a second.”

Tunjukkan badge **Built for Yogyakarta merchants · Monad Testnet** dan tombol **Create a payment**.

### 0:20 — Merchant membuat invoice (40 detik)

1. Buka `/demo` → klik **Open prefilled merchant**.
2. Connect wallet A (sudah login). Form sudah terisi `1` MON dan `Kopi Susu - Kedai Jogja`.
3. Jika perlu, klik **Load Demo Data** untuk mengisi ulang.
4. Klik **Create payment**, setujui di wallet.
5. Tunggu QR muncul.

Bicara sambil menunggu:

> “One contract call creates the invoice. The QR encodes a normal URL, so any phone camera works — no app install.”

Setelah QR muncul:

- Klik **Copy link** → tunjukkan konfirmasi “Link copied”.
- Tunjukkan **Share** dan tombol **Dashboard**.
- Sebut bahwa status di layar ini ikut berubah otomatis saat dibayar.

### 1:00 — Customer membayar (50 detik)

1. Buka link `/pay/<id>` di wallet B (incognito / HP).
2. Tunjukkan nominal, deskripsi, merchant, network, dan status **Awaiting payment**.
3. Klik **Pay 1 MON**, setujui di wallet.
4. Layar sukses muncul:
   - invoice #, nominal, merchant, payer
   - tx hash + tombol copy
   - **Share receipt**

Bicara:

> “The contract enforces the exact amount. Funds go straight to the merchant in the same transaction. The success screen is a receipt anyone can verify on Monadscan.”

### 1:50 — Status live di merchant (30 detik)

1. Kembali ke tab merchant (layar QR).
2. Tunggu ±4 detik → badge berubah **Paid**, muncul “Payment received”.
3. Buka `/dashboard`:
   - invoice yang sama berstatus **Paid**
   - **Total received** bertambah
   - **JPay points** bertambah 10
   - filter All / Unpaid / Paid berfungsi
   - auto-refresh tiap 5 detik, tanpa backend

Bicara:

> “Everything is read directly from the contract with multicall. No indexer, no database — the chain is the source of truth.”

### 2:20 — Error handling (20 detik)

Tunjukkan salah satu (pilih yang paling aman):

- Buka `/pay/999999` → “Invoice not found” yang ramah.
- Atau tolak transaksi di wallet → “You rejected the request in your wallet.”
- Atau buka dengan wallet merchant → “This is your own invoice. Pay it from a customer wallet.”

### 2:40 — Closing (20 detik)

> “JPay is non-custodial, mobile-first, built for Yogyakarta merchants, and powered by Next.js 14, Privy, wagmi and viem on Monad. Every paid invoice also earns JPay loyalty points. Next step: merchant profiles, USDC settlement, and an onchain receipt page. Thanks!”

## Test matrix

| Skenario | Ekspektasi |
| --- | --- |
| Buat invoice valid | QR + link muncul, invoice masuk dashboard sebagai Unpaid |
| Bayar dari wallet lain | Sukses, hash tampil, status merchant & dashboard jadi Paid |
| Nominal kurang/lebih | Kontrak revert `IncorrectAmount`, UI menampilkan pesan jelas |
| Wallet merchant membayar sendiri | Ditolak kontrak + pesan UI |
| Saldo tidak cukup | Peringatan saldo + link faucet |
| Network salah | Banner + tombol switch Monad Testnet |
| Invoice tidak ada | Pesan “not found”, bukan layar putih |
| URL ngawur | Halaman 404 JPay |
| Refresh dashboard | Data tetap benar (dibaca ulang dari chain) |
| Buka link dari HP | Layout mobile rapi, QR bisa discan |

## Troubleshooting cepat

| Masalah | Solusi |
| --- | --- |
| QR mengarah ke localhost | Pastikan membuka app dari domain Vercel yang benar (link memakai origin browser); hard-refresh tab |
| Login Privy gagal di Vercel | Tambahkan domain ke Allowed origins Privy |
| Invoice tidak muncul di dashboard | Pastikan wallet yang connect sama dengan wallet pembuat |
| Status tidak berubah | Tunggu 5 detik; pastikan wallet di Monad Testnet; cek tx di explorer |
| Contract call revert | Cek `NEXT_PUBLIC_JPAY_PAYMENT_ADDRESS` = contract, bukan wallet deployer |
| Saldo 0 | Faucet Monad Testnet, tunggu ~1,2 detik setelah funding |

## Backup Plan (kalau production bermasalah)

Rencana B berurutan:

1. **Jangan debug live.** Tetap tenang, jelaskan alur normalnya, lalu pindah ke rencana berikutnya.
2. **Invoice cadangan.** Sebelum tampil, buat satu invoice **Unpaid** dan satu invoice **Paid**. Kalau create invoice live gagal, tunjukkan invoice cadangan di `/pay/<id>` dan dashboard.
3. **Localhost cadangan.** Jalankan `npm run dev` di root repo. `apps/web/.env.local` sudah berisi Privy App ID + contract yang sama, dan `http://localhost:3000` sudah ada di Privy Allowed Origins. Data invoice production tetap terlihat karena membaca contract yang sama.
   - Catatan: QR localhost tidak bisa discan dari HP. Gunakan **Copy link** lalu buka di browser kedua di laptop yang sama.
4. **Video backup 60–90 detik.** Rekam flow lengkap dari production: create → QR → bayar → success → dashboard Paid. Simpan file offline di laptop, bukan hanya di cloud.
5. **Screenshot bukti.** Simpan screenshot QR, success screen dengan tx hash, dashboard Paid, dan halaman explorer.
6. **Wallet cadangan.** Siapkan wallet C yang sudah login dan punya MON testnet. Kalau wallet B bermasalah, ganti tanpa mengubah contract.
7. **Koneksi cadangan.** Siapkan hotspot HP. Kalau RPC publik lambat, tunggu beberapa detik dan retry — jangan ganti env saat demo.
8. **Kalau Vercel down total.** Tunjukkan video backup, lalu lanjut demo localhost untuk bagian dashboard dan contract read. Jelaskan bahwa frontend dan contract terpisah, jadi dana dan invoice tetap aman onchain.
9. **Jangan mengubah contract address atau env saat demo.** Semua sudah final dan sudah diverifikasi.

## Kalau demo gagal di tengah jalan

1. Jangan debug live. Buka invoice cadangan yang sudah Paid.
2. Jelaskan alur normalnya sambil menunjukkan dashboard.
3. Simpan error untuk setelah demo — jangan reload berulang di depan juri.
