import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'DocuForge — Project documentation, made simple', template: '%s | DocuForge' },
  description: 'Turn a student software project into clear, consistent academic documentation.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <header className="border-b border-white/10">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
            <a href="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 font-bold text-white">D</span>
              <span>DocuForge</span>
            </a>
            <nav className="flex items-center gap-4 text-sm text-slate-300">
              <a className="transition hover:text-white" href="/login">Sign in</a>
              <a className="rounded-lg bg-white px-3 py-2 font-medium text-slate-950 transition hover:bg-indigo-100" href="/projects/new">Start a project</a>
            </nav>
          </div>
        </header>
        {children}
        <footer className="border-t border-white/10 px-5 py-6 text-center text-xs text-slate-500">
          DocuForge · Student project documentation · Review every generated claim before submission.
        </footer>
      </body>
    </html>
  );
}
