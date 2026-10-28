# PLAN: lepas dari Emergent/Lovable + deploy Docker di VPS bersama

Dibuat 2026-10-28 dari clone `origin/emergent` @ `590ec11`. Isi `main` (`ba45806`) sama persis dengan `emergent`; bedanya hanya commit merge.
Dokumen ini masih rencana. Belum ada kode, server, atau setelan GitHub yang diubah.

---

## Keputusan dan status (2026-10-28)

**Keputusan user:**

| Topik | Keputusan |
|---|---|
| Supabase `nnxyouxuxvxrvggklqvf` | Milik akun sendiri, jadi tidak perlu migrasi storage. A4 cukup rotasi kredensial. |
| Database produksi | Postgres Supabase yang sama, bukan Neon. `deploy/README.md` perlu disesuaikan di PR bagian B. |
| Hostname | `eranusasiber.my.id` + `www.eranusasiber.my.id`. DNS-nya di Cloudflare (`ctf.` sudah di-proxy CF); apex dan www belum punya record. |
| n8n | Mati di VPS ini (profile `automation` tidak diaktifkan). |
| Starter Astro di root | Dihapus. Isi lama tetap ada di tag `legacy/emergent-2026-10-11`. |
| Vercel | Dimatikan segera setelah VPS lolos uji B4. |

**Status pekerjaan:**

| Langkah | Status |
|---|---|
| A0 kode: `alembic/env.py` membaca `DATABASE_URL`, `alembic.ini` dikosongkan, dan test `tests/test_alembic_config.py` ditambahkan | Selesai, commit lokal |
| A1 + A3 dead code: artefak Emergent, starter Astro, klien Supabase frontend, 34 komponen/hook, 30 paket npm, dan dependency Python yang tidak dipakai dibuang; `requirements-dev.txt` dibuat | Selesai, commit lokal. Frontend build + test hijau, backend 15 test hijau. |
| Rewrite riwayat git: `backend/.env` dan `frontend/.env` dihapus dari semua commit, dan semua nilai secret diganti `***REMOVED***` | Selesai di lokal. Scan ulang: 0 temuan. **Belum di-push** karena VPS tidak punya kredensial GitHub. |
| B3 shared-host: `deploy/shared-host/` (compose override loopback 8180, nginx site, `setup-host.sh` idempoten + rollback nginx), CA Supabase di `backend/certs/`, CI menjalankan semua test | Selesai, commit lokal. 24 test hijau; `nginx -t` pada site lolos. Image belum di-build (VPS tanpa akses docker). |
| Rotasi password DB | **Selesai** (dashboard, 2026-10-28). Password lama ditolak; `backend/.env` diverifikasi lewat `database.py` dengan TLS terverifikasi. |
| Rotasi `SUPABASE_SERVICE_KEY` | **Selesai** (dashboard). Key baru bisa membaca Storage; key lama dari riwayat publik ditolak (403). `EMERGENT_LLM_KEY` dan key n8n hf.space masih harus di-revoke user. |

Storage: bucket yang ada `resources` (6 objek), `materi-edukasi`, `presentations`. Bucket `templates` dibuat 2026-10-28 (public, batas 15 MB, sama dengan validasi backend) dan sudah diuji upload, ambil URL publik, lalu hapus.
**Temuan saat verifikasi DB:**
- Pooler Supabase memakai sertifikat dari "Supabase Root 2021 CA" (SHA-256 `80:70:25:AD:…:CA:FA`, berlaku sampai 2031), yang tidak ada di `certifi`. Tanpa `PGSSLROOTCERT` yang mengarah ke CA ini, `database.py` gagal dengan `CERTIFICATE_VERIFY_FAILED`. Bagian B wajib memasukkan CA ini ke image (atau mount) dan menyetel `PGSSLROOTCERT` di `backend.env`.
- Schema `public` berisi tabel n8n (`workflow_entity`, `user`, `credentials_entity`, dll.; 3 workflow, terakhir diubah 2026-02-22). Artinya n8n di hf.space memakai DB ini, dan sejak rotasi password ia tidak bisa konek lagi. Dari tabel CMS hanya `resources` (8 baris) yang ada; `users`, `admin_sessions`, `templates`, `audit_logs` belum ada, sehingga `init_db.py` perlu dijalankan sebelum login admin bisa dipakai. Sebaiknya tabel n8n dipindah ke schema lain atau dibuang kalau n8n hf.space tidak dipakai lagi (perlu keputusan user).

---

## 0. Ringkasan temuan

### 0.1 Dependency runtime ke Emergent/Lovable: sudah tidak ada

| Yang dicek | Hasil |
|---|---|
| `emergentintegrations`, `EMERGENT_LLM_KEY` di kode | Sudah diganti OpenAI SDK resmi di commit `5caa263`. Satu test memastikan tidak ada fallback ke Emergent (`tests/test_openai_services.py:113`). |
| `lovable-tagger`, branding Lovable | Sudah dibuang di commit `1792786`. Lockfile `frontend/package-lock.json` dan `package-lock.json` bersih. |
| URL `*.emergentagent.com` / `lovable.dev` di kode aplikasi | Tidak ada di `frontend/src` maupun `backend/`. |

Artinya aplikasi sudah bisa dibangun dan dijalankan tanpa layanan Emergent/Lovable. Yang tersisa adalah sisa jejak (artefak, konvensi, akses GitHub), bukan library.

### 0.2 Sisa jejak yang perlu dibersihkan

| # | Lokasi | Isi | Dampak | Tindakan |
|---|---|---|---|---|
| L1 | `.emergent/` (emergent.yml + markers) | Metadata job Emergent | Tidak dipakai | Hapus |
| L2 | `.gitconfig` di root repo | `emergent-agent-e1 <github@emergent.sh>` | Tidak dibaca git dari repo, tapi menyesatkan | Hapus |
| L3 | `test_result.md`, `memory/`, `test_reports/` | Protokol agent Emergent | Tidak dipakai CI | Hapus |
| L4 | `backend_test.py`, `test_ai_only.py`, `test_ai_service.py`, `test_simple_ai.py` (root) | Menembak `https://website-sprint-dev.preview.emergentagent.com` | Tidak dipakai CI, bisa mengirim data ke host Emergent kalau dijalankan | Hapus (CI cuma memakai `tests/`) |
| L5 | `REACT_APP_BACKEND_URL` di `frontend/src/services/api.ts`, `contexts/auth-context.tsx`, `pages/AIGenerator.tsx` (6 tempat) | Konvensi CRA dari template Emergent | Fallback mati di Vite | Sisakan `VITE_BACKEND_URL` saja |
| L6 | Branch default GitHub = `emergent`; branch `conflict_140226_2128` | Buatan Emergent. Branch conflict sudah jadi ancestor `emergent` (0 commit unik). | CI (`vps.yml`) hanya jalan di `main`, jadi default branch tidak cocok dengan CI | Default → `main`, arsipkan lalu hapus keduanya |
| L7 | GitHub App / akses Emergent & Lovable (`gpt-engineer-app[bot]`, 41 commit) | Kemungkinan masih punya akses tulis ke repo | Bisa push ke repo kapan saja | Cabut akses (lihat A2) |
| L8 | `.gitignore` | Blok `-e # Environment files` tiga kali (bekas skrip Emergent) | Kosmetik | Rapikan |
| L9 | Root: `package.json` (Astro), `astro.config.mjs`, `src/`, `tailwind.config.mjs`, `tsconfig.json`, `package-lock.json` | Starter Astro dari `main` lama, disimpan "untuk referensi" | Membingungkan, bukan bagian app | Tanya user: hapus, atau pindah ke tag arsip |
| L10 | `backend/requirements.txt` | `boto3`, `requests-oauthlib`, `pandas`, `numpy`, `jq`, `typer`, `python-jose`, `passlib`, `aiofiles` tidak di-import di backend. Ada juga tool dev (`pytest`, `black`, `isort`, `flake8`, `mypy`) di image runtime. | Image lebih besar, RAM build lebih boros. Diduga bawaan base image Emergent `fastapi_react_mongo_base_image`. | Pisah `requirements.txt` (runtime) dan `requirements-dev.txt`, lalu buang yang tidak dipakai setelah diverifikasi |
| L11 | `frontend/src/lib/supabase.ts` + `@supabase/supabase-js` | Klien Supabase dibuat, tapi semua pemakai hanya meng-import **type** `Resource`. Ini pola standar Lovable. | Butuh `VITE_SUPABASE_*` saat build walau tidak dipakai | Pindahkan type ke `src/types/resource.ts`, hapus klien dan paket |

### 0.3 Masalah keamanan (kerjakan paling dulu)

**`backend/alembic.ini:89` menyimpan connection string Supabase Postgres lengkap dengan password, di repo publik.** Password itu juga ada di riwayat git.
Membersihkan file saja tidak cukup. Password database **wajib diganti** di dashboard Supabase.

### 0.4 Hal yang belum bisa dipastikan dari repo

1. **Siapa pemilik project Supabase `nnxyouxuxvxrvggklqvf`.** Akun Supabase kamu sendiri, atau dibuat oleh Lovable Cloud/Emergent? Kalau bukan milikmu, ini dependency legacy yang paling besar (DB dev + storage file).
2. Siapa pemilik project Vercel `triad-proteksiber-web.vercel.app`.
3. Instance n8n mana yang dipakai saat ini.
4. Container Docker apa saja yang sudah ada di VPS. User `usersaya` belum masuk grup docker, jadi saya tidak bisa melihatnya. Cek dengan `sudo docker ps -a`.

---

## Bagian A: lepas dari Emergent/Lovable

Setiap langkah berdiri sendiri, punya cara verifikasi, dan bisa di-revert dengan `git revert`.

### A0. Amankan kredensial (hari ini)

Selain password DB di `alembic.ini`, riwayat git ternyata juga memuat `backend/.env` dan `frontend/.env` (commit Emergent, terakhir 2026-02-13). Isinya:

| Secret | Tindakan user |
|---|---|
| Password DB `postgres` | Supabase → Project Settings → Database → **Reset database password**. Isi dengan password yang sudah disiapkan di `backend/.env`. |
| `SUPABASE_SERVICE_KEY` (`sb_secret_…`) | Supabase → Project Settings → API Keys → buat secret key baru, lalu **hapus yang lama**. |
| `EMERGENT_LLM_KEY` (`sk-emergent-…`) | Revoke di dashboard Emergent (saldo bisa dipakai orang lain). |
| `N8N_API_KEY` (n8n di `labibeduph-triad-proteksiber-webflow2.hf.space`) | Sudah kedaluwarsa 2026-05-13, tapi tetap hapus di n8n → Settings → API. |
| `sb_publishable_…` (anon) | Memang publik. Tidak wajib dirotasi. |

Kode (selesai): `backend/alembic/env.py` membaca `DATABASE_URL` dari environment atau `backend/.env`, dan `sqlalchemy.url` di `alembic.ini` dikosongkan.

Riwayat (selesai di lokal, belum di-push): `git filter-repo` menghapus kedua `.env` dan mengganti semua nilai secret di semua commit. Push dari mesin yang punya akses tulis ke GitHub:

```sh
cd ~/website_triad_proteksiber
git remote add origin https://github.com/gimanainidit/website_triad_proteksiber.git
git push --force origin main
git push origin legacy/emergent-2026-10-11
# GitHub → Settings → Default branch → main, lalu:
git push origin --delete emergent conflict_140226_2128
```

Batasan: GitHub tetap menyimpan commit lama lewat ref PR (`refs/pull/1`, `refs/pull/2`) dan cache. Untuk menghapus yang itu, ajukan ke GitHub Support ("remove cached views / sensitive data"). **Rotasi tetap perlindungan utamanya.**

Verifikasi: koneksi dengan password lama gagal, koneksi dengan `backend/.env` berhasil, dan scan seluruh `git rev-list --all` bersih.

### A1. Bersihkan artefak repo (tanpa perubahan perilaku)

Hapus L1–L4, rapikan L8, dan putuskan L9.
Verifikasi: CI `check` tetap hijau, dan `git grep -i -E 'emergent|lovable'` hanya menyisakan test anti-fallback dan catatan sejarah di README/PLAN.

### A2. Putus akses GitHub

1. Repo Settings → General → Default branch → `main`.
2. `git tag legacy/emergent-2026-10-11 origin/emergent && git push origin legacy/emergent-2026-10-11`, lalu hapus branch `emergent` dan `conflict_140226_2128` di GitHub.
3. GitHub → Settings → Applications → **Installed GitHub Apps** dan **Authorized OAuth Apps**: cabut Emergent dan Lovable (gpt-engineer).
4. Repo Settings → **Webhooks**, **Deploy keys**, **Collaborators**: hapus semua entri milik Emergent/Lovable.
5. Di dashboard Lovable dan Emergent: putuskan GitHub dari project, lalu arsipkan atau hapus project.

Verifikasi: tidak ada lagi commit baru dari `emergent-agent-e1` atau `gpt-engineer-app[bot]`, dan daftar Apps/Webhooks bersih.

### A3. Kode: buang konvensi legacy

1. L5: ganti fallback `REACT_APP_BACKEND_URL` dengan `VITE_BACKEND_URL` saja, lewat satu helper (`api.ts` sudah punya `API_BASE_URL`). `auth-context.tsx` dan `AIGenerator.tsx` ikut memakainya.
2. L11: pindahkan `Resource` ke `src/types/resource.ts`, hapus `lib/supabase.ts`, lalu `npm uninstall @supabase/supabase-js`. Hapus build-arg `VITE_SUPABASE_*` dari `frontend/Dockerfile` dan `.github/workflows/vps.yml`.
3. L10: buat `requirements-dev.txt` (pytest, black, isort, flake8, mypy). Buang paket yang tidak di-import satu per satu, dan pertahankan `psycopg2-binary` (dipakai Alembic sync) serta `certifi` (sekarang hanya transitif; jadikan eksplisit).
4. Komentar "Supabase Transaction Pooler" di `database.py`: `statement_cache_size=0` tetap dipertahankan karena aman untuk pooler Neon/Supabase.

Verifikasi:
- `npm ci && npm run build && npm test` di `frontend/` hijau
- `grep -r supabase frontend/build` kosong
- `pip install -r backend/requirements.txt` di venv bersih, lalu `python -c "import server"` dengan env dummy dan 4 file test CI hijau
- Halaman `/`, `/services`, `/resources` dicek manual di build preview

### A4. Platform: Supabase dan Vercel

Bergantung pada jawaban 0.4.

- **Supabase milik akun sendiri:** tidak perlu migrasi. Cukup A0.
- **Supabase milik Lovable/Emergent:** buat project baru di akun sendiri.
  1. Buat bucket `resources` dan `templates` dengan policy yang sama (`setup_storage.py` membuat `resources`, dan `templates` perlu dibuat juga).
  2. Salin semua objek (`supabase storage cp` atau skrip Python dengan service key lama dan baru).
  3. **Kolom `resources.file_url` menyimpan URL publik lengkap yang berisi project ref.** Jalankan skrip SQL yang mengganti prefix `https://<ref-lama>.supabase.co/storage/` dengan ref baru. Dry-run dulu dan hitung jumlah baris.
  4. Ganti `SUPABASE_URL` dan `SUPABASE_SERVICE_KEY` di `backend.env`.
- **Database:** `deploy/README.md` mengarah ke Neon. Pilih satu: Neon (baru, kosong, `init_db.py`) atau Postgres Supabase milik sendiri. Kalau datanya sudah ada di Supabase lama, `pg_dump` → `pg_restore` ke target.
- **Vercel:** biarkan jalan sebagai fallback sampai VPS stabil 1–2 minggu. Setelah itu ganti `canonical`/`og:*` di `frontend/index.html` ke domain baru, lalu matikan project Vercel atau arahkan ke domain baru.

---

## Bagian B: deploy Docker di VPS ini tanpa merusak yang sudah ada

### B1. Kondisi VPS (diperiksa 2026-10-28)

| Aspek | Kondisi | Konsekuensi |
|---|---|---|
| OS / CPU / RAM | Debian 13 x86_64, **1 vCPU, 1,8 GB RAM** (tersedia ±470 MB), swap 2 GB (terpakai 660 MB), disk 47 GB kosong | Image wajib dibangun di CI, bukan di VPS. n8n default mati. Tiap container diberi batas memori. |
| Port publik | **nginx host** memegang 80, 443, 8080. SSH 22/2222. | `deploy/compose.yml` sekarang mem-bind Caddy ke `80:80` dan `443:443`. Container itu akan gagal start, atau kalau nginx dimatikan, situs lain ikut mati. **Inilah breaking change yang harus dihindari.** |
| Situs yang sudah ada | `content-agent-media` (`gadgetagent-triad.duckdns.org`, 80+443, Certbot); `ctf.conf` (`server_name ctf.eranusasiber.my.id _` di :80 → `127.0.0.1:8000`); `ctf.eranusasiber.my.id` (:8080 → 8000) | `ctf.conf` menangkap semua host tak dikenal di port 80 (`_`), jadi **akses via `http://IP` akan masuk ke CTF, bukan TRIAD.** TRIAD harus punya hostname sendiri sejak awal. Port 8000 dicadangkan untuk CTF. |
| Firewall | ufw aktif | Port yang di-publish Docker **melewati ufw**. Semua port container hanya boleh di-bind ke `127.0.0.1`. |
| Docker | Engine aktif, Compose 2.26.1 | `!override` di file compose didukung (butuh ≥ 2.24.4) |
| Akses docker | `usersaya` tidak ada di grup docker | Perlu user deploy khusus (lihat B4) |
| Target lama di `deploy/README.md` | Ubuntu 24.04, `harai@172.104.190.115`, VPS khusus | VPS ini berbeda dan dipakai bersama, jadi perlu mode "shared host" |

### B2. Arsitektur target

```
Internet ──► nginx host :443 (TLS, Certbot)   ← satu-satunya pintu publik, tetap seperti sekarang
               │  server_name triad.<domain>  (atau triad-xxx.duckdns.org sebelum ada domain)
               ▼
        127.0.0.1:8180  ──►  [container] gateway (Caddy, HTTP saja, router internal)
                                   ├─ /api/*  → backend:8001  (FastAPI, uvicorn)
                                   └─ /*      → frontend:80   (nginx statis, build Vite)
        127.0.0.1:5678  ──►  [container] n8n  (profile "automation", default MATI)

Data di luar VPS:  Postgres (Neon / Supabase)  ·  Storage file (Supabase)
```

Kenapa Caddy tetap dipakai sebagai router internal dan tidak diganti nginx host langsung ke dua port:
- `compose.yml`, `Caddyfile`, `release.sh`, dan test `test_vps_release.py` tidak perlu diubah. Mode VPS khusus (Caddy pegang 80/443) tetap jalan apa adanya.
- Hanya satu port loopback, jadi konfigurasi nginx host sederhana.
- Biayanya kira-kira 15–20 MB RAM.

### B3. Perubahan repo (semuanya tambahan, file lama tidak diubah)

```
deploy/shared-host/
  compose.override.yml     # disalin ke /opt/triad/compose.override.yml, otomatis dibaca compose
  nginx-triad.conf         # template site nginx host
  setup-host.sh            # dijalankan user dengan sudo, idempoten
  README.md                # langkah deploy mode shared host
```

**`compose.override.yml`.** Compose otomatis membaca file ini bila ada di folder yang sama, jadi `release.sh` tidak perlu diubah:

```yaml
services:
  gateway:
    ports: !override
      - "127.0.0.1:8180:80"
    mem_limit: 64m
  frontend:
    mem_limit: 48m
  backend:
    mem_limit: 384m
    environment:
      WEB_CONCURRENCY: "1"
  n8n:
    profiles: ["automation"]   # hanya jalan dengan COMPOSE_PROFILES=automation
    mem_limit: 512m
```

Sudah dicoba dengan `docker compose config` (Compose 2.26.1 di VPS ini) memakai `compose.yml` asli: port gateway menjadi hanya `127.0.0.1:8180→80`, dan n8n hilang dari daftar service kecuali `COMPOSE_PROFILES=automation`.

`production.env` di VPS: `SITE_ADDRESS=:80`. Dengan nilai ini Caddy hanya listen HTTP tanpa ACME, karena TLS diurus nginx host.

**`nginx-triad.conf`:**

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name eranusasiber.my.id www.eranusasiber.my.id;   # jangan pakai "_" atau default_server

    client_max_body_size 20m;             # upload backend dibatasi 15 MB
    proxy_read_timeout 120s;              # endpoint AI bisa lambat

    location / {
        proxy_pass http://127.0.0.1:8180;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
}
```

Blok 443 ditambahkan oleh `certbot --nginx -d eranusasiber.my.id -d www.eranusasiber.my.id`, sama seperti `content-agent-media`.

**Penyesuaian kode kecil (non-breaking):**
- `backend/Dockerfile`: hanya `requirements.txt` runtime (dari A3), sehingga image lebih kecil dan pull di VPS lebih cepat.
- CI: tambah langkah `docker compose -f deploy/compose.yml -f deploy/shared-host/compose.override.yml config` dengan env dummy. Langkah ini gagal kalau ada port yang di-publish ke selain `127.0.0.1`, dan memastikan n8n ada di profile.
- Test `tests/test_shared_host.py`: parse `nginx-triad.conf` untuk memastikan tidak ada `default_server`, `_`, maupun port selain 8180.

### B4. Langkah di VPS (dijalankan user sendiri; `sudo` butuh password)

| # | Langkah | Perintah / isi | Verifikasi | Rollback |
|---|---|---|---|---|
| 0 | Inventaris | `sudo docker ps -a` · `sudo docker compose ls` · `free -h` | Tidak ada project compose bernama `triad`, port 8180 kosong (`ss -ltn`) | – |
| 1 | User deploy | `sudo adduser --system --group --home /opt/triad --shell /bin/bash triad` · `sudo usermod -aG docker triad`. Grup docker setara root, jadi hanya untuk user ini. | `sudo -u triad docker ps` jalan | `sudo deluser triad` |
| 2 | File deploy | Salin `compose.yml`, `Caddyfile`, `release.sh`, `shared-host/compose.override.yml`, dan tiga file `.env` (dari `*.env.example`) ke `/opt/triad`. Jalankan `chmod 600 *.env` dan `chmod 700 release.sh`. | `docker compose --env-file production.env config` di `/opt/triad` menampilkan `127.0.0.1:8180` | Hapus folder |
| 3 | Login registry | Sebagai `triad`: `docker login ghcr.io -u gimanainidit --password-stdin`, dengan fine-grained PAT `read:packages` | `docker pull` image SHA berhasil | `docker logout ghcr.io` |
| 4 | DNS (Cloudflare) | `A eranusasiber.my.id → 67.217.244.248` dan `CNAME www → eranusasiber.my.id`. Bisa di-proxy (oranye) atau DNS-only. Kalau di-proxy, setel SSL/TLS mode **Full (strict)** setelah langkah 8. Jangan tambah AAAA (VPS tanpa IPv6 publik). | `getent ahosts eranusasiber.my.id` | Hapus record |
| 5 | Skema DB | `docker compose --env-file production.env run --rm --no-deps backend python init_db.py`, hanya pada DB baru yang memang kosong | Tabel ada | DB terpisah, VPS tidak terdampak |
| 6 | Jalankan stack | `docker compose --env-file production.env up -d --wait --wait-timeout 180` | `curl -s 127.0.0.1:8180/api/health`, `curl -s 127.0.0.1:8180/api/resources`; `ss -ltn` tidak menampilkan `0.0.0.0:8180`; `free -h` masih wajar | `docker compose down` (**tanpa `-v`**) |
| 7 | nginx host | Salin `nginx-triad.conf` ke `/etc/nginx/sites-available/triad`, ganti `eranusasiber.my.id`, lalu `ln -s` ke `sites-enabled`. Jalankan `sudo nginx -t` lalu `sudo systemctl reload nginx` (reload, bukan restart). | `curl -I http://eranusasiber.my.id/`; **situs lama tetap jalan**: `curl -I https://gadgetagent-triad.duckdns.org`, dan CTF :80/:8080 tetap merespons seperti sebelumnya | Hapus symlink, `nginx -t`, reload |
| 8 | HTTPS | `sudo certbot --nginx -d eranusasiber.my.id -d www.eranusasiber.my.id` | `curl -I https://eranusasiber.my.id/api/health` = 200; `sudo certbot renew --dry-run` | `certbot delete --cert-name eranusasiber.my.id` + kembalikan site |
| 9 | Uji fungsi | Login admin, upload PDF ≤ 15 MB, lihat `/resources`. AI dan n8n boleh 503 kalau belum diaktifkan. | Semua lewat HTTPS | – |

### B5. Rilis otomatis (opsional, setelah B4 stabil)

`release.sh` bisa dipakai tanpa diubah: file override ikut terbaca, dan rollback memulihkan `production.env.previous`.
Sebelum mengaktifkan `VPS_DEPLOY_ENABLED=true`:
- Buat SSH key khusus deploy untuk user `triad`, dibatasi di `authorized_keys` dengan `restrict,command="/opt/triad/ssh-release.sh"`. Wrapper ini hanya menerima `<repo> <sha>` dari `$SSH_ORIGINAL_COMMAND` dan memvalidasinya dengan regex yang sama seperti `release.sh`.
- Pakai port SSH yang sudah ada (22 atau 2222). Ingat fail2ban `maxretry 4`: uji koneksi dari runner sekali saja, jangan berulang.
- `VPS_KNOWN_HOSTS` diambil dari fingerprint yang kamu cek sendiri di VPS (`ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub`).

Alternatif tanpa membuka SSH ke runner GitHub: biarkan auto-deploy mati, lalu jalankan `sudo -u triad /opt/triad/release.sh gimanainidit/website_triad_proteksiber <sha>` secara manual setelah CI hijau.

### B6. Daftar cek non-breaking

- [ ] Tidak ada perubahan pada `ctf.conf`, `ctf.eranusasiber.my.id`, `content-agent-media`, aturan ufw, atau sshd.
- [ ] Semua port container hanya di `127.0.0.1` (diverifikasi oleh langkah CI dan `ss -ltn`).
- [ ] `nginx -t` sebelum setiap reload, dan pakai reload, bukan restart.
- [ ] Batas memori terpasang. n8n mati sampai diputuskan perlu. Pantau `free -h` dan `docker stats --no-stream` 24 jam pertama. Kalau content-agent jadi lambat, turunkan `backend` atau pindah n8n ke tempat lain.
- [ ] Tidak pernah menjalankan `docker compose down -v` pada produksi.
- [ ] Mode lama di `deploy/compose.yml` (VPS khusus, Caddy 80/443) tetap utuh dan test lama tetap hijau.

---

## Urutan kerja yang disarankan

1. **A0** rotasi password + perbaiki `alembic.ini` (segera).
2. Jawab pertanyaan di bawah.
3. **A1 + A2** bersih-bersih repo dan putus akses (1 PR + setelan GitHub).
4. **A3** kode (1 PR, CI hijau).
5. **B3** file shared-host + test (1 PR).
6. **A4** sesuai jawaban soal Supabase dan DB.
7. **B4** deploy manual di VPS, langkah demi langkah.
8. **B5** opsional, rilis otomatis.

## Pertanyaan untuk user

1. Project Supabase `nnxyouxuxvxrvggklqvf` ada di akun Supabase kamu sendiri, atau dibuat oleh Lovable/Emergent?
2. Database produksi: Neon baru (sesuai `deploy/README.md`), atau Postgres Supabase milikmu?
3. Domain final sudah ada? Kalau belum, nama subdomain DuckDNS apa yang mau dipakai?
4. n8n perlu jalan di VPS ini? RAM-nya sempit.
5. File starter Astro di root (L9) dihapus saja?
6. Vercel dipertahankan sebagai cadangan sementara, atau langsung dimatikan setelah VPS jalan?
