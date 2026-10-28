# Do & Don't

## Do

- Pakai **shield stripe** di kaki setiap halaman, tepat di atas footer. Itulah penanda kesinambungan brand.
- Batasi `primary` untuk CTA utama dan status aktif. Satu CTA utama per layar.
- Pasangkan DM Serif Display (display) dengan Inter (heading kecil dan UI) dan JetBrains Mono (kode), seperti sampel Mistral.
- Pakai `radius-lg` (8px) untuk tombol dan input, `radius-xl` (12px) untuk kartu, secara konsisten.
- Pakai `accent-soft` untuk panel form, kartu unggulan, dan tile ikon.
- Pakai `link` untuk teks biru berukuran kecil. Simpan `shield-blue` untuk ikon dan display ≥24px.
- Tampilkan kedua logo sebagai lockup horizontal yang dipisah garis `hairline` saat co-branding.
- Pakai `stat-display` untuk angka. Tulis sertifikasi dan standar dengan tepat.

## Don't

- Jangan memakai tombol berbentuk pil (`radius-full`). Pil hanya untuk badge dan pill tab.
- Jangan menambahkan warna aksen di luar keluarga navy, indigo, dan biru. Tidak ada gradasi biru ke ungu, tidak ada neon hijau "hacker".
- Jangan menurunkan leading hero di bawah 1.05.
- Jangan mengganti display DM Serif Display dengan Inter, dan jangan memakai DM Serif Display di bawah 36px.
- Jangan memberi bayangan tebal pada kartu dokumentasi yang datar. Elevasi hanya untuk mockup dan overlay.
- Jangan menaruh teks kecil `shield-blue` di atas putih (3,1:1).
- Jangan memakai lockup JPEG di atas dasar berwarna atau gelap.
- Jangan menaruh logo TRIAD (reversed) di atas putih atau abu muda tanpa tile `protx-navy`.
- Jangan menghapus shield stripe dari halaman mana pun.
- Jangan memakai stok foto hacker berkerudung, gembok neon, atau kode matriks.

## Panduan iterasi

1. Kerjakan satu komponen dalam satu waktu.
2. Rujuk token dengan namanya (`primary`, `radius-xl`), jangan dengan nilai mentah.
3. Varian baru menjadi modifier baru (`tps-btn--…`), bukan override inline.
4. Default body `body-md`, penekanan `subtitle`, hero `hero-display`.
5. Setiap mockup halaman diakhiri **ShieldStripe** + **Footer**.
