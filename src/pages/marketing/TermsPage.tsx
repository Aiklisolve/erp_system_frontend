import { Link } from 'react-router-dom';
import { appConfig } from '../../config/appConfig';

export function TermsPage() {
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
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms & Conditions</h1>
          <p className="text-sm text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-slate max-w-none">
            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-slate-600 mb-4">
              By accessing and using {appConfig.brandName} ("the Service"), you accept and agree to be bound by the terms 
              and provision of this agreement. If you do not agree to these terms, please do not use the Service.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Description of Service</h2>
            <p className="text-slate-600 mb-4">
              {appConfig.brandName} provides a comprehensive Enterprise Resource Planning (ERP) system that includes but is not limited to:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 mb-4">
              <li>Finance and accounting management</li>
              <li>Inventory and warehouse management</li>
              <li>Customer relationship management (CRM)</li>
              <li>Human resources management</li>
              <li>Supply chain and procurement</li>
              <li>Manufacturing and production planning</li>
              <li>E-commerce integration</li>
              <li>Project management</li>
              <li>Marketing automation</li>
              <li>And other business management tools</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. User Accounts</h2>
            <p className="text-slate-600 mb-4">
              To access certain features of the Service, you must register for an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 mb-4">
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept all responsibility for activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">4. Acceptable Use</h2>
            <p className="text-slate-600 mb-4">You agree not to use the Service to:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 mb-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Transmit any harmful or malicious code</li>
              <li>Attempt to gain unauthorized access to the Service or related systems</li>
              <li>Interfere with or disrupt the Service or servers</li>
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">5. Intellectual Property</h2>
            <p className="text-slate-600 mb-4">
              The Service and its original content, features, and functionality are owned by {appConfig.brandName} and are 
              protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. 
              You may not copy, modify, distribute, sell, or lease any part of our Service without our express written permission.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">6. Data Ownership and Usage</h2>
            <p className="text-slate-600 mb-4">
              You retain all rights to the data you input into the Service. We do not claim ownership of your data. 
              However, by using the Service, you grant us a license to use, store, and process your data solely for 
              the purpose of providing and improving the Service.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">7. Payment Terms</h2>
            <p className="text-slate-600 mb-4">
              If you subscribe to a paid plan, you agree to pay all fees associated with your subscription. Fees are 
              billed in advance on a recurring basis (monthly or annually). All fees are non-refundable except as 
              required by law. We reserve the right to change our pricing with 30 days notice.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">8. Service Availability</h2>
            <p className="text-slate-600 mb-4">
              We strive to provide 99.9% uptime for the Service. However, we do not guarantee that the Service will be 
              uninterrupted, timely, secure, or error-free. We reserve the right to modify, suspend, or discontinue the 
              Service at any time with reasonable notice.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">9. Limitation of Liability</h2>
            <p className="text-slate-600 mb-4">
              To the maximum extent permitted by law, {appConfig.brandName} shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether 
              incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
            </p>
            <ul className="list-disc list-inside text-slate-600 space-y-2 mb-4">
              <li>Your use or inability to use the Service</li>
              <li>Any unauthorized access to or use of our servers and/or any personal information stored therein</li>
              <li>Any interruption or cessation of transmission to or from the Service</li>
              <li>Any bugs, viruses, or other harmful code that may be transmitted through the Service</li>
              <li>Any errors or omissions in any content or for any loss or damage incurred as a result of your use of any content</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">10. Indemnification</h2>
            <p className="text-slate-600 mb-4">
              You agree to indemnify, defend, and hold harmless {appConfig.brandName}, its officers, directors, employees, 
              and agents from and against any claims, liabilities, damages, losses, and expenses arising out of or in any 
              way connected with your access to or use of the Service or your violation of these Terms.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">11. Termination</h2>
            <p className="text-slate-600 mb-4">
              We may terminate or suspend your account and access to the Service immediately, without prior notice or 
              liability, for any reason, including if you breach these Terms. Upon termination, your right to use the 
              Service will immediately cease. You may also terminate your account at any time through your account settings.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">12. Governing Law</h2>
            <p className="text-slate-600 mb-4">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which 
              {appConfig.brandName} operates, without regard to its conflict of law provisions.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">13. Changes to Terms</h2>
            <p className="text-slate-600 mb-4">
              We reserve the right to modify or replace these Terms at any time. If a revision is material, we will 
              provide at least 30 days notice prior to any new terms taking effect. Your continued use of the Service 
              after such modifications constitutes your acceptance of the new Terms.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">14. Contact Information</h2>
            <p className="text-slate-600 mb-4">
              If you have any questions about these Terms, please contact us at:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-4">
              <p className="text-slate-900 font-semibold mb-2">{appConfig.brandName} Legal Department</p>
              <p className="text-slate-600">Email: legal@aiklisolve.com</p>
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

