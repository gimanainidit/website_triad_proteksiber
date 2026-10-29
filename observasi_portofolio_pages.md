# Observasi: Dossier Portfolio Template (myseera.com)

Sumber: https://myseera.com/demo/dossier-template#projects, diamati 2026-10-29 lewat browser pane (lebar ±800px dan emulasi 375px). Data diambil dari DOM, computed style, dan aturan CSS halaman.

Fokus permintaan:
1. Daftar kartu proyek ("Case files").
2. UX tombol "Open case file".
3. Galeri gambar di halaman Case file 01–04.

Label: **[terverifikasi]** dibaca dari DOM/CSS atau diuji dengan klik/keyboard · **[visual]** dari screenshot · **[dugaan]** belum dibuktikan.

Banner cookie "I agree" tidak diklik, karena itu persetujuan syarat layanan. Pengamatan dilakukan di sekitarnya.

---

## AMATI

### 1. Konsep halaman

Situs adalah "buku" satu halaman. Tiap bab berupa lembar kertas (`article.ds-sheet`, `aria-label="Case files, page 4 of 8"`) di atas meja (`--ds-desk`). Ada tumpukan lembar di belakang (`.ds-stack-2/3`, geser 10/15px) dan bayangan lipatan di tepi kiri (gradien 34px). Navigasi antar bab lewat "Next → How I work" di pojok kanan bawah. [terverifikasi]

Bab "Case files" punya dua keadaan dalam satu tempat:
- **Daftar**: grid kartu berkas.
- **Spread**: detail satu berkas, menggantikan grid di posisi yang sama.

URL tetap `#projects` di kedua keadaan. Tidak ada route per proyek. [terverifikasi]

### 2. Token visual

| Token | Nilai | Peran |
|---|---|---|
| `--ds-desk` | `#F0E9DC` | Latar meja |
| `--ds-sheet` | `#FCF9F2` | Lembar kertas |
| `--ds-card` | `#FCF9F2` 50% + putih | Kartu berkas |
| `--ds-ink` | `#1D1A24` | Teks utama |
| `--ds-muted` | ink 68% | Teks sekunder, meta |
| `--ds-line` | ink 12% | Border 1px |
| `--ds-pastel` | kuning `#F3D35B` 46% | Tab nomor, latar gambar saat memuat, dekor |
| `--ds-primary` | `#4A2390` ungu | Aksen, tombol, thumbnail aktif |
| `--ds-shadow` | ink 26% | Semua bayangan |

Font: judul **Bricolage Grotesque** 800 (`h2` 51,2px, `letter-spacing -0.03em`), isi **Geist** 16px/1.6, label **Geist Mono** 12px. [terverifikasi]

### 3. Daftar kartu ("Case files")

**Header** [terverifikasi]
- `h2` "Case files" dengan coretan SVG tangan di bawahnya (`.ds-h2-underline`, digambar lewat `stroke-dashoffset`).
- Subjudul `ds-sub` 1,08rem, `max-width 56ch`: "Selected work. Open a file to see the full story."
- Dekor melayang: lingkaran pastel 250px di kiri atas, cincin 72px, grid titik. Animasi `ds-float` 10–14 detik, mati saat `prefers-reduced-motion`.

**Grid** [terverifikasi]
- `.ds-files`: 1 kolom, lalu 2 kolom mulai 768px. Gap 40px vertikal, 36px horizontal.
- Kartu genap turun **56px** (`:nth-child(2n) { margin-top: 56px }`). Hasilnya susunan zig-zag seperti berkas yang ditumpuk tidak rata. Ini yang membuat daftar terasa "fisik", bukan tabel.

**Anatomi kartu `.ds-file`** [terverifikasi]

```
  ┌──────┐                      ← tab nomor "01": mono 12px, pastel, radius 10px 10px 0 0,
  │  01  │                        menempel di atas kartu (left 22px, tinggi 26px)
┌─┴──────┴─────────────────────┐
│ ┌──────────────────────────┐ │ ← body: padding 14/14/20, card, border 1px line, radius 14px,
│ │      gambar 4:3          │ │   shadow 0 18px 40px -30px
│ │      radius 10px         │ │
│ └──────────────────────────┘ │
│  4 images · React            │ ← meta mono 12px muted: jumlah gambar · teknologi utama
│  CloudSync Dashboard         │ ← h3 700, clamp(1.35rem, 2vw, 1.65rem), -0.015em
│  A real-time analytics ...   │ ← excerpt 15px/1.6 muted, dipotong 2 baris (ds-clamp-2)
│  Open case file →            │ ← teks tombol 15px/600 warna aksen, tanpa latar
└──────────────────────────────┘
```

- Seluruh body adalah target klik: `div role="button" tabindex="0" aria-label="Open case file: CloudSync Dashboard"`. Tombol "Open case file" di dalamnya `tabindex="-1"`, jadi hanya ada satu tab stop per kartu.
- Enter pada kartu yang fokus membuka berkas.
- Data demo: 01 CloudSync Dashboard (4 gambar · React), 02 TaskFlow (3 · Next.js), 03 DesignKit UI (5 · React), 04 EcoTracker (3 · Vue.js).

**Hover** [terverifikasi]
- Body naik `translateY(-6px)` dan miring `rotate(-0.4deg)`. Bayangan membesar ke `0 32px 60px -34px`. Transisi 0,4s `cubic-bezier(0.22, 1, 0.36, 1)`.
- Panah di "Open case file" bergeser `translateX(4px)` dalam 0,25s.
- Kesannya seperti mengangkat map kertas dari meja.

### 4. UX "Open case file"

**Bentuknya: spread inline, bukan modal atau halaman baru.** [terverifikasi]

Klik kartu menukar grid dengan `article.ds-spread` di tempat yang sama. Header bab tetap. Halaman tidak berpindah dan URL tidak berubah.

**Transisi**, diukur tiap 60ms setelah klik Next [terverifikasi]:

| Waktu | Yang terjadi |
|---|---|
| 0–350ms | Pembungkus lama mengecil ke `scale(0.985)` (keluar) |
| ±400ms | Konten baru masuk dari `translateY(16px)`, ease-out, selesai ±600ms |
| ±650ms | Kolom gambar naik dari `translateY(18px)` |
| ±720ms | Kolom teks naik dari `translateY(18px)`, stagger ±70ms setelah gambar |

**Bar atas `.ds-spread-bar`** [terverifikasi]
- Kiri: tombol ghost "← All case files" (pil 38px, border ink 22%).
- Kanan: tombol bulat 40px "‹", penghitung mono "01 / 04", tombol "›".
- Navigasi **berputar**: dari 04, Next kembali ke 01. Tombol tidak pernah `disabled`.

**Grid spread** [terverifikasi]
- 1 kolom di mobile. Mulai 1024px: `1.25fr / 1fr`, gap 56px, `align-items: start`.
- **Kiri (media)**: stage 4:3, radius 12px, bayangan `0 26px 56px -34px`, kursor `zoom-in`. Di bawahnya rail berisi thumbnail dan tombol ghost "⤢ Full screen".
- **Kanan (teks)**:
  - Kicker mono 12px uppercase `letter-spacing .14em` "CASE FILE 01".
  - Judul 800, `clamp(2rem, 3.6vw, 3.1rem)`, `line-height 1.05`.
  - Blok "BRIEF": mini-label mono + paragraf 1,02rem/1.7.
  - Blok "TOOLS": pil teknologi dengan ikon (radius 999px, border ink 18%, 13,5px).
  - Jarak antar blok 28px.

**Kelemahan yang ditemukan** [terverifikasi]
- Fokus jatuh ke `<body>` setelah membuka spread dan setelah kembali ke grid. Pengguna keyboard kehilangan posisi.
- Tidak ada URL per berkas, jadi berkas tidak bisa dibagikan atau dibuka lewat tombol Back.

### 5. Galeri gambar di Case file 01–04

**Data per berkas** [terverifikasi]

| Berkas | Gambar | Label thumbnail (`aria-label`) |
|---|---|---|
| 01 CloudSync Dashboard | 4 | CloudSync Dashboard · Analytics dashboard with charts · Data visualization on screen · Monitoring interface |
| 02 TaskFlow | 3 | TaskFlow · Kanban board · Team collaborating |
| 03 DesignKit UI | 5 | DesignKit UI · UI components · Design tokens in Figma · Docs page · Code on screen |
| 04 EcoTracker | 3 | 3 gambar, gambar utama ladang panel surya dari udara [visual] |

Gambar pertama selalu sama dengan cover kartu. Sumbernya Unsplash `w=1200&h=800&fit=crop` (3:2), ditampilkan `object-fit: cover` di bingkai 4:3. [terverifikasi]

**Thumbnail rail** [terverifikasi]
- `.ds-thumb` 64×48px, radius 8px, border 2px transparan, `opacity .65`.
- Hover: opacity 1 dan naik 2px. Aktif: opacity 1, border warna primary, `aria-pressed="true"`.
- Rail bisa digulir horizontal tanpa scrollbar (`scrollbar-width: none`). Di 375px, thumbnail ke-5 terpotong di tepi sebagai tanda ada lanjutan. [visual]
- Memilih thumbnail mengganti gambar stage dan menampilkan caption di bawah rail ("Live metrics overview", 14px muted).

**Lightbox** (klik stage atau "Full screen") [terverifikasi]
- `div role="dialog" aria-modal="true" aria-label="Project gallery"`, `fixed inset-0`, latar `black/90` dengan `backdrop-blur 4px`, `z-index 100`.
- Gambar `object-contain`, `max-h-78vh`, radius 8px. Di bawahnya caption putih 90%, penghitung "2 / 4" putih 40%, dan strip thumbnail 48×48. Thumbnail aktif diberi border primary dan `scale-110`.
- Tombol Close kanan atas, Prev/Next di sisi gambar: bulat 44px, `bg-white/10`, hover `white/20`, `touch-manipulation`.
- Keyboard: ← dan → mengganti gambar, Escape menutup.
- `body { overflow: hidden }` selama terbuka.
- **Kelemahan**: fokus tidak masuk ke dialog dan tidak kembali ke pemicu setelah ditutup (tetap di `<body>`). Indeks lightbox tidak disinkronkan balik ke stage: menutup di 3/4 membiarkan stage di gambar 2.

### 6. Mobile (375px) [visual + terverifikasi]

- Lembar kehilangan radius dan bayangan. Padding `30px 18px 40px`.
- Grid kartu 1 kolom, tanpa zig-zag.
- Spread bertumpuk: bar (All case files + navigator), stage selebar layar, rail, Full screen, lalu teks.
- Stage memakai `touch-action: pan-y` dengan atribut `data-ds-noswipe` di rail. Ada geser horizontal di area stage untuk ganti halaman. [dugaan: tidak diuji dengan sentuhan nyata]

---

## TIRU (blueprint)

Struktur yang layak ditiru, tanpa gaya visualnya:

```tsx
// Daftar
<section aria-labelledby="files-h">
  <h2 id="files-h">…</h2>
  <ul className="grid gap-x-9 gap-y-10 md:grid-cols-2 md:[&>li:nth-child(2n)]:mt-14">
    <li className="relative pt-6">
      <span aria-hidden className="absolute left-5 top-0 h-[26px] rounded-t-[10px] px-3.5 font-mono text-xs">01</span>
      <Link to="/…/slug" className="block rounded-[14px] border p-3.5 pb-5 transition hover:-translate-y-1.5">
        <img className="aspect-[4/3] rounded-[10px] object-cover" />
        <p className="font-mono text-xs">4 gambar · Kategori</p>
        <h3>Judul</h3>
        <p className="line-clamp-2">Ringkasan</p>
        <span>Buka berkas <ArrowRight className="transition group-hover:translate-x-1" /></span>
      </Link>
    </li>
  </ul>
</section>

// Spread
<article aria-labelledby="case-title">
  <nav>[← Semua berkas] … [‹] 01 / 04 [›]</nav>
  <div className="grid lg:grid-cols-[1.25fr_1fr] lg:gap-14">
    <figure>stage 4:3 (button → lightbox) + rail thumbnail (aria-pressed) + caption</figure>
    <div>kicker mono · h1/h2 · blok berlabel mono (Brief, Tools, …)</div>
  </div>
</article>

// Lightbox: <dialog> + gambar contain + caption + "n / N" + strip thumbnail + ←/→/Esc
```

## MODIFIKASI (arah untuk TRIAD)

| Pola | Keputusan | Alasan |
|---|---|---|
| Kartu berkas bertab nomor | Tiru | Nomor mono sudah dipakai di landing (01–04). Tab menambah kesan "berkas" tanpa warna baru |
| Zig-zag 56px | Tiru di 2 kolom | Murah, memberi ritme, tidak mengganggu urutan baca |
| Hover naik + miring | Naik saja, tanpa rotasi | Gerak DS "tenang, bermakna". Rotasi terasa main-main untuk audit keamanan |
| Spread inline tanpa URL | Ganti dengan route per layanan | Berkas bisa dibagikan, Back berfungsi, fokus bisa dikelola |
| Navigasi ‹ 01 / 08 › berputar | Tiru, tanpa putaran | Di ujung daftar, arahkan ke CTA kontak |
| Blok berlabel mono (Brief, Tools) | Tiru: Ringkasan, Cakupan, Deliverables, Standar | Data sudah ada di `services.ts` |
| Pil Tools | Ganti dengan Badge DS | DS hanya mengizinkan bentuk pil untuk badge |
| Lightbox `div role=dialog` | Ganti dengan `<dialog>` native | Fokus masuk, terjebak, dan kembali ke pemicu |
| Kertas krem, kuning pastel, ungu, coretan, dekor melayang | Buang | Di luar palet navy–biru DS |
| Gambar Unsplash 3:2 di bingkai 4:3 | Pixabay `large` 1280px | Aturan pipeline aset yang sudah ada |
