import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, AlertCircle, FileText, Mail, Briefcase, Zap, ArrowLeft } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Login = () => {
  const [form, setForm]               = useState({ email: '', password: '' });
  const [showPwd, setShowPwd]         = useState(false);
  const [error, setError]             = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const { login } = useAuth();

  const onChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(form);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { icon: FileText, text: 'AI-powered resume generation' },
    { icon: Mail,     text: 'Personalized cover letters' },
    { icon: Briefcase,text: 'Job description analyzer' },
    { icon: Zap,      text: 'Instant PDF export' },
  ];

  return (
    <div className="min-h-screen bg-dark-950 flex">

      {/* ── Left Panel (hidden on mobile) ── */}
      <div className="hidden lg:flex flex-col w-[480px] shrink-0 bg-dark-900 border-r border-dark-700/60 p-12 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-500/6 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex-1 flex flex-col justify-between">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-16">
              <div className="w-9 h-9 bg-brand-500/20 border border-brand-500/30 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-400" />
              </div>
              <span className="text-xl font-bold text-white">Vita<span className="text-gradient">Craft</span> AI</span>
            </Link>
            <h2 className="text-3xl font-bold text-white leading-snug mb-4">
              Your AI career<br/>toolkit is waiting.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-10">
              Sign in to access your dashboard, generate documents, and track your job applications.
            </p>
            <ul className="space-y-4">
              {features.map(({ icon: FeatureIcon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-500/10 border border-brand-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <FeatureIcon className="w-4 h-4 text-brand-400" />
                  </div>
                  <span className="text-slate-300 text-sm">{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-slate-600">Trusted by 12,000+ professionals · © 2026 VitaCraft AI</p>
        </div>
      </div>

      {/* ── Right Panel (Form) ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm animate-slide-up">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-brand-500/20 border border-brand-500/30 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-brand-400" />
            </div>
            <span className="text-lg font-bold text-white">Vita<span className="text-gradient">Craft</span> AI</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-slate-400 text-sm mb-8">Sign in to your account</p>

          {error && (
            <div className="flex items-center gap-3 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl mb-6">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="input-label" htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" required autoComplete="email"
                value={form.email} onChange={onChange} placeholder="you@example.com" className="input-field" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="input-label mb-0" htmlFor="password">Password</label>
                <a href="#" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <input id="password" name="password" type={showPwd ? 'text' : 'password'} required
                  autoComplete="current-password" value={form.password} onChange={onChange}
                  placeholder="Enter your password" className="input-field pr-11" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 transition-colors">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
              {isLoading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                : 'Sign in to your account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Create one free</Link>
          </p>

          <div className="mt-8 pt-6 border-t border-dark-800">
            <Link to="/" className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-400 transition-colors justify-center">
              <ArrowLeft className="w-3 h-3" /> Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;