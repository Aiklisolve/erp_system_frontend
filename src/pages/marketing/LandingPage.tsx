import { Link } from 'react-router-dom';
import { appConfig } from '../../config/appConfig';

export function LandingPage() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const modules = [
    { emoji: '💼', name: 'Finance', desc: 'Track expenses, income, invoices & budgets', color: 'from-emerald-500 to-teal-600' },
    { emoji: '📥', name: 'Procurement', desc: 'Manage purchase orders & suppliers', color: 'from-blue-500 to-cyan-600' },
    { emoji: '🏭', name: 'Manufacturing', desc: 'Production orders & planning', color: 'from-purple-500 to-indigo-600' },
    { emoji: '📦', name: 'Inventory', desc: 'Stock levels & warehouse tracking', color: 'from-orange-500 to-amber-600' },
    { emoji: '🧾', name: 'Orders', desc: 'Sales orders & fulfillment', color: 'from-pink-500 to-rose-600' },
    { emoji: '🏷️', name: 'Ecommerce', desc: 'Online products & orders', color: 'from-violet-500 to-purple-600' },
    { emoji: '🚚', name: 'Supply Chain', desc: 'Logistics & distribution', color: 'from-green-500 to-emerald-600' },
    { emoji: '🏬', name: 'Warehouse', desc: 'Stock movements & locations', color: 'from-yellow-500 to-orange-600' },
    { emoji: '🧑‍💼', name: 'CRM', desc: 'Customer relationships & sales', color: 'from-red-500 to-pink-600' },
    { emoji: '📣', name: 'Marketing', desc: 'Campaigns & automation', color: 'from-fuchsia-500 to-pink-600' },
    { emoji: '🧑‍🤝‍🧑', name: 'HR & Workforce', desc: 'Employees & scheduling', color: 'from-cyan-500 to-blue-600' },
    { emoji: '📊', name: 'Projects', desc: 'Project management & resources', color: 'from-indigo-500 to-blue-600' }
  ];

  const features = [
    { icon: '⚡', title: 'Lightning Fast', desc: 'Optimized performance for instant data access' },
    { icon: '🔒', title: 'Secure & Reliable', desc: 'Enterprise-grade security for your data' },
    { icon: '📱', title: 'Mobile Ready', desc: 'Access from anywhere, any device' },
    { icon: '🎯', title: 'Role-Based Access', desc: 'Control permissions by user roles' },
    { icon: '📈', title: 'Real-time Analytics', desc: 'Live dashboards and reports' },
    { icon: '🔄', title: 'Auto Sync', desc: 'Seamless data synchronization' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-1/4 h-72 w-72 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-xl shadow-sm">
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
            <div className="flex items-center gap-6">
              <button
                onClick={() => scrollToSection('features')}
                className="hidden text-sm font-medium text-slate-700 hover:text-primary transition-colors md:block"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('modules')}
                className="hidden text-sm font-medium text-slate-700 hover:text-primary transition-colors md:block"
              >
                Modules
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="hidden text-sm font-medium text-slate-700 hover:text-primary transition-colors md:block"
              >
                How it works
              </button>
              <Link
                to="/login"
                className="rounded-xl bg-gradient-to-r from-primary to-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:scale-105"
              >
                Login →
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-2 text-sm font-medium text-primary">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Modern ERP Solution
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              Unified ERP for
              <span className="block bg-gradient-to-r from-primary via-teal-600 to-blue-600 bg-clip-text text-transparent">
                Modern Business
              </span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              Streamline operations across finance, inventory, sales, HR, and more. 
              One platform, infinite possibilities. Built for teams that move fast.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-teal-600 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-primary/40 transition-all hover:shadow-3xl hover:scale-105"
              >
                Get Started
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <button
                onClick={() => scrollToSection('modules')}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white/80 backdrop-blur px-8 py-4 text-lg font-semibold text-slate-700 transition-all hover:bg-white hover:border-primary/50 hover:shadow-lg"
              >
                Explore Modules
                <span>🔍</span>
              </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200">
              <div>
                <p className="text-3xl font-bold text-primary">13+</p>
                <p className="text-sm text-slate-600">Modules</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">99.9%</p>
                <p className="text-sm text-slate-600">Uptime</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">24/7</p>
                <p className="text-sm text-slate-600">Support</p>
              </div>
            </div>
          </div>
          
          {/* Hero Image/Cards */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-teal-600/20 rounded-3xl blur-3xl"></div>
            <div className="relative grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl p-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  <div className="mb-3 text-4xl">💸</div>
                  <p className="text-lg font-bold text-slate-900">Finance</p>
                  <p className="text-2xl font-bold text-primary">$2.4M</p>
                  <p className="text-xs text-slate-600">Revenue this month</p>
                  <div className="mt-3 flex items-center gap-1 text-xs text-emerald-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <span>+24% vs last month</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl p-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  <div className="mb-3 text-4xl">🧑‍💼</div>
                  <p className="text-lg font-bold text-slate-900">CRM</p>
                  <p className="text-2xl font-bold text-primary">1,248</p>
                  <p className="text-xs text-slate-600">Active customers</p>
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl p-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  <div className="mb-3 text-4xl">📦</div>
                  <p className="text-lg font-bold text-slate-900">Inventory</p>
                  <p className="text-2xl font-bold text-primary">94%</p>
                  <p className="text-xs text-slate-600">Stock health</p>
                </div>
                <div className="rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl p-6 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  <div className="mb-3 text-4xl">🧑‍🤝‍🧑</div>
                  <p className="text-lg font-bold text-slate-900">HR</p>
                  <p className="text-2xl font-bold text-primary">156</p>
                  <p className="text-xs text-slate-600">Employees</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 sm:text-5xl">Why Choose Aiklisolve?</h2>
          <p className="mt-4 text-xl text-slate-600">
            Everything your business needs, designed for simplicity and power
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl p-8 shadow-lg hover:shadow-2xl transition-all hover:scale-105"
            >
              <div className="mb-4 text-5xl group-hover:scale-110 transition-transform">{feature.icon}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
              <p className="text-slate-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 sm:text-5xl">
            🧩 13 Powerful Modules
          </h2>
          <p className="mt-4 text-xl text-slate-600">
            Every part of your business, seamlessly connected
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {modules.map((module, idx) => (
            <div
              key={idx}
              className="group rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg hover:shadow-2xl transition-all hover:scale-105 hover:-translate-y-1"
            >
              <div className={`mb-4 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${module.color} text-3xl shadow-lg`}>
                {module.emoji}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{module.name}</h3>
              <p className="text-sm text-slate-600">{module.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-teal-600 px-8 py-4 text-lg font-semibold text-white shadow-2xl shadow-primary/40 transition-all hover:shadow-3xl hover:scale-105"
          >
            Start Managing Now
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 sm:text-5xl">How It Works</h2>
          <p className="mt-4 text-xl text-slate-600">Get started in minutes, not months</p>
        </div>
        <div className="grid gap-8 md:grid-cols-4">
          {[
            { num: '01', title: 'Sign Up', desc: 'Create your account instantly', icon: '🚀' },
            { num: '02', title: 'Configure', desc: 'Set up your company & modules', icon: '⚙️' },
            { num: '03', title: 'Import Data', desc: 'Migrate existing data easily', icon: '📥' },
            { num: '04', title: 'Go Live', desc: 'Start managing operations', icon: '✨' }
          ].map((step, idx) => (
            <div key={idx} className="relative text-center">
              <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-teal-600/20 text-4xl shadow-lg">
                {step.icon}
              </div>
              <div className="mb-3 text-sm font-bold text-primary">{step.num}</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-slate-600">{step.desc}</p>
              {idx < 3 && (
                <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -z-10"></div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-teal-600 to-blue-600 px-8 py-16 text-center shadow-2xl">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>
          <div className="relative">
            <h2 className="text-4xl font-bold text-white sm:text-5xl mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of companies using Aiklisolve to streamline operations and drive growth.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-10 py-4 text-lg font-bold text-primary shadow-2xl transition-all hover:bg-slate-50 hover:shadow-3xl hover:scale-105"
            >
              Get Started Free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-white/50 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <Link to="/" className="flex items-center gap-3 mb-4">
                <img 
                  src="/aks logo.jpeg" 
                  alt="Aiklisolve Logo" 
                  className="h-10 w-10 rounded-xl object-cover shadow-lg"
                />
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">{appConfig.brandName}</span>
              </Link>
              <p className="text-sm text-slate-600 max-w-md">
                Modern ERP solution for businesses of all sizes. Streamline operations, boost productivity, and drive growth.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Product</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-primary transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('modules')} className="hover:text-primary transition-colors">Modules</button></li>
                <li><Link to="/login" className="hover:text-primary transition-colors">Login</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
                <li><Link to="/support" className="hover:text-primary transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              © {new Date().getFullYear()} {appConfig.brandName}. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-primary transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
