# PLAN: TRIAD lepas dari Emergent/Lovable + deploy Docker di VPS bersama

Tujuan akhir: `https://eranusasiber.my.id` (dan `www`) melayani website TRIAD dari container di VPS `67.217.244.248`. Tidak ada lagi secret, akses, atau kode milik Emergent/Lovable. Situs lain di VPS tetap jalan.

## Cara memakai dokumen ini

1. Ambil tiket pertama di tabel **Progres** yang berstatus ⬜ dan semua blocker-nya ✅.
2. Kerjakan bagian **Detail tiket**-nya sampai kriteria **Selesai bila** terpenuhi. Pakai skill yang disebut di tiket.
3. Ubah statusnya di tabel Progres (satu-satunya tempat status), isi kolom Bukti (commit, perintah, atau hasil cek), lalu commit `PLAN.md`.

Status: ✅ selesai · 🟡 sebagian · ⬜ belum · ⛔ menunggu keputusan.
Pelaku: **Agent** (Claude di VPS, tanpa sudo/GitHub/Docker) · **User** (kamu: dashboard, sudo, push) · **Wizard** (user menjalankan skrip yang ditulis agent).

## Progres

Diperbarui 2026-10-28. **Posisi sekarang: situs live dan berfungsi di https://eranusasiber.my.id (halaman publik, API, file). Berikutnya T18 (uji admin di browser), sisa T10 (push + hapus `emergent`), lalu T20 (matikan Vercel).** T19 menunggu keputusan user.

| ID | Tiket | Pelaku | Blocker | Status | Bukti |
|---|---|---|---|---|---|
| T01 | Connection string DB keluar dari `alembic.ini` | Agent | – | ✅ | `5e575be`, `tests/test_alembic_config.py` |
| T02 | Rotasi password DB `postgres` | User | – | ✅ | Password lama ditolak; `backend/.env` konek lewat `database.py` dengan TLS terverifikasi |
| T03 | Rotasi `SUPABASE_SERVICE_KEY` | User | – | ✅ | Key baru membaca Storage; key lama dari riwayat publik → 403 |
| T04 | Revoke `EMERGENT_LLM_KEY` + API key n8n hf.space | User | – | ✅ | Lewat wizard 2026-10-28 (dikonfirmasi user, tidak bisa dicek agent) |
| T05 | Hapus secret dari seluruh riwayat git (lokal) | Agent | T01 | ✅ | `git filter-repo`; scan semua ref: 0 temuan |
| T06 | Buang dead code + jejak Emergent/Lovable | Agent | – | ✅ | `c6c918a`; frontend build/test hijau |
| T07 | Mode deploy shared host + CA Supabase | Agent | – | ✅ | `d8e881d`; 24 test hijau; `nginx -t` site lolos |
| T08 | Bucket Storage `templates` | Agent | T03 | ✅ | Dibuat public 15 MB; uji upload, ambil URL, hapus |
| T09 | Review semua commit sebelum push | Agent | T05–T08 | ✅ | 4 putaran review independen; putaran 4 atas `ba4f85d` bersih. Perbaikan: `3db00be`, `e6f7d1c`, `ba4f85d`. Risiko yang diterima: email mixed-case lama di DB dev; PDF draft tetap bisa diunduh lewat URL Supabase publik oleh yang sudah punya link. |
| T10 | Push riwayat bersih, default branch `main`, hapus branch legacy | User | T09 | 🟡 | GitHub `main` = `4f90c7a`, default `main`, tag legacy ada, `conflict_140226_2128` terhapus. **Belum: hapus branch `emergent`, push commit lokal `88da23b`..HEAD** (migrasi + fix driver + PLAN; tidak mengubah image yang jalan) |
| T11 | Cabut akses Emergent/Lovable di GitHub | User | – | ✅ | Lewat wizard (dikonfirmasi user, tidak bisa dicek agent tanpa token) |
| T12 | CI hijau dan image di GHCR | Agent cek | T10 | ✅ | Run push `4f90c7a` success: actions/runs/40623078257 |
| T13 | Tulis wizard deploy untuk T14–T17 | Agent | T07 | ✅ | `deploy/shared-host/wizard.sh` (12 stage), `bash -n` + shellcheck bersih; cek non-interaktif diuji ke API GitHub dan situs lokal |
| T14 | DNS Cloudflare apex + www | Wizard | T13 | ✅ | Keduanya → 67.217.244.248 (DNS only) |
| T15 | `setup-host.sh` di VPS | Wizard | T13 | ✅ | User `triad` uid 999 + grup docker; site `triad` aktif; listener hanya `127.0.0.1:8180` |
| T16 | Isi env, login GHCR, `init_db.py`, superadmin, jalankan stack | Wizard | T12, T15 | ✅ | Stack jalan; 1 superadmin; migrasi Alembic `0001` dijalankan user (setelah fix driver `e900a6c`). `/api/resources` 200 (8 resource, 5 file Supabase HEAD 200), `/api/admin/resources` tanpa token 401 |
| T17 | HTTPS dengan certbot | Wizard | T14, T16 | ✅ | Let's Encrypt `eranusasiber.my.id` + `www`, s.d. 2027-01-26; HTTP → 301 HTTPS. Situs lain sama seperti sebelum deploy (DuckDNS 404, CTF 502/502) |
| T18 | Uji fungsi end-to-end di domain | User + Agent | T17 | ⬜ | |
| T19 | Nasib tabel n8n di schema `public` | User | – | ⛔ | |
| T20 | Matikan Vercel + canonical/og ke domain baru | Agent + User | T18 | ⬜ | |
| T21 | Hapus cache commit lama di GitHub | User | T10 | ⬜ | Opsional |
| T22 | Rilis otomatis dari GitHub Actions | Agent + User | T18 | ⬜ | Opsional |
| T23 | Perbaiki 5 error TypeScript + typecheck di CI | Agent | – | ✅ | `04f714f`; ternyata bug: API tidak mengirim `published`, tombol Publish admin selalu mengirim `true`. `tsc` 0, CI `npm run typecheck` |
| T24 | Admin melihat draft; publik tidak | Agent | – | ✅ | `8fab47e` + `e6f7d1c`: listing publik dan detail by id hanya published; `GET /api/admin/resources` untuk admin |
| T25 | Bersihkan data uji di produksi | User | – | ⛔ | 8 resource published, termasuk `Test AI Guide`, `Test PPTX Conversion`, `Test Resource Document` dan duplikat judul; 3 tanpa file. Keputusan konten user |
| T26 | Buang kolom `ai_review_score`, `ai_review_result`, `is_published` | Agent | T16 | ⬜ | Tidak dipakai kode; perlu migrasi `0002` + rilis image baru |

## Skill per jenis tiket

| Jenis | Skill | Dipakai di |
|---|---|---|
| Perubahan kode | `tdd`: satu test merah → kode minimal → hijau, hanya di seam yang disepakati (lihat **Seam**) | T20, T22, T23 |
| Sebelum push | `code-review` dengan titik tetap `1972341` (= `origin/main` lama setelah rewrite) | T09 |
| Langkah yang hanya bisa dilakukan manusia | `wizard`: satu skrip bertahap, input secret tersembunyi, konfirmasi sebelum aksi yang tidak bisa dibatalkan | T13–T17 |
| Deploy gagal atau perilaku aneh | `diagnosing-bugs` | Kapan saja |
| Publikasi tiket ke GitHub Issues | `to-tickets` (dipanggil user, perlu `/setup-matt-pocock-skills` dulu) | Opsional |

### Seam

T01 dan T07 sudah dikerjakan red → green, tapi seam-nya belum dikonfirmasi ke user sebelum test pertama ditulis. Konfirmasi sekarang, sebelum T22/T23 menambah test:

| Seam | Menangkap | Tidak menangkap |
|---|---|---|
| CLI `alembic upgrade head --sql` dengan env berbeda | URL DB hanya dari environment | Migrasi nyata ke Supabase |
| `docker compose config` atas `compose.yml` + override | Port hanya loopback, n8n di profile, batas memori | Container benar-benar start |
| File `nginx-triad.conf` | Domain, tanpa `default_server`, proxy ke 8180, batas upload | Perilaku nginx host yang sudah ada |
| `setup-host.sh` dengan perintah sistem dipalsukan lewat `PATH` | `.env` tidak ditimpa, rollback bila `nginx -t` gagal | Efek sudo nyata |
| FastAPI `TestClient` (test lama) | Startup tanpa key opsional, endpoint 503 | Supabase nyata |

---

## Detail tiket

Tiket ✅ tidak punya detail; buktinya ada di tabel dan `git log`.

### T04 · Revoke key legacy
1. Dashboard Emergent → API keys → revoke key `sk-emergent-…`.
2. n8n `labibeduph-triad-proteksiber-webflow2.hf.space` → Settings → n8n API → hapus key. Key itu sudah kedaluwarsa 2026-05-13.

**Selesai bila:** kedua key tidak lagi terdaftar di dashboard masing-masing.

### T09 · Review sebelum push
Jalankan skill `code-review` atas `1972341..main`. Cek bahwa tidak ada secret di diff (`git log -p 1972341..main | grep -cE 'sb_secret_[A-Za-z0-9_-]{8,}|sk-emergent-[A-Za-z0-9]{8,}|postgres(ql)?://[^:/ ]+:[^@* ]{12,}@'` = 0). Jalankan ulang `.venv/bin/python -m pytest tests -q` (dengan `PYTHONPATH=backend`) dan `npm run build && npm test` di `frontend/`.

**Selesai bila:** semua temuan review sudah diperbaiki atau sengaja ditolak dengan alasan tertulis di Bukti, dan kedua suite test hijau.

### T10 · Push riwayat bersih
Dari mesin yang punya akses tulis ke `gimanainidit/website_triad_proteksiber`:

```sh
cd ~/website_triad_proteksiber
git remote add origin https://github.com/gimanainidit/website_triad_proteksiber.git
git push --force origin main
git push origin legacy/emergent-2026-10-11
```

Lalu GitHub → Settings → General → Default branch → `main`, dan:

```sh
git push origin --delete emergent conflict_140226_2128
```

**Selesai bila:** `curl -s https://api.github.com/repos/gimanainidit/website_triad_proteksiber` menunjukkan `default_branch: main`; branch remote hanya `main`; scan `git rev-list --all` pada clone baru dari GitHub bersih.

### T11 · Cabut akses GitHub
1. github.com/settings/installations dan github.com/settings/applications: cabut Emergent dan Lovable (gpt-engineer).
2. Repo Settings → Webhooks, Deploy keys, Collaborators: hapus entri milik Emergent/Lovable.
3. Dashboard Lovable dan Emergent: putuskan GitHub dari project, lalu hapus project.

**Selesai bila:** ketiga daftar di langkah 1–2 tidak memuat Emergent/Lovable.

### T12 · CI dan image
Pantau workflow `Build and deploy VPS` untuk push T10. Job `check` dan `images` harus hijau. `deploy` tetap dilewati karena `VPS_DEPLOY_ENABLED` belum diset.

**Selesai bila:** paket `ghcr.io/gimanainidit/website_triad_proteksiber-frontend` dan `-backend` bertag SHA commit `main` ada di GHCR.

### T13 · Wizard deploy
Pakai skill `wizard`. Tulis `deploy/shared-host/wizard.sh` dengan satu stage per tiket T14–T17:
- DNS di Cloudflare (buka dashboard, cek dengan `getent ahosts`)
- `sudo bash deploy/shared-host/setup-host.sh`
- isi `/opt/triad/backend.env` dengan `ask_secret`: `DATABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET_KEY` (dibangkitkan dengan `openssl rand -hex 48`)
- isi tag image SHA di `production.env`
- `docker login ghcr.io`, `init_db.py`, `up -d --wait`, `certbot`

Setiap aksi yang tidak bisa dibatalkan diberi `confirm`.

**Selesai bila:** `bash -n` dan `shellcheck` lolos; setiap nilai yang dicatat di T14–T17 tertangkap dan tersimpan di file tujuannya; skrip di-commit dan dirujuk dari `deploy/shared-host/README.md`.

### T14–T17 · Deploy lewat wizard
Jalankan `bash deploy/shared-host/wizard.sh` sebagai `usersaya`. Bagian sudo akan meminta password-mu sendiri. Langkah manual yang setara tetap ada di `deploy/shared-host/README.md`.

**Selesai bila:**
- `getent ahosts eranusasiber.my.id` menunjuk ke VPS (atau ke Cloudflare kalau di-proxy)
- `curl -s 127.0.0.1:8180/api/health` sehat
- `ss -ltn` hanya menampilkan `127.0.0.1:8180` untuk TRIAD
- `curl -I https://eranusasiber.my.id/api/health` = 200
- `https://gadgetagent-triad.duckdns.org` dan CTF di `:80`/`:8080` merespons seperti sebelum deploy

### T18 · Uji fungsi
Login admin, upload PDF ≤ 15 MB, buka `/resources` dan detailnya, upload satu template. AI dan n8n boleh mengembalikan 503. Pantau `free -h` dan `docker stats --no-stream` selama 24 jam.

**Selesai bila:** setiap fitur di atas berhasil lewat HTTPS, dan RAM tersedia tidak turun di bawah 150 MB.

### T24 · Draft hanya untuk admin
Halaman admin (`ResourcesNew.tsx`) memuat `/api/resources` yang default-nya hanya resource published, jadi draft tidak pernah tampil di admin. Di sisi lain `GET /api/resources?published=false` terbuka tanpa login, jadi siapa pun bisa membaca draft. Pakai `tdd` di seam HTTP API: endpoint publik selalu `published=True`, dan endpoint admin baru di `routes/admin.py` (dengan `admin_guard`) mengembalikan semua resource.

**Selesai bila:** request anonim dengan `published=false` tidak mengembalikan draft, admin melihat draft, dan tombol Publish/Unpublish mengubah status yang tampil.

### T19 · Tabel n8n di `public` ⛔
Schema `public` memuat ±50 tabel n8n (3 workflow, terakhir diubah 2026-02-22). Instance n8n di hf.space tidak bisa konek lagi sejak T02. **Keputusan user:** hapus tabel n8n, atau pindahkan ke schema `n8n` (kalau masih mau dipakai). Tabel CMS (`users`, dll.) tidak bentrok dengan tabel n8n (`user`), jadi ini tidak memblokir T16.

**Selesai bila:** keputusan tercatat di sini, lalu dijalankan sebagai migrasi lewat Supabase connector setelah dump/backup.

### T20 · Matikan Vercel
Pakai `tdd` untuk perubahan `frontend/index.html`: `canonical`, `og:url`, `og:image`, `twitter:image`, dan JSON-LD `url` diarahkan ke `https://eranusasiber.my.id`. Lalu hapus project Vercel, dan perbarui `README.md` serta `frontend/README.md` yang masih menyebut Vercel.

**Selesai bila:** `git grep vercel` kosong, dan `triad-proteksiber-web.vercel.app` tidak lagi melayani situs.

### T21 · Cache GitHub (opsional)
Ajukan ke GitHub Support (Sensitive data removal) untuk ref `refs/pull/1` dan `refs/pull/2` serta cached views. Semua secret yang bocor sudah dirotasi, jadi risikonya rendah.

**Selesai bila:** Support mengonfirmasi, atau tiket ditutup karena dianggap tidak perlu.

### T22 · Rilis otomatis (opsional)
Buat SSH key khusus untuk user `triad`, dibatasi di `authorized_keys` dengan `restrict,command="/opt/triad/ssh-release.sh"`. Wrapper ini memvalidasi `<repo> <sha>` dengan regex yang sama seperti `release.sh`. Isi secret di environment `production` GitHub, lalu set `VPS_DEPLOY_ENABLED=true`. Ingat fail2ban `maxretry 4`: uji koneksi sekali saja.

**Selesai bila:** satu push ke `main` ter-deploy otomatis, dan satu smoke check gagal yang disengaja memicu rollback (sudah dites di `tests/test_vps_release.py`, cek ulang di host).

### T23 · Error TypeScript
`npx tsc -p tsconfig.app.json --noEmit` di `frontend/` melaporkan 5 error yang sudah ada sejak sebelum perubahan ini:
- `AdminUpload.tsx:185`, `Resources.tsx:35`, `ResourcesNew.tsx:55`: hasil `apiFetch` bertipe `unknown`
- `ResourcesNew.tsx:348,352`: `Resource` tidak punya `published`

Tambahkan langkah typecheck di job `check` CI.

**Selesai bila:** `tsc` keluar dengan kode 0, dan CI gagal kalau ada error tipe baru.

---

## Referensi

### Keputusan user (2026-10-28)

| Topik | Keputusan |
|---|---|
| Supabase `nnxyouxuxvxrvggklqvf` | Milik akun sendiri; dipakai untuk Postgres dan Storage produksi (bukan Neon) |
| Domain | `eranusasiber.my.id` + `www`; DNS di Cloudflare; `ctf.` sudah ada dan di-proxy CF |
| n8n | Mati di VPS ini (profile `automation`) |
| Starter Astro | Dihapus; isi lama di tag `legacy/emergent-2026-10-11` |
| Vercel | Dimatikan segera setelah T18 |
| Riwayat git | Ditulis ulang untuk membuang secret (T05/T10) |

### Kondisi VPS (2026-10-28)

| Aspek | Kondisi | Konsekuensi |
|---|---|---|
| Mesin | Debian 13, 1 vCPU, 1,8 GB RAM (±470 MB tersedia), swap 2 GB | Image dibangun di CI; batas memori per container |
| Port | nginx host memegang 80/443/8080; port 8000 untuk CTF | TRIAD hanya di `127.0.0.1:8180`, di belakang nginx host |
| Situs lain | `content-agent-media` (DuckDNS, 443), `ctf.conf` dengan `server_name … _` di :80 | Akses lewat IP masuk ke CTF; TRIAD wajib lewat domain |
| Firewall | ufw aktif; port publish Docker melewati ufw | Tidak ada port container di `0.0.0.0` |
| Docker | Compose 2.26.1; `usersaya` bukan anggota grup docker | `!override` didukung; deploy memakai user `triad` |

### Arsitektur

```
Internet → nginx host :443 (TLS certbot, server_name eranusasiber.my.id www.…)
         → 127.0.0.1:8180 gateway (Caddy, HTTP) ─┬─ /api/* → backend:8001 (FastAPI)
                                                 └─ /*     → frontend:80 (build Vite)
Data: Supabase Postgres (pooler 6543, CA "Supabase Root 2021") · Supabase Storage (resources, templates)
```

Konfigurasi lengkap ada di file aslinya (sumber kebenaran): `deploy/shared-host/compose.override.yml`, `deploy/shared-host/nginx-triad.conf`, `deploy/shared-host/setup-host.sh`, dan `deploy/shared-host/README.md`. Mode VPS khusus (Caddy memegang 80/443) di `deploy/compose.yml` tetap utuh.

### Hal yang tidak terlihat dari kode

- Pooler Supabase memakai sertifikat dari CA milik Supabase sendiri, dan CA itu tidak ada di `certifi`. Tanpa `PGSSLROOTCERT=/app/certs/supabase-prod-ca-2021.crt`, koneksi gagal dengan `CERTIFICATE_VERIFY_FAILED`.
- `ALTER ROLE postgres` lewat SQL ditolak Supabase ("Only superusers can alter privileged roles"). Ganti password hanya lewat dashboard.
- Dari tabel CMS, baru `resources` (8 baris) yang ada. `init_db.py` di T16 membuat `users`, `admin_sessions`, `templates`, dan `audit_logs`.
- Project Supabase free tier bisa di-pause otomatis kalau tidak aktif (status INACTIVE pada 2026-10-28). Setelah live, trafik backend menjaganya tetap aktif.
- Data yang selalu dipertahankan: volume Docker (jangan pernah `docker compose down -v`), `/opt/triad/*.env`, dan `backend/.env` lokal (chmod 600, di-ignore git).

### Jejak legacy yang sudah dibuang (T06)

`.emergent/`, `.gitconfig`, `test_result.md`, `memory/`, `test_reports/`, 4 skrip test ke host preview Emergent, starter Astro, fallback `REACT_APP_BACKEND_URL`, klien `@supabase/supabase-js` di frontend, 34 komponen/hook UI dan 30 paket npm yang tidak dipakai, paket Python yang tidak di-import (`requirements-dev.txt` baru). Yang tersisa sengaja: test anti-fallback `EMERGENT_LLM_KEY` di `tests/test_openai_services.py`.
