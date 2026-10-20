import Link from 'next/link';

const deliverables = [
  { number: '01', title: 'One project model', description: 'Build a structured understanding of the project from its source files before generating documents.' },
  { number: '02', title: 'Consistent documentation', description: 'Prepare synopsis, SRS, design, testing, report, presentation, and viva material from the same facts.' },
  { number: '03', title: 'Review before submission', description: 'Confirm missing academic details and review generated content instead of relying on invented facts.' },
];

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f7fc] text-ink">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-[560px] bg-[radial-gradient(ellipse_at_top,_rgba(116,87,232,0.14),_transparent_66%)]" />
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-3" aria-label="DocuForge home">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-600 text-lg font-bold text-white shadow-lg shadow-violet-600/20">D</span>
          <span className="text-lg font-semibold tracking-tight">DocuForge</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium">
          <Link href="/login" className="hidden rounded-full px-4 py-2.5 text-gray-700 transition hover:bg-white sm:inline-flex">Sign in</Link>
          <Link href="/projects/new" className="rounded-full bg-ink px-4 py-2.5 text-white transition hover:bg-violet-700 sm:px-5">Start a project <span aria-hidden="true">↗</span></Link>
        </nav>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 md:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-12 lg:pb-28 lg:pt-24">
        <div>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-100 bg-white/80 px-3.5 py-2 text-xs font-semibold tracking-wide text-violet-700 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> BUILT FOR STUDENT SOFTWARE PROJECTS
          </div>
          <h1 className="max-w-2xl text-5xl font-semibold leading-[1.06] tracking-[-0.055em] sm:text-6xl lg:text-[4.45rem]">
            Your project is built.
            <span className="mt-2 block text-violet-600">Now document it.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
            Turn a codebase into a documentation workspace for your college submission. Start with a ZIP file or a public GitHub repository, then review the project details before generating documents.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/projects/new" className="inline-flex items-center justify-center gap-3 rounded-full bg-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:-translate-y-0.5 hover:bg-violet-700">
              Analyze my project <span aria-hidden="true">→</span>
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-gray-700 transition hover:border-violet-200 hover:text-violet-700">Sign in with email</Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-2"><span className="text-emerald-600">✓</span> ZIP and public GitHub URLs</span>
            <span className="inline-flex items-center gap-2"><span className="text-emerald-600">✓</span> Secret-file filtering</span>
            <span className="inline-flex items-center gap-2"><span className="text-emerald-600">✓</span> Student-reviewed details</span>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-violet-200/70 via-white/20 to-fuchsia-100/80 blur-2xl" />
          <div className="relative overflow-hidden rounded-[1.6rem] border border-white bg-white/90 p-5 shadow-lift sm:p-7">
            <div className="flex items-center justify-between border-b border-gray-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-xl">⌘</div>
                <div>
                  <p className="text-sm font-semibold">Campus project</p>
                  <p className="mt-1 text-xs text-gray-500">Source analysis preview</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">Ready to review</span>
            </div>
            <div className="grid grid-cols-2 gap-3 py-5">
              <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4"><p className="text-xs text-gray-500">Source files</p><p className="mt-2 text-2xl font-semibold tracking-tight">150 <span className="text-sm font-normal text-gray-400">max analyzed</span></p></div>
              <div className="rounded-xl border border-gray-100 bg-gray-50/80 p-4"><p className="text-xs text-gray-500">Source input</p><p className="mt-2 text-lg font-semibold">ZIP <span className="text-gray-400">/</span> GitHub</p></div>
            </div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">Documentation pack</p>
            <div className="space-y-2">
              {[
                ['Synopsis', 'Project overview and objectives', 'S'],
                ['Software requirements', 'Functional and non-functional needs', 'R'],
                ['System design', 'Architecture and data-flow diagrams', 'D'],
                ['Test cases', 'Positive, negative and boundary tests', 'T'],
              ].map(([title, subtitle, initial]) => (
                <div key={title} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-violet-50 text-sm font-semibold text-violet-700">{initial}</span>
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{title}</p><p className="mt-0.5 truncate text-xs text-gray-500">{subtitle}</p></div>
                  <span className="text-gray-300" aria-hidden="true">↗</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-gray-400">Illustrative preview. Documents and exports are being built in stages.</p>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-y border-gray-200/70 bg-white/70">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 md:grid-cols-3 lg:px-12 lg:py-16">
          {deliverables.map((item) => (
            <article key={item.number} className="max-w-sm">
              <p className="text-xs font-bold tracking-[0.18em] text-violet-600">{item.number}</p>
              <h2 className="mt-4 text-lg font-semibold tracking-tight">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-14 sm:px-8 md:flex-row md:items-center lg:px-12 lg:py-16">
        <div><h2 className="text-2xl font-semibold tracking-tight">Start with the code you already have.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">Week 1 supports safe project ingestion, source filtering, technology detection, and processing status. Document generation will follow in later milestones.</p></div>
        <Link href="/projects/new" className="shrink-0 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-700">Create a project <span aria-hidden="true">→</span></Link>
      </section>

      <footer className="border-t border-gray-200/70 px-5 py-6 text-center text-xs text-gray-500 sm:px-8">© {new Date().getFullYear()} DocuForge · Documentation should be accurate, reviewable, and yours.</footer>
    </main>
  );
}
