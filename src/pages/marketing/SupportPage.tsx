import { Link } from 'react-router-dom';
import { useState, FormEvent } from 'react';
import { appConfig } from '../../config/appConfig';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { toast } from '../../lib/toast';

export function SupportPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      toast.success('Support request submitted successfully! We\'ll get back to you soon.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setLoading(false);
    }, 1500);
  };

  const faqs = [
    {
      q: 'How do I get started with Aiklisolve?',
      a: 'Simply click the "Login" button and create your account. You can start using the system immediately with our demo data, or configure it for your business needs.'
    },
    {
      q: 'What modules are included in Aiklisolve?',
      a: 'Aiklisolve includes 13 comprehensive modules: Finance, Procurement, Manufacturing, Inventory, Orders, Warehouse, Supply Chain, CRM, Projects, Workforce, HR, Ecommerce, and Marketing.'
    },
    {
      q: 'Is my data secure?',
      a: 'Yes! We use enterprise-grade encryption, secure servers, and regular security audits to protect your data. Your information is stored securely and backed up regularly.'
    },
    {
      q: 'Can I import my existing data?',
      a: 'Yes, Aiklisolve supports data import from various formats including CSV, Excel, and through API integrations. Contact our support team for assistance with data migration.'
    },
    {
      q: 'What kind of support do you offer?',
      a: 'We offer 24/7 email support, live chat during business hours, comprehensive documentation, video tutorials, and dedicated account managers for enterprise customers.'
    },
    {
      q: 'Can I customize the system for my business?',
      a: 'Absolutely! Aiklisolve is highly customizable. You can configure workflows, create custom fields, set up role-based permissions, and integrate with third-party tools.'
    }
  ];

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

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">How Can We Help?</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Get the support you need to make the most of Aiklisolve
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-16">
          <div className="rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl p-8 shadow-lg text-center hover:shadow-2xl transition-all">
            <div className="text-5xl mb-4">📧</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Email Support</h3>
            <p className="text-slate-600 mb-4">Get help via email</p>
            <a href="mailto:aiklisolvetechnologies@gmail.com" className="text-primary font-semibold hover:underline">
            aiklisolvetechnologies@gmail.com
            </a>
          </div>
          
          <div className="rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl p-8 shadow-lg text-center hover:shadow-2xl transition-all">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Live Chat</h3>
            <p className="text-slate-600 mb-4">Chat with our team</p>
            <button className="text-primary font-semibold hover:underline">
              Start Chat
            </button>
          </div>
          
          <div className="rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl p-8 shadow-lg text-center hover:shadow-2xl transition-all">
            <div className="text-5xl mb-4">📞</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Phone Support</h3>
            <p className="text-slate-600 mb-4">Call us directly</p>
            <a href="tel:+91 7893678950" className="text-primary font-semibold hover:underline">
            +91 7893678950
            </a>
          </div>
        </div>

        {/* Contact Form & FAQs */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <div className="rounded-3xl border border-white/50 bg-white/80 backdrop-blur-xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Send Us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Subject <span className="text-red-500">*</span>
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="How can we help?"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Message <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us more about your question or issue..."
                  rows={6}
                  required
                />
              </div>
              
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>

          {/* FAQs */}
          <div className="rounded-3xl border border-white/50 bg-white/80 backdrop-blur-xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border-b border-slate-200 pb-6 last:border-0 last:pb-0">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{faq.q}</h3>
                  <p className="text-slate-600">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg hover:shadow-2xl transition-all">
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Documentation</h3>
            <p className="text-sm text-slate-600 mb-4">
              Comprehensive guides and tutorials to help you get the most out of Aiklisolve
            </p>
            <button className="text-primary font-semibold text-sm hover:underline">
              View Docs →
            </button>
          </div>
          
          <div className="rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg hover:shadow-2xl transition-all">
            <div className="text-4xl mb-3">🎥</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Video Tutorials</h3>
            <p className="text-sm text-slate-600 mb-4">
              Step-by-step video guides for all features and modules
            </p>
            <button className="text-primary font-semibold text-sm hover:underline">
              Watch Videos →
            </button>
          </div>
          
          <div className="rounded-2xl border border-white/50 bg-white/80 backdrop-blur-xl p-6 shadow-lg hover:shadow-2xl transition-all">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Community Forum</h3>
            <p className="text-sm text-slate-600 mb-4">
              Connect with other users, share tips, and get answers
            </p>
            <button className="text-primary font-semibold text-sm hover:underline">
              Join Forum →
            </button>
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

