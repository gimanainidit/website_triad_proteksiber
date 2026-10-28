# Handover: workflow agentic n8n untuk TRIAD

Untuk: tim developer agent n8n (custom). Ditulis 2026-10-28, saat migrasi CMS ke VPS selesai.
Status ringkas: **n8n mati.** Tabel n8n lama di Supabase dibiarkan (keputusan user, T19), karena workflow akan dibangun ulang.

## 1. Gambaran sistem sekarang

| Bagian | Lokasi | Catatan |
|---|---|---|
| Situs + CMS | https://eranusasiber.my.id (dan `www`) | React/Vite (`frontend/`) + FastAPI (`backend/`) |
| Hosting | VPS Debian bersama (shared host) | nginx host (TLS certbot) → `127.0.0.1:8180` → Caddy → `frontend:80` / `backend:8001` |
| Database CMS | Supabase Postgres, project `nnxyouxuxvxrvggklqvf`, schema `public` | Lewat transaction pooler (port 6543), TLS dengan CA `backend/certs/supabase-prod-ca-2021.crt` |
| File | Supabase Storage, bucket publik `resources` dan `templates` | |
| Rilis | push ke `main` | CI build image GHCR → timer `triad-auto-release` di VPS menjalankan `release.sh` (≤2 menit). `ship.sh` = push + pantau CI |
| Rencana kerja | `PLAN.md` | Tabel Progres adalah satu-satunya sumber status |

Tabel CMS: `users`, `resources`, `templates`, `admin_sessions`, `audit_logs`, `alembic_version`. Skema CMS hanya berubah lewat Alembic (`backend/alembic/versions/`).

## 2. Sisa n8n lama di Supabase (`public`)

Dibuat oleh instance n8n lama di hf.space (Postgres backend). Instance itu sudah tidak bisa diakses sejak awal migrasi. Terakhir diubah 2026-02-22; migrasi n8n terakhir: `AddWorkflowUnpublishScopeToCustomRoles1769900001000`.

Isi:

- ±58 tabel n8n (`workflow_entity`, `credentials_entity`, `execution_entity`, `user`, `project`, `role`, `webhook_entity`, `chat_hub_*`, `oauth_*`, dll.). Nama tabel `user` (n8n) tidak bentrok dengan `users` (CMS).
- 3 workflow, semuanya **nonaktif**, 0 execution tersimpan:
  - **TRIAD Telegram Content Generation** (7 node): Telegram Trigger → IF → LangChain Agent (OpenAI) → Code → Telegram. Ini cikal bakal yang paling relevan.
  - **Transform voice notes into business reviews with Groq Whisper & GPT-5 to Google Slides** (39 node): template komunitas, memakai Telegram, Groq/HTTP, Agent + guardrails, Google Drive/Slides, Gmail.
  - **My workflow** (2 node): uji coba.
- 6 credential: Gmail, Google Drive, Google Slides (OAuth2), 2 bot Telegram (`@triadproteksi_bot`, "genAI automation"), 1 OpenAI.
- 1 user n8n (owner).

Yang perlu diketahui:

- **Credential lama tidak bisa dipakai.** Isinya terenkripsi dengan `N8N_ENCRYPTION_KEY` instance hf.space, dan kunci itu tidak kami pegang. Buat ulang semua credential. Token bot Telegram dan API key OpenAI lama sebaiknya dianggap bocor dan diganti di BotFather/OpenAI.
- **Workflow bisa dibaca sebagai referensi.** Kolom `nodes` dan `connections` di `workflow_entity` berisi JSON biasa. Ekspor dengan query read-only, lalu impor ke n8n baru lewat editor (Import from JSON):
  ```sql
  select name, nodes, connections, settings from public.workflow_entity;
  ```
  Periksa dulu node `Code` dan `httpRequest` dari hasil ekspor: bisa jadi ada nilai sensitif yang ditulis langsung di parameter.
- **Jangan arahkan n8n baru ke schema `public`.** Versi n8n baru akan menjalankan migrasinya di atas tabel lama dan bercampur dengan tabel CMS. Pilihan yang disarankan ada di §4.
- Menghapus tabel lama adalah keputusan user (T19). Kalau suatu saat dihapus: dump dulu, lalu jalankan sebagai migrasi lewat Supabase, bukan dari n8n.

## 3. Titik integrasi yang sudah ada di kode

Backend membaca `N8N_API_URL` dan `N8N_API_KEY` (`backend/optional_features.py`). Kalau salah satunya kosong, fitur n8n mati dan endpoint di bawah membalas 503. Kondisi ini terlihat di `GET /api/health` → `features.n8n_configured` (sekarang `false`).

| Endpoint | Auth | Fungsi | Kode |
|---|---|---|---|
| `POST /api/n8n/webhook/content` | Header `X-N8N-Secret` = `N8N_WEBHOOK_SECRET`; tanpa secret di server → 503, salah → 401 | n8n mengirim hasil konten (form: `title`, `content`, `category`, `source`, `material_type`) → baris baru `resources`, `file_type='n8n'`, tag `n8n-generated`, **selalu draft** (`published=False`, `author_id` kosong). Admin mem-publish di `/admin/resources` | `backend/server.py`, test `tests/test_n8n_webhook.py` |
| `GET /api/n8n/health` | Tidak ada; 503 bila n8n off | Cek `{N8N_API_URL}/healthz` | `backend/server.py` |
| `GET /api/admin/n8n/workflows` | Admin | Daftar workflow via n8n REST API | `backend/routes/admin.py` |
| `POST /api/admin/n8n/trigger` | Admin | POST ke `{N8N_API_URL}/webhook/{webhook_path}` dengan `{user_id, data}` | `backend/routes/admin.py` |
| `POST /api/admin/n8n/create` | Admin | Membuat workflow contoh "TRIAD Telegram Content Generation" (body diabaikan) | `backend/n8n_service.py` |
| `GET /api/admin/n8n/workflows/{id}/executions` | Admin | Riwayat eksekusi | `backend/routes/admin.py` |

Frontend belum punya UI untuk n8n. Endpoint admin hanya bisa dipanggil langsung dengan token admin.

Callback dari n8n ke backend memakai `BACKEND_INTERNAL_URL` (default `http://backend:8001`), artinya lewat jaringan Docker internal, bukan lewat domain publik.

## 4. Menyalakan n8n di VPS

Service `n8n` sudah ada di `deploy/compose.yml` (image dipin dengan digest, port hanya `127.0.0.1:5678`, volume `n8n_data`). Di shared host, service ini masuk profile `automation` dengan `mem_limit: 512m` (`deploy/shared-host/compose.override.yml`). Langkahnya:

1. **Kapasitas.** VPS memakai RAM 1,8 GB + swap 2 GB, dan dipakai bersama layanan lain. Cek `free -m` sebelum menyalakan. Workflow berat (Whisper, render) sebaiknya memanggil API eksternal, bukan diproses di VPS.
2. **Database n8n.** Pilih salah satu:
   - Default: SQLite di volume `n8n_data`. Paling sederhana; backup volume beserta encryption key.
   - Supabase: set `DB_TYPE=postgresdb` dan **`DB_POSTGRESDB_SCHEMA=n8n`** (schema baru, bukan `public`), user DB terpisah kalau bisa, dan TLS memakai CA Supabase yang sama dengan backend.
3. **Env.** Salin `deploy/n8n.env.example` ke `/opt/triad/n8n.env` (chmod 600). Buat `N8N_ENCRYPTION_KEY` sekali saja dan simpan di luar VPS.
4. **Start.** Di `/opt/triad`, set `COMPOSE_PROFILES=automation` di `production.env`, lalu jalankan `docker compose --env-file production.env up -d n8n`. Perintah yang membutuhkan sudo dijalankan sendiri oleh pemilik VPS.
5. **Editor hanya lewat SSH tunnel:** `ssh -L 5678:127.0.0.1:5678 <user>@<vps>`, lalu buka `http://localhost:5678`. Jangan buka port 5678 di ufw. Port yang di-publish Docker tidak lewat ufw, jadi bind harus tetap ke `127.0.0.1`.
6. **Hubungkan ke backend.** Buat API key di n8n, isi `N8N_API_URL=http://n8n:5678` dan `N8N_API_KEY` di `/opt/triad/backend.env`. Buat secret acak (`openssl rand -hex 32`), isi sebagai `N8N_WEBHOOK_SECRET` di `backend.env`, lalu recreate backend. Di n8n, buat credential **Header Auth** (name `X-N8N-Secret`, value = secret yang sama) dan pakai di node HTTP Request yang memanggil webhook. Jangan tulis secret langsung di parameter node, dan jangan pakai `$env` (itu membuka `N8N_ENCRYPTION_KEY` ke semua node).
7. **Trigger dari luar** (Telegram webhook, dll.) butuh route publik. Caddy saat ini hanya meneruskan `/api/*` dan frontend. Kalau perlu, tambahkan route sempit (misalnya hanya `/webhook/<path>` ke `n8n:5678`) di `deploy/Caddyfile`. Editor dan `/rest` jangan pernah ikut terbuka. Alternatif tanpa route publik: Telegram Trigger mode polling.

## 5. Wajib sebelum workflow dinyalakan

- **Webhook konten sudah diamankan (2026-10-28):** wajib header `X-N8N-Secret`, hasil selalu draft. Endpoint ini tetap terjangkau dari internet lewat Caddy `/api/*` (dengan secret). Kalau workflow hanya memanggilnya dari jaringan Docker, boleh dipertimbangkan memblok path ini di Caddy.
- Konten dari n8n tidak pernah tampil publik tanpa admin menekan Publish. Kalau tim ingin auto-publish, itu keputusan user dan wajib dicatat di `PLAN.md`.
- Semua perubahan backend pakai TDD (test merah dulu) di `tests/`, lalu push ke `main` (rilis otomatis setelah CI hijau). Lihat bagian Seam di `PLAN.md`.
- Jangan simpan secret di workflow JSON, repo, atau variabel `VITE_*`. Simpan di credential n8n atau di file env server.

## 6. Kontak dan keputusan yang sudah diambil

- Pemilik: user repo `gimanainidit/website_triad_proteksiber` (akun Supabase dan VPS milik user yang sama).
- Tabel n8n lama: dibiarkan (2026-10-28).
- 8 resource uji lama: tetap draft (T25).
- Keputusan baru dicatat di `PLAN.md`.
