# Observasi Landing Page — genesis.ai

> Sumber: https://www.genesis.ai/ — diamati 28 Okt 2026 lewat Chrome (viewport desktop 1536×720), screenshot per section, inspeksi DOM, dan CSS produksi yang diunduh (10 file `_app/immutable/assets/*.css`).
> Metode: **ATM** — Amati (apa yang ada), Tiru (cara membangunnya ulang), Modifikasi (cara membuatnya jadi milik sendiri).
> Label: **[terverifikasi]** = dibaca langsung dari CSS/DOM. **[visual]** = dilihat dari screenshot. **[dugaan]** = inferensi, belum dibuktikan.

---

## 0. Ringkasan cepat

| Aspek | Temuan |
|---|---|
| Karakter visual | Editorial-teknis, monokrom, "lab notebook". Banyak whitespace, card abu-abu terang membulat, video full-bleed, label mono kecil, tanda garis "—" seperti registration mark. |
| Stack | **SvelteKit** (`/_app/immutable/`), CMS **DatoCMS** (aset di `datocms-assets.com`), video via **Mux** (`<mux-video>`), analytics **PostHog**. [terverifikasi] |
| Library animasi | Tidak ada GSAP/Lenis/Three/Swiper di `window`. Semua animasi = **CSS transition + IntersectionObserver** (atribut `data-visible`). [terverifikasi untuk global; bundling internal tidak dicek] |
| Grid | 4 kolom (mobile) → 12 kolom (≥900px). Gap 14/16px. |
| Font | `scto grotesk a - regular` (sans, semua teks) + `aeonik mono - medium` (label, tombol, eyebrow). Self-hosted OTF, `font-display: block`. |
| Warna inti | Navy `#1a1d34` (teks + footer), card `#f6f6f4`, faded `#8a8a8a`, biru-abu `#dee8eb`, putih `#fff`. |
| Tinggi dokumen | ±6707px, 7 block konten + footer. |

---

## 1. AMATI — Struktur & Layout per Section

Halaman dibangun dari **block CMS** yang berurutan (setiap block punya `div.debug-block-type` tersembunyi → dirender dari model DatoCMS). Setiap section = `section.site-padding.<nama-block>` berisi `div.card` (rounded 16px).

### Peta halaman

| # | Class block | y (px) | Tinggi | Isi |
|---|---|---|---|---|
| — | `header` | 0 | 52 | Logo, nav, Contact |
| 1 | `hero-block theme-difference is-hero` | 52 | 868 | Video Eno full-card + judul + 2 CTA |
| 2 | `big-media-bottom-block` | 920 | 834 | Teks kiri + video besar kanan |
| 3 | `three-thumb-block` | 1755 | 869 | Headline + 3 kartu kapabilitas |
| 4 | `hero-block theme-light removeTopPadding` | 2624 | 855 | Video GENE-26.5 full-bleed |
| 5 | `hero-block theme-light removeTopPadding` | 3479 | 855 | Video Genesis World 1.0 full-bleed |
| 6 | `about-block` | 4334 | 753 | Misi + investor (bg biru-abu) |
| 7 | `opening-block` | 5087 | 996 | Careers + tabel lowongan |
| — | footer | 6083 | 624 | Footer navy |

### 1.0 Header [terverifikasi + visual]
- `header.site-padding` → `div.grid` 12 kolom. **Tidak sticky** (`position: static`), ikut scroll.
- Logo `grid-column: 1 / span 2`: SVG wordmark "Genesis" + **video MP4 34×34px** (cincin logo animasi) ditumpuk absolut di atas lingkaran. Ada versi warna dan B/W (B/W dipakai di dark mode).
- Nav tengah `grid-column: 5 / span 6`, `justify-content: flex-end`, `gap: 60px`: Careers · Blog · News.
- "Contact" sendiri di `grid-column: 11 / span 2`, rata kanan.
- Link: `.text-s.color-faded.hover-underline` → 14px, abu `#8a8a8a`, hover jadi navy + garis bawah tumbuh dari tengah.
- Masuk halaman: header `opacity 0 → 1` dalam 1s.
- Mobile (<900px): burger 2 garis (rotate ±19° saat open), overlay menu fullscreen putih, link mulai di `padding-top: 50vh`.

### 1.1 Hero "Eno" [terverifikasi + visual]
- Card `border-radius: 16px`, container hitam, **video Mux autoplay+loop** sebagai background (robot Eno render 3D monokrom).
- Overlay grid 3 baris (`.top / .center / .bottom`) dengan **penanda garis "—" 14×1px** di kolom 1, 5, 9, 12 → kesan grid kertas teknik / viewfinder kamera.
- Pojok kiri atas: eyebrow mono "Meet Eno". Pojok kanan atas: **timecode "00:01:28"** (durasi video penuh, statis, tidak berdetak).
- Kiri bawah (kolom 1–3): judul "Eno" (`.text-card-title`, 32px) + deskripsi 14px + 2 tombol mono ("Learn more", "Join the waitlist").
- **Trik `mix-blend-mode: difference`** (`.theme-difference .overlay`): teks overlay otomatis jadi putih di atas area gelap video dan hitam di atas area terang. Tombol tidak ikut ter-invert: ada **dua set tombol** — `.links-normal` (di dalam layer blend, disembunyikan) dan `.links-excluded` (di luar layer blend, terlihat). DOM menunjukkan pasangan `gray` + `dark-gray` pada koordinat yang sama.
- **Pill "Play full video" mengikuti kursor**: `.playButton` di-set `left/top` via JS mengikuti mouse (terbukti: hover di (1250,250) → pill center di (1250,243)), `transform: translate(-50%,-75%)`, muncul `opacity .4s` saat hover. Gaya pill: `.button.inverted-faded` (glass: `backdrop-filter: blur(7px)`, bg `#f7f7f533`).
- Klik → modal video player (backdrop `#111516f2` + `blur(4px)`, frame 16:9 radius 16px, scrubber kustom). Analisis lengkap di **§3A**.
- Ukuran hero di-set JS lewat CSS var di `style` section: `--full-height`, `--hero-height`, `--hero-width`, `--hero-min-height`. Tidak ada efek scale/parallax saat scroll (dicek di scrollY 0–500: lebar & tinggi tetap).

### 1.2 "Built for the places it's needed." (big-media-bottom-block) [visual + terverifikasi]
- Card `#f6f6f4`. Baris atas: hanya penanda "—". Ruang kosong besar di atas (tinggi `.top` ±200px).
- Baris tengah: kiri `grid-column: 1 / span 3` → headline 32px 2 baris + deskripsi faded; kanan `grid-column: 5 / span 8` → video autoplay loop, radius 4px, **melebar keluar padding** (`width: calc(100% + 22px)`) dan naik `translateY(-15px)`.
- Hover video → pill "Play / Full screen".

### 1.3 "Designed to extend capability." (three-thumb-block)
- Headline + deskripsi kiri, `margin-top: 150px` ke baris kedua.
- Eyebrow "Capabilities" lalu **3 kartu sejajar** (`thumb-left/center/right` = kolom 1–4, 5–8, 9–12).
- Tiap kartu: media 16:9 (radius 4px, render 3D B/W), lalu nomor mono "01", judul mono, deskripsi faded 14px.
- Mobile: berubah jadi **slider drag** (1 kartu = 100%), navigasi panah kotak kecil 24×24 abu `#ebebeb`, transisi `transform .6s cubic-bezier(.33,1,.68,1)`.
- [visual] Caption 02 & 03 muncul belakangan dari 01 → stagger fade.

### 1.4 & 1.5 "GENE-26.5" / "Genesis World 1.0" (hero-block theme-light)
- Section `aspect-ratio: 16/9` (mobile `9/16`), video full-bleed dalam card.
- Teks putih: eyebrow kiri atas (nama produk), timecode kanan atas, headline + deskripsi + "Learn more" di tengah-kiri.
- **Blur bertopeng** atas & bawah: `.blur-wrapper-top` (25% tinggi) dan `.blur-wrapper-bottom` (40%) pakai `backdrop-filter: blur(4px)` + `mask-image: linear-gradient(...)` → video makin blur ke tepi, teks lebih terbaca tanpa overlay hitam pekat.
- Section ke-4/5 tanpa padding atas (`removeTopPadding`) sehingga kartu-kartu video menumpuk rapat.

### 1.6 About (about-block)
- Background grid `#dee8eb` (biru-abu pucat) — satu-satunya blok berwarna di badan halaman.
- Baris atas: eyebrow "About" (kol 1) + "Genesis" (kol 5). Pernyataan misi satu baris lebar (`text-xl` 32px).
- Bawah: "Our Investors" + paragraf faded. Banyak ruang kosong (`padding-bottom: 300px − padding`).

### 1.7 Careers (opening-block)
- Kiri: headline "Have a hand in writing the future." + deskripsi. Kanan (kol 9–12): foto tim radius 4px.
- **Tabel lowongan** grid 12 kolom: header mono (Roles / Department / Location / Apply), baris `border-top: 1px #cacaca`, `padding 20px 0`. Lokasi 2 baris (Bay Area + OnSite faded).
- Hover baris → teks "Apply" **muncul dengan wipe mask kiri→kanan** (lihat §3).
- Kanan bawah: tombol gray "View all open roles".

### 1.8 Footer
- `.footer-large` bg navy `#1a1d34`, teks `#dee8eb`, card membulat [visual].
- 4 kolom × `span 4/…` dengan `min-height: 180px` per sel: logo putih | tagline "Made by humans, for humans." | link mono (Careers, Blog, News, Contact) + sosial (Twitter/X, LinkedIn, YouTube) | email kanan.
- Baris bawah (`color: #dee8eb99`): © 2026 Genesis AI SAS kiri, Privacy policy kanan.
- [visual] Link footer muncul satu per satu (stagger) saat masuk viewport.

---

## 2. AMATI — Design System

### 2.1 Warna [terverifikasi dari CSS]

| Token (usulan nama) | Hex | Dipakai untuk |
|---|---|---|
| `ink` | `#1a1d34` | Semua teks heading, garis marker, footer bg, hover link |
| `ink-black` | `#111516` | Overlay video, theme-dark, progress bar slider |
| `ink-soft` | `#353a3b` | Teks theme-black |
| `muted` | `#8a8a8a` | Deskripsi, link nav, `.color-faded` |
| `muted-cool` | `#7c828f` | Sub-deskripsi galeri, footnote dark mode |
| `surface` | `#f6f6f4` | Background card (off-white hangat) |
| `surface-cool` | `#dee8eb` | Blok About, teks footer, garis inverted |
| `button-gray` | `#ebebeb` | Tombol gray, arrow-button |
| `button-dark` | `#282828` | Tombol dark-gray |
| `button-blue` | `#cad4d9` | Varian tombol blue |
| `divider` | `#cacaca` | Border baris tabel & nav slider |
| `glass` | `#f7f7f533` + blur 7px | Pill di atas video |
| `page` | `#ffffff` | Latar halaman (`main`) |
| Dark mode | `#07070d` (main), `#0e0f19` (card/footer), `#10132a` (tombol) | via `html[color-scheme=dark]` |

Tidak ada warna aksen "brand" yang mencolok. Satu-satunya warna adalah merah `#ff5656` di shape logo (disembunyikan; logo pakai video). Identitas = **monokrom + navy**.

### 2.2 Tipografi [terverifikasi]

Font utama: **Scto Grotesk A Regular** (grotesk geometris, tracking rapat). Font label: **Aeonik Mono Medium**.

| Class | Ukuran | Line-height | Letter-spacing | Font | Pemakaian |
|---|---|---|---|---|---|
| `.text-xxl` | 2.5rem / 40px | 102% | −0.125rem | Grotesk | Display besar |
| `.text-xl` / `.text-card-title` (≥900) / `.text-headline` | 2rem / 32px | 102% | −0.1rem | Grotesk | Headline section, misi |
| `.text-xxl-small` / `.text-card-title` (mobile) | 1.375rem / 22px | 108% | −0.069rem | Grotesk | Headline mobile |
| `.text-l` / `.p-article` (≥900) | 1.125rem / 18px | 112% / 132% | −0.056rem | Grotesk | Lead |
| `.text-m` | 1rem / 16px | 112% | −0.03rem | Grotesk | — |
| `.text-s` | 0.875rem / 14px | 112% | −0.026rem | Grotesk | Nav, deskripsi |
| `.text-body` | 12–13.5px | ~1.15 | −0.004rem | Grotesk | Body kecil |
| `.text-eyebrow` | 0.625rem / **10px** | 118% | 0 | **Mono 500** | Label, tombol, timecode, header tabel |

Ciri khas:
- Heading **tracking negatif kuat** (−3 s.d. −5%) dan line-height ~1.0 → padat, modern.
- `leading-trim: both; text-edge: cap` (eksperimental) untuk meratakan cap-height.
- `text-wrap: balance` di heading, `text-wrap: pretty` di paragraf.
- Kontras ukuran ekstrem: headline 32px vs label mono 10px. Tidak ada ukuran "tengah" yang dominan.
- Semua weight 400 untuk sans. Tidak ada bold di landing.

### 2.3 Spacing, grid, radius [terverifikasi]

| Token | Mobile | ≥900px | ≥1440px |
|---|---|---|---|
| Site padding (luar card) | 14px | 34px | `--site-padding` = 34px |
| Max width | `--site-max-width` = 2800px | | |
| Grid padding (dalam card) | 18px | 22px | |
| Column gap | 14px | 16px | |
| Kolom | 4 | 12 | |
| Section padding vertikal | 40px | 68px atas / 40px bawah | |
| Jarak antar card | ±40px (padding-bottom section) | | |

Radius: card **16px**, media/gambar **4px**, video full-bleed **6px**, tombol **6px**, modal video **16px**.

Breakpoint: **700** (sembunyikan play pill), **900** (layout utama), **1440**, **1600** (konten menyempit ke 8 kolom).

### 2.4 Komponen [terverifikasi]

**Line marker** (`span` di `line.css`) — ciri paling khas:
```css
span { background:#1a1d34; width:14px; height:1px; margin-bottom:14px; display:flex; }
span.inverted { background:#dee8eb; }
span.compact  { margin-bottom:8px; }
```
Ditempatkan di awal kolom 1, 5, 9, 12 pada setiap baris top/center/bottom card. Muncul dengan animasi `scaleX(0 → 1)`.

**Button** (`.button`):
- `height: 24px; padding: 8px; border-radius: 6px; gap: 8px;` teks mono 10px.
- Varian: `gray` (#ebebeb/navy), `dark-gray` (#282828/putih), `white`, `blue` (#cad4d9), `inverted-faded` (glass), `inverted-disabled`.
- Hover: `padding-right: 8px → 30px` dan ikon ▶ muncul (`opacity` dengan delay .2s). Transisi `.35s`.
- Focus: pseudo `:before` 2px di luar tombol, border 1px warna sama, `opacity 0→1` → focus ring yang menyatu dengan tombol.

**Arrow button / nav-legend**: kotak 18×18 (desktop) / 24×24 (mobile), bg `#ebebeb`, radius 6px, disabled = ikon opacity .3.

**Card**: `background:#f6f6f4; border-radius:16px;` konten `opacity 0` sampai class `.shown`.

**Media**: `<figure>` + `<img>` `opacity 0 → 1` (.4s) saat `.ready`. Video Mux: thumbnail statis di bawah, `mux-video` fade in saat siap.

**Job row**: `border-top 1px #cacaca`, grid 12 kolom (4/4/3/1), CTA reveal mask.

---

## 3. AMATI — Animasi & Interaksi [terverifikasi dari CSS kecuali disebut]

| # | Animasi | Mekanisme | Durasi / easing |
|---|---|---|---|
| A1 | Header muncul | `opacity 0 → 1` via class `.fade-in` | 1s ease-in-out |
| A2 | Card muncul | `.card .content` opacity 0 → 1 saat `.shown`; `.fade-in-card` | .6s ease-out |
| A3 | **Stagger teks** | Wrapper `div[data-visible=true]` (diset IntersectionObserver). Anak `.fade-in-N` delay = `0.6s + 0.1s × N` | opacity .4s ease-out |
| A4 | **Garis marker tumbuh** | `.line-in-N` `transform: scaleX(0 → 1)`, delay `0.1s × N`. 121 elemen `line-in` di halaman | .4s ease-in-out |
| A5 | Gambar load | `img` opacity 0 → 1 saat `.ready` | .4s ease-in-out |
| A6 | Container video load | `@keyframes fadeIn` | .5s ease-in-out |
| A7 | **Underline nav dari tengah** | `:before` width 0→100%, left 50%→0, opacity .5→1 | .35s ease-in-out |
| A8 | **Button expand + arrow** | padding-right 8→30px, arrow opacity delay .2s | .35s |
| A9 | **Cursor-follow play pill** | JS set `left/top` = posisi mouse; opacity 0→1 saat hover | .4s ease-in-out |
| A10 | **Hero blend difference** | `mix-blend-mode: difference` di overlay teks | statis |
| A11 | Slider/galeri | `transform: translate(calc(var(--currentPage) * -100% - gap*page + var(--dragOffset)))`; drag mematikan transition | .6s `cubic-bezier(.33,1,.68,1)` (easeOutCubic) |
| A12 | Progress slider | `.nav:after` width = `var(--gallery-percentage)` | .1s linear |
| A13 | Info item slider | `.page-selected` → label/judul/deskripsi opacity 1 | .6s ease-in |
| A14 | **Job row "Apply" wipe** | `@property --mask-edge` (percentage) dianimasikan 100% → −1% pada `mask-image: linear-gradient(to right, transparent var(--mask-edge), black 0%)` | .4s ease-in-out |
| A15 | Modal video | Backdrop + frame muncul instan setelah video siap (±0.5–0.7s), kontrol fade in, tutup tanpa animasi. Detail §3A | kontrol: opacity 1s |
| A16 | Blur tepi video | `backdrop-filter: blur(4px)` + gradient mask atas/bawah | statis |
| A17 | Burger | garis rotate ±19° + translateY 3.5px | .3s ease-in-out |
| A18 | Smooth scroll | `html { scroll-behavior: smooth }` (native, tanpa Lenis) | — |

Catatan:
- **Tidak ada** parallax, pin/scroll-scrub, split-text per huruf, atau WebGL. Semua "wow" datang dari video berkualitas tinggi + stagger halus. [terverifikasi: tidak ada `<canvas>`, tidak ada global GSAP/Lenis/Three]
- **Tidak ada** `prefers-reduced-motion` di CSS yang diunduh. [terverifikasi]
- Garis vertikal putih tipis di tengah video hero terlihat di beberapa frame. Garis itu juga muncul di dalam modal player, jadi itu bagian dari konten video, bukan elemen UI [visual].

---

## 3A. AMATI — Modal Video Player (analisis mendalam)

> Diuji 28 Okt 2026 di Chrome desktop 1536×720. Metode: klik nyata + `MutationObserver` yang mencatat setiap perubahan DOM/class/style dengan timestamp, sampling opacity tiap 50ms, dan uji tombol, scrubber, keyboard, serta cara menutup. Semua poin di bawah **[terverifikasi]** kecuali diberi label lain.

### 3A.1 Pemicu & cakupan
Satu komponen player **global** dipakai oleh semua video di halaman:

| Section | Pemicu | Label pill hover | Durasi video penuh |
|---|---|---|---|
| Hero "Eno" | klik di mana saja pada `.overlay-play` | "Play full video" | 88.6s (00:01:28) |
| Big media "Built for the places…" | klik `.video-wrapper` | "Play Full screen" | 13.1s |
| 3 kartu kapabilitas | klik `.video-wrapper` | "Play Full screen" | 7.1s (kartu 01) |
| GENE-26.5 | klik `.overlay-play` | "Play video" | 185.7s (00:03:05) |
| Genesis World 1.0 | klik `.overlay-play` | "Play video" | — (tidak diukur) |

- Video di card (preview) berbeda dari video di modal. Preview hero berdurasi 32.9s, `muted`, autoplay, loop. Modal memuat **versi penuh dengan audio**.
- Hit area = seluruh permukaan video, bukan hanya pill. Pill hanya petunjuk visual yang mengikuti kursor (§1.1).

### 3A.2 Struktur DOM saat terbuka
Elemen modal **di-append langsung ke `<main>`**, bukan di dalam section. Wadah `div.modal` (fixed, z 99) tetap `display: none` dan tidak dipakai player ini.

```
<main>
  …sections…
  div.video-overlay                  ← backdrop: fixed, inset 0, z 100
  mux-video.video-frame.video-height-first   ← frame video: fixed, z 100
  div.overlay.on.overlay-controls.video-height-first   ← kontrol: fixed, z 101
     ├─ div.top.grid      → line marker ×4 + [Close] di col-4
     ├─ div.center        → div.scrubber (hit area 100px) > div.bar > div.progress + button.handle
     └─ div.bottom.grid   → col-1: judul (kosong) + elapsed "00:00:39"
                            col-2: [Mute]   col-3: [Pause]   col-4: durasi "00:01:28"
</main>
<body class="no-scroll" style="padding-right: 15px">
```

Ukuran terukur (viewport 1536×720):

| Elemen | Posisi / ukuran | Style kunci |
|---|---|---|
| `.video-overlay` | 0,0 · 1536×720 | `background: rgba(17,21,22,.95)`, `backdrop-filter: blur(4px)` |
| `.video-frame` | x192 y36 · **1152×648** | `top/left: 50%`, `translate(-50%,-50%)`, radius 16px, bg hitam |
| `.overlay-controls` | sama persis dengan frame | z 101, radius 16px, **`mix-blend-mode: difference`** (inline style) |
| Grid kontrol | padding 22px, kolom di x 214 / 589 / 963 / 1308 | grid 12 kolom: col-1 `1/span 3`, col-2 `5/span 3`, col-3 `9/span 3`, col-4 `12/span 1` |
| `.scrubber` | lebar penuh frame, tinggi **100px**, `translateY(-50%)` | `cursor: pointer` |
| `.bar` | x214 · w1108 · h1 | `#ffffff33` |
| `.progress` | h1, `width: N%` | `#fff` |
| `.handle` | **14×3px**, radius 1px | `#fff`, `left: N%`, `translate(-50%,-50%)` |
| Tombol | h24, mono 10px | `.button.inverted-faded` (glass `#f7f7f533` + `blur(7px)`) |

**Aturan ukuran frame:** 1152×648 = 90% tinggi viewport × 16:9. Class `video-height-first` = `height: 90vh; width: auto`. Ada juga `video-width-first` = `width: calc(100% − 68px)` (mobile: −28px). Player memilih salah satu berdasarkan rasio viewport. Di layar lebar dipakai height-first. Pemilihan untuk layar tinggi/sempit **[dugaan dari CSS]**, belum diuji dengan resize.

Atribut `<mux-video>`: `autoplay loop playsinline prefer-playback disable-tracking disablepictureinpicture disableremoteplayback playback-id`. Jadi tidak ada Picture-in-Picture, tidak ada Cast/AirPlay, dan tracking Mux Data dimatikan. Audio langsung bunyi (`muted=false`) karena dibuka oleh klik pengguna.

### 3A.3 Timeline buka (dari MutationObserver, t=0 saat klik)

| t | Kejadian |
|---|---|
| 0ms | Klik |
| ~5–75ms | `mux-video.video-fullscreen` di-append ke `<main>` (opacity 0, class loading). `body` dapat class `no-scroll` → `overflow: hidden` + `padding-right: 15px` (kompensasi lebar scrollbar agar layout tidak bergeser). |
| ~86ms | `overlay-controls` diberi `opacity: 0` |
| **~470–680ms** | Video siap → `div.video-overlay` (backdrop) + `div.overlay-controls` di-append. Class frame berganti `video-fullscreen` → `video-frame video-height-first`. Backdrop dan frame **langsung tampil penuh**, tanpa animasi masuk. |
| ~1.1–1.5s | Kontrol diset `mix-blend-mode: difference; opacity: 1` dan fade in (`transition: opacity 1s`) |
| setiap ~250ms | `.progress` width dan `.handle` left diperbarui (frekuensi event `timeupdate`) |

Jeda ±0.5–0.7s antara klik dan munculnya modal tidak diberi indikator loading. Halaman terlihat diam, hanya scroll yang terkunci.

> Catatan: di CSS ada `@keyframes fadeIn 1s` dengan delay 1s untuk `.video-fullscreen`. Class itu hanya bertahan ±0.5s sebelum diganti, jadi animasi tersebut tidak pernah terlihat.

### 3A.4 Kontrol & state

| Kontrol | Perilaku terverifikasi |
|---|---|
| **Close** (pojok kanan atas, col-4) | Menutup player |
| **Mute** ↔ **"Audio on"** | Label berubah sesuai state. State mute **global**: setelah di-mute di hero, video big-media yang dibuka berikutnya juga muted dengan label "Audio on". |
| **Pause** ↔ **"Resume play"** | Label berubah. Elapsed time berhenti. |
| **Scrubber klik** | Klik di 25% bar → `currentTime` tepat 25% (22.15s dari 88.6s). Klik 20px di bawah garis tetap kena (hit area 100px). State pause dipertahankan. |
| **Scrubber drag** | Drag handle ke 75% → `currentTime` tepat 75% (66.45s). Drag pakai seluruh area scrubber, bukan hanya handle 14×3px. |
| Handle hover | Tidak ada perubahan (CSS punya `transition: transform .2s`, tapi tidak ada state hover yang aktif). |
| Elapsed / durasi | Kiri bawah `00:00:39` (warna `rgba(255,255,255,.6)`), kanan bawah `00:01:28` (putih). Format `HH:MM:SS`. |
| Judul / label atas | Elemen `p.text-eyebrow` ada di kiri atas dan kiri bawah, tetapi kosong (field CMS tidak diisi). |
| Loop | Video penuh tetap `loop=true`. |
| **Resume posisi** | Tutup lalu buka lagi → video lanjut dari posisi terakhir (80.65s), tidak mulai dari 0. Preview di card justru restart dari 0. |

### 3A.5 Auto-hide kontrol
- Kontrol **disembunyikan saat kursor keluar dari frame**: inline `opacity: 0`, fade 1s (terukur: 1.00 → 0.18 → 0.00 dalam ±1s).
- Kontrol **muncul lagi saat kursor bergerak di atas frame** (`opacity: 1`).
- Kursor yang diam di dalam frame **tidak** memicu hide (diamati 22s tanpa gerak, kontrol tetap tampil). Jadi tidak ada timer idle seperti YouTube.

### 3A.6 Efek visual kontrol
- Seluruh layer kontrol (garis marker, scrubber, teks waktu, tombol) memakai **`mix-blend-mode: difference`**, sama seperti teks hero. Di atas frame gelap kontrol tampak putih, di atas frame terang jadi hitam/gelap [visual].
- Line marker "—" 14×1px (`#dee8eb`) dipasang di 4 kolom, atas dan bawah. Modal mengulang bahasa grid halaman, jadi terasa satu sistem dengan card.
- Tombol glass ikut ter-blend. Di frame yang sangat terang, tombol "Resume play" **hampir tidak terlihat** [visual: screenshot frame lab putih].

### 3A.7 Cara menutup

| Cara | Hasil |
|---|---|
| Tombol Close | ✅ Tutup |
| Klik backdrop di luar frame | ✅ Tutup |
| Tombol **Escape** | ❌ Tidak menutup (DOM tidak berubah setelah 2s) |
| Tombol back browser | Tidak diuji |

Timeline tutup: ~70ms kontrol diset `opacity: 0` → **~100ms seluruh elemen dihapus dari DOM** dan class `no-scroll` dilepas. Karena dihapus sebelum transisi 1s selesai, **tidak ada animasi keluar**: modal hilang mendadak. Posisi scroll halaman tetap. Video preview di card lanjut loop dari 0.

### 3A.8 Keyboard & aksesibilitas

| Cek | Hasil |
|---|---|
| Elemen dialog | Tidak ada `<dialog>`, `role="dialog"`, atau `aria-modal` |
| Focus trap | ❌ Tidak ada. Tab dari dalam modal pindah ke link header di belakang backdrop (Careers → Blog → News → Contact). |
| `inert` pada konten belakang | ❌ Tidak ada |
| Space | Hanya mengaktifkan tombol yang sedang fokus (perilaku bawaan `<button>`). Tidak ada shortcut play/pause global. |
| Arrow kiri/kanan | ❌ Tidak seek |
| Scrubber | `div` tanpa `role="slider"`, `tabindex=-1`, tanpa `aria-valuenow`. Tidak bisa dipakai dengan keyboard. |
| Tombol | `<button>` asli dengan label teks. Bisa difokus dan diklik dengan keyboard. |
| Kontras kontrol | Bergantung frame karena blend `difference`. Bisa jatuh mendekati 1:1 di frame abu-abu menengah. |
| Caption / subtitle | Tidak ada kontrol caption |

### 3A.9 Ringkasan karakter
Player sengaja **minimal dan editorial**: kontrolnya hanya Close, Mute, Pause, dan sebuah garis 1px. Semua label berupa teks mono, bukan ikon. Frame mengambang di atas backdrop gelap yang blur, dan grid marker halaman diulang di dalam player. Kelemahannya ada di transisi buka/tutup yang kasar dan aksesibilitas keyboard yang hampir tidak ada.

---

## 4. TIRU — Blueprint implementasi

Target: HTML/CSS/vanilla JS (bisa dipindah ke Svelte/React/Next). Nilai di bawah diambil dari CSS asli.

### 4.1 Token CSS
```css
:root {
  /* color */
  --ink: #1a1d34;
  --ink-black: #111516;
  --muted: #8a8a8a;
  --surface: #f6f6f4;
  --surface-cool: #dee8eb;
  --btn-gray: #ebebeb;
  --btn-dark: #282828;
  --divider: #cacaca;
  --glass: rgba(247, 247, 245, .2);

  /* type */
  --font-sans: "Scto Grotesk A", "Inter Tight", system-ui, sans-serif;
  --font-mono: "Aeonik Mono", "JetBrains Mono", ui-monospace, monospace;

  /* layout */
  --site-pad: 14px;
  --grid-pad: 18px;
  --gap: 14px;
  --radius-card: 16px;
  --radius-media: 4px;
  --radius-btn: 6px;

  /* motion */
  --ease-out-cubic: cubic-bezier(.33, 1, .68, 1);
  --dur-fast: .35s;
  --dur-base: .4s;
  --dur-slow: .6s;
}
@media (min-width: 900px) {
  :root { --site-pad: 34px; --grid-pad: 22px; --gap: 16px; }
}
```

### 4.2 Grid & card
```css
.site { max-width: 2800px; margin: auto; padding: 0 var(--site-pad); }
.card { background: var(--surface); border-radius: var(--radius-card); position: relative; }
.grid {
  display: grid; column-gap: var(--gap);
  grid-template-columns: repeat(4, 1fr);
  padding: var(--grid-pad);
}
@media (min-width: 900px) { .grid { grid-template-columns: repeat(12, 1fr); } }

/* posisi kolom yang dipakai berulang */
.c1 { grid-column: 1 / span 3; }   /* teks utama */
.c2 { grid-column: 5 / span 4; }
.c3 { grid-column: 9 / span 3; }
.c4 { grid-column: 12 / span 1; justify-self: end; }
```

### 4.3 Line marker + stagger reveal
```css
.marker { display: block; width: 14px; height: 1px; background: var(--ink);
          margin-bottom: 14px; transform: scaleX(0); transform-origin: left; }
.fade   { opacity: 0; }

[data-visible="true"] .marker { transform: scaleX(1);
  transition: transform var(--dur-base) ease-in-out;
  transition-delay: calc(var(--i, 1) * .1s); }
[data-visible="true"] .fade { opacity: 1;
  transition: opacity var(--dur-base) ease-out;
  transition-delay: calc(.6s + var(--i, 1) * .1s); }

@media (prefers-reduced-motion: reduce) {
  .marker, .fade { transform: none; opacity: 1; transition: none !important; }
}
```
```js
// Set data-visible sekali saat block masuk viewport
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) {
    e.target.dataset.visible = "true";
    io.unobserve(e.target);
  }
}, { threshold: 0.15 });
document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
```
Pakai `style="--i:3"` di tiap elemen untuk urutan stagger (pengganti 12 class `fade-in-1..12` di aslinya).

### 4.4 Button expand
```css
.btn { position: relative; display: inline-flex; align-items: center; height: 24px;
  padding: 8px; border: 0; border-radius: var(--radius-btn);
  font: 500 10px/1.18 var(--font-mono); white-space: nowrap; cursor: pointer;
  transition: padding-right var(--dur-fast), background-color var(--dur-fast), color var(--dur-fast); }
.btn--gray { background: var(--btn-gray); color: var(--ink); }
.btn--dark { background: var(--btn-dark); color: #fff; }
.btn--glass { background: var(--glass); color: #fff; backdrop-filter: blur(7px); }
.btn .arrow { position: absolute; right: 8px; opacity: 0; transition: opacity .1s; }
.btn:hover { padding-right: 30px; }
.btn:hover .arrow { opacity: 1; transition: opacity .3s .2s; }
.btn::before { content: ""; position: absolute; inset: -2px; border-radius: inherit;
  border: 1px solid currentColor; opacity: 0; transition: opacity var(--dur-fast); }
.btn:focus-visible::before { opacity: 1; }
```

### 4.5 Underline dari tengah
```css
.u-link { position: relative; color: var(--muted); transition: color var(--dur-fast) ease-in-out; }
.u-link::before { content: ""; position: absolute; top: calc(100% + 1px); left: 50%;
  width: 0; height: 1px; background: var(--ink); opacity: .5;
  transition: width var(--dur-fast) ease-in-out, left var(--dur-fast) ease-in-out, opacity var(--dur-fast); }
.u-link:hover { color: var(--ink); }
.u-link:hover::before { width: 100%; left: 0; opacity: 1; }
```

### 4.6 Hero video + overlay difference
```html
<section class="site hero">
  <div class="card hero__media">
    <video autoplay muted loop playsinline src="hero.mp4"></video>
    <div class="hero__overlay grid" data-reveal>   <!-- layer blend -->
      <p class="eyebrow">Meet Eno</p> <p class="eyebrow c4">00:01:28</p>
      <h1 class="title c1">Eno</h1>
      <p class="desc c1">…</p>
    </div>
    <div class="hero__ctas">                         <!-- di luar blend -->
      <a class="btn btn--dark">Learn more <span class="arrow">▶</span></a>
    </div>
    <button class="btn btn--glass hero__pill">Play full video</button>
  </div>
</section>
```
```css
.hero__media { position: relative; overflow: hidden; background: #000; height: calc(100svh - 120px); }
.hero__media video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.hero__overlay { position: absolute; inset: 0; color: #fff; mix-blend-mode: difference; }
.hero__pill { position: absolute; pointer-events: none; opacity: 0;
  transform: translate(-50%, -75%); transition: opacity var(--dur-base) ease-in-out; }
.hero__media:hover .hero__pill { opacity: 1; }
@media (max-width: 700px) { .hero__pill { display: none; } }
```
```js
const media = document.querySelector(".hero__media");
const pill = media.querySelector(".hero__pill");
media.addEventListener("pointermove", (e) => {
  const r = media.getBoundingClientRect();
  pill.style.left = `${e.clientX - r.left}px`;
  pill.style.top = `${e.clientY - r.top}px`;
});
```
Kenapa CTA dipisah dari layer blend: dengan `difference`, tombol abu akan berubah warna mengikuti video. Aslinya mengatasi ini dengan merender tombol dua kali; memisahkan layer sudah cukup.

### 4.7 Blur tepi video (section produk)
```css
.blur-top, .blur-bottom { position: absolute; left: 0; width: 100%; backdrop-filter: blur(4px); }
.blur-top    { top: 0;    height: 25%; mask-image: linear-gradient(#000, transparent); }
.blur-bottom { bottom: 0; height: 40%; mask-image: linear-gradient(transparent, #000); }
```

### 4.8 Mask wipe "Apply"
```css
@property --mask-edge { syntax: "<percentage>"; inherits: false; initial-value: 100%; }
.reveal { mask-image: linear-gradient(to right, transparent var(--mask-edge), #000 0%);
          transition: --mask-edge .4s ease-in-out; }
.job:hover .reveal { --mask-edge: -1%; }
```
`@property` belum didukung semua browser lama. Fallback: animasikan `clip-path: inset(0 100% 0 0)` → `inset(0)`.

### 4.9 Slider kartu (mobile)
```css
.slider { display: flex; gap: var(--gap); }
.slide { flex: 0 0 100%;
  transform: translateX(calc(var(--page) * (-100% - var(--gap)) + var(--drag, 0px)));
  transition: transform var(--dur-slow) var(--ease-out-cubic); }
.is-dragging .slide { transition: none; }
@media (min-width: 900px) { .slide { flex-basis: 33.333%; } }
```
Progress bar: `.nav::after { width: var(--progress); height: 1px; background: var(--ink-black); }` di atas border `1px #cacaca`.

### 4.10 Modal video player
Meniru tampilan dan perilaku §3A, sekaligus menutup kekurangannya: `<dialog>` memberi focus trap, Escape, dan latar inert secara bawaan, ada animasi keluar, dan scrubber bisa dipakai dengan keyboard.

```html
<dialog class="vplayer" aria-label="Video player">
  <video class="vplayer__frame" playsinline loop disablepictureinpicture></video>
  <div class="vplayer__ui grid">
    <div class="c1"><span class="marker marker--inv"></span><p class="eyebrow vplayer__title"></p></div>
    <div class="c2"><span class="marker marker--inv"></span></div>
    <div class="c3"><span class="marker marker--inv"></span></div>
    <div class="c4"><span class="marker marker--inv"></span>
      <button class="btn btn--glass" data-act="close">Close</button></div>

    <input class="vplayer__scrub" type="range" min="0" max="1000" value="0"
           aria-label="Posisi video">

    <div class="c1 vplayer__bottom"><p class="eyebrow vplayer__elapsed">00:00:00</p><span class="marker marker--inv"></span></div>
    <div class="c2 vplayer__bottom"><button class="btn btn--glass" data-act="mute">Mute</button><span class="marker marker--inv"></span></div>
    <div class="c3 vplayer__bottom"><button class="btn btn--glass" data-act="play">Pause</button><span class="marker marker--inv"></span></div>
    <div class="c4 vplayer__bottom"><p class="eyebrow vplayer__dur">00:00:00</p><span class="marker marker--inv"></span></div>
  </div>
</dialog>
```

```css
.vplayer { padding: 0; border: 0; background: transparent; max-width: none; max-height: none;
  width: min(calc(90vh * 16 / 9), calc(100vw - 68px));      /* height-first vs width-first dalam satu rumus */
  aspect-ratio: 16 / 9; border-radius: 16px; overflow: hidden;
  opacity: 0; transform: scale(.98);
  transition: opacity .4s ease-out, transform .4s var(--ease-out-cubic),
              overlay .4s allow-discrete, display .4s allow-discrete; }
.vplayer[open] { opacity: 1; transform: none; }
@starting-style { .vplayer[open] { opacity: 0; transform: scale(.98); } }
.vplayer::backdrop { background: rgb(17 21 22 / .95); backdrop-filter: blur(4px);
  opacity: 0; transition: opacity .4s, overlay .4s allow-discrete, display .4s allow-discrete; }
.vplayer[open]::backdrop { opacity: 1; }
@starting-style { .vplayer[open]::backdrop { opacity: 0; } }

.vplayer__frame { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; background: #000; }
.vplayer__ui { position: absolute; inset: 0; grid-template-rows: auto 1fr auto; align-content: stretch;
  color: #fff; mix-blend-mode: difference; transition: opacity 1s; }
.vplayer.is-idle .vplayer__ui { opacity: 0; }
.vplayer__bottom { align-self: end; }
.marker--inv { background: #dee8eb; transform: none; }

/* scrubber: garis 1px, hit area tinggi, handle 14×3 */
.vplayer__scrub { grid-column: 1 / -1; align-self: center; width: 100%; height: 40px;
  appearance: none; background: transparent; cursor: pointer; margin: 0; }
.vplayer__scrub::-webkit-slider-runnable-track { height: 1px;
  background: linear-gradient(to right, #fff var(--p, 0%), rgb(255 255 255 / .2) 0); }
.vplayer__scrub::-webkit-slider-thumb { appearance: none; width: 14px; height: 3px;
  margin-top: -1px; border-radius: 1px; background: #fff; }
.vplayer__scrub:focus-visible { outline: 1px solid #fff; outline-offset: 6px; }

@media (prefers-reduced-motion: reduce) { .vplayer, .vplayer::backdrop { transition: none; } }
```

```js
const dlg = document.querySelector(".vplayer");
const vid = dlg.querySelector("video");
const scrub = dlg.querySelector(".vplayer__scrub");
const fmt = (s) => new Date((s || 0) * 1000).toISOString().slice(11, 19);   // HH:MM:SS
const positions = new Map();                                                 // resume per video
let muted = false;                                                           // state mute global

export function openPlayer(src, title = "") {
  src = new URL(src, location.href).href;   // samakan dengan format vid.src (URL absolut)
  if (vid.src !== src) { vid.src = src; vid.currentTime = positions.get(src) ?? 0; }
  vid.muted = muted;
  dlg.querySelector(".vplayer__title").textContent = title;
  document.body.style.paddingRight = `${innerWidth - document.documentElement.clientWidth}px`;
  document.documentElement.style.overflow = "hidden";
  dlg.showModal();                     // fokus terkunci, Esc menutup, latar inert
  vid.play();
}

dlg.addEventListener("close", () => {
  positions.set(vid.src, vid.currentTime);
  vid.pause();
  document.documentElement.style.overflow = "";
  document.body.style.paddingRight = "";
});
dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });   // klik backdrop

dlg.addEventListener("click", (e) => {
  const act = e.target.closest("[data-act]")?.dataset.act;
  if (act === "close") dlg.close();
  if (act === "mute") { muted = vid.muted = !vid.muted; e.target.textContent = muted ? "Audio on" : "Mute"; }
  if (act === "play") vid.paused ? vid.play() : vid.pause();
});
vid.addEventListener("play",  () => dlg.querySelector('[data-act="play"]').textContent = "Pause");
vid.addEventListener("pause", () => dlg.querySelector('[data-act="play"]').textContent = "Resume play");
vid.addEventListener("loadedmetadata", () => dlg.querySelector(".vplayer__dur").textContent = fmt(vid.duration));
vid.addEventListener("timeupdate", () => {
  const p = vid.currentTime / vid.duration || 0;
  scrub.value = p * 1000;
  scrub.style.setProperty("--p", `${p * 100}%`);
  dlg.querySelector(".vplayer__elapsed").textContent = fmt(vid.currentTime);
});
scrub.addEventListener("input", () => { vid.currentTime = (scrub.value / 1000) * vid.duration; });

// auto-hide: sembunyikan saat kursor keluar frame (seperti aslinya), tampil saat bergerak/fokus
dlg.addEventListener("pointerleave", () => dlg.classList.add("is-idle"));
dlg.addEventListener("pointermove",  () => dlg.classList.remove("is-idle"));
dlg.addEventListener("focusin",      () => dlg.classList.remove("is-idle"));
```

Catatan port:
- Pakai `<mux-video>` atau `hls.js` bila sumbernya HLS. Untuk MP4 biasa, `<video>` sudah cukup.
- Tampilkan spinner kecil atau ubah pill menjadi "Loading…" selama video belum `canplay`. Aslinya diam ±0.6s tanpa umpan balik.
- `transition-behavior: allow-discrete` dan `@starting-style` butuh Chrome 117+ / Safari 17.4+. Di browser lama dialog tetap berfungsi, hanya tanpa animasi.

### 4.11 Urutan section yang ditiru
1. Header statis (logo + nav kanan).
2. Hero video full-card + overlay grid + 2 CTA + pill kursor.
3. Split teks kiri (3 kol) / media kanan (8 kol).
4. Headline + 3 kartu bernomor (01/02/03).
5. 1–2 card video full-bleed 16:9 dengan blur tepi.
6. Blok misi berwarna (surface-cool).
7. Tabel/list (lowongan, fitur, harga) dengan hover reveal.
8. Footer navy 4 kolom.

---

## 5. MODIFIKASI — Arah pengembangan

### 5.1 Yang dipertahankan (DNA desain)
- Grid 12 kolom yang **diperlihatkan** lewat line marker "—". Ini identitas terkuat, murah dibuat.
- Kontras skala tipografi: headline grotesk tracking rapat vs label mono 10px.
- Card membulat 16px di atas latar putih, jarak antar card kecil (±40px).
- Animasi minimal: hanya opacity + scaleX + stagger. Cepat, ringan, tanpa library.

### 5.2 Yang diganti agar tidak jadi klon
| Elemen asli | Opsi modifikasi |
|---|---|
| Font Scto Grotesk A + Aeonik Mono (komersial) | Gratis: **Inter Tight / Geist / Manrope** + **Geist Mono / JetBrains Mono / IBM Plex Mono**. Pertahankan tracking negatif −3%. |
| Palet navy `#1a1d34` + monokrom | Ganti satu warna ink (mis. hijau tua `#14231c` atau coklat `#2a1f1a`) dan tambah **1 aksen** untuk CTA utama / status (aslinya tidak punya aksen). |
| Marker "—" polos | Marker berlabel koordinat (`A1`, `B4`), tanda "+" crosshair, atau marker yang beranimasi saat hover kolom. |
| Timecode statis | Jadikan timecode berjalan sesuai `video.currentTime`. Asli statis. |
| Kartu kapabilitas 3 kolom | Hover kartu memutar video pendek (asli hanya tampil statis/loop). |
| Blok About warna `#dee8eb` | Pakai warna aksen versi pucat agar konsisten dengan palet baru. |
| Hero render 3D | Konten sendiri: video produk, motion 3D sederhana (Spline), atau loop foto + `object-position` yang bergerak pelan. |

### 5.3 Perbaikan yang layak ditambahkan
- **Aksesibilitas kontras**: `#8a8a8a` di atas `#f6f6f4` ≈ **3.2:1** (gagal WCAG AA 4.5:1 untuk teks 14px). Gelapkan ke ±`#6b6b6b` (≈ 5:1).
- **Label mono 10px** terlalu kecil untuk teks yang bisa diklik (tombol tinggi 24px). Naikkan ke 11–12px dan tinggi tombol minimal 32px di mobile.
- Tambahkan `prefers-reduced-motion` (asli tidak punya).
- Ganti `font-display: block` ke `swap` agar teks tidak hilang saat font belum termuat.
- Tombol duplikat untuk trik blend → cukup satu tombol di luar layer blend (lihat §4.6).
- Video background: sediakan `poster` dan matikan autoplay di koneksi hemat data (`navigator.connection.saveData`).

### 5.4 Modifikasi khusus modal video
| Asli | Modifikasi |
|---|---|
| Div biasa tanpa role, tanpa focus trap, Escape tidak berfungsi | `<dialog>.showModal()`: focus trap, Escape, dan `inert` didapat tanpa kode tambahan |
| Muncul dan hilang mendadak | Fade + scale 0.98 → 1 (.4s). Keluar dengan animasi yang sama dibalik. Aslinya menghapus DOM di 100ms. |
| Diam ±0.6s setelah klik | Teks pill berubah jadi "Loading…" atau garis progres 1px di bawah card selama buffering |
| Scrubber `div` tanpa keyboard | `<input type="range">` bergaya garis 1px. Arrow kiri/kanan seek ±5s. |
| Kontrol `difference` bisa hilang di frame terang | Pertahankan blend untuk garis dan teks, tetapi beri tombol latar solid `rgb(17 21 22 / .6)` tanpa blend, atau tambah gradient gelap 15% di atas & bawah frame |
| Judul eyebrow kosong | Isi nama video + nomor bab ("Eno — 01/03") agar layout kiri atas tidak kosong |
| Hanya Close / Mute / Pause | Tambah tombol mono "CC" (caption) dan "Fullscreen" (Fullscreen API) dengan gaya tombol yang sama |
| Hide hanya saat kursor keluar frame | Tambah timer idle 2.5s saat video berjalan, supaya tampilan bersih walau kursor diam di atas frame |
| Shortcut tidak ada | `Space`/`K` play-pause, `M` mute, `←/→` seek, `F` fullscreen |

---

## 6. Checklist implementasi

- [ ] Token warna/tipografi/spacing (§4.1)
- [ ] Grid 4/12 + card + marker (§4.2, §4.3)
- [ ] IntersectionObserver `data-visible` + stagger
- [ ] Button system 4 varian + hover expand + focus ring
- [ ] Header + nav underline
- [ ] Hero video + overlay difference + pill kursor
- [ ] Modal video `<dialog>`: frame 16:9, kontrol grid, scrubber range, mute global, resume posisi, auto-hide, animasi buka/tutup (§4.10)
- [ ] Block split teks/media
- [ ] Block 3 kartu + slider mobile
- [ ] Block video 16:9 + blur tepi
- [ ] Block misi berwarna
- [ ] Tabel list + mask wipe
- [ ] Footer navy
- [ ] Reduced motion, kontras, ukuran tap target
- [ ] Uji breakpoint 375 / 900 / 1440 / 1600

---

### Lampiran — keterbatasan observasi
- Hanya diamati di desktop 1536px. Layout mobile disimpulkan dari media query CSS, tidak dari screenshot.
- JS bundle SvelteKit tidak dibaca. Perilaku JS (cursor pill, drag slider, observer) disimpulkan dari CSS + DOM runtime.
- Menu mobile tidak dibuka.
- Modal video diuji di hero (lengkap), big-media, kartu 01, dan GENE-26.5 (struktur & durasi). Pemilihan `video-width-first` di viewport sempit dan perilaku tombol back browser tidak diuji.
- Pada sesi analisis modal, screenshot Chrome sempat time-out setelah beberapa uji. Data §3A.4–3A.8 sebagian diambil lewat JS di halaman, bukan screenshot.
