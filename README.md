# DocuForge

DocuForge is a student-focused documentation app for software projects. The repository currently implements the **Week 1 foundation**: automatic guest sessions, project upload, safe source ingestion, stack detection, and ingestion coverage. AI summarization, document generation, editors, and exports are later milestones and are not yet implemented here.

## Week 1 workflow

1. Open DocuForge and start a project. No sign-in or sign-up form is required; the browser creates a guest session automatically.
2. Upload a ZIP (up to 50 MB) or provide a public GitHub repository URL.
3. For ZIP uploads, the app requests a one-time signed upload token from its authenticated server and sends the file directly to a private Supabase Storage bucket. The Supabase secret key never reaches the browser.
4. Inngest queues ingestion. The worker downloads the uploaded archive from Supabase Storage, filters generated files, dependencies, archives, binaries, and secret files, then redacts common credentials in retained source.
5. DocuForge detects languages and frameworks, ranks files, and saves file summaries/metadata for the next milestone. It does **not** execute the uploaded project.
6. The project page polls for status and shows coverage information.

Guest workspaces are created through Supabase anonymous authentication behind the scenes. Projects are tied to the anonymous browser session. Clearing browser site data or switching browsers/devices can make those projects inaccessible; there is currently no account-recovery or cross-device sync flow.

## Requirements

- Node.js 20.9 or newer
- npm
- A Supabase project with anonymous sign-ins and Storage enabled
- Inngest (local development can use the Inngest dev server)
- Optional: a GitHub personal access token to raise API rate limits for public repositories

## Install and configure

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local` with your own service credentials. Never commit `.env.local` or a Supabase secret key.

### Supabase

1. Link the Supabase CLI to your project: `supabase link --project-ref <project-ref>`.
2. Apply the versioned migrations in order with `supabase db push`. The repository migration files are under `supabase/migrations/`.
3. In the Supabase Dashboard, open **Authentication → Sign In / Providers** (or the Auth settings for your project) and enable **Anonymous Sign-Ins**. Email OTP/magic-link sign-in is not needed for the guest flow.
4. Add `http://localhost:3000` and your deployed app URL to the allowed site/redirect URL configuration if required by your Supabase project settings.
5. Configure the public client variables and server-only Supabase secret key in your deployment environment. Use `SUPABASE_SECRET_KEY` for a modern `sb_secret_*` key. The code also accepts the legacy `SUPABASE_SERVICE_ROLE_KEY` variable during migration. Never expose either server-only variable to browser code.

The migrations create the Week 1 database tables, a profile trigger for new auth users (including anonymous guests), row-level-security policies, the generic B.Tech report template, restricted trigger-function execution, and supporting indexes.

### Supabase Storage

The migration creates a private `docuforge-uploads` bucket with a 50 MiB per-file limit and `application/zip` content-type restriction. Storage object access is private; the RLS insert policy only permits an authenticated guest to upload under `uploads/<that-guest-user-id>/`. The app's server verifies the guest session and creates a one-time signed upload token for a random object key. The browser uses that token for the upload; it never receives the Supabase secret key. The ingestion worker downloads the object using the server-side Supabase client.

Set `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=docuforge-uploads` in the environment. This is a bucket name, not a secret. Supabase Free projects enforce a 50 MB maximum file size, so DocuForge's ZIP upload limit is 50 MiB.

For a public launch, add CAPTCHA protection (Cloudflare Turnstile or hCaptcha) to anonymous sign-ins and monitor auth rate limits. Anonymous sessions are browser-bound and are not recoverable after browser storage is cleared.

### Inngest

The local Inngest dev server discovers the app at `http://localhost:3000/api/inngest`. You do not need an event key for local development. For production, configure the Inngest environment keys in `.env.local`/your host's environment settings and register the deployed endpoint in Inngest.

## Environment variables

See `.env.example`. The important values are:

- `SUPABASE_URL` and `SUPABASE_SECRET_KEY` — server-side Supabase client. Use the modern `sb_secret_*` key; the legacy `SUPABASE_SERVICE_ROLE_KEY` variable is supported as a fallback. Keep the key secret.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` — browser client used to create anonymous guest sessions. A Supabase publishable `sb_publishable_*` key can be used for the public key value.
- `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` — private upload bucket name (default: `docuforge-uploads`).
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

Open [http://localhost:3000](http://localhost:3000) and choose **Start a project**. DocuForge creates a guest session automatically; there is no login page. After starting a project, its status page polls `/api/projects/:id` about every three seconds. The Inngest dashboard is usually available at [http://localhost:8288](http://localhost:8288).

## Tests and build

```bash
npm test
npm run build
```

Tests cover ZIP traversal protection, common skip rules, secret redaction, upload-size enforcement, language/framework detection, and file ranking.

## Ingestion limits and safety

- Compressed ZIP upload cap: 50 MiB.
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
