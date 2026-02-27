import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, AlertCircle, CheckCircle2, ArrowLeft, Check } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const checks = (p) => [
  { label: '8+ characters', ok: p.length >= 8 },
  { label: 'Uppercase',     ok: /[A-Z]/.test(p) },
  { label: 'Lowercase',     ok: /[a-z]/.test(p) },
  { label: 'Number',        ok: /\d/.test(p) },
];
const colors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const list   = checks(password);
  const passed = list.filter((c) => c.ok).length;
  const label  = ['', 'Weak', 'Fair', 'Good', 'Strong'][passed];
  return (
    <div className="mt-2.5 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {[1,2,3,4].map((i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passed ? colors[passed] : 'bg-dark-700'}`} />
          ))}
        </div>
        <span className={`text-xs font-medium ${['','text-red-400','text-yellow-400','text-blue-400','text-green-400'][passed]}`}>{label}</span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {list.map((c) => (
          <span key={c.label} className={`text-xs flex items-center gap-1 transition-colors ${c.ok ? 'text-green-400' : 'text-slate-600'}`}>
            <CheckCircle2 className="w-3 h-3" />{c.label}
          </span>
        ))}
      </div>
    </div>
  );
};

const Register = () => {
  const [form, setForm]           = useState({ name: '', email: '', password: '' });
  const [showPwd, setShowPwd]     = useState(false);
  const [error, setError]         = useState('');
  const [fieldErr, setFieldErr]   = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setFieldErr({ ...fieldErr, [e.target.name]: '' });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(''); setFieldErr({});
    try {
      await register(form);
    } catch (err) {
      const data = err.response?.data;
      if (data?.error?.code === 'VALIDATION_ERROR') {
        const fe = {};
        data.error.details.forEach(({ field, message }) => { fe[field] = message; });
        setFieldErr(fe);
      } else {
        setError(data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const perks = [
    '5 free AI credits on signup',
    'Resume Generator instantly',
    'No credit card required',
    'Cancel anytime',
  ];

  return (
    <div className="min-h-screen bg-dark-950 flex">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex flex-col w-[480px] shrink-0 bg-dark-900 border-r border-dark-700/60 p-12 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-500/6 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex-1 flex flex-col justify-between">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-16">
              <div className="w-9 h-9 bg-brand-500/20 border border-brand-500/30 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-brand-400" />
              </div>
              <span className="text-xl font-bold text-white">Vita<span className="text-gradient">Craft</span> AI</span>
            </Link>
            <h2 className="text-3xl font-bold text-white leading-snug mb-4">
              Start generating<br/>in 60 seconds.
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-10">
              Create your free account and let AI handle the hard part — so you can focus on landing the job.
            </p>
            <ul className="space-y-3.5 mb-12">
              {perks.map((p) => (
                <li key={p} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-500/15 border border-green-500/25 rounded-full flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-green-400" />
                  </div>
                  <span className="text-slate-300 text-sm">{p}</span>
                </li>
              ))}
            </ul>

            {/* Social proof */}
            <div className="p-5 bg-dark-800 border border-dark-700 rounded-2xl">
              <p className="text-slate-300 text-sm italic mb-3">"Got 3 interviews in a week. The ATS optimization is real."</p>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold">P</div>
                <div>
                  <p className="text-white text-xs font-medium">Priya M.</p>
                  <p className="text-slate-500 text-xs">Software Engineer</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-600">© 2026 VitaCraft AI · Secure by Supabase + JWT</p>
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

          <h1 className="text-2xl font-bold text-white mb-1">Create your account</h1>
          <p className="text-slate-400 text-sm mb-8">
            Start with <span className="text-brand-400 font-semibold">5 free AI credits</span> — no card needed
          </p>

          {error && (
            <div className="flex items-center gap-3 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl mb-6">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="input-label" htmlFor="name">Full name</label>
              <input id="name" name="name" type="text" required autoComplete="name"
                value={form.name} onChange={onChange} placeholder="Alex Johnson"
                className={`input-field ${fieldErr.name ? 'border-red-500/70 focus:ring-red-500' : ''}`} />
              {fieldErr.name && <p className="input-error"><AlertCircle className="w-3 h-3" />{fieldErr.name}</p>}
            </div>

            <div>
              <label className="input-label" htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" required autoComplete="email"
                value={form.email} onChange={onChange} placeholder="you@example.com"
                className={`input-field ${fieldErr.email ? 'border-red-500/70 focus:ring-red-500' : ''}`} />
              {fieldErr.email && <p className="input-error"><AlertCircle className="w-3 h-3" />{fieldErr.email}</p>}
            </div>

            <div>
              <label className="input-label" htmlFor="password">Password</label>
              <div className="relative">
                <input id="password" name="password" type={showPwd ? 'text' : 'password'} required
                  autoComplete="new-password" value={form.password} onChange={onChange}
                  placeholder="Create a strong password"
                  className={`input-field pr-11 ${fieldErr.password ? 'border-red-500/70 focus:ring-red-500' : ''}`} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1 transition-colors">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErr.password
                ? <p className="input-error"><AlertCircle className="w-3 h-3" />{fieldErr.password}</p>
                : <PasswordStrength password={form.password} />}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3">
              {isLoading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</>
                : 'Create free account'}
            </button>

            <p className="text-xs text-slate-600 text-center">
              By signing up you agree to our{' '}
              <a href="#" className="text-slate-500 hover:text-slate-400 underline">Terms</a> &{' '}
              <a href="#" className="text-slate-500 hover:text-slate-400 underline">Privacy Policy</a>
            </p>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Sign in</Link>
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

export default Register;
