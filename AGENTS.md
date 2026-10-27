# Cara bekerja di repo ini

Catatan untuk agen (Claude Code, Codex, dan sejenisnya) yang mengerjakan
StreetProof. Isinya kesepakatan kerja. Rencana produk dan arsitektur ada di
`plan/` (versi EN dan ID), bukan di sini.

## Status repo

Aplikasinya belum dibangun. Yang sudah ada: paket perencanaan di `plan/`,
kerangka monorepo JavaScript (pnpm + Turborepo) dan Python (uv), serta skill
agen di `.agents/skills/`. Folder `apps/`, `packages/`, dan `py/` masih kosong
sampai spike teknis memutuskan isinya.

Arah teknis yang diusulkan (lihat `plan/en/04-technical/architecture-decisions.md`):

- **Next.js + TypeScript** untuk UI dan `/api/v1` (modular monolith).
- **Worker Node terpisah** untuk job lambat (AI, media), lewat outbox di PostgreSQL.
- **Supabase**: Auth, PostgreSQL dengan RLS, Storage privat.
- **Python** hanya untuk kebutuhan yang memang khas Python: evaluasi AI,
  eksperimen model, skrip data. Bukan runtime kedua untuk API (ADR-001, D-05).

Semua ADR di `plan/` masih berstatus _proposed_. Kalau pekerjaanmu bertentangan
dengan salah satunya, sebutkan secara eksplisit, jangan diam-diam menimpanya.

## Aturan tetap

1. **Sunting berkas langsung.** Jangan membungkus perubahan dalam skrip Python
   atau shell yang menulis ulang berkas. Diff harus memperlihatkan perubahan
   kode, bukan perubahan skrip.
2. **Jangan memakai multi-agen kecuali disuruh.** Tanpa subagen, Workflow, atau
   skill yang membagi tugas ke agen lain. Kalau tugas terasa butuh itu, tanya dulu.
3. **Push hanya kalau disuruh.** Commit boleh per langkah; `git push` menunggu
   perintah eksplisit pemilik repo.
4. **Setiap service punya `AGENTS.md` dan `CLAUDE.md` sendiri** di foldernya
   (`apps/*`, `packages/*`, `py/*`). `CLAUDE.md` cukup berisi `@AGENTS.md`.
   Service baru langsung dibuatkan keduanya; ikuti skill `streetproof-scaffold`.
5. **Rencana dua bahasa tetap sinkron.** Mengubah `plan/en/...` berarti
   mengubah `plan/id/...` yang sepadan di commit yang sama, dan sebaliknya.
   Keputusan baru dicatat di `plan/*/00-foundation/decision-register.md`.
6. **Tidak ada data nyata di repo.** Repo ini privat, tapi bisa di-clone,
   dibagikan ke kolaborator, atau dibuka ke publik nanti. Foto laporan, nama
   pelapor, nomor telepon, dan data penyewa hanya boleh sintetis. Rahasia
   hanya di `.env` (diabaikan git); `.env.example` berisi nama variabel saja.

## Struktur

```
.agents/skills/   skill agen untuk stack ini (lihat indeks di bawah)
apps/             aplikasi yang di-deploy (web Next.js, worker Node)
packages/         paket TypeScript bersama (domain, kontrak, db, ui, config)
py/               paket Python (evaluasi AI, eksperimen, skrip data)
plan/en, plan/id  paket perencanaan, dua bahasa
docs/adr/         ADR yang sudah diterima (yang diusulkan masih di plan/)
docs/agents/      konfigurasi untuk skill to-spec, to-tickets, triage
```

## Perintah

JavaScript (Node 22, pnpm 12), dijalankan dari root:

```bash
pnpm install          # selalu dari root, jangan --filter saat install
pnpm dev              # turbo run dev
pnpm build            # turbo run build
pnpm typecheck
pnpm lint
pnpm test
```

Python (3.12, uv), juga dari root:

```bash
uv sync               # buat .venv dan pasang workspace + dev tools
uv run ruff check .
uv run ruff format .
uv run pytest
```

## Sebelum menyatakan selesai

- JS: `pnpm typecheck && pnpm lint && pnpm test`, lalu `pnpm build` kalau
  menyentuh aplikasi Next.js. Sebagian kerusakan hanya muncul saat prerender.
- Python: `uv run ruff check . && uv run ruff format --check . && uv run pytest`.
- Setiap perubahan perilaku, nama, atau kontrak: `grep` nama dan kalimat lama di
  seluruh repo (termasuk `plan/`) dan perbarui yang tertinggal di commit yang sama.
- Pesan commit memakai format conventional commits (`feat:`, `fix:`, `docs:`, ...).

## Skill agen

Skill ada di `.agents/skills/<nama>/SKILL.md`. Codex membacanya langsung. Agen
lain: baca `SKILL.md` yang relevan sebelum mulai, bukan sesudah drafnya jadi.

| Kebutuhan                                 | Skill                                                                                   |
| ----------------------------------------- | --------------------------------------------------------------------------------------- |
| Menambah app, package, atau paket Python  | `streetproof-scaffold`                                                                  |
| Next.js App Router, RSC, Suspense, cache  | `nextjs-app-architecture`, `vercel-react-best-practices`, `vercel-composition-patterns` |
| UI: komponen, styling, aksesibilitas      | `shadcn`, `tailwind-design-system`, `web-design-guidelines`, `frontend-patterns`        |
| Monorepo, pipeline task, cache            | `turborepo`                                                                             |
| Supabase: Auth, RLS, Storage, CLI         | `supabase`, `supabase-postgres-best-practices`                                          |
| Skema, migrasi, index                     | `database-migrations`, `supabase-postgres-best-practices`                               |
| API dan service layer                     | `api-design`, `backend-patterns`, `error-handling`                                      |
| Python                                    | `python-patterns`, `python-testing`, `fastapi-patterns`                                 |
| Test dan verifikasi                       | `tdd-workflow`, `e2e-testing`, `verification-loop`                                      |
| Keamanan (auth, input, data penyewa)      | `security-review`                                                                       |
| Docker, CI/CD, deploy                     | `docker-patterns`, `deployment-patterns`                                                |
| Riset sebelum menulis kode baru           | `search-first`                                                                          |
| Keputusan arsitektur                      | `architecture-decision-records`, `domain-modeling`                                      |
| Spec, tiket, triase issue                 | `to-spec`, `to-tickets`, `triage`                                                       |
| Alur git dan PR                           | `git-workflow`                                                                          |
| Serah terima ke sesi lain, orientasi repo | `handoff`, `codebase-onboarding`                                                        |
| Standar kode umum                         | `coding-standards`                                                                      |

## Agent skills

### Issue tracker

Issue dan spec ada di GitHub Issues repo ini, lewat `gh`. Lihat `docs/agents/issue-tracker.md`.

### Triage labels

Lima label kanonis bawaan (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). Lihat `docs/agents/triage-labels.md`.

### Domain docs

Single-context: glosarium di `plan/en/00-foundation/glossary.md`, ADR di `docs/adr/`. Lihat `docs/agents/domain.md`.
