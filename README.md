# DocuForge

DocuForge helps students turn a software repository into a consistent academic documentation pack. This repository currently contains the Week 1 foundation: email-link authentication, ZIP/public GitHub ingestion, safe source-file filtering, secret redaction, stack detection, and ingestion status reporting. **Document generation and exports are later milestones and are not implemented in this slice yet.**

## Requirements

- Node.js 20.9 or newer (Node.js 22 LTS recommended)
- A Supabase project
- A Cloudflare R2 bucket and API token
- Inngest CLI for local background-job processing

## Install and configure

```bash
npm install
cp .env.example .env.local
```

Fill these variables in `.env.local`:

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Server-side Supabase URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only service-role key; never expose it to a browser |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL used by the browser client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe Supabase publishable/anon key |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | R2 S3-compatible credentials |
| `R2_BUCKET` | Bucket name (default example: `docuforge-uploads`) |
| `GITHUB_TOKEN` | Optional token to increase GitHub API rate limits |
| `INNGEST_EVENT_KEY` / `INNGEST_SIGNING_KEY` | Inngest production keys; local Inngest dev can run without them |

### Supabase setup

1. Create a Supabase project.
2. Run `supabase/migrations/001_init.sql` in the SQL Editor.
3. In **Authentication → URL Configuration**, allow your local callback URL `http://localhost:3000/projects/new` (and your deployed URL when you deploy).
4. Enable Email / magic-link sign-in. The migration creates a `profiles` row when a user signs up.

### Cloudflare R2 setup

1. Create a private bucket, for example `docuforge-uploads`.
2. Create an R2 API token with object read/write access only to this bucket.
3. Add this bucket CORS policy for local development (add your deployed origin before deploying):

```json
[
  {
    "AllowedOrigins": ["http://localhost:3000"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

4. Add a lifecycle rule to delete objects under `uploads/` after 30 days, unless you intentionally retain them.

## Run locally

Start the Next.js app and Inngest dev server in separate terminals:

```bash
npm run dev
```

```bash
npx inngest-cli@latest dev
```

Open `http://localhost:3000`, sign in at `/login`, then upload a `.zip` or submit a public GitHub URL at `/projects/new`. The project page polls ingestion status every 3 seconds. Local jobs appear in the Inngest dashboard at `http://localhost:8288`.

## Checks

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Tests cover ZIP traversal and invalid archives, filtering of junk and secret files, secret redaction, stack detection, and file-role ranking.

## Week 1 ingestion safeguards

- Uploads are capped at 100 MB and use user-namespaced R2 keys.
- ZIP extraction rejects path traversal, checks entry count and declared expanded size, and re-checks actual file sizes. User-supplied code is never executed.
- Dependency/build directories, binary files, nested archives, lockfiles, and secret files are excluded. Recognized credentials embedded in kept source files are redacted before saving.
- At most 5,000 archive entries are accepted, individual source files are capped at 200 KB, and the top 150 ranked files are flagged for later AI summarization.
- Database insert batches use UTF-8 byte counts, and project-file delete/update errors are surfaced instead of silently ignored.

## Current limitations

- GitHub ingestion supports public repositories on their default branch only.
- Nested archives are skipped rather than recursively extracted.
- Files above 200 KB are skipped.
- Week 2 summarization, Project Model confirmation, document generation, export rendering, billing, and university template editing are not included yet.
- The current slice stores redacted source text in Postgres for simpler Week 2 ingestion; revisit retention and storage sizing before broad production use.

## Deployment note

Configure the same environment variables, set R2 CORS to the deployed site origin, add the deployed Supabase redirect URL, and run the SQL migration before deploying. Background ingestion requires the Inngest endpoint to be reachable and correctly configured.
