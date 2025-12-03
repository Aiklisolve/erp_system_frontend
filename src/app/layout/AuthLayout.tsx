import { Outlet, Link } from 'react-router-dom';
import { appConfig } from '../../config/appConfig';
import { getAuthMode } from '../../features/auth/api/authApi';

export function AuthLayout() {
  const authMode = getAuthMode();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Top Navigation */}
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src="/aks logo.jpeg" 
                alt="Aiklisolve Logo" 
                className="h-10 w-10 rounded-xl object-cover shadow-lg group-hover:shadow-xl transition-all"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">{appConfig.brandName}</span>
            </Link>
            <Link
              to="/"
              className="text-sm font-medium text-slate-700 hover:text-primary transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-screen items-center justify-center py-12 px-4 pt-24">
        <div className="mx-auto w-full max-w-md">
          {/* Logo & Title */}
          <div className="mb-8 text-center">
            <img 
              src="/aks logo.jpeg" 
              alt="Aiklisolve Logo" 
              className="inline-block h-16 w-16 rounded-2xl object-cover shadow-2xl shadow-primary/40 mb-4"
            />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-teal-600 to-blue-600 bg-clip-text text-transparent mb-2">
              {appConfig.brandName}
            </h1>
            <p className="text-sm text-slate-600">
              {appConfig.authTagline}
            </p>
          </div>

          {/* Auth Card */}
          <div className="rounded-3xl border border-white/50 bg-white/80 backdrop-blur-xl p-8 shadow-2xl">
            <Outlet />
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-xs text-slate-600">
              {authMode === 'static' 
                ? '🎭 Demo Mode - Using static demo users' 
                : '🔒 Secure Authentication - Connected to Supabase'}
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <span>•</span>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <span>•</span>
              <Link to="/support" className="hover:text-primary transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


