import { appConfig } from '../../config/appConfig';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-800 bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {year} {appConfig.brandName}. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <a
            href="#"
            className="hover:text-emerald-300 transition-colors"
            aria-label="Privacy policy (placeholder link)"
          >
            Privacy
          </a>
          <a
            href="#"
            className="hover:text-emerald-300 transition-colors"
            aria-label="Contact (placeholder link)"
          >
            Contact
          </a>
          <span className="hidden sm:inline text-slate-500">
            Static demo powered by Supabase-ready React + Vite.
          </span>
        </div>
      </div>
    </footer>
  );
}


