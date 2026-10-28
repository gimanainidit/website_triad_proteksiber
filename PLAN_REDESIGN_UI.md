# PLAN: Redesain UI landing TRIAD PRO-TX SIBER

> Dokumen ini hidup di branch `redesign/ui`. Benchmark visual ada di [docs/benchmark-genesis.md](docs/benchmark-genesis.md). Eksekusi tiket berjalan lewat `/poteto-mode`, satu tiket per sesi. `PLAN.md` (migrasi VPS) tidak berubah dan tetap terpisah.

## Konteks

Landing page `eranusasiber.my.id` (Vite + React 18 + Tailwind 3 + shadcn, folder `frontend/`) masih memakai tampilan template Lovable:
- Font Merriweather + Inter.
- Hero gradien dengan `NetworkMesh` canvas.
- Animasi framer-motion `whileInView` generik.
- Tidak ada video, modal, atau sistem grid.

Tujuan redesain:
1. **Design system default akun** "Triad PRO-TX Siber × Eranusasiber" (artifact `https://claude.ai/artifact/GoEeTPA2F4dFGvALRqreq3`) menjadi sumber token: warna, tipografi DM Serif Display / Inter / JetBrains Mono, spasi, radius, shadow, komponen `tps-*`, dan ShieldStripe wajib.
2. **Layout, komponen, dan animasi setia ke benchmark genesis.ai.** Rinciannya ada di `observasi.md` dari sesi sebelumnya. Polanya: card besar membulat, grid 12 kolom dengan line marker "—", label mono, video full-bleed, cursor pill, stagger reveal, mask wipe, `mix-blend-mode: difference`, dan modal video player.
3. **Aset video dan foto dari Pixabay**, diambil oleh script build-time. Contohnya video 173102 "Robot, Technology, Futuristic" (1920×1080, 30fps, Pixabay Content License).

Keputusan user (2026-10-28):
- Pixabay lewat **script build-time**.
- Cakupan **landing page dulu**. Halaman lain hanya ikut token dan shell baru.
- Hero memakai **video Pixabay + mesh**.
- Gaya animasi **setia ke benchmark**.

Eksekusi memakai **pstack `/poteto-mode`**, satu tiket per sesi kerja. Skill mattpocock dipakai sesuai kolom Skill di tabel Progres.

## Cara memakai dokumen ini

1. Ambil tiket pertama di **Progres** yang berstatus ⬜ dan semua blocker-nya ✅.
2. Jalankan `/poteto-mode` dengan tiket itu sebagai tugas. Pakai skill yang tertulis di kolom Skill.
3. Kerjakan sampai kriteria **Selesai bila** terpenuhi.
4. Ubah status di tabel Progres (satu-satunya tempat status), isi kolom Bukti, lalu commit `PLAN_REDESIGN_UI.md`.

Status: ✅ selesai · 🟡 sebagian · ⬜ belum · ⛔ menunggu keputusan.
Pelaku: **Agent** (Claude) · **User** (kamu: key Pixabay, approval visual, merge).

**Aturan rilis.** VPS menarik setiap push hijau ke `main` dalam ±2 menit (T22 di `PLAN.md`). Semua kerja dilakukan di branch `redesign/ui`. Merge ke `main` hanya lewat PR setelah R17 dan persetujuan user.

## Progres

| ID | Tiket | Pelaku | Blocker | Skill | Status | Bukti |
|---|---|---|---|---|---|---|
| R00 | Konfirmasi seam test dan pembagian tiket | User | – | `grilling` (opsional) | ✅ | Seam dan pembagian tiket disetujui user 2026-10-28, tanpa perubahan. `grilling` dilewati |
| R01 | Branch `redesign/ui` + baseline | Agent | R00 | – | ✅ | 2026-10-28, Node v24.22.1 lokal (CI memakai 22). `npm ci` 428 paket. `typecheck` lulus. **`lint` gagal: 3 error + 10 warning, sudah ada sebelum redesain** (`textarea.tsx:5` no-empty-object-type, `AIGenerator.tsx:25` no-explicit-any, `tailwind.config.ts:111` no-require-imports; CI tidak menjalankan lint). `test` 8 lulus di 4 file. `build` lulus. Bundle: JS 653.879 B (gzip 202,10 kB), CSS 50.863 B (gzip 9,21 kB), font 48 file 1.094.320 B, gambar 603.530 B, `build/` 3.874 KB. Batas R16: JS ≤ 752 kB. Screenshot `frontend/.cache/baseline/home-{375,768,1024,1440}.jpg` (tidak di-commit). Temuan baseline: animasi masuk hero (framer-motion) baru tampil setelah frame dirender, dan frasa aksen "dari Ancaman Siber." berwarna biru di atas gradien biru, kontrasnya rendah |
| R02 | Pipeline aset Pixabay (script + manifest + atribusi) | Agent | R01 | `tdd`, `codebase-design` | ⬜ | |
| R03 | Kurasi dan unduh aset | Agent + User | R02 | – | ⬜ | |
| R04 | Prototipe hero + modal + draft copy, disetujui user | Agent + User | R03 | `prototype` | ⬜ | |
| R05 | Token design system ke `index.css` + Tailwind + font | Agent | R01 | – | ⬜ | |
| R06 | Primitif UI (Button, LinkUnderline, LineMarker, Eyebrow, Card, ShieldStripe, SectionGrid) | Agent | R05 | `tdd` | ⬜ | |
| R07 | Sistem motion (`useReveal` + CSS stagger + reduced motion) | Agent | R05 | `tdd` | ⬜ | |
| R08 | Modul VideoPlayer (`<dialog>` global) | Agent | R05 | `codebase-design`, `tdd` | ⬜ | |
| R09 | Primitif media (`LoopVideo`, `useCursorPill`, `MediaCard`, modul `media`) | Agent | R03, R07, R08 | `tdd` | ⬜ | |
| R10 | Shell situs: `SiteLayout`, TopNav, Footer, ShieldStripe, halaman `/kredit` | Agent | R06, R09 | `tdd` | ⬜ | |
| R11 | Section Hero | Agent | R04, R10 | `tdd` | ⬜ | |
| R12 | Section "Lingkungan kritis" (big media) + Layanan | Agent | R11 | `tdd` | ⬜ | |
| R13 | Dua card video fitur 16:9 | Agent | R11 | `tdd` | ⬜ | |
| R14 | Tentang + Tim + CTA banner | Agent | R11 | `tdd` | ⬜ | |
| R15 | Halaman publik lain pindah ke shell dan token baru | Agent | R10 | – | ⬜ | |
| R16 | QA: a11y, responsif, reduced motion, performa, verifikasi browser | Agent | R12–R15 | `design:accessibility-review`, `slop-patterns:check-ui` | ⬜ | |
| R17 | Review, PR, merge, cek produksi | Agent + User | R16 | `code-review` | ⬜ | |

R05–R08 bisa paralel setelah R01. R02–R04 adalah jalur aset.

## Skill per jenis tiket

| Jenis | Skill | Dipakai di |
|---|---|---|
| Perubahan kode | `tdd`: satu test merah → kode minimal → hijau, hanya lewat seam di bawah | R02, R06–R14 |
| Merancang interface modul | `codebase-design`: modul *deep*, interface kecil, seam di tempat yang disepakati | R02, R08 |
| Pertanyaan desain visual sebelum integrasi | `prototype`: HTML statis buang-pakai, diputuskan user | R04 |
| Stress-test plan | `grilling` | R00 (opsional) |
| Bug atau perilaku aneh | `diagnosing-bugs` | Kapan saja |
| Sebelum PR | `code-review` atas `main..redesign/ui` | R17 |

### Seam (dikonfirmasi user di R00 sebelum test pertama ditulis)

| Seam | Menangkap | Tidak menangkap |
|---|---|---|
| `syncAssets({ config, apiKey, fetch, fs, now })` dengan `fetch`/`fs` palsu | Pilihan rendisi sesuai budget, cache 24 jam, manifest + atribusi, key tidak pernah tertulis ke output, error 429/key kosong | API Pixabay nyata |
| `useVideoPlayer().open(id)` + `<VideoPlayerProvider>` lewat Testing Library | Dialog terbuka/tertutup (Close, backdrop, Escape), label Mute↔"Suara aktif" dan Pause↔"Lanjutkan", mute global, resume posisi per video, scrubber `input range` | Decoding video nyata, `mix-blend` visual |
| `useReveal()` dengan `IntersectionObserver` palsu dan `matchMedia` | `data-visible="true"` saat masuk viewport, langsung visible saat `prefers-reduced-motion` | Timing transisi CSS |
| `LoopVideo` dengan `HTMLMediaElement` di-stub | Pause saat keluar viewport, poster saja saat reduced motion atau `saveData` | Autoplay nyata di browser |
| Render `Index` lewat Testing Library | Satu `h1`, skip link, urutan section, ShieldStripe tepat sebelum footer, atribusi Pixabay ada | Tampilan visual (dicek di R16 lewat browser) |
| `src/test/site-metadata.test.ts` (sudah ada) | Canonical/og/JSON-LD tetap `https://eranusasiber.my.id` | – |

---

## Keputusan desain

### 1. Rekonsiliasi benchmark × design system

| Aspek | Ambil dari benchmark | Ambil dari design system | Hasil |
|---|---|---|---|
| Warna | Monokrom tenang, satu aksen | Navy `navy-950`, `protx-navy`, `primary` `#2c306d`, `shield-blue` `#0096fa`, `background`/`canvas`/`accent-soft` | Palet DS saja. Card besar `canvas`/`background`, card gelap `navy-950`. Tidak ada warna di luar keluarga navy–biru. |
| Tipografi | Display rapat + label mono kecil | DM Serif Display (display ≥36px), Inter 400/500/600, JetBrains Mono | Display DM Serif. Heading kecil dan UI Inter. Label eyebrow, nomor, timecode, dan tombol kecil memakai **JetBrains Mono 500 11–12px uppercase**. Mono 10px benchmark dinaikkan demi keterbacaan. |
| Grid | 4 kolom (mobile) → 12 kolom, gap 14/16px, line marker di kolom 1/5/9/12 | Container 1400px, padding 2rem, breakpoint Tailwind | 12 kolom mulai `lg` (1024px), 4 kolom di bawahnya. Marker 14×1px `hairline-strong` di terang, `on-dark-muted` di gelap. |
| Card | Radius 16px, jarak antar card ±40px | `radius-xl` 12px kartu, `radius-2xl` 16px hero/CTA | Card section besar `radius-2xl`, kartu isi `radius-xl`, media dalam card `radius-lg`. |
| Tombol | Expand + panah saat hover, focus ring `:before` | `radius-lg`, padding 10px 20px, varian `primary/dark/soft/secondary/link`, tanpa pil | Varian DS + hover expand (`padding-right` 20→40px + `ArrowRight` 16px fade in). Focus `ring` 2px offset 2px. |
| Gerak | Stagger opacity, line `scaleX`, underline dari tengah, mask wipe, cursor pill | Entrance 0.6–0.8s ease-out, geser ≤30px, state 150–200ms, reduced motion wajib | Entrance 0.6s, geser 16px, stagger 0.08s. Line 0.4s. State 200ms. Expand 300ms. Semua efek mati saat reduced motion. |
| Blend `difference` | Overlay teks hero + kontrol modal | Teks kecil `shield-blue` dilarang di terang | Blend **hanya** pada lapisan marker, eyebrow mono, dan timecode. Headline (dengan frasa `shield-blue`) dan CTA berada di luar lapisan blend, supaya biru tidak terbalik jadi oranye. |
| Penutup halaman | Footer navy | ShieldStripe 12px wajib + Footer `navy-950` | ShieldStripe + Footer DS. |
| Foto | Render 3D monokrom | Tidak boleh hacker berkerudung, gembok neon, atau kode matriks | Kurasi Pixabay: robot/teknologi, data center, jaringan abstrak, tim kerja, dengan tonalitas biru–navy. |

### 2. Struktur landing (urutan section)

| # | Section | Pola benchmark | Isi |
|---|---|---|---|
| 0 | Skip link + **TopNav** | Header ringan, underline dari tengah | DS TopNav sticky (`canvas`, `shadow-1` saat scroll), logo di `tps-logo-tile`, link Layanan/Resources/Kontak, satu CTA primary "Hubungi Kami" |
| 1 | **Hero** | Hero card video + overlay grid + timecode + cursor pill + modal | Card `radius-2xl` `navy-950`, video loop Pixabay (173102 atau pilihan R03), titik mesh 32px `shield-blue` 30%, overlay 3 baris marker, eyebrow "ENTERPRISE CYBERSECURITY", timecode = durasi video penuh, `h1` "Lindungi Bisnis Anda / **dari Ancaman Siber.**", subtitle, CTA "Hubungi Kami" + "Company Deck" (PDF yang sudah ada). Pill "Putar video" mengikuti kursor dan membuka modal. |
| 2 | **Lingkungan kritis** | Big media: teks kiri 3 kolom + video kanan 8 kolom | Heading + paragraf (draft copy di R04), video Pixabay data center/kantor |
| 3 | **Layanan** | Headline + kartu bernomor 01–04 + slider di mobile | Tabs DS "Assurance / Consulting". 4 kartu per tab dengan thumbnail foto Pixabay 16:9, nomor mono, judul, deskripsi `steel`, mask wipe "Pelajari →" ke `/services#slug`. Data diambil dari `serviceCategories`/`services` di `ServicesSection.tsx` yang sudah ada. Mobile: scroll-snap horizontal + garis progres 1px. |
| 4–5 | **Dua card video fitur** | Card 16:9 full-bleed + blur tepi bertopeng + eyebrow + timecode | Mis. "Penetration Testing & Red Teaming" dan "Audit ISMS ISO 27001". Tombol "Pelajari" + pill "Putar video" yang membuka modal. |
| 6 | **Tentang** | About block berwarna + pernyataan misi besar | `accent-soft`, pernyataan misi `heading-1` serif, kolom Misi/Visi/Pendekatan dengan marker |
| 7 | **Tim** | Tabel careers (hover reveal) | 3 kartu partner (foto yang sudah ada, grayscale → warna), baris nama/peran, mask wipe "LinkedIn →" |
| 8 | **CTA banner** | – | DS `tps-cta`: `accent-soft`, `radius-2xl`, `heading-1` "Siap Meningkatkan Keamanan Siber?", CTA "Konsultasi Gratis" |
| 9 | **ShieldStripe + Footer** | Footer navy 4 kolom, stagger | DS footer `navy-950`, tagline "SATU AKSI SEJUTA PROTEKSI", baris kredit "Video & foto: Pixabay" → `/kredit` |

Tidak ada section statistik. Repo tidak punya angka resmi, dan DS melarang mengarang angka. Bisa ditambahkan nanti kalau user memberi data.

### 3. Modul (interface kecil, implementasi dalam)

| Modul | Interface | Yang disembunyikan |
|---|---|---|
| `src/media/` | `media(id: MediaId): MediaAsset` dan tipe `MediaId` dari `manifest.json` hasil generate | Path file, poster, dimensi, durasi, atribusi |
| `src/components/video-player/` | `<VideoPlayerProvider>` di root, `useVideoPlayer().open(id: MediaId)` | Satu `<dialog>` global, `showModal`, mute global, peta posisi resume, scrubber, auto-hide (pointerleave + idle 2.5s), keyboard (Space/K, M, ←/→ 5s, F), loading state, animasi buka/tutup `@starting-style` |
| `src/motion/` | `useReveal<T>()` → ref, plus class CSS `reveal-fade` / `reveal-line` dengan `style={{"--i": n}}` | IntersectionObserver sekali jalan, reduced motion |
| `LoopVideo` | `<LoopVideo id={MediaId} />` | `autoplay muted loop playsinline`, pause saat offscreen, poster saat reduced motion atau `navigator.connection.saveData`, lazy `src` |
| `useCursorPill` | `const { ref, pill } = useCursorPill(label)` | Tracking `pointermove`, posisi, fade, sembunyi di <700px dan pointer kasar |
| `frontend/scripts/pixabay/` | CLI `npm run assets:pixabay` → `syncAssets(deps)` | Panggilan API, cache 24 jam di `frontend/.cache/pixabay/`, pemilihan rendisi, unduh, manifest |

framer-motion tetap untuk menu mobile Header lama dan halaman admin. Landing baru memakai CSS + IntersectionObserver, mengikuti benchmark.

### 4. Pipeline Pixabay

- Endpoint: gambar `GET https://pixabay.com/api/?key=…&id=…`, video `GET https://pixabay.com/api/videos/?key=…&id=…`. Rendisi video `tiny/small/medium/large`. Gambar maksimal `largeImageURL` 1280px (`fullHDURL` butuh akun yang disetujui).
- Aturan Pixabay:
  - Cache respons 24 jam.
  - Batas 100 request/60 detik (429 bila lewat).
  - **Gambar wajib diunduh** ke server sendiri. Video disarankan diunduh.
  - Tampilkan sumber "Pixabay".
- Konfigurasi kurasi `frontend/scripts/pixabay/assets.config.json`: `{ id: MediaId, pixabayId, kind, rendition, role }`. Kandidat dicari dengan parameter `q`, `video_type`, `editors_choice`, `safesearch=true`, lalu ID terpilih dikunci di config.
- Output:
  - File `frontend/public/media/pixabay-<id>-<rendition>.<ext>` + poster `.jpg`.
  - `frontend/src/media/manifest.json` berisi `id, kind, src, poster, width, height, duration, pixabayId, pageURL, user, license`.
- **Budget ukuran** (disesuaikan 2026-10-28 setelah mengukur API: video 173102 `small` 960×540 = 5,99 MB, `medium` 1280×720 = 10,2 MB, `tiny` 640×360 = 2,8 MB): loop hero ≤ 6,5 MB (`small`). Video modal ≤ 15 MB per file (`medium`). Total `public/media` ≤ 40 MB. Script menolak rendisi di atas budget dan memilih yang lebih kecil. Satu `pixabayId` boleh dipakai untuk dua `MediaId` dengan rendisi berbeda (loop `small`, modal `medium`).
- **Tanpa ffprobe:** `duration` video dan dimensi gambar diambil dari respons API. Poster video memakai `thumbnail` rendisi yang sama.
- `frontend/nginx.conf`: tambah `location /media/ { expires 30d; add_header Cache-Control "public"; }`.
- **Key API:**
  - Simpan sebagai `PIXABAY_API_KEY` di `frontend/.env.local`. File ini sudah di-ignore oleh pola `*.env.*` di `.gitignore`.
  - **Jangan pakai prefix `VITE_`**, karena variabel `VITE_` ikut masuk ke bundle browser (lihat `frontend/README.md`).
  - CI tidak butuh key, karena aset di-commit.
  - Key sudah tertulis di riwayat chat. Pertimbangkan membuat key baru di akun Pixabay.

---

## Detail tiket

### R00 · Konfirmasi seam
User membaca tabel **Seam** dan pembagian tiket, lalu setuju atau mengubahnya. Opsional: `grilling` atas plan ini.

**Selesai bila:** kolom Bukti R00 berisi "disetujui user <tanggal>" plus perubahan yang diminta.

### R01 · Branch dan baseline
1. Pastikan branch `redesign/ui` aktif dan berisi `PLAN_REDESIGN_UI.md` + `docs/benchmark-genesis.md`.
2. `cd frontend && npm ci && npm run typecheck && npm run lint && npm test && npm run build`. Catat hasil dan ukuran `build/assets/*.js|css`.
3. Ambil screenshot baseline `/` di 375, 768, 1024, dan 1440px lewat browser pane (`npm run preview`). Simpan di `frontend/.cache/baseline/` (tidak di-commit).

**Selesai bila:** keempat perintah di langkah 2 tercatat di Bukti (lulus/gagal apa adanya), dan ukuran bundle baseline tercatat.

### R02 · Pipeline aset Pixabay
TDD lewat seam `syncAssets`. Test pertama: config 1 video + `fetch` palsu → manifest berisi `src` lokal dan atribusi, dan **tidak ada string key** di file mana pun yang ditulis. Lalu tambahkan test untuk:
- Rendisi di atas budget diganti yang lebih kecil.
- Cache < 24 jam dipakai ulang tanpa request.
- `PIXABAY_API_KEY` kosong → exit dengan pesan jelas.
- 429 → berhenti dengan pesan `X-RateLimit-Reset`.

Tambah script `"assets:pixabay"` dan `"assets:search"` (cari kandidat, tulis contact sheet HTML ke `.cache/pixabay/candidates.html`). Dokumentasikan di `frontend/README.md`.

**Selesai bila:** semua test di atas hijau, `npm run assets:pixabay` tanpa key gagal dengan pesan yang benar, dan `git grep -n "<prefix 8 karakter key>"` kosong.

### R03 · Kurasi dan unduh aset
1. User mengisi `frontend/.env.local`.
2. Agent menjalankan `assets:search` untuk tiap peran:
   - `hero-loop` (robot/teknologi, kandidat awal 173102) dan `hero-full`.
   - `critical-env` (data center/kantor).
   - `feature-pentest`, `feature-iso`.
   - 8 foto `service-*`.
3. User memilih di contact sheet.
4. Agent mengunci ID di config, menjalankan `assets:pixabay`, dan commit `public/media/` + `manifest.json` + config.

**Selesai bila:** semua `MediaId` yang dirujuk R11–R14 ada di manifest, total `public/media` ≤ 40 MB (`du -sh`), dan tidak ada aset yang melanggar daftar larangan visual DS.

### R04 · Prototipe hero + modal + copy
Skill `prototype`: satu HTML statis buang-pakai di `frontend/.cache/prototype/landing.html` (tidak di-commit). Isinya hero dengan video R03, overlay blend, cursor pill, satu card video fitur, dan modal player, memakai token DS. Pertanyaan yang diputuskan:
1. Apakah blend `difference` pada lapisan marker/label terbaca di atas video terpilih?
2. Titik mesh di atas video: berapa opacity-nya, atau tanpa mesh?
3. Draft copy semua section baru, ditulis dalam Bahasa Indonesia sesuai suara DS.

Publikasikan sebagai artifact atau buka di browser pane untuk user.

**Selesai bila:** user menyetujui tampilan dan copy (atau memberi revisi yang sudah diterapkan), dan copy final dipindah ke `frontend/src/content/landing.ts`.

### R05 · Token design system
- Petakan `tokens.json` DS ke `frontend/src/index.css`. Nama variabel shadcn (`--primary`, `--accent`, `--background`, `--card`, `--border`, `--ring`, …) tetap, nilainya diambil dari DS (format HSL). Tambahkan variabel DS lain: `--navy-950`, `--navy-900`, `--protx-navy`, `--shield-blue`, `--link`, `--accent-soft(-border)`, `--hairline-strong`, `--steel`, `--stripe-1..5`, `--shadow-1..4`, dan motion `--dur-state`, `--dur-expand`, `--dur-enter`, `--ease-out-cubic`.
- `tailwind.config.ts`:
  - `fontFamily` serif/sans/mono.
  - Warna DS baru.
  - `borderRadius` `xl` 12px, `2xl` 16px.
  - `boxShadow` 1–4.
  - Class tipografi (`text-hero-display`, `text-display-lg`, `text-heading-1..5`, `text-subtitle`, `text-eyebrow`, `text-tagline`) dengan skala responsif DS (84→72→60→48→36).
- Font: ganti `@fontsource/merriweather` dengan `@fontsource/dm-serif-display`, `@fontsource/inter` 400/500/600, dan `@fontsource/jetbrains-mono` 400/500. Self-host, tanpa Google Fonts CDN. Hapus rule global `h1–h4 { font-family: serif }`; serif hanya lewat class display.

**Selesai bila:** typecheck, test, dan build hijau. Halaman admin (`/admin/upload`, `/login`) dibandingkan screenshot dengan baseline dan hanya berubah warna/font, tanpa layout rusak.

### R06 · Primitif UI
Di `frontend/src/components/ds/`:
- `Button` (varian DS + `expand`)
- `LinkUnderline`
- `LineMarker` (14×1, `scaleX` reveal)
- `Eyebrow` (mono uppercase)
- `Card` (`default/feature/soft/photo`)
- `Badge`
- `ShieldStripe`
- `SectionGrid` (12 kolom + slot marker top/center/bottom)
- `MaskReveal` (mask wipe `@property --mask-edge`, fallback `clip-path`)

shadcn `ui/button.tsx` tetap untuk admin. Test hanya pada perilaku yang terlihat dari luar (role, label, `aria-*`, `disabled`).

**Selesai bila:** setiap primitif punya minimal satu test perilaku, dan halaman demo internal tidak di-commit.

### R07 · Sistem motion
`useReveal` + CSS:
- `.reveal-fade`: opacity + translateY 16px, delay `0.6s + var(--i) × 0.08s` (sesuai observasi §3 A3).
- `.reveal-line`: `scaleX`, delay `var(--i) × 0.1s`.
- `@media (prefers-reduced-motion: reduce)` mematikan semuanya.

**Selesai bila:** test seam `useReveal` hijau (masuk viewport → visible; reduced motion → langsung visible; observer di-disconnect setelah sekali).

### R08 · VideoPlayer
Rancang interface dengan `codebase-design` sebelum test pertama. Implementasi mengikuti `observasi.md` §3A + §4.10, dengan perbaikan:
- `<dialog>.showModal()` memberi focus trap, Escape, dan latar `inert`.
- Frame `min(90vh × 16/9, 100vw − 64px)`, rasio 16:9, `radius-xl`.
- Backdrop `navy-950` 95% + blur 4px.
- Kontrol di grid 12 kolom dengan marker. Close kanan atas. Kiri bawah judul + elapsed. "Bisukan"/"Suara aktif". "Jeda"/"Lanjutkan". Durasi kanan bawah.
- Scrubber `input type=range` (garis 1px, thumb 14×3, `aria-label="Posisi video"`).
- Blend `difference` hanya pada teks/marker. Tombol berlatar solid `rgb(2 18 34 / .6)` agar tidak hilang di frame terang.
- Auto-hide saat pointerleave atau idle 2.5s, muncul lagi saat pointermove/focus.
- Animasi buka/tutup 0.4s (`@starting-style`, `allow-discrete`).
- Pill berubah jadi "Memuat…" sampai `canplay`.
- Mute global, resume posisi per `MediaId`.
- Pintasan keyboard: Space/K, M, ←/→ (5s), F.
- `src/test/setup.ts`: stub `HTMLDialogElement.prototype.showModal/close` dan `HTMLMediaElement.prototype.play/pause` untuk jsdom.

**Selesai bila:** test seam mencakup buka, ketiga cara tutup, label toggle, mute global antar video, resume posisi, dan seek lewat range + ←/→.

### R09 · Primitif media
`media()` + `MediaId` dari manifest, `LoopVideo`, `useCursorPill`, dan `MediaCard` (gabungan `LoopVideo` + pill + `open(id)`). Tambahkan test integritas: setiap `src`/`poster` di manifest ada di `public/media`.

**Selesai bila:** test seam `LoopVideo` dan test integritas manifest hijau.

### R10 · Shell situs
- `SiteLayout` menggantikan Header/Footer/skip link yang diulang di setiap halaman: TopNav DS + `<main id="main-content">` + ShieldStripe + Footer DS + `<VideoPlayerProvider>`.
- Route baru `/kredit` menampilkan daftar aset dari manifest (judul, pembuat, tautan Pixabay, lisensi).
- Menu mobile di bawah 1024px memakai panel sederhana (CSS + `dialog` atau `details`). framer-motion boleh dipakai ulang kalau lebih ringkas.

**Selesai bila:** test render `Index` membuktikan ShieldStripe tepat sebelum footer, skip link berfungsi, dan link `/kredit` ada. Semua route publik tetap ter-render (smoke test).

### R11 · Hero
Pakai `SectionGrid`, `LoopVideo` (`hero-loop`), titik mesh, lapisan blend (marker, eyebrow, timecode), headline/CTA di luar blend, dan `useCursorPill("Putar video")` yang membuka `hero-full`. Tinggi `min(100svh − nav − 32px, 860px)`. Di mobile, pill diganti tombol "Putar video" di bawah CTA.

**Selesai bila:** test memastikan satu `h1` dengan teks hero, CTA ke `/contact` dan PDF deck, dan klik area video memanggil `open("hero-full")`. Verifikasi visual dilakukan di R16.

### R12 · Lingkungan kritis + Layanan
Big media mengikuti observasi §1.2: video kanan melebar keluar padding. Layanan memakai Tabs DS, kartu bernomor, `MaskReveal`, dan scroll-snap di mobile. Data diambil dari `ServicesSection.tsx`. Pindahkan data itu ke `src/content/services.ts` agar `Services.tsx` dan landing berbagi satu sumber.

**Selesai bila:** test memastikan kedua tab menampilkan 4 kartu dengan link `/services#slug` yang benar, dan `Services.tsx` tetap lulus build/test.

### R13 · Dua card video fitur
Card 16:9 (`aspect-ratio`, mobile 9:16) dengan blur tepi bertopeng (observasi §1.4), eyebrow, timecode, headline, tombol "Pelajari", dan pill yang membuka video penuh.

**Selesai bila:** test memastikan setiap card membuka `MediaId` yang benar dan link "Pelajari" mengarah ke layanan yang sesuai.

### R14 · Tentang + Tim + CTA
- Tentang: `accent-soft`, pernyataan misi serif, 3 kolom.
- Tim: data dipindah ke `src/content/team.ts`, foto yang sudah ada, `MaskReveal` "LinkedIn →".
- CTA: DS `tps-cta`.

Hapus komponen lama yang tidak dipakai lagi (`HeroSection`, `AboutSection`, `TeamSection`, `CTASection`, dan `NetworkMesh` bila mesh diganti titik CSS) beserta aset yang tidak dipakai (`ceo-portrait.jpg`, `hero-abstract.jpg`, `office-building.jpg`), setelah `grep` membuktikan tidak ada rujukan.

**Selesai bila:** test render `Index` memastikan urutan section sesuai §2, dan `grep` komponen lama = 0 rujukan.

### R15 · Halaman publik lain
`Services`, `Contact`, `Resources`, `ResourceDetail`, `Login`, dan `NotFound` dipindah ke `SiteLayout` dan token baru, tanpa layout ulang penuh. Ganti gradien `blue-600/indigo-600/purple-600` di halaman publik dengan token DS. Admin hanya mengikuti token lewat variabel shadcn.

**Selesai bila:** semua test lama hijau, dan screenshot tiap halaman publik di 375/1440px tidak menunjukkan elemen rusak.

### R16 · QA
1. `npm run typecheck && npm test && npm run build` harus hijau. `npm run lint` tidak boleh menambah error di atas 3 error baseline R01 (satu di `tailwind.config.ts` hilang bila R05 mengganti `require` plugin dengan `import`).
2. Browser pane (`npm run preview`) di 375/768/1024/1440: hero, cursor pill, modal (buka, kontrol, Escape, backdrop, Tab tetap di dalam modal), slider layanan, mask wipe, sticky nav.
3. Reduced motion: emulasi lewat OS atau devtools. Tidak ada animasi, video loop diganti poster.
4. `design:accessibility-review`: kontras (`steel` di `canvas` ≥ 4.5:1, label mono, tombol di atas video), focus visible, target sentuh 44px di mobile.
5. `slop-patterns:check-ui` atas komponen baru.
6. Performa:
   - Bundle JS tidak naik > 15% dari baseline R01.
   - LCP = poster hero (preload).
   - Video di bawah fold `preload="none"`.

**Selesai bila:** semua temuan diperbaiki atau ditolak dengan alasan tertulis di Bukti.

### R17 · Review dan rilis
`code-review` atas `main..redesign/ui`. Cek tidak ada key: `git log -p main..redesign/ui | grep -c "<prefix key>"` = 0. Push branch, buka PR, user merge. Setelah auto-release VPS, cek `https://eranusasiber.my.id`:
- Hero video 200 `video/mp4`.
- Modal berjalan.
- `/kredit` tampil.
- `site-metadata` tidak berubah.

**Selesai bila:** PR di-merge user, produksi lolos semua cek di atas, dan Progres R00–R17 ✅.

## Verifikasi end-to-end (ringkas)

```bash
cd frontend
npm ci
npm run typecheck && npm run lint && npm test && npm run build
npm run preview
```

Lalu cek di browser pane pada 375/768/1024/1440px sesuai daftar R16, dan setelah merge cek domain produksi sesuai R17.

## File kritis

- Diubah:
  - `frontend/src/index.css`, `frontend/tailwind.config.ts`, `frontend/package.json` (font, script aset)
  - `frontend/src/pages/Index.tsx`, `frontend/src/App.tsx` (route `/kredit`, layout)
  - `frontend/src/components/ServicesSection.tsx` (data dipindah)
  - `frontend/nginx.conf`, `frontend/README.md`, `frontend/src/test/setup.ts`
- Baru:
  - `frontend/src/components/ds/*`, `frontend/src/components/video-player/*`
  - `frontend/src/motion/*`, `frontend/src/media/*`, `frontend/src/content/*`
  - `frontend/scripts/pixabay/*`, `frontend/public/media/*`
  - `PLAN_REDESIGN_UI.md`
- Dipakai ulang: `cn` di `src/lib/utils.ts`, data layanan, `logo-protx.png`, foto tim, `Triad_Proteksi-Company_Deck.pdf`, `site-metadata.test.ts`.
- Referensi: `docs/benchmark-genesis.md` (= `observasi.md`; "observasi §x" di plan ini merujuk ke bagian file itu), design system artifact `GoEeTPA2F4dFGvALRqreq3` (`project/tokens.json`, `project/components/bundle.css`, `project/0*-*.md`).
