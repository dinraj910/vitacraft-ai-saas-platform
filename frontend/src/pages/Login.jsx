import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';
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

  return (
    <div className="auth-container">
      <div className="w-full max-w-md animate-slide-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-500/20 border border-brand-500/30 rounded-2xl mb-4 glow-brand">
            <Sparkles className="w-7 h-7 text-brand-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Vita<span className="text-gradient">Craft</span> AI</h1>
          <p className="text-slate-400 mt-2 text-sm">Your AI-powered career document suite</p>
        </div>

        {/* Card */}
        <div className="card-glass">
          <h2 className="text-xl font-semibold text-white mb-1">Welcome back</h2>
          <p className="text-slate-400 text-sm mb-6">Sign in to your account to continue</p>

          {error && (
            <div className="flex items-center gap-3 p-3.5 bg-red-500/10 border border-red-500/30 rounded-xl mb-5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="input-label" htmlFor="email">Email address</label>
              <input id="email" name="email" type="email" required value={form.email} onChange={onChange}
                placeholder="you@example.com" className="input-field" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="input-label mb-0" htmlFor="password">Password</label>
                <a href="#" className="text-xs text-brand-400 hover:text-brand-300">Forgot password?</a>
              </div>
              <div className="relative">
                <input id="password" name="password" type={showPwd ? 'text' : 'password'} required
                  value={form.password} onChange={onChange} placeholder="Enter your password"
                  className="input-field pr-12" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">Create one free</Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">© 2026 VitaCraft AI</p>
      </div>
    </div>
  );
};

export default Login;