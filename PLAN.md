# JPay — Technical Execution Plan (QRIS + Loyalty Token)

> Source of truth: PRD.md v0.2  
> Skill wajib: **jpay-hackathon** + MONSKILLS  
> Target: Selesai dalam waktu hackathon

---

## 0. Agent Rules (WAJIB)

1. Selalu mulai dengan skill `jpay-hackathon`.
2. Gunakan MONSKILLS untuk bagian Monad-specific.
3. Kerjakan per Phase. Jangan loncat.
4. Prioritaskan demo yang jalan daripada kesempurnaan.
5. Jangan over-engineer.
6. Setelah setiap phase: commit + verifikasi.

---

## Phase 0 — Setup & Skill
- Pastikan skill `jpay-hackathon` aktif
- Setup Next.js 14 + Tailwind + Privy + wagmi + viem
- Support Monad Testnet
- Warna utama: #6E54FF

**Prompt awal:**
```text
Gunakan skill jpay-hackathon dan MONSKILLS.
Lakukan Phase 0: Setup project JPay (QRIS + Loyalty Token version).