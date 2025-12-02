import { Outlet } from 'react-router-dom';
import { appConfig } from '../../config/appConfig';
import { getAuthMode } from '../../features/auth/api/authApi';

export function AuthLayout() {
  const authMode = getAuthMode();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--text-primary)] py-12 px-4">
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light/10 border border-primary/30 text-primary font-semibold text-xl shadow-sm">
            📊
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-text-primary">
              {appConfig.brandName}
            </h1>
            <p className="text-xs text-text-secondary mt-1">
              {appConfig.authTagline}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-card p-6 shadow-md">
          <Outlet />
        </div>
        <p className="mt-4 text-center text-[10px] text-text-secondary">
          {authMode === 'static' 
            ? 'Using static demo users. Configure Supabase to enable real authentication.' 
            : 'Connected to Supabase. Real-time authentication enabled.'}
        </p>
      </div>
    </div>
  );
}


