import { FileText, Mail, Briefcase, Zap, TrendingUp, Clock, LogOut, Sparkles, ChevronRight, Settings, Shield } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useAuthStore from '../store/authStore';

const CreditBar = ({ balance, total = 5 }) => {
  const pct = Math.min((balance / total) * 100, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">Credits remaining</span>
        <span className="text-brand-300 font-semibold">{balance} / {total}</span>
      </div>
      <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, credits, badge, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}
    className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 group
      ${disabled ? 'bg-dark-900/40 border-dark-700/50 opacity-50 cursor-not-allowed'
                 : 'bg-dark-900 border-dark-700 hover:border-brand-500/40 hover:bg-dark-800'}`}>
    <div className="flex items-start justify-between mb-3">
      <div className={`p-2.5 rounded-xl ${disabled ? 'bg-dark-800' : 'bg-brand-500/15 group-hover:bg-brand-500/25 transition-colors'}`}>
        <Icon className={`w-5 h-5 ${disabled ? 'text-slate-600' : 'text-brand-400'}`} />
      </div>
      <div className="flex items-center gap-2">
        {badge && <span className="text-xs bg-dark-700 text-slate-400 px-2 py-0.5 rounded-full border border-dark-600">{badge}</span>}
        {!disabled && <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-brand-400 transition-colors" />}
      </div>
    </div>
    <h3 className="font-semibold text-white mb-1 text-sm">{title}</h3>
    <p className="text-slate-400 text-xs leading-relaxed mb-3">{description}</p>
    <div className="flex items-center gap-1.5">
      <Zap className="w-3 h-3 text-brand-400" />
      <span className="text-xs text-brand-300 font-medium">{credits} credit{credits !== 1 ? 's' : ''}</span>
    </div>
  </button>
);

const StatCard = ({ label, value, icon: Icon, color = 'text-brand-400' }) => (
  <div className="card flex items-center gap-4">
    <div className="p-3 bg-dark-800 rounded-xl border border-dark-700">
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
    <div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-slate-400 text-xs">{label}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { logout } = useAuth();
  const user = useAuthStore((s) => s.user);

  const credits = user?.creditAccount?.balance ?? 0;
  const plan    = user?.subscription?.plan?.displayName ?? 'Free';
  const total   = user?.subscription?.plan?.monthlyCredits ?? 5;

  const planBadge = {
    Pro:        'bg-blue-500/15 text-blue-300 border-blue-500/30',
    Enterprise: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  }[plan] || 'bg-dark-700 text-slate-400 border-dark-600';

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-8">

        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 bg-brand-500/20 border border-brand-500/30 rounded-xl">
              <Sparkles className="w-4 h-4 text-brand-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none">Vita<span className="text-gradient">Craft</span> AI</h1>
              <p className="text-xs text-slate-500 mt-0.5">Career Document Suite</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user?.role === 'ADMIN' && (
              <button className="btn-ghost text-xs"><Shield className="w-3.5 h-3.5" />Admin</button>
            )}
            <button className="btn-ghost"><Settings className="w-4 h-4" /></button>
            <button onClick={logout} className="btn-ghost text-red-400 hover:text-red-300 hover:bg-red-500/10">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Welcome */}
        <div className="card-glass mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-slate-400 text-sm">Welcome back,</p>
            <h2 className="text-2xl font-bold text-white mt-0.5">{user?.name?.split(' ')[0]} 👋</h2>
            <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border mt-2 ${planBadge}`}>
              {plan} Plan
            </span>
          </div>
          <div className="hidden sm:block min-w-[200px]">
            <CreditBar balance={credits} total={total} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Credits Available" value={credits} icon={Zap} />
          <StatCard label="Documents Created" value={user?.creditAccount?.totalUsed ?? 0} icon={TrendingUp} color="text-blue-400" />
          <StatCard label="Current Plan"       value={plan}    icon={Clock}        color="text-purple-400" />
        </div>

        {/* AI Tools */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">AI Tools</h3>
            <p className="text-xs text-slate-500">1 credit per generation</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <FeatureCard icon={FileText} title="Resume Generator"
              description="Create ATS-optimized resumes tailored to your target role"
              credits={1} onClick={() => alert('Coming in Phase 2!')} disabled={credits === 0} />
            <FeatureCard icon={Mail} title="Cover Letter"
              description="Generate compelling cover letters for each application"
              credits={1} badge="Coming Soon" disabled />
            <FeatureCard icon={Briefcase} title="Job Analyzer"
              description="Analyze job descriptions and get keyword recommendations"
              credits={1} badge="Coming Soon" disabled />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="card text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-dark-800 rounded-2xl mb-3 border border-dark-700">
              <FileText className="w-6 h-6 text-slate-600" />
            </div>
            <p className="text-slate-400 text-sm">No documents generated yet</p>
            <p className="text-slate-500 text-xs mt-1">Start by generating your first AI resume above</p>
          </div>
        </div>

        {/* Upgrade Banner */}
        {plan === 'Free' && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-500/10 to-dark-800/50 border border-brand-500/20 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-white text-sm">Unlock more with Pro</p>
              <p className="text-slate-400 text-xs mt-0.5">50 credits/month + Cover Letters + Priority support</p>
            </div>
            <button className="btn-primary text-xs px-4 py-2 shrink-0" onClick={() => alert('Billing — Phase 3!')}>
              Upgrade — $9.99/mo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;