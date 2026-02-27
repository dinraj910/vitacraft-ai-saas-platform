import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const checks = (p) => [
  { label: '8+ characters', ok: p.length >= 8 },
  { label: 'Uppercase', ok: /[A-Z]/.test(p) },
  { label: 'Lowercase', ok: /[a-z]/.test(p) },
  { label: 'Number', ok: /\d/.test(p) },
];
const colors = ['', 'bg-red-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'];

const PasswordStrength = ({ password }) => {
  if (!password) return null;
  const list   = checks(password);
  const passed = list.filter((c) => c.ok).length;
  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1,2,3,4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= passed ? colors[passed] : 'bg-dark-700'}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {list.map((c) => (
          <span key={c.label} className={`text-xs flex items-center gap-1 ${c.ok ? 'text-green-400' : 'text-slate-500'}`}>
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

  return (
    <div className="auth-container">
      <div className="w-full max-w-md animate-slide-up">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-500/20 border border-brand-500/30 rounded-2xl mb-4 glow-brand">
            <Sparkles className="w-7 h-7 text-brand-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Vita<span className="text-gradient">Craft</span> AI</h1>
          <p className="text-slate-400 mt-2 text-sm">Your AI-powered career document suite</p>
        </div>

        <div className="card-glass">
          <h2 className="text-xl font-semibold text-white mb-1">Create your account</h2>
          <p className="text-slate-400 text-sm mb-6">
            Start with <span className="text-brand-400 font-semibold">5 free AI credits</span>
          </p>

          {error && (
            <div className="flex items-center gap-3 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl mb-5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="input-label" htmlFor="name">Full name</label>
              <input id="name" name="name" type="text" required value={form.name} onChange={onChange}
                placeholder="Alex Johnson"
                className={`input-field ${fieldErr.name ? 'border-red-500/70' : ''}`} />
              {fieldErr.name && <p className="input-error"><AlertCircle className="w-3 h-3" />{fieldErr.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="input-label" htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" required value={form.email} onChange={onChange}
                placeholder="you@example.com"
                className={`input-field ${fieldErr.email ? 'border-red-500/70' : ''}`} />
              {fieldErr.email && <p className="input-error"><AlertCircle className="w-3 h-3" />{fieldErr.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="input-label" htmlFor="password">Password</label>
              <div className="relative">
                <input id="password" name="password" type={showPwd ? 'text' : 'password'} required
                  value={form.password} onChange={onChange} placeholder="Create a strong password"
                  className={`input-field pr-12 ${fieldErr.password ? 'border-red-500/70' : ''}`} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErr.password
                ? <p className="input-error"><AlertCircle className="w-3 h-3" />{fieldErr.password}</p>
                : <PasswordStrength password={form.password} />}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating account...</>
                : 'Create free account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
          </p>
        </div>
        <p className="text-center text-xs text-slate-600 mt-6">© 2026 VitaCraft AI</p>
      </div>
    </div>
  );
};

export default Register;