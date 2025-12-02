import { Link } from 'react-router-dom';
import { appConfig } from '../../config/appConfig';

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50">
      {/* Navbar */}
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
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-sm font-medium text-slate-700 hover:text-primary transition-colors"
              >
                ← Back to Home
              </Link>
              <Link
                to="/login"
                className="rounded-xl bg-gradient-to-r from-primary to-teal-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl hover:scale-105"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/50 bg-white/80 backdrop-blur-xl p-8 md:p-12 shadow-2xl">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-sm text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-slate max-w-none">
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Introduction</h2>
            <p className="text-slate-600 mb-4">
              Welcome to {appConfig.brandName}. We respect your privacy and are committed to protecting your personal data. 
              This privacy policy will inform you about how we look after your personal data when you visit our website 
              and use our ERP system, and tell you about your privacy rights and how the law protects you.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Information We Collect</h2>
            <p className="text-slate-600 mb-4">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 mb-4">
              <li><strong>Identity Data:</strong> includes first name, last name, username, or similar identifier</li>
              <li><strong>Contact Data:</strong> includes email address, telephone numbers, and physical address</li>
              <li><strong>Technical Data:</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location</li>
              <li><strong>Usage Data:</strong> includes information about how you use our website and services</li>
              <li><strong>Business Data:</strong> includes financial data, transaction data, inventory data, and other business-related information</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. How We Use Your Information</h2>
            <p className="text-slate-600 mb-4">We use your personal data for the following purposes:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 mb-4">
              <li>To provide and maintain our ERP services</li>
              <li>To manage your account and provide customer support</li>
              <li>To process your transactions and manage your orders</li>
              <li>To send you important updates and notifications</li>
              <li>To improve our services and develop new features</li>
              <li>To ensure the security and integrity of our platform</li>
              <li>To comply with legal obligations</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Data Security</h2>
            <p className="text-slate-600 mb-4">
              We have implemented appropriate security measures to prevent your personal data from being accidentally lost, 
              used, accessed, altered, or disclosed in an unauthorized way. We use industry-standard encryption, secure servers, 
              and regular security audits to protect your data.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Data Retention</h2>
            <p className="text-slate-600 mb-4">
              We will only retain your personal data for as long as necessary to fulfill the purposes we collected it for, 
              including for the purposes of satisfying any legal, accounting, or reporting requirements. When we no longer 
              need your data, we will securely delete or anonymize it.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Your Legal Rights</h2>
            <p className="text-slate-600 mb-4">Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 mb-4">
              <li>Request access to your personal data</li>
              <li>Request correction of your personal data</li>
              <li>Request erasure of your personal data</li>
              <li>Object to processing of your personal data</li>
              <li>Request restriction of processing your personal data</li>
              <li>Request transfer of your personal data</li>
              <li>Withdraw consent at any time</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. Cookies</h2>
            <p className="text-slate-600 mb-4">
              Our website uses cookies to distinguish you from other users and to provide you with a good experience. 
              Cookies are small text files that are placed on your computer or mobile device when you visit our website. 
              You can set your browser to refuse all or some cookies.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. Third-Party Links</h2>
            <p className="text-slate-600 mb-4">
              Our website may include links to third-party websites, plug-ins, and applications. Clicking on those links 
              may allow third parties to collect or share data about you. We do not control these third-party websites 
              and are not responsible for their privacy statements.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">9. Changes to This Policy</h2>
            <p className="text-slate-600 mb-4">
              We may update this privacy policy from time to time. We will notify you of any changes by posting the new 
              privacy policy on this page and updating the "Last updated" date at the top of this policy.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">10. Contact Us</h2>
            <p className="text-slate-600 mb-4">
              If you have any questions about this privacy policy or our privacy practices, please contact us at:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-4">
              <p className="text-slate-900 font-semibold mb-2">{appConfig.brandName} Support</p>
              <p className="text-slate-600">Email: privacy@aiklisolve.com</p>
              <p className="text-slate-600">Phone: +1 (555) 123-4567</p>
              <p className="text-slate-600">Address: 123 Business Street, Suite 100, City, State 12345</p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row gap-4 justify-between">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50"
            >
              ← Back to Home
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:shadow-xl"
            >
              Go to Login →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-white/50 backdrop-blur-xl mt-16">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              © {new Date().getFullYear()} {appConfig.brandName}. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-600">
              <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
              <Link to="/support" className="hover:text-primary transition-colors">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

