# Progres redesain UI landing

Dokumen ini merekam apa yang sudah dikerjakan, keputusan yang diambil, hasil verifikasi, dan sisa pekerjaan untuk redesain landing `eranusasiber.my.id`. Status per tiket yang resmi ada di tabel Progres [PLAN_REDESIGN_UI.md](../PLAN_REDESIGN_UI.md). Dokumen ini menjelaskan konteksnya.

Diperbarui 2026-10-28. Redesain sudah live di produksi lewat PR #3 (`728f70f`). Tabel progres diperbarui lewat PR #4 (`aaf600d`).

## Ringkasan

| Hal | Hasil |
|---|---|
| Tujuan | Landing baru dengan design system Triad PRO-TX Siber x Eranusasiber, layout dan animasi mengikuti genesis.ai, modal video player, aset video dan foto Pixabay |
| Status | Tiket R00 sampai R17 selesai, live di produksi |
| Pengujian | 42 file, 317 test hijau (baseline 8 test). `typecheck` 0 error, build lulus |
| Lint | 2 error lama (`textarea.tsx`, `AIGenerator.tsx`), tidak ada yang baru. CI tidak menjalankan lint |
| Bundle | JS 675.970 B (gzip 208,08 kB) dari 653.879 B (gzip 202,10 kB), naik 3,4%. Batas rencana 752 kB. CSS 88,4 kB (gzip 27,6 kB) dari 50,9 kB (gzip 9,2 kB) karena font self-host dan kelas design system |
| Media | 14 berkas Pixabay, 31 MB di `frontend/public/media` (batas 40 MB) |
| Tidak disentuh | `backend/`, `deploy/`, `.github/`, `tests/`. Tidak ada migrasi DB |

## Apa yang dibangun

**Dasar visual.** Token design system dipetakan ke `frontend/src/index.css` dan `tailwind.config.ts` (warna, bayangan, motion, font). Font self-host: DM Serif Display, Inter, JetBrains Mono. Snapshot design system ada di `docs/design-system/`. Test drift `src/test/design-tokens.test.ts` menjaga nilai tetap sama dengan snapshot dan memeriksa kontras WCAG untuk pasangan warna yang dipakai.

**Komponen.** `src/components/ds` (Button, LinkUnderline, LineMarker, Eyebrow, Card, Badge, ShieldStripe, SectionGrid, MaskReveal), `src/motion` (`useReveal` dan kelas stagger), `src/components/video-player` (satu `<dialog>` global), `src/media` dan `src/components/media` (manifest, `LoopVideo`, `useCursorPill`), `src/components/site` (`SiteLayout`, `TopNav`, `Footer`).

**Landing.** `src/components/landing`: `Hero`, `Environment`, `Services`, `FeatureVideos`, `About`, `Team`, `CtaBanner`. Teks ada di `src/content/*`. Halaman `/kredit` menampilkan atribusi Pixabay.

**Halaman lain.** Semua halaman publik dan admin berada di bawah satu `SiteLayout`. Header dan Footer lama, komponen landing lama, dan tiga foto lama dihapus. Gradien biru/indigo/ungu diganti token.

**Pipeline aset.** `frontend/scripts/pixabay` dengan perintah `npm run assets:pixabay` dan `npm run assets:search`. Aset diunduh saat build ke repo, bukan dari browser, sesuai aturan Pixabay (gambar wajib diunduh, cache 24 jam, 100 permintaan per menit).

## Keputusan penting

| Keputusan | Alasan |
|---|---|
| Aset Pixabay diambil build-time dan di-commit | Memenuhi aturan Pixabay dan key tidak masuk bundle browser. Harga: 31 MB di riwayat git |
| Cakupan: landing dulu, lalu halaman lain ikut shell dan token | Atas pilihan user di awal |
| Blend `mix-blend-mode: difference` hanya untuk marker, label mono, dan timecode | Headline dan tombol di luar layer blend supaya biru brand tidak terbalik warnanya |
| Modal memakai `<dialog>` | Focus trap, Escape, dan latar inert tanpa kode tambahan. Situs benchmark tidak punya ini |
| `MediaCard` dibatalkan | Section memakai `LoopVideo`, `useCursorPill`, dan `open(id)` langsung. Satu lapisan lebih sedikit |
| Label mono dinaikkan dari 10px ke 11px | Keterbacaan |
| Tidak ada section statistik | Repo tidak punya angka resmi dan design system melarang mengarang angka |
| Loop hero punya rendisi `tiny` untuk layar kecil | Ponsel mengunduh 2,8 MB, bukan 6 MB |
| Link "LinkedIn" dan "Pelajari" tetap terbaca saat diam, wipe hanya mewarnai | Versi awal menyembunyikan teks sampai hover dan hanya menampilkan panah |
| T26 (migrasi Alembic 0002) tidak dikerjakan | Rencana terpisah di `PLAN.md` dan akan mengubah DB produksi. User memilih "Bukan, redesain saja" |

## Cara kerja dan verifikasi

Setiap tiket dikerjakan oleh worker terpisah di worktree sendiri dengan TDD, lalu di-merge ke `redesign/ui` setelah `typecheck`, test, dan build dijalankan ulang di checkout utama. Tahap verifikasi:

1. Browser pane di 375px dan 1024px pada build produksi. Ditemukan 8 cacat visual (teks sulit dibaca di atas video, tombol utama hero kurang kontras, heading Environment terlalu sempit, pernyataan About terlalu tinggi, label link tersembunyi, email footer terpotong, kontrol player terpotong di mobile, target sentuh 24px). Semua diperbaiki.
2. Review independen read-only atas `main...redesign/ui`: 0 BLOCKER, 0 HIGH, 4 MEDIUM, 7 LOW. Semua diperbaiki kecuali satu (preload poster di semua rute, diterima).
3. Scan key Pixabay: 0 temuan di diff dan working tree.
4. Setelah merge: produksi dicek.

| Cek produksi | Hasil |
|---|---|
| `/media/*.mp4` | 200 `video/mp4`, cache 30 hari |
| Hero | Memutar `pixabay-173102-small.mp4`, `h1` benar |
| Modal | Terbuka dan memutar `medium.mp4` |
| `/kredit`, `/services` | 200 |
| Canonical, `og:url`, JSON-LD | Tetap `https://eranusasiber.my.id/` |
| API | `/api/health` 200, `/api/resources` 200, `/api/admin/resources` tanpa token 401 |
| Vercel lama | 404 |
| Chrome asli 1536px | `h1` 84px DM Serif, container 1400px, grid 12 kolom, tanpa overflow, pill kursor aktif |
| Reduced motion (simulasi CSS) | 24 elemen `.reveal-fade` berubah dari `opacity: 0` ke 1 tanpa transisi |

Catatan: cek pertama pada `tiny.mp4` sempat positif palsu (nginx SPA fallback mengembalikan `index.html` dengan 200). Syarat diganti menjadi `content-type: video/mp4`.

## Belum dicek, perlu orang

| Item | Pemilik | Catatan |
|---|---|---|
| Safari, Firefox | User | Fitur yang dipakai: `color-mix` hanya untuk alpha, `@property`, `@starting-style`, `backdrop-filter`, `<dialog>` |
| Perangkat sentuh nyata | User | Pengecekan sentuh baru berupa test dan perbaikan dari review. Kontrol player di mobile belum diuji dengan jari |
| Reduced motion dengan preferensi OS aktif | User | Sisi CSS disimulasikan, sisi JS tercakup unit test |
| Pilihan video dan foto Pixabay | User | Dikurasi otomatis dari contact sheet. ID ada di `frontend/scripts/pixabay/assets.config.json`. Mengganti: ubah entri lalu `npm run assets:pixabay` |
| Key Pixabay | User | Pernah tertulis di percakapan. Buat key baru, simpan di `frontend/.env.local` (git-ignored, tanpa prefix `VITE_`) |

## Utang teknis dan tindak lanjut

| Item | Prioritas | Catatan |
|---|---|---|
| Entri warna `dark` di `tailwind.config.ts` dan variabel `--dark*` | Rendah | Kemungkinan tidak terpakai, dijaga oleh drift test. Hapus bersama test-nya |
| Preload poster hero berlaku di semua rute | Rendah | Poster ikut diunduh di `/admin` dan `/login`. Bisa disuntik hanya untuk `/` |
| JS satu chunk 676 kB, peringatan Vite > 500 kB | Rendah | Halaman admin bisa dipecah dengan `React.lazy` |
| Riwayat git +31 MB karena media | Info | Bila jadi masalah, pindahkan media ke penyimpanan terpisah dan unduh saat build dengan key sebagai secret CI |
| Tombol `size="sm"` setinggi 24px di desktop | Info | Di pointer kasar otomatis 44px. Tombol layar penuh tetap target sentuh utama |
| T26 migrasi kolom `ai_review_score`, `ai_review_result`, `is_published` | Terpisah | Lihat `PLAN.md`. Menghapus kolom tidak bisa dibatalkan, jalankan setelah review dan cadangan |

## Operasi sehari-hari

```bash
cd frontend
npm ci
npm run typecheck && npm test && npm run build   # gerbang sebelum push
npm run assets:search -- "kata kunci" --kind video   # cari kandidat, hasil di .cache/pixabay/candidates.html
npm run assets:pixabay                                # unduh sesuai assets.config.json, tulis manifest
```

Merge ke `main` memicu rilis otomatis ke VPS dalam sekitar 2 menit (lihat T22 di `PLAN.md`). Kerjakan perubahan di branch dan buka PR.

## Catatan proses

- Beberapa worker sempat macet: menjalankan `python -` yang menunggu stdin, dan satu `npm ci` yang terganggu `node_modules` setengah terhapus. Perbaikannya: hentikan proses sisa, hapus `node_modules` worktree itu, jalankan ulang `npm ci`. Brief berikutnya melarang perintah yang menunggu stdin.
- `python -m http.server` untuk contact sheet ditolak sistem izin (mengekspos layanan lokal). Contact sheet dirender lewat browser pane.
- Browser pane merender animasi JS hanya setelah ada panggilan screenshot, dan hanya menangkap area sekitar 800x600. Pengecekan lebar besar dilakukan lewat Chrome asli, yang screenshot-nya sempat time-out, jadi sebagian dicek lewat ukuran elemen.
