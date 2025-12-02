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
    { emoji: '💼', name: 'Finance', desc: 'Track expenses, income, invoices' },
    { emoji: '📥', name: 'Procurement', desc: 'Manage purchase orders & suppliers' },
    { emoji: '🏭', name: 'Manufacturing', desc: 'Production orders & planning' },
    { emoji: '📦', name: 'Inventory', desc: 'Stock levels & warehouse tracking' },
    { emoji: '🧾', name: 'Orders', desc: 'Sales orders & fulfillment' },
    { emoji: '🏷️', name: 'Ecommerce', desc: 'Online products & orders' },
    { emoji: '🚚', name: 'Supply Chain', desc: 'Logistics & distribution' },
    { emoji: '🏬', name: 'Warehouse', desc: 'Stock movements & locations' },
    { emoji: '🧑‍💼', name: 'CRM', desc: 'Customer relationships & sales' },
    { emoji: '📣', name: 'Marketing', desc: 'Campaigns & automation' },
    { emoji: '🧑‍🤝‍🧑', name: 'HR & Workforce', desc: 'Employees & scheduling' },
    { emoji: '📊', name: 'Projects', desc: 'Project management & resources' }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <span className="text-lg font-bold text-slate-900">{appConfig.brandName}</span>
            </Link>
            <div className="flex items-center gap-6">
              <button
                onClick={() => scrollToSection('features')}
                className="hidden text-sm font-medium text-slate-600 hover:text-primary md:block"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('modules')}
                className="hidden text-sm font-medium text-slate-600 hover:text-primary md:block"
              >
                Modules
              </button>
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="hidden text-sm font-medium text-slate-600 hover:text-primary md:block"
              >
                How it works
              </button>
              <Link
                to="/login"
                className="rounded-xl border border-primary/30 bg-white px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              📊 All-in-One ERP for Your Business
            </h1>
            <p className="text-lg text-slate-600 sm:text-xl">
              Connect finance, inventory, sales, HR, and more in a single, easy-to-use ERP
              platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-[#0f766e] hover:shadow-xl"
              >
                Go to Login <span>🚀</span>
              </Link>
              <button
                onClick={() => scrollToSection('modules')}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-primary/30 bg-white px-6 py-3 text-base font-semibold text-primary transition-all hover:bg-primary/10"
              >
                Explore Modules <span>🔍</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
              <div className="mb-2 text-3xl">💸</div>
              <p className="text-sm font-semibold text-slate-900">Finance</p>
              <p className="text-xs text-slate-600">$248K Revenue</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
              <div className="mb-2 text-3xl">📦</div>
              <p className="text-sm font-semibold text-slate-900">Inventory</p>
              <p className="text-xs text-slate-600">89% Health</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
              <div className="mb-2 text-3xl">🧑‍💼</div>
              <p className="text-sm font-semibold text-slate-900">CRM</p>
              <p className="text-xs text-slate-600">342 Orders</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
              <div className="mb-2 text-3xl">🧑‍🤝‍🧑</div>
              <p className="text-sm font-semibold text-slate-900">HR</p>
              <p className="text-xs text-slate-600">94% Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Our ERP? Section */}
      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Why Our ERP?</h2>
          <p className="mt-4 text-lg text-slate-600">
            Everything your business needs, designed for simplicity and power.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-md transition-transform hover:scale-105">
            <div className="mb-4 text-5xl">📡</div>
            <h3 className="text-lg font-semibold text-slate-900">Real-time Visibility</h3>
            <p className="mt-2 text-sm text-slate-600">
              See your business metrics and KPIs update in real-time across all modules, so you
              always know what's happening.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-md transition-transform hover:scale-105">
            <div className="mb-4 text-5xl">🤖</div>
            <h3 className="text-lg font-semibold text-slate-900">Smart Automation</h3>
            <p className="mt-2 text-sm text-slate-600">
              Automate repetitive tasks, workflows, and notifications to save time and reduce
              errors across your operations.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-md transition-transform hover:scale-105">
            <div className="mb-4 text-5xl">😊</div>
            <h3 className="text-lg font-semibold text-slate-900">Simple, Friendly UI</h3>
            <p className="mt-2 text-sm text-slate-600">
              A modern, intuitive interface that your team will actually enjoy using. No complex
              training required.
            </p>
          </div>
        </div>
      </section>

      {/* Modules Overview Section */}
      <section id="modules" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            🧩 13 Connected ERP Modules
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Every part of your business, in one place.
          </p>
        </div>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <div
              key={module.name}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md transition-all hover:shadow-lg"
            >
              <div className="mb-3 text-3xl">{module.emoji}</div>
              <h3 className="text-base font-semibold text-slate-900">{module.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{module.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:bg-[#0f766e] hover:shadow-xl"
          >
            Login to manage all modules <span>➜</span>
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">How It Works</h2>
          <p className="mt-4 text-lg text-slate-600">Get started in minutes, not months.</p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-4">
          <div className="text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
              1️⃣
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Sign up / Login</h3>
            <p className="mt-2 text-sm text-slate-600">
              Create your account or login to access your ERP dashboard instantly.
            </p>
          </div>
          <div className="text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
              2️⃣
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Configure Your Company</h3>
            <p className="mt-2 text-sm text-slate-600">
              Set up your company details and choose which modules you want to use.
            </p>
          </div>
          <div className="text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
              3️⃣
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Track Everything</h3>
            <p className="mt-2 text-sm text-slate-600">
              Manage finance, orders, inventory, people, and more from a unified dashboard.
            </p>
          </div>
          <div className="text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-3xl">
              4️⃣
            </div>
            <h3 className="text-lg font-semibold text-slate-900">View Dashboards</h3>
            <p className="mt-2 text-sm text-slate-600">
              Monitor real-time KPIs, reports, and analytics to make data-driven decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-[#0f766e] px-8 py-12 text-center shadow-xl">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to run your business smarter?
          </h2>
          <p className="mt-4 text-lg text-white/90">
            Login to access your ERP dashboard and start managing your business operations today.
          </p>
          <div className="mt-8">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-base font-semibold text-primary shadow-lg transition-all hover:bg-slate-50 hover:shadow-xl"
            >
              Go to Login <span>🚀</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-xl">📊</span>
              <span className="font-semibold text-slate-900">
                © {new Date().getFullYear()} {appConfig.brandName}
              </span>
            </div>
            <div className="flex gap-6 text-sm text-slate-600">
              <a href="#" className="hover:text-primary">
                Privacy
              </a>
              <a href="#" className="hover:text-primary">
                Terms
              </a>
              <a href="#" className="hover:text-primary">
                Support
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

