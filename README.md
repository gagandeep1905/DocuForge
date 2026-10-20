# DocuForge

DocuForge is a student-focused documentation app for software projects. This repository currently implements the **Week 1 foundation**: authentication, project upload, safe source ingestion, stack detection, and ingestion coverage. AI summarization, document generation, editors, and exports are later milestones and are not yet implemented here.

## Week 1 workflow

1. Sign in with a Supabase email magic link.
2. Upload a ZIP (up to 100 MB) or provide a public GitHub repository URL.
3. The file is uploaded to Cloudflare R2 using a short-lived, user-scoped presigned URL.
4. Inngest queues ingestion. The worker filters generated files, dependencies, archives, binaries, and secret files, then redacts common credentials in retained source.
5. DocuForge detects languages and frameworks, ranks files, and saves file summaries/metadata for the next milestone. It does **not** execute the uploaded project.
6. The project page polls for status and shows coverage information.

## Requirements

- Node.js 20.9 or newer
- npm
- A Supabase project
- A Cloudflare R2 bucket and S3-compatible API token
- Inngest (local development can use the Inngest dev server)
- Optional: a GitHub personal access token to raise API rate limits for public repositories

## Install and configure

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` with your own service credentials. Never commit `.env.local` or a service-role key.

### Supabase

1. Create a Supabase project.
2. Open **SQL Editor** and run `supabase/migrations/001_init.sql`.
3. In **Authentication → URL Configuration**, add `http://localhost:3000/projects/new` as an allowed redirect URL.
4. Enable email OTP/magic-link sign-in.

The migration creates the Week 1 tables, a new-user profile trigger, read-only row-level-security policies for browser access, and the generic B.Tech report template. Server API routes use the service-role key and enforce ownership checks in the route handlers.

### Cloudflare R2

1. Create an R2 bucket (the default name in `.env.example` is `docuforge-uploads`).
2. Create an API token with access only to this bucket and read/write object permissions.
3. Add the following CORS policy to the bucket for local browser uploads (add your deployed app origin before production use):

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

4. Consider adding an R2 lifecycle rule to remove objects under `uploads/` after 30 days.

### Inngest

The local Inngest dev server discovers the app at `http://localhost:3000/api/inngest`. You do not need an event key for local development. For production, configure the Inngest environment keys in `.env.local`/your host's environment settings and register the deployed endpoint in Inngest.

## Environment variables

See `.env.example`. The important values are:

- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` — server-side Supabase client (keep the service-role key secret).
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — browser auth client.
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` — storage.
- `GITHUB_TOKEN` — optional token for fetching public GitHub repository ZIPs.
- `INNGEST_EVENT_KEY` and `INNGEST_SIGNING_KEY` — production Inngest integration.

## Run locally

Open two terminal windows.

```bash
npm run dev
```

```bash
npx inngest-cli@latest dev
```

Open [http://localhost:3000](http://localhost:3000), sign in at `/login`, and open `/projects/new`. After starting a project, its status page polls `/api/projects/:id` about every three seconds. The Inngest dashboard is usually available at [http://localhost:8288](http://localhost:8288).

## Tests and build

```bash
npm test
npm run build
```

Tests cover ZIP traversal protection, common skip rules, secret redaction, language/framework detection, and file ranking.

## Ingestion limits and safety

- Compressed upload cap: 100 MB.
- Archive entry cap: 5,000 files.
- Declared extracted-size cap: 400 MB.
- Per-file source cap: 200 KB.
- At most 150 ranked files are flagged for the next AI-analysis stage.
- Nested archives, dependency/build directories, common binaries, lockfiles, and likely secret files are skipped.
- Common API tokens, private keys, credential assignments, and database-URL passwords are redacted from retained text.
- Uploaded code is data, never executed. Only public GitHub repositories are supported in this milestone.

These checks reduce risk but cannot guarantee every possible secret is detected. Review your repository and confirm the security configuration before using this with real user projects.

## Planned next milestones

Week 2 adds map-reduce source summarization, a validated Project Model, missing-field questions, and a confirmation screen. Later milestones add the document editor, DOCX/PDF/PPTX exports, diagram rendering, payments, and university templates. Those features are not represented as complete in this Week 1 branch.
