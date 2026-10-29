# PLAN: Redesain halaman Layanan (`/services`) sebagai berkas layanan

## Konteks

Halaman `/services` (`frontend/src/pages/Services.tsx`) masih berupa daftar teks panjang. Ada hero navy, dua kategori, dan 8 artikel berisi Overview, Scope, dan Deliverables. Halaman ini belum memakai gambar layanan, `useReveal`, atau grid design system. Animasinya masih framer-motion.

User menyukai pola "Case files" dari https://myseera.com/demo/dossier-template#projects:
- kartu berkas bernomor,
- UX "Open case file",
- galeri gambar per berkas.

Hasil pengamatannya ada di [observasi_portofolio_pages.md](observasi_portofolio_pages.md) ("observasi §x" di bawah merujuk ke file itu). Plan ini memetakan pola tersebut ke design system default "Triad PRO-TX Siber × Eranusasiber" ([docs/design-system/](docs/design-system/)) dan memakai ulang modul dari redesain landing ([PLAN_REDESIGN_UI.md](PLAN_REDESIGN_UI.md)).

Catatan lingkup: `frontend/src/services/` berisi layer API (`api.ts`, `resourceService.ts`), bukan UI. Plan ini mengerjakan **halaman Layanan**, yaitu `src/pages/Services.tsx` dan `src/content/services.ts`. Layer API tidak disentuh.

Eksekusi memakai **pstack `/poteto-mode`**, satu tiket per worker. Skill mattpocock dipakai sesuai kolom Skill.

## Cara memakai dokumen ini

1. Ambil tiket pertama di **Progres** yang berstatus ⬜ dan semua blocker-nya ✅.
2. Jalankan `/poteto-mode` dengan tiket itu. Pakai skill di kolom Skill.
3. Kerjakan sampai kriteria **Selesai bila** terpenuhi.
4. Ubah status di tabel Progres (satu-satunya tempat status), isi Bukti, lalu commit file ini.

Status: ✅ selesai · 🟡 sebagian · ⬜ belum · ⛔ menunggu keputusan.
Pelaku: **Agent** (Claude) · **User** (kurasi gambar, persetujuan visual, merge).

**Aturan rilis.** VPS menarik setiap push hijau ke `main` dalam ±2 menit (T22 di `PLAN.md`). Semua kerja dilakukan di branch `redesign/services`. Merge ke `main` hanya lewat PR setelah S10 dan persetujuan user.

## Progres

| ID | Tiket | Pelaku | Blocker | Skill | Status | Bukti |
|---|---|---|---|---|---|---|
| S00 | Konfirmasi seam, route, dan copy label | User | – | `grilling` (opsional) | ✅ | Disetujui user 2026-10-29 tanpa perubahan: route `/services/:slug`, label "Buka berkas" / "BERKAS LAYANAN 03" / "Semua layanan" / "Layar penuh", `standards` hanya dari teks yang ada |
| S01 | Baseline di branch `redesign/services` | Agent | S00 | – | ✅ | 2026-10-29 di `72198bb`. `typecheck` 0 error. Lint 2 error lama + 8 warning. Test 42 file / 317 hijau. Build lulus. JS 676.010 B (gzip 207.563 B), CSS 88.365 B (gzip 27.932 B). `public/media` 31 MB, 20 file. `/services`: 1 `h1`, 2 `h2`, 8 `article`, 0 gambar, tinggi 7.738px di 375px dan 6.666px di 1024px, tanpa overflow horizontal. Screenshot di `frontend/.cache/baseline/services/` |
| S02 | Model data galeri + helper urutan | Agent | S01 | `tdd` | ✅ | 2026-10-29. `ServiceImage`, `gallery` (tuple, cover di indeks 0), `standards`, `serviceBySlug`, `serviceNeighbors` di `src/content/services.ts`. `mediaId` dihapus dari `ServiceItem`, landing memakai `gallery[0]`. 4 test baru di `services.test.ts` merah lalu hijau. Total 42 file / 320 test, `typecheck` 0, build lulus, lint file tersentuh bersih. Caption sementara dari judul halaman Pixabay, diganti di S03 |
| S03 | Kurasi dan unduh 24 gambar layanan | Agent + User | S02 | – | ⬜ | |
| S04 | Prototipe daftar + berkas + lightbox, disetujui user | Agent + User | S03 | `prototype` | ⬜ | |
| S05 | Route `/services/:slug` + kompatibilitas `#slug` | Agent | S02 | `tdd` | ⬜ | |
| S06 | Modul `ImageGallery` (stage, rail, lightbox `<dialog>`) | Agent | S02 | `codebase-design`, `tdd` | ⬜ | |
| S07 | Halaman daftar `/services` (kartu berkas) | Agent | S04, S05 | `tdd` | ⬜ | |
| S08 | Halaman berkas `/services/:slug` | Agent | S04, S05, S06 | `tdd` | ⬜ | |
| S09 | QA: a11y, responsif, reduced motion, bundle, browser | Agent | S07, S08 | `design:accessibility-review`, `slop-patterns:check-ui` | ⬜ | |
| S10 | Review, PR, merge, cek produksi | Agent + User | S09 | `code-review` | ⬜ | |

S05 dan S06 bisa paralel setelah S02. S03–S04 adalah jalur aset dan visual.

## Skill per jenis tiket

| Jenis | Skill | Dipakai di |
|---|---|---|
| Perubahan kode | `tdd`: satu test merah, kode minimal, hijau, hanya lewat seam di bawah | S02, S05–S08 |
| Merancang interface modul | `codebase-design`: modul dalam, interface kecil | S06 |
| Pertanyaan visual sebelum integrasi | `prototype`: HTML statis buang-pakai | S04 |
| Bug atau perilaku aneh | `diagnosing-bugs` | Kapan saja |
| Sebelum PR | `code-review` atas `main..redesign/services` | S10 |

### Seam (dikonfirmasi user di S00)

| Seam | Menangkap | Tidak menangkap |
|---|---|---|
| `serviceBySlug(slug)` dan `serviceNeighbors(slug)` di `src/content/services.ts` | Slug tidak dikenal → `undefined`. Urutan 01–08 lintas kategori. Prev/next di ujung bernilai `undefined` (tidak berputar). Setiap layanan punya 3 gambar dan gambar pertama = cover | – |
| `<ImageGallery images label />` lewat Testing Library | Thumbnail mengganti stage (`aria-pressed`). Caption ikut berganti. Klik stage membuka `<dialog>`. ←/→ mengganti gambar, Escape menutup. Fokus kembali ke pemicu. Indeks lightbox tersinkron ke stage. Scroll terkunci selama terbuka | Decoding gambar, `backdrop-filter` |
| Render route lewat `renderWithProviders(ui, { route })` | `/services` menampilkan 8 kartu berkas dengan link `/services/<slug>`. `/services#slug` diarahkan ke `/services/slug`. `/services/<slug>` punya satu `h1` = judul layanan dan navigasi `‹ 03 / 08 ›`. Slug salah → NotFound. Fokus pindah ke `h1` saat berkas berganti | Transisi visual (dicek di S09) |
| `src/test/routes-shell.test.tsx` (sudah ada) | Semua route publik tetap ter-render di shell | – |
| Test integritas manifest (sudah ada) | Setiap `src` di manifest ada di `public/media` | – |

---

## Keputusan desain

### 1. Rekonsiliasi dossier × design system

| Aspek | Dossier (observasi) | Design system | Hasil |
|---|---|---|---|
| Latar | Meja krem + lembar kertas + tumpukan + lipatan (§1) | `background` #f6f7f9, `canvas` #fff | Halaman `background`. Kartu `canvas`. Tanpa efek kertas, tumpukan, atau lipatan |
| Aksen | Ungu `#4A2390` + kuning pastel (§2) | Navy–biru saja | Tab nomor `bg-soft` + `text-link`. Thumbnail aktif `border-link`. Fokus `outline-ring` |
| Judul | Bricolage 800, coretan SVG (§3) | DM Serif Display ≥36px, Inter | `h1` daftar `text-display-lg font-serif`. Judul kartu `text-heading-4` Inter. `h1` berkas `text-heading-1 font-serif`. Coretan diganti `LineMarker` |
| Label | Geist Mono 12px uppercase | JetBrains Mono, `.text-eyebrow` | Tab nomor, meta, kicker, label blok, penghitung: JetBrains Mono 11–12px |
| Kartu | Radius 14px, gambar 10px, tab 10px (§3) | `xl` 12px kartu, `lg` 8px media | Kartu `rounded-xl border-hairline shadow-ds-1`. Gambar `rounded-lg aspect-[4/3]`. Tab `rounded-t-lg` |
| Grid | 2 kolom ≥768px, kartu genap turun 56px (§3) | Container 1400px, 12 kolom ≥1024px | 2 kolom mulai `md`, kartu genap `md:mt-14`. Per kategori ada 4 kartu (2×2) |
| Hover kartu | Naik 6px + `rotate(-0.4deg)`, 0,4s (§3) | State 150–200ms, expand 300ms, gerak tenang | Naik 4px, `shadow-ds-1` ke `shadow-ds-3`, 300ms `ease-out-cubic`, tanpa rotasi. Panah geser 4px. Mati saat reduced motion |
| Buka berkas | Spread inline, URL tetap, fokus hilang (§4) | – | **Route `/services/:slug`**. Back berfungsi, berkas bisa dibagikan, fokus dikelola |
| Navigasi berkas | `‹ 01 / 04 ›` berputar (§4) | Tombol `rounded-lg`, tanpa pil | `‹ 03 / 08 ›` dengan tombol ikon `secondary` 44px `rounded-lg`. Di ujung tidak berputar: tombol `disabled`, dan di bawah berkas terakhir ada CTA kontak |
| Kembali | Ghost pil "← All case files" | Button `secondary` | `Button variant="secondary" size="sm"` "← Semua layanan" |
| Transisi | Keluar `scale(.985)`, masuk `translateY(16–18px)` stagger ±70ms (§4) | Entrance 0,6s, geser ≤30px | `reveal-fade` + `revealIndex(i)`: bar, media, teks berurutan. Tanpa animasi keluar (route berganti) |
| Blok teks | Brief, Tools (pil) | Badge satu-satunya pil | RINGKASAN (`overview`), CAKUPAN (`scope`), DELIVERABLES, STANDAR (Badge `soft`) |
| Galeri | Stage 4:3, thumb 64×48, Full screen, caption (§5) | `radius-lg`, `hairline` | Stage `rounded-lg shadow-ds-2`, thumb 64×48 `rounded-md`, tombol "Layar penuh" `secondary sm` |
| Lightbox | `div role=dialog`, `black/90`, fokus tidak dikelola (§5) | Pola video player | `<dialog>` native, backdrop `navy-950/95` + blur 4px seperti video player. Penghitung mono "2 / 3", caption `on-dark`, tombol 44px solid `rgb(2 18 34 / .6)` |
| Foto | Unsplash | Pixabay build-time, larangan visual | Pixabay `large` 1280px. Tanpa hacker berkerudung, gembok neon, atau kode matriks |

### 2. Halaman daftar `/services`

| # | Bagian | Isi |
|---|---|---|
| 1 | Kepala | `Eyebrow` "LAYANAN", `h1` "Layanan Kami" serif, subjudul yang sudah ada, `LineMarker`. Latar `background`, bukan navy (seperti header dossier) |
| 2 | Kategori ×2 | `h2` kategori (`text-heading-2`), deskripsi `steel`, grid 2 kolom zig-zag berisi 4 `ServiceFileCard` |
| 3 | CTA | Banner CTA landing (`CtaBanner`) dipakai ulang |

`ServiceFileCard` (observasi §3, dipetakan):

```
  ┌──────┐
  │  03  │                       ← tab: JetBrains Mono 12px, bg-soft text-link, rounded-t-lg
┌─┴──────┴──────────────────┐
│ [ gambar 4:3, rounded-lg ]│   ← media(gallery[0])
│ 3 GAMBAR · ASSURANCE      │   ← text-eyebrow steel
│ Penetration Testing …     │   ← h3 text-heading-4 ink-strong
│ Uji keamanan menyeluruh … │   ← service.short, line-clamp-2, steel
│ Buka berkas →             │   ← MaskReveal + ArrowRight text-link
└───────────────────────────┘
```

Seluruh kartu adalah satu `<Link to="/services/<slug>">` dengan nama aksesibel "Buka berkas: <judul>". Satu tab stop per kartu, sama dengan dossier.

### 3. Halaman berkas `/services/:slug`

```
[← Semua layanan]                                   [‹] 03 / 08 [›]
┌────────────────────────────── 7 kol ─┐  BERKAS LAYANAN 03 · ASSURANCE
│        stage 4:3 (button)            │  h1 Network, Web & Infrastructure
│                                      │     Penetration Testing
└──────────────────────────────────────┘  RINGKASAN   overview
[▣][▢][▢]                  [⤢ Layar penuh] CAKUPAN     scope (marker ■)
caption gambar aktif                       DELIVERABLES ✓ …
                                           STANDAR     [OWASP Top 10] [CVSS]
                                           [Konsultasi layanan ini →]
```

- Grid `lg:grid-cols-12`: media `col-span-7`, teks `col-span-5`, gap 56px. Di bawah `lg` bertumpuk (observasi §6).
- `document.title` = "<judul> | Layanan TRIAD PRO-TX SIBER".
- Saat slug berganti, scroll ke atas `main` dan fokus ke `h1` (`tabIndex={-1}`).
- Tombol ‹/› adalah `<Link>` dengan `aria-label` "Layanan sebelumnya: <judul>". Penghitung memakai `aria-live="polite"`.
- Di bawah berkas ke-08 tampil CTA kontak.

### 4. Model data (`src/content/services.ts`)

```ts
export interface ServiceImage { mediaId: MediaId; caption: string }

export interface ServiceItem {
  // field lama tetap: icon, title, slug, short, overview, scope, deliverables
  gallery: [ServiceImage, ...ServiceImage[]]; // gambar pertama = cover, menggantikan mediaId
  standards: string[];                        // hanya yang sudah tertulis di teks layanan
}

export function serviceBySlug(slug: string): ServiceItem | undefined;
export function serviceNeighbors(slug: string): { index: number; total: number; prev?: ServiceItem; next?: ServiceItem } | undefined;
```

- `mediaId` diganti `gallery[0].mediaId`. Landing `Services.tsx` ikut memakai `gallery[0]`.
- `standards` **tidak boleh dikarang**. Isi awal hanya dari teks yang sudah ada:
  - ISO 27001:2022 (audit ISO)
  - ANSI/TIA-942C (data center)
  - OWASP Top 10 dan CVSS (pentest)

  Layanan lain kosong, dan blok STANDAR disembunyikan. "TTP" di red teaming tidak dimasukkan karena itu istilah, bukan standar. Test memastikan setiap standar tertulis di teks layanannya.
- Caption gambar ditulis deskriptif, tanpa klaim ("Ruang server dengan rak jaringan"), bukan "Klien kami di …".

### 5. Modul `ImageGallery` (`src/components/gallery/`)

| Interface | Yang disembunyikan |
|---|---|
| `<ImageGallery images={ServiceImage[]} label={string} />` | Indeks aktif, rail thumbnail `aria-pressed`, caption, `<dialog>` `showModal`, ←/→/Escape, sinkron indeks lightbox ke stage, kunci scroll, pengembalian fokus ke pemicu, preload gambar berikutnya |

- `lockScroll` dipindah dari `components/video-player/scroll-lock.ts` ke `src/lib/scroll-lock.ts`, lalu dipakai bersama oleh video player dan galeri.
- Tidak memakai `VideoPlayerProvider`: galeri adalah gambar, dan dialognya lokal per halaman.

### 6. Aset (pipeline Pixabay yang sudah ada)

- 8 layanan × 3 gambar = 24 gambar `large` (1280px). ID baru: `svc-<slug>` (cover, diganti ke rendisi `large`), `svc-<slug>-2`, `svc-<slug>-3`. Tambahkan ke `MEDIA_IDS` di `src/media/index.ts`.
- Budget: `maxBytes` 450 KB per gambar, total tambahan ≤ 9 MB. `public/media` sekarang 31 MB. Batas 40 MB tetap. Bila lewat, pakai `webformat` untuk gambar ke-2 dan ke-3.
- Gambar di kartu dan stage memakai `loading="lazy"` kecuali stage berkas (di atas lipatan). Atribusi otomatis tampil di `/kredit`.

---

## Detail tiket

### S00 · Konfirmasi
User membaca tabel Seam dan Keputusan desain, lalu memutuskan:
1. Route `/services/:slug` (rekomendasi) atau tetap satu halaman dengan hash.
2. Copy label: "Buka berkas", "BERKAS LAYANAN 03", "Semua layanan", "Layar penuh".
3. Isi `standards` per layanan, atau biarkan hanya dari teks yang ada.

**Selesai bila:** Bukti S00 berisi "disetujui user <tanggal>" plus perubahan yang diminta.

### S01 · Baseline
`cd frontend && npm ci && npm run typecheck && npm test && npm run build`. Catat jumlah test, ukuran JS/CSS, dan `du -sh public/media`. Screenshot `/services` di 375 dan 1024px ke `frontend/.cache/baseline/services/` (tidak di-commit).

**Selesai bila:** keempat angka tercatat di Bukti.

### S02 · Model data
TDD lewat seam data:
- Tambah `gallery`, `standards`, `serviceBySlug`, dan `serviceNeighbors`.
- Hapus `mediaId`, lalu migrasikan pemanggil: landing `Services.tsx`, `features.ts` bila merujuk, dan test.
- Sementara S03 belum selesai, `gallery` diisi cover yang ada ×1. Tipe tuple menjamin minimal 1.

**Selesai bila:** test seam data hijau, `grep -rn "mediaId" src/content/services.ts` hanya di dalam `gallery`, dan typecheck, test, serta build hijau.

### S03 · Kurasi gambar
1. `npm run assets:search -- "<kata kunci>" --kind image` per layanan. Contoh kata kunci: "server room", "audit document", "network cable", "team meeting security", "data center cooling".
2. User memilih 3 gambar per layanan di `.cache/pixabay/candidates.html`.
3. Kunci ID di `scripts/pixabay/assets.config.json` (rendisi `large`, `maxBytes` 450000), lalu jalankan `npm run assets:pixabay`.
4. Isi `gallery` dan caption, lalu commit `public/media`, `manifest.json`, dan config.

**Selesai bila:** 24 ID ada di manifest, `du -sh public/media` ≤ 40 MB, dan tidak ada gambar yang melanggar larangan visual DS.

### S04 · Prototipe
Skill `prototype`. Satu HTML statis di `frontend/.cache/prototype/services.html` (tidak di-commit) memakai token DS dan gambar S03. Isinya daftar zig-zag, satu berkas, dan lightbox. Pertanyaan yang diputuskan:
1. Zig-zag 56px tetap, atau grid rata?
2. Tab nomor di atas kartu terbaca sebagai "berkas", atau cukup nomor mono di dalam kartu seperti landing?
3. Rasio stage 4:3 atau 16:9 (gambar Pixabay kebanyakan 16:9)?

**Selesai bila:** user menyetujui, atau revisinya sudah diterapkan ke bagian Keputusan desain.

### S05 · Route
- `App.tsx`: tambah `<Route path="/services/:slug" element={<ServiceCase />} />`.
- `Services.tsx`: bila `location.hash` cocok dengan slug, `<Navigate replace to="/services/<slug>" />`. Link lama dari landing, email, atau mesin cari tetap berfungsi.
- Ganti link internal ke `/services/<slug>`: `components/landing/Services.tsx`, `content/features.ts`, dan test-nya.
- Slug tidak dikenal merender `NotFound`.

**Selesai bila:** test route di tabel Seam hijau dan `grep -rn "services#" src` hanya tersisa di test kompatibilitas.

### S06 · ImageGallery
Rancang interface dengan `codebase-design` sebelum test pertama. Pindahkan `lockScroll` ke `src/lib/` dan pastikan test video player tetap hijau. Pakai stub `dialog` di `src/test/setup.ts` yang sudah ada.

**Selesai bila:** test seam galeri mencakup thumbnail, buka lightbox, ←/→, Escape, fokus kembali, sinkron indeks, dan kunci scroll.

### S07 · Halaman daftar
Tulis ulang `pages/Services.tsx` sesuai §2. Buat `ServiceFileCard` di `src/components/services/`. Ganti framer-motion dengan `useReveal` dan `revealIndex`. `CtaBanner` dipakai ulang.

**Selesai bila:** test memastikan satu `h1`, 2 `h2` kategori, 8 link kartu dengan nama "Buka berkas: <judul>" dan href yang benar, tab nomor 01–08 `aria-hidden`, serta kartu genap memiliki kelas offset.

### S08 · Halaman berkas
Buat `pages/ServiceCase.tsx` sesuai §3. Pakai `ImageGallery`, `Badge`, `Button`, `Eyebrow`, dan `useReveal`.

**Selesai bila:** test memastikan:
- `h1` = judul, dan fokus pindah ke `h1` saat slug berganti;
- penghitung "03 / 08";
- prev/next benar dan `disabled` di ujung;
- blok STANDAR tidak ada bila `standards` kosong;
- CTA ke `/contact`;
- `document.title` sesuai.

### S09 · QA
1. `npm run typecheck && npm run lint && npm test && npm run build`. Lint tidak boleh menambah error baru (sekarang ada 2 error lama).
2. Browser pane dengan `npm run preview` di 375 dan 1024px, plus Chrome asli 1440px. Cek:
   - zig-zag dan hover;
   - buka berkas dari kartu dan dari landing (`/services#slug` lama);
   - ‹/› dan Back browser;
   - thumbnail dan caption;
   - lightbox (Tab terjebak, Escape, fokus kembali);
   - rail thumbnail di 375px.
3. Reduced motion: tidak ada reveal atau hover lift.
4. `design:accessibility-review`: kontras `text-link` di `bg-soft` untuk tab nomor, label mono 11–12px, target sentuh 44px.
5. `slop-patterns:check-ui` atas komponen baru.
6. Bundle JS tidak naik > 5% dari S01.

**Selesai bila:** semua temuan diperbaiki, atau ditolak dengan alasan tertulis di Bukti.

### S10 · Review dan rilis
`code-review` atas `main..redesign/services`. Push, buka PR, dan user merge. Setelah auto-release, cek produksi:
- `/services` dan `/services/penetration-testing` 200;
- `/services#iso-27001-audit` diarahkan;
- gambar `/media/*.jpg` 200 `image/jpeg`;
- lightbox berjalan.

**Selesai bila:** PR di-merge user, produksi lolos, dan Progres S00–S10 ✅.

## Verifikasi end-to-end

```bash
cd frontend
npm ci
npm run typecheck && npm test && npm run build
npm run preview -- --port 4173 --strictPort
```

Lalu buka `http://localhost:4173/services` di browser pane dan jalankan daftar S09.

## File kritis

- Diubah:
  - `frontend/src/pages/Services.tsx` (ditulis ulang)
  - `frontend/src/content/services.ts` (`gallery`, `standards`, helper)
  - `frontend/src/App.tsx` (route)
  - `frontend/src/components/landing/Services.tsx`, `frontend/src/content/features.ts` (link dan cover)
  - `frontend/src/media/index.ts` (`MEDIA_IDS`), `frontend/scripts/pixabay/assets.config.json`
  - `frontend/src/components/video-player/*` (import `lockScroll`)
- Baru:
  - `frontend/src/pages/ServiceCase.tsx`
  - `frontend/src/components/services/ServiceFileCard.tsx`
  - `frontend/src/components/gallery/*`
  - `frontend/src/lib/scroll-lock.ts`
  - `frontend/public/media/pixabay-*-large.jpg`
- Dipakai ulang:
  - `@/components/ds` (Button, Eyebrow, Badge, LineMarker, MaskReveal)
  - `@/motion` (`useReveal`, `revealIndex`)
  - `@/media` (`media()`)
  - `CtaBanner`
  - `renderWithProviders`
  - stub `dialog` di `src/test/setup.ts`
- Tidak disentuh: `frontend/src/services/` (API), `backend/`, `deploy/`, `.github/`.
- Referensi: [observasi_portofolio_pages.md](observasi_portofolio_pages.md), [docs/design-system/](docs/design-system/), [PLAN_REDESIGN_UI.md](PLAN_REDESIGN_UI.md).
