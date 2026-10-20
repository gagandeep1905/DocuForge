const deliverables = [
  ['Project synopsis', 'A focused overview of the problem, objectives, scope, and approach.'],
  ['SRS and design', 'Requirements and system diagrams grounded in the source files.'],
  ['Report and test cases', 'Structured chapters and positive, negative, and boundary cases.'],
  ['PPT and viva prep', 'Presentation-ready slides and project-specific viva questions.'],
];

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden border-b border-white/10">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.22),transparent_55%)]" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-28">
          <div>
            <p className="mb-5 inline-flex rounded-full border border-indigo-300/20 bg-indigo-300/10 px-3 py-1 text-xs font-medium text-indigo-200">Built for B.Tech · BCA · MCA projects</p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">Your project is built. <span className="text-indigo-300">Now document it.</span></h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">Upload a ZIP or add a public GitHub repository. DocuForge maps the codebase into a project model to help create consistent academic documentation.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/projects/new" className="rounded-xl bg-indigo-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-indigo-300">Analyze a project <span aria-hidden="true">→</span></a>
              <a href="#how-it-works" className="rounded-xl border border-white/15 px-5 py-3 font-semibold text-white transition hover:bg-white/5">How it works</a>
            </div>
            <p className="mt-4 text-xs text-slate-500">Your source code is analyzed as data; it is not executed.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl shadow-indigo-950/30 sm:p-7">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div><p className="text-sm font-semibold">Documentation workspace</p><p className="mt-1 text-xs text-slate-400">Example project pack</p></div>
              <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">Consistent model</span>
            </div>
            <div className="mt-5 space-y-3">
              {deliverables.map(([title, description], index) => (
                <div key={title} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.025] p-3.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-400/10 text-sm font-semibold text-indigo-200">0{index + 1}</span>
                  <div><p className="text-sm font-medium">{title}</p><p className="mt-1 text-xs leading-5 text-slate-400">{description}</p></div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">Generated drafts need your review. Missing academic details are left for you to confirm.</p>
          </div>
        </div>
      </section>
      <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-16 md:py-20">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-300">Simple workflow</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">From repository to report-ready drafts</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ['01', 'Upload your code', 'Choose a ZIP archive or paste the URL of a public GitHub repository.'],
            ['02', 'Review the scan', 'DocuForge filters build artifacts and secrets, then shows source-file coverage.'],
            ['03', 'Confirm project facts', 'The next step is to confirm your objectives and academic details before generating documents.'],
          ].map(([number, title, description]) => (
            <article key={number} className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
              <p className="text-sm font-semibold text-indigo-300">{number}</p><h3 className="mt-4 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
