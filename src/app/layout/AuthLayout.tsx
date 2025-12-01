import { Outlet } from 'react-router-dom';
import { appConfig } from '../../config/appConfig';

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-900">
      <div className="mx-auto w-full max-w-md px-4">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-light/10 border border-brand/40 text-brand font-semibold shadow-soft">
            O
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              {appConfig.brandName}
            </h1>
            <p className="text-xs text-slate-400">
              {appConfig.authTagline}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-emerald-500/10">
          <Outlet />
        </div>
        <p className="mt-4 text-center text-[11px] text-slate-500">
          This is a demo ERP. Authentication uses Supabase when configured, otherwise a
          local mock session.
        </p>
      </div>
    </div>
  );
}


