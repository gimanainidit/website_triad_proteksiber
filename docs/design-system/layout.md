# Layout dan spasi

Basis 4px dengan langkah utama 8px. Halaman marketing bernapas lega, sedangkan halaman form merapat.

## Skala spasi

| Token | Nilai | Pemakaian |
|---|---|---|
| `space-xxs` | 4px | Jarak ikon dan label |
| `space-xs` | 8px | Tumpukan rapat, padding vertikal pill tab |
| `space-sm` | 12px | Padding vertikal input |
| `space-md` | 16px | Jarak antar field form, padding blok kode |
| `space-lg` | 20px | Padding horizontal tombol, stat cell |
| `space-xl` | 24px | Padding kartu ringkas |
| `space-2xl` | 32px | Padding kartu fitur, kartu harga, panel form. Gutter container. |
| `space-3xl` | 40px | Jarak besar di dalam hero |
| `section-sm` | 48px | Ritme section ringkas |
| `section` | 64px | Ritme section halaman konten |
| `section-lg` | 96px | Ritme section halaman marketing |
| `hero` | 120px | Padding vertikal hero di desktop |

## Grid dan container

- Container di tengah, padding 2rem (`space-2xl`), maksimum **1400px** (`container-max`, repo `screens.2xl`). Blok bacaan panjang dibatasi sekitar 720px.
- **Hero**: dua kolom (teks kiri, mesh jaringan atau visual perisai kanan) di ≥ 1024px. Bertumpuk di bawahnya.
- **Layanan**: grid fitur 3 kolom di desktop, 2 di tablet, 1 di mobile.
- **Harga atau paket**: 4 kolom → 2 → 1.
- **Kontak**: satu kolom, panel form `accent-soft` di tengah dengan lebar maksimum sekitar 560px.
- **Statistik**: baris 3–4 sel, bertumpuk di < 768px.

## Filosofi ruang kosong

Ruang kosong adalah bagian dari rasa aman: konten yang tidak berdesakan terasa terkendali. Section marketing memakai `section-lg` (96px), hero memakai `hero` (120px). Form merapat: panel `space-2xl`, field `space-md`.

## Kerangka halaman

1. Promo banner opsional (`navy-900`)
2. Top nav (`canvas`, border bawah `hairline`, tinggi 64–80px)
3. Hero band (`navy-950` + mesh jaringan, atau `background`)
4. Section konten
5. CTA banner
6. **Shield stripe** (wajib)
7. Footer
