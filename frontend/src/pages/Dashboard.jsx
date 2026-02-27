import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Mail, Briefcase, Zap, TrendingUp, LogOut,
  Sparkles, Settings, Shield, LayoutDashboard, CreditCard,
  ChevronRight, Bell, Menu, X, Clock, ArrowUpRight, Plus,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useAuthStore from '../store/authStore';

/* ─── Credit Bar ─── */
const CreditBar = ({ balance, total }) => {
  const pct = total > 0 ? Math.min((balance / total) * 100, 100) : 0;
  const color =
    pct > 60 ? 'from-green-500 to-green-400' :
    pct > 25 ? 'from-brand-500 to-brand-400' :
               'from-red-500 to-red-400';
  return (
    <div>
      <div className="flex justify-between items-center text-xs mb-1.5">
        <span className="text-slate-500">Credits</span>
        <span className="text-white font-semibold tabular-nums">{balance}<span className="text-slate-600 font-normal"> / {total}</span></span>
      </div>
      <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700 ease-out`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

/* ─── Nav Item ─── */
const NavItem = ({ icon: Icon, label, active, badge, onClick }) => (
  <button onClick={onClick}
    className={`group w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 ${
      active
        ? 'bg-brand-500/12 text-brand-300'
        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
    }`}>
    <Icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
    <span className="flex-1 text-left truncate">{label}</span>
    {badge && <span className="text-[10px] bg-brand-500/20 text-brand-300 px-1.5 py-px rounded-full font-semibold">{badge}</span>}
  </button>
);

/* ─── Stat Card ─── */
const StatCard = ({ label, value, icon: Icon, accent }) => {
  const styles = {
    brand:  'bg-brand-500/8 border-brand-500/15 text-brand-400',
    blue:   'bg-blue-500/8 border-blue-500/15 text-blue-400',
    purple: 'bg-purple-500/8 border-purple-500/15 text-purple-400',
    green:  'bg-green-500/8 border-green-500/15 text-green-400',
  };
  return (
    <div className="bg-dark-900/80 border border-dark-700/50 rounded-xl p-4 hover:border-dark-600/60 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${styles[accent]}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold text-white leading-none mb-0.5">{value}</p>
          <p className="text-[11px] text-slate-500 truncate">{label}</p>
        </div>
      </div>
    </div>
  );
};

/* ─── Tool Card ─── */
const ToolCard = ({ icon: Icon, title, description, credits, badge, onClick, disabled, accent = 'brand' }) => {
  const accents = {
    brand:  { bg: 'bg-brand-500/8 border-brand-500/15', icon: 'text-brand-400', glow: 'group-hover:border-brand-500/30' },
    blue:   { bg: 'bg-blue-500/8 border-blue-500/15',   icon: 'text-blue-400',  glow: 'group-hover:border-blue-500/30' },
    purple: { bg: 'bg-purple-500/8 border-purple-500/15', icon: 'text-purple-400', glow: 'group-hover:border-purple-500/30' },
  };
  const a = accents[accent];
  return (
    <button onClick={onClick} disabled={disabled}
      className={`group w-full text-left p-5 rounded-xl border transition-all duration-200 ${
        disabled
          ? 'bg-dark-900/40 border-dark-800/50 cursor-not-allowed opacity-50'
          : `bg-dark-900/80 border-dark-700/50 hover:bg-dark-900 ${a.glow}`
      }`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${a.bg}`}>
          <Icon className={`w-5 h-5 ${a.icon}`} />
        </div>
        <div className="flex items-center gap-1.5">
          {badge && <span className="text-[10px] bg-dark-700 text-slate-400 px-2 py-0.5 rounded-full font-medium border border-dark-600">{badge}</span>}
          {!disabled && <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />}
        </div>
      </div>
      <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
      <p className="text-slate-500 text-xs leading-relaxed mb-3">{description}</p>
      <span className={`inline-flex items-center gap-1 text-[11px] ${a.icon}`}>
        <Zap className="w-3 h-3" /> {credits} credit{credits !== 1 ? 's' : ''}
      </span>
    </button>
  );
};

/* ════════════════════════════════════════════════════════════════════════
   DASHBOARD
   ════════════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const { logout } = useAuth();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const credits      = user?.creditAccount?.balance ?? 0;
  const totalUsed    = user?.creditAccount?.totalUsed ?? 0;
  const plan         = user?.subscription?.plan?.displayName ?? 'Free';
  const totalCredits = user?.subscription?.plan?.monthlyCredits ?? 5;

  const planBadge = {
    Pro:        'bg-blue-500/15 text-blue-300 border-blue-500/25',
    Enterprise: 'bg-purple-500/15 text-purple-300 border-purple-500/25',
  }[plan] ?? 'bg-dark-700/80 text-slate-400 border-dark-600';

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  };

  const navItems = [
    { key: 'overview', icon: LayoutDashboard, label: 'Overview' },
    { key: 'tools',    icon: Sparkles,        label: 'AI Tools', badge: 'New' },
    { key: 'history',  icon: Clock,           label: 'History' },
    { key: 'billing',  icon: CreditCard,      label: 'Billing' },
    { key: 'settings', icon: Settings,        label: 'Settings' },
  ];

  /* ── Sidebar Content (render function, not component) ── */
  const renderSidebar = (mobile = false) => (
    <div className={`flex flex-col h-full ${mobile ? 'p-4' : 'p-4 pt-5'}`}>
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 px-2 mb-6 shrink-0">
        <div className="w-7 h-7 bg-brand-500/20 border border-brand-500/30 rounded-lg flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
        </div>
        <span className="text-sm font-bold text-white">Vita<span className="text-gradient">Craft</span> AI</span>
      </Link>

      {/* Nav */}
      <nav className="space-y-0.5 flex-1 min-h-0">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">Menu</p>
        {navItems.map((item) => (
          <NavItem key={item.key} icon={item.icon} label={item.label} badge={item.badge}
            active={activeTab === item.key}
            onClick={() => { setActiveTab(item.key); if (mobile) setSidebarOpen(false); }} />
        ))}
        {user?.role === 'ADMIN' && (
          <>
            <div className="h-px bg-dark-700/50 my-2 mx-3" />
            <NavItem icon={Shield} label="Admin" active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} />
          </>
        )}
      </nav>

      {/* Bottom: Credits + User */}
      <div className="shrink-0 border-t border-dark-700/40 pt-3 mt-2 space-y-3">
        <div className="px-1">
          <CreditBar balance={credits} total={totalCredits} />
        </div>
        <div className="flex items-center gap-2.5 px-1">
          <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-brand-600 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate leading-none mb-0.5">{user?.name ?? 'User'}</p>
            <span className={`inline-block text-[10px] px-1.5 py-px rounded-full border font-medium ${planBadge}`}>{plan}</span>
          </div>
          <button onClick={logout} title="Sign out"
            className="p-1 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-dark-950 flex overflow-hidden">

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-dark-900/60 border-r border-dark-700/40">
        {renderSidebar()}
      </aside>

      {/* ── Mobile Overlay ── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-56 bg-dark-900 border-r border-dark-700/40 h-full shadow-2xl shadow-dark-950">
            <button onClick={() => setSidebarOpen(false)}
              className="absolute top-3 right-3 p-1 text-slate-500 hover:text-white rounded-md hover:bg-dark-800 transition-colors">
              <X className="w-4 h-4" />
            </button>
            {renderSidebar(true)}
          </div>
        </div>
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="shrink-0 h-12 bg-dark-950/80 backdrop-blur-md border-b border-dark-800/50 px-4 lg:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1 text-slate-400 hover:text-white">
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-xs font-semibold text-white capitalize">{activeTab}</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="relative p-1.5 text-slate-500 hover:text-white hover:bg-dark-800 rounded-md transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-brand-500 rounded-full" />
            </button>
            <button onClick={() => setActiveTab('settings')} className="p-1.5 text-slate-500 hover:text-white hover:bg-dark-800 rounded-md transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-4 lg:p-6">

            {/* ───── OVERVIEW TAB ───── */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">

                {/* Welcome */}
                <div className="relative overflow-hidden bg-gradient-to-br from-brand-500/10 via-dark-900/80 to-dark-900/80 border border-brand-500/15 rounded-xl p-5">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-slate-500 text-xs mb-0.5">{greeting()},</p>
                      <h1 className="text-lg font-bold text-white">{user?.name?.split(' ')[0] ?? 'there'} 👋</h1>
                      <div className="flex items-center gap-2.5 mt-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${planBadge}`}>{plan} Plan</span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-brand-400" /> {credits} credits left
                        </span>
                      </div>
                    </div>
                    {plan === 'Free' && (
                      <button onClick={() => setActiveTab('billing')}
                        className="btn-primary text-xs px-4 py-2 shrink-0">
                        Upgrade to Pro <ArrowUpRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <StatCard label="Credits Available" value={credits}       icon={Zap}         accent="brand"  />
                  <StatCard label="Docs Generated"    value={totalUsed}     icon={FileText}    accent="blue"   />
                  <StatCard label="Current Plan"      value={plan}          icon={CreditCard}  accent="purple" />
                  <StatCard label="Monthly Limit"     value={totalCredits}  icon={TrendingUp}  accent="green"  />
                </div>

                {/* Quick Actions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">Quick Actions</h3>
                    <button onClick={() => setActiveTab('tools')}
                      className="text-[11px] text-brand-400 hover:text-brand-300 flex items-center gap-0.5">
                      All tools <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <ToolCard icon={FileText} accent="brand" credits={1}
                      title="Resume Generator"
                      description="ATS-optimized resumes tailored to your target role."
                      onClick={() => alert('Coming in Phase 2!')} disabled={credits === 0} />
                    <ToolCard icon={Mail} accent="blue" credits={1} badge="Soon"
                      title="Cover Letter"
                      description="Match your letter to any job posting automatically."
                      disabled />
                    <ToolCard icon={Briefcase} accent="purple" credits={1} badge="Soon"
                      title="Job Analyzer"
                      description="Extract keywords and beat ATS screening systems."
                      disabled />
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Recent Activity</h3>
                  <div className="bg-dark-900/80 border border-dark-700/50 rounded-xl overflow-hidden">
                    {totalUsed === 0 ? (
                      <div className="py-12 text-center">
                        <div className="w-11 h-11 bg-dark-800 border border-dark-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <FileText className="w-5 h-5 text-slate-600" />
                        </div>
                        <p className="text-slate-400 text-sm font-medium">No documents yet</p>
                        <p className="text-slate-600 text-xs mt-1 mb-4">Generate your first AI resume to get started</p>
                        <button onClick={() => setActiveTab('tools')} className="btn-primary text-xs px-4 py-2 mx-auto">
                          <Plus className="w-3 h-3" /> Create document
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-dark-700/40">
                        {[...Array(Math.min(totalUsed, 3))].map((_, i) => (
                          <div key={i} className="flex items-center justify-between px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-brand-500/8 border border-brand-500/15 rounded-lg flex items-center justify-center">
                                <FileText className="w-3.5 h-3.5 text-brand-400" />
                              </div>
                              <div>
                                <p className="text-white text-sm font-medium">Resume — Software Engineer</p>
                                <p className="text-slate-600 text-[11px]">{i + 1}d ago · 1 credit</p>
                              </div>
                            </div>
                            <button className="text-[11px] text-brand-400 hover:text-brand-300 flex items-center gap-0.5">
                              View <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ───── TOOLS TAB ───── */}
            {activeTab === 'tools' && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h2 className="text-lg font-bold text-white mb-0.5">AI Tools</h2>
                  <p className="text-slate-500 text-sm">1 credit per generation · <span className="text-brand-300 font-medium">{credits}</span> remaining</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <ToolCard icon={FileText} accent="brand" credits={1}
                    title="Resume Generator"
                    description="Generate ATS-optimized, role-specific resumes with GPT-powered language tailored to your experience."
                    onClick={() => alert('Coming in Phase 2!')} disabled={credits === 0} />
                  <ToolCard icon={Mail} accent="blue" credits={1} badge="Soon"
                    title="Cover Letter Writer"
                    description="Craft personalized cover letters that match the exact requirements of any job posting."
                    disabled />
                  <ToolCard icon={Briefcase} accent="purple" credits={1} badge="Soon"
                    title="Job Description Analyzer"
                    description="Extract key skills and requirements from any job listing to align your profile perfectly."
                    disabled />
                </div>
              </div>
            )}

            {/* ───── PLACEHOLDER TABS ───── */}
            {['history', 'billing', 'settings'].includes(activeTab) && (
              <div className="flex flex-col items-center justify-center min-h-[45vh] text-center animate-fade-in">
                <div className="w-12 h-12 bg-dark-800 border border-dark-700 rounded-xl flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5 text-slate-600" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-1 capitalize">{activeTab}</h3>
                <p className="text-slate-500 text-xs max-w-[220px]">Coming in Phase 2 — stay tuned!</p>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
