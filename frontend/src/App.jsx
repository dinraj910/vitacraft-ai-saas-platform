import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeGenerator      from './pages/ResumeGenerator';
import CoverLetterGenerator from './pages/CoverLetterGenerator';
import JobAnalyzer          from './pages/JobAnalyzer';
import {
  FileText, Mail, Briefcase, Zap, TrendingUp,
  Sparkles, Settings, Shield, LayoutDashboard, CreditCard,
  Menu, X, ArrowUpRight, Check, Star, ArrowRight,
} from 'lucide-react';
import useAuthStore from './store/authStore';

/* ─── Landing Page ─────────────────────────────────────────────────── */
const LandingPage = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const features = [
    { icon: FileText, title: 'AI Resume Generator', desc: 'Create ATS-optimized, role-specific resumes in seconds with our GPT-powered engine.', color: 'text-brand-400', bg: 'bg-brand-500/10 border-brand-500/20' },
    { icon: Mail,     title: 'Cover Letter Writer', desc: 'Personalized cover letters that match job requirements and showcase your strengths.', color: 'text-blue-400',  bg: 'bg-blue-500/10 border-blue-500/20' },
    { icon: Briefcase,title: 'Job Description Analyzer', desc: 'Extract key skills and align your profile to beat automated screening systems.', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
    { icon: Zap,      title: 'Credit-Based System', desc: 'Pay only for what you use. credits roll over monthly for Pro and Enterprise plans.', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { icon: TrendingUp, title: 'Usage Analytics',  desc: 'Track your career activity, document history and credit usage from one dashboard.', color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20' },
    { icon: Shield,   title: 'Secure & Private',   desc: 'Your data is encrypted and never shared. Bank-grade security by Supabase + JWT.', color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
  ];

  const plans = [
    { name: 'Starter', price: '$0', period: 'forever', credits: 5,   badge: null, highlight: false,
      features: ['5 AI generations/month', 'Resume Generator', 'PDF Export', 'Email support'] },
    { name: 'Pro',     price: '$9.99', period: '/month', credits: 50, badge: 'Most Popular', highlight: true,
      features: ['50 AI generations/month', 'Resume + Cover Letter', 'Advanced templates', 'Priority support', 'Usage analytics'] },
    { name: 'Enterprise', price: '$29.99', period: '/month', credits: 200, badge: null, highlight: false,
      features: ['200 AI generations/month', 'All AI tools', 'Team workspace', '24/7 dedicated support', 'API access + Webhooks'] },
  ];

  const stats = [
    { value: '12,000+', label: 'Professionals hired' },
    { value: '95%', label: 'Interview success rate' },
    { value: '50K+', label: 'Documents generated' },
    { value: '< 30s', label: 'Average generation time' },
  ];

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 font-sans">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-dark-950/80 backdrop-blur-xl border-b border-dark-800/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-500/20 border border-brand-500/30 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-brand-400" />
            </div>
            <span className="text-lg font-bold text-white">Vita<span className="text-gradient">Craft</span> AI</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">Features</a>
            <a href="#pricing"  className="text-sm text-slate-400 hover:text-white transition-colors">Pricing</a>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary text-sm px-4 py-2 flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">Get started free</Link>
              </>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-slate-400 hover:text-white">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-dark-800 bg-dark-950 px-6 py-4 space-y-3">
            <a href="#features" className="block text-sm text-slate-300 hover:text-white py-1.5">Features</a>
            <a href="#pricing"  className="block text-sm text-slate-300 hover:text-white py-1.5">Pricing</a>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary text-sm w-full text-center py-2.5 mt-2 flex items-center justify-center gap-2">
                <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="block text-sm text-slate-300 hover:text-white py-1.5">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm w-full text-center py-2.5 mt-2">Get started free</Link>
              </>
            )}
          </div>
        )}
      </nav>

      {/* ── Hero ── */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute -top-60 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-brand-500/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-500/10 border border-brand-500/25 rounded-full text-xs text-brand-300 font-medium mb-8">
            <Zap className="w-3 h-3" /> Powered by AI · Free to start
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
            Land your dream job<br />
            with <span className="text-gradient">AI-crafted</span> documents
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            VitaCraft AI generates ATS-optimized resumes, cover letters and job insights in seconds — so you spend less time writing and more time interviewing.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary text-base px-8 py-3.5 glow-brand">
                <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
              </Link>
            ) : (
              <Link to="/register" className="btn-primary text-base px-8 py-3.5 glow-brand">
                Start for free <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <a href="#features" className="btn-secondary text-base px-8 py-3.5">
              See how it works
            </a>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-slate-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6 border-t border-dark-800/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand-400 text-sm font-semibold tracking-widest uppercase mb-3">Features</p>
            <h2 className="text-4xl font-bold text-white mb-4">Everything to get you hired</h2>
            <p className="text-slate-400 max-w-xl mx-auto">A complete AI career toolkit — from resume optimization to job fit scoring — in one unified platform.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="p-6 bg-dark-900 border border-dark-700/60 rounded-2xl hover:border-dark-600 transition-all duration-200 group">
                <div className={`w-11 h-11 flex items-center justify-center rounded-xl border mb-5 ${f.bg} transition-transform group-hover:scale-110 duration-200`}>
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-24 px-6 bg-dark-900/40 border-t border-dark-800/60">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-brand-400 text-sm font-semibold tracking-widest uppercase mb-3">How it works</p>
          <h2 className="text-4xl font-bold text-white mb-16">From signup to hired in 3 steps</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Create your account', desc: 'Sign up free and get 5 credits instantly. No credit card required.' },
              { step: '02', title: 'Describe your role', desc: 'Enter your experience and target job. Our AI tailors every word for ATS systems.' },
              { step: '03', title: 'Download and apply', desc: 'Export polished PDF documents and start applying with confidence.' },
            ].map((s) => (
              <div key={s.step} className="relative">
                <div className="text-6xl font-black text-dark-800 mb-4 select-none">{s.step}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 px-6 border-t border-dark-800/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand-400 text-sm font-semibold tracking-widest uppercase mb-3">Pricing</p>
            <h2 className="text-4xl font-bold text-white mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-400">Start free. Scale as you grow. No hidden fees.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.name} className={`relative p-7 rounded-2xl border flex flex-col ${
                plan.highlight
                  ? 'bg-brand-500/10 border-brand-500/40 shadow-xl shadow-brand-500/10'
                  : 'bg-dark-900 border-dark-700'
              }`}>
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    {plan.badge}
                  </span>
                )}
                <div className="mb-6">
                  <p className="text-slate-400 text-sm mb-1">{plan.name}</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-black text-white">{plan.price}</span>
                    <span className="text-slate-500 text-sm mb-1">{plan.period}</span>
                  </div>
                  <p className="text-brand-300 text-sm font-medium mt-2 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> {plan.credits} credits/month
                  </p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <Check className="w-4 h-4 text-brand-400 mt-0.5 shrink-0" />{f}
                    </li>
                  ))}
                </ul>

                <Link to="/register" className={`text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                  plan.highlight
                    ? 'bg-brand-500 hover:bg-brand-400 text-white glow-brand'
                    : 'bg-dark-800 hover:bg-dark-700 text-slate-200 border border-dark-600'
                }`}>
                  Get started
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-6 bg-dark-900/40 border-t border-dark-800/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Trusted by professionals</h2>
            <div className="flex justify-center gap-1">{[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}</div>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: 'Priya M.', role: 'Software Engineer', quote: 'Got 3 interviews within a week of using VitaCraft. The ATS optimization is real.' },
              { name: 'James K.', role: 'Product Manager', quote: 'The cover letter writer saved me hours. It actually understood the job description context.' },
              { name: 'Sara L.', role: 'Data Analyst', quote: 'Clean interface, fast results. Way better than traditional resume builders.' },
            ].map((t) => (
              <div key={t.name} className="p-6 bg-dark-900 border border-dark-700 rounded-2xl">
                <div className="flex gap-0.5 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}</div>
                <p className="text-slate-300 text-sm leading-relaxed mb-5">"{t.quote}"</p>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-slate-500 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 border-t border-dark-800/60">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-500/20 border border-brand-500/30 rounded-2xl mb-6 glow-brand">
            <Sparkles className="w-8 h-8 text-brand-400" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Ready to accelerate your career?</h2>
          <p className="text-slate-400 mb-8">Join thousands of professionals who already use VitaCraft AI to land better roles faster.</p>
          <Link to="/register" className="btn-primary text-base px-10 py-3.5 glow-brand">
            Start free — no credit card needed <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-dark-800/60 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-500/20 border border-brand-500/30 rounded-lg flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            </div>
            <span className="text-sm font-bold text-white">Vita<span className="text-gradient">Craft</span> AI</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <a href="#" className="hover:text-slate-300 transition">Privacy</a>
            <a href="#" className="hover:text-slate-300 transition">Terms</a>
            <a href="#" className="hover:text-slate-300 transition">Contact</a>
          </div>
          <p className="text-xs text-slate-600">© 2026 VitaCraft AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

/* ─── App Router ────────────────────────────────────────────────────── */
const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/"          element={<LandingPage />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/resume"    element={<ProtectedRoute><ResumeGenerator /></ProtectedRoute>} />
        <Route path="/cover-letter" element={<ProtectedRoute><CoverLetterGenerator /></ProtectedRoute>} />
        <Route path="/job-analyzer"  element={<ProtectedRoute><JobAnalyzer /></ProtectedRoute>} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
