import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, Mail, Briefcase, Zap, TrendingUp, LogOut,
  Sparkles, Settings, Shield, LayoutDashboard, CreditCard,
  ChevronRight, Bell, Menu, X, Clock, ArrowUpRight, Plus,
  Loader2, Download, Check, AlertCircle, ExternalLink, User,
  Lock, Eye, EyeOff,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import useAuthStore from '../store/authStore';
import { aiAPI, filesAPI, billingAPI } from '../api/ai.api';
import { authAPI } from '../api/auth.api';


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
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const credits      = user?.creditAccount?.balance ?? 0;
  const totalUsed    = user?.creditAccount?.totalUsed ?? 0;
  const plan         = user?.subscription?.plan?.displayName ?? 'Free';
  const totalCredits = user?.subscription?.plan?.monthlyCredits ?? 5;

  // ── Phase 2: History state ──────────────────────────────────────────
  const [historyItems, setHistoryItems]     = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError]     = useState('');

  useEffect(() => {
    if (activeTab !== 'history' && activeTab !== 'overview') return;
    if (historyItems.length > 0 && activeTab === 'overview') return; // already loaded
    const load = async () => {
      setHistoryLoading(true);
      setHistoryError('');
      try {
        const res = await aiAPI.getHistory(1, 20);
        setHistoryItems(res.data.data || []);
      } catch {
        setHistoryError('Failed to load history. Please try again.');
      } finally {
        setHistoryLoading(false);
      }
    };
    load();
  }, [activeTab]);

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
                      onClick={() => navigate('/resume')} disabled={credits === 0} />
                    <ToolCard icon={Mail} accent="blue" credits={1}
                      title="Cover Letter"
                      description="Match your letter to any job posting automatically."
                      onClick={() => navigate('/cover-letter')} disabled={credits === 0} />
                    <ToolCard icon={Briefcase} accent="purple" credits={1}
                      title="Job Analyzer"
                      description="Extract keywords and beat ATS screening systems."
                      onClick={() => navigate('/job-analyzer')} disabled={credits === 0} />
                  </div>
                </div>

                {/* Recent Activity */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Recent Activity</h3>
                  <div className="bg-dark-900/80 border border-dark-700/50 rounded-xl overflow-hidden">
                    {historyItems.length === 0 ? (
                      <div className="py-12 text-center">
                        <div className="w-11 h-11 bg-dark-800 border border-dark-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <FileText className="w-5 h-5 text-slate-600" />
                        </div>
                        <p className="text-slate-400 text-sm font-medium">No documents yet</p>
                        <p className="text-slate-600 text-xs mt-1 mb-4">Generate your first AI document to get started</p>
                        <button onClick={() => setActiveTab('tools')} className="btn-primary text-xs px-4 py-2 mx-auto">
                          <Plus className="w-3 h-3" /> Create document
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-dark-700/40">
                        {historyItems.slice(0, 3).map((gen) => {
                          const TYPE_META = {
                            RESUME:       { label: 'Resume',       icon: 'text-brand-400', bg: 'bg-brand-500/8 border-brand-500/15' },
                            COVER_LETTER: { label: 'Cover Letter', icon: 'text-blue-400',  bg: 'bg-blue-500/8 border-blue-500/15' },
                            JOB_ANALYSIS: { label: 'Job Analysis', icon: 'text-purple-400', bg: 'bg-purple-500/8 border-purple-500/15' },
                          };
                          const m = TYPE_META[gen.type] || TYPE_META.RESUME;
                          const timeAgo = (() => {
                            const diff = Date.now() - new Date(gen.createdAt).getTime();
                            const mins = Math.floor(diff / 60000);
                            if (mins < 60) return `${mins}m ago`;
                            const hrs = Math.floor(mins / 60);
                            if (hrs < 24) return `${hrs}h ago`;
                            return `${Math.floor(hrs / 24)}d ago`;
                          })();
                          return (
                            <div key={gen.id} className="flex items-center justify-between px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${m.bg}`}>
                                  <FileText className={`w-3.5 h-3.5 ${m.icon}`} />
                                </div>
                                <div>
                                  <p className="text-white text-sm font-medium">{m.label}</p>
                                  <p className="text-slate-600 text-[11px]">{timeAgo} · {gen.creditsUsed} credit</p>
                                </div>
                              </div>
                              {gen.downloadUrl && (
                                <a href={gen.downloadUrl} target="_blank" rel="noreferrer"
                                  className="text-[11px] text-brand-400 hover:text-brand-300 flex items-center gap-0.5">
                                  Download <Download className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          );
                        })}
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
                    onClick={() => navigate('/resume')} disabled={credits === 0} />
                  <ToolCard icon={Mail} accent="blue" credits={1}
                    title="Cover Letter Writer"
                    description="Craft personalized cover letters that match the exact requirements of any job posting."
                    onClick={() => navigate('/cover-letter')} disabled={credits === 0} />
                  <ToolCard icon={Briefcase} accent="purple" credits={1}
                    title="Job Description Analyzer"
                    description="Extract key skills and requirements from any job listing to align your profile perfectly."
                    onClick={() => navigate('/job-analyzer')} disabled={credits === 0} />
                </div>
              </div>
            )}

            {/* ───── HISTORY TAB ───── */}
            {activeTab === 'history' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <h2 className="text-lg font-bold text-white mb-0.5">Generation History</h2>
                  <p className="text-slate-500 text-sm">All your AI-generated documents</p>
                </div>

                {historyLoading && (
                  <div className="flex justify-center py-20">
                    <Loader2 className="w-7 h-7 text-brand-400 animate-spin" />
                  </div>
                )}

                {historyError && (
                  <p className="text-red-400 text-sm text-center py-10">{historyError}</p>
                )}

                {!historyLoading && !historyError && historyItems.length === 0 && (
                  <div className="bg-dark-900/80 border border-dark-700/50 rounded-xl py-14 text-center">
                    <div className="w-11 h-11 bg-dark-800 border border-dark-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-5 h-5 text-slate-600" />
                    </div>
                    <p className="text-slate-400 text-sm font-medium">No documents yet</p>
                    <p className="text-slate-600 text-xs mt-1 mb-4">Generate your first AI resume to get started</p>
                    <button onClick={() => navigate('/resume')} className="btn-primary text-xs px-4 py-2 mx-auto">
                      <Plus className="w-3 h-3" /> Create document
                    </button>
                  </div>
                )}

                {!historyLoading && historyItems.length > 0 && (
                  <div className="bg-dark-900/80 border border-dark-700/50 rounded-xl overflow-hidden divide-y divide-dark-700/40">
                    {historyItems.map((gen) => {
                      const TYPE_LABELS = {
                        RESUME:       { label: 'Resume',       color: 'text-brand-300 bg-brand-500/15 border-brand-500/30' },
                        COVER_LETTER: { label: 'Cover Letter', color: 'text-blue-300 bg-blue-500/15 border-blue-500/30' },
                        JOB_ANALYSIS: { label: 'Job Analysis', color: 'text-purple-300 bg-purple-500/15 border-purple-500/30' },
                      };
                      const t = TYPE_LABELS[gen.type] || { label: gen.type, color: 'text-slate-300 bg-dark-700 border-dark-600' };
                      return (
                        <div key={gen.id} className="flex items-center justify-between px-4 py-3.5 gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 bg-brand-500/8 border border-brand-500/15 rounded-lg flex items-center justify-center shrink-0">
                              <FileText className="w-3.5 h-3.5 text-brand-400" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${t.color}`}>
                                  {t.label}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {new Date(gen.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Zap className="w-3 h-3" /> {gen.creditsUsed} credit
                                </span>
                                {gen.processingMs && (
                                  <span>{(gen.processingMs / 1000).toFixed(1)}s</span>
                                )}
                              </div>
                            </div>
                          </div>
                          {gen.downloadUrl && (
                            <a href={gen.downloadUrl} target="_blank" rel="noreferrer"
                              className="btn-secondary text-xs py-1.5 px-3 gap-1.5 shrink-0">
                              <Download className="w-3 h-3" /> PDF
                            </a>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ───── BILLING TAB ───── */}
            {activeTab === 'billing' && (
              <BillingTab credits={credits} totalCredits={totalCredits} plan={plan} planBadge={planBadge} />
            )}

            {/* ───── SETTINGS TAB ───── */}
            {activeTab === 'settings' && (
              <SettingsTab user={user} />
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════
   BILLING TAB
   ════════════════════════════════════════════════════════════════════ */
const PLAN_FEATURES = {
  FREE:       ['5 credits/month', 'Resume Generator', 'Cover Letter Writer', 'Job Analyzer', 'PDF Export'],
  PRO:        ['50 credits/month', 'All Free features', 'Priority AI models', 'Generation history', 'Email support'],
  ENTERPRISE: ['200 credits/month', 'All Pro features', 'Dedicated support', 'Custom templates', 'API access'],
};

const PLAN_PRICES = { FREE: 0, PRO: 9.99, ENTERPRISE: 29.99 };

const BillingTab = ({ credits, totalCredits, plan, planBadge }) => {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState('');
  const [portalLoading, setPortalLoading]     = useState(false);
  const [error, setError]               = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [subRes, plansRes] = await Promise.all([
          billingAPI.getSubscription(),
          billingAPI.getPlans(),
        ]);
        // Flatten the nested response: { subscription: {...}, credits: {...}, recentTransactions: [...] }
        const subData = subRes.data.data;
        setSubscription({
          ...(subData.subscription || {}),
          credits: subData.credits,
          recentTransactions: subData.recentTransactions || [],
        });
        setPlans(plansRes.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load billing info');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleUpgrade = async (planName) => {
    setCheckoutLoading(planName);
    setError('');
    try {
      const res = await billingAPI.createCheckoutSession(planName);
      const { url } = res.data.data;
      if (url) window.location.href = url;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create checkout session');
    } finally {
      setCheckoutLoading('');
    }
  };

  const handleManage = async () => {
    setPortalLoading(true);
    setError('');
    try {
      const res = await billingAPI.createPortalSession();
      const { url } = res.data.data;
      if (url) window.location.href = url;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to open billing portal');
    } finally {
      setPortalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 animate-fade-in">
        <Loader2 className="w-7 h-7 text-brand-400 animate-spin" />
      </div>
    );
  }

  const currentPlanName = subscription?.planName || 'FREE';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white mb-0.5">Billing & Subscription</h2>
        <p className="text-slate-500 text-sm">Manage your plan, credits, and payment method</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Current Plan Overview */}
      <div className="bg-dark-900/80 border border-dark-700/50 rounded-xl p-5">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <p className="text-slate-500 text-xs mb-1">Current Plan</p>
            <div className="flex items-center gap-2">
              <h3 className="text-white text-xl font-bold">{plan}</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${planBadge}`}>Active</span>
            </div>
            {subscription?.status === 'ACTIVE' && currentPlanName !== 'FREE' && (
              <p className="text-slate-500 text-xs mt-1">
                Renews {subscription.currentPeriodEnd
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                  : 'monthly'}
              </p>
            )}
          </div>
          {currentPlanName !== 'FREE' && (
            <button onClick={handleManage} disabled={portalLoading}
              className="btn-secondary text-xs py-2 px-4 gap-1.5">
              {portalLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ExternalLink className="w-3 h-3" />}
              Manage Subscription
            </button>
          )}
        </div>

        {/* Credits Bar */}
        <div className="bg-dark-800/60 rounded-lg p-3.5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 text-xs flex items-center gap-1"><Zap className="w-3 h-3 text-brand-400" /> Credits</span>
            <span className="text-white text-sm font-bold tabular-nums">{credits} <span className="text-slate-500 font-normal text-xs">/ {totalCredits}</span></span>
          </div>
          <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${
                credits / totalCredits > 0.6 ? 'from-green-500 to-green-400' :
                credits / totalCredits > 0.25 ? 'from-brand-500 to-brand-400' :
                'from-red-500 to-red-400'
              }`}
              style={{ width: `${totalCredits > 0 ? Math.min((credits / totalCredits) * 100, 100) : 0}%` }}
            />
          </div>
          <p className="text-slate-600 text-[11px] mt-1.5">Credits reset each billing cycle</p>
        </div>
      </div>

      {/* Plans Grid */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-3">Available Plans</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {['FREE', 'PRO', 'ENTERPRISE'].map((pName) => {
            const isCurrent = currentPlanName === pName;
            const price     = PLAN_PRICES[pName];
            const features  = PLAN_FEATURES[pName];
            const isPopular = pName === 'PRO';

            return (
              <div key={pName}
                className={`relative bg-dark-900/80 border rounded-xl p-5 transition-all ${
                  isCurrent ? 'border-brand-500/40 ring-1 ring-brand-500/20' :
                  isPopular ? 'border-blue-500/30 hover:border-blue-500/50' :
                  'border-dark-700/50 hover:border-dark-600/60'
                }`}>
                {isPopular && !isCurrent && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] bg-blue-500 text-white px-3 py-0.5 rounded-full font-semibold">
                    Popular
                  </span>
                )}
                <div className="mb-4">
                  <h4 className="text-white font-semibold text-sm mb-1">{pName.charAt(0) + pName.slice(1).toLowerCase()}</h4>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">${price}</span>
                    {price > 0 && <span className="text-slate-500 text-xs">/month</span>}
                  </div>
                </div>
                <div className="space-y-2 mb-5">
                  {features.map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs text-slate-400">
                      <Check className="w-3.5 h-3.5 text-green-400 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                {isCurrent ? (
                  <button disabled className="w-full text-center py-2 rounded-lg text-xs font-semibold bg-brand-500/10 text-brand-300 border border-brand-500/20 cursor-default">
                    Current Plan
                  </button>
                ) : pName === 'FREE' ? (
                  <button disabled className="w-full text-center py-2 rounded-lg text-xs font-medium bg-dark-800 text-slate-500 border border-dark-700 cursor-default">
                    Default
                  </button>
                ) : (
                  <button onClick={() => handleUpgrade(pName)}
                    disabled={!!checkoutLoading}
                    className={`w-full text-center py-2 rounded-lg text-xs font-semibold transition-colors ${
                      isPopular
                        ? 'bg-blue-500 hover:bg-blue-600 text-white'
                        : 'bg-brand-500 hover:bg-brand-600 text-white'
                    }`}>
                    {checkoutLoading === pName ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <Loader2 className="w-3 h-3 animate-spin" /> Redirecting…
                      </span>
                    ) : (
                      `Upgrade to ${pName.charAt(0) + pName.slice(1).toLowerCase()}`
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      {subscription?.recentTransactions?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Recent Transactions</h3>
          <div className="bg-dark-900/80 border border-dark-700/50 rounded-xl overflow-hidden divide-y divide-dark-700/40">
            {subscription.recentTransactions.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
                    txn.amount > 0
                      ? 'bg-green-500/8 border-green-500/15'
                      : 'bg-red-500/8 border-red-500/15'
                  }`}>
                    <Zap className={`w-3.5 h-3.5 ${
                      txn.amount > 0 ? 'text-green-400' : 'text-red-400'
                    }`} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{txn.reason?.replace(/_/g, ' ') || 'Transaction'}</p>
                    <p className="text-slate-600 text-[11px]">
                      {new Date(txn.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <span className={`text-sm font-semibold tabular-nums ${
                  txn.amount > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {txn.amount > 0 ? '+' : ''}{txn.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Mode Notice */}
      <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-lg px-4 py-3 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-yellow-300 text-xs font-semibold mb-0.5">Stripe Test Mode</p>
          <p className="text-yellow-200/60 text-[11px] leading-relaxed">
            Payments are in <span className="font-semibold">test mode</span>. Use card <span className="font-mono text-yellow-300/80">4242 4242 4242 4242</span> with
            any future expiry and CVC. No real charges will be made.
          </p>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════
   SETTINGS TAB
   ════════════════════════════════════════════════════════════════════ */
const SettingsTab = ({ user }) => {
  const { logout } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: '', newPass: '', confirm: '' });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (passwordData.newPass.length < 8) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (passwordData.newPass !== passwordData.confirm) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    // Note: Password change API not yet implemented — show info message
    setPasswordMsg({ type: 'info', text: 'Password change functionality will be available soon.' });
    setPasswordData({ current: '', newPass: '', confirm: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-white mb-0.5">Settings</h2>
        <p className="text-slate-500 text-sm">Manage your account and preferences</p>
      </div>

      {/* Profile Info */}
      <div className="bg-dark-900/80 border border-dark-700/50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-brand-400" /> Profile Information
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] text-slate-500 uppercase tracking-wider font-medium mb-1 block">Full Name</label>
            <div className="bg-dark-800/60 border border-dark-700/50 rounded-lg px-3 py-2.5 text-sm text-white">
              {user?.name || 'N/A'}
            </div>
          </div>
          <div>
            <label className="text-[11px] text-slate-500 uppercase tracking-wider font-medium mb-1 block">Email Address</label>
            <div className="bg-dark-800/60 border border-dark-700/50 rounded-lg px-3 py-2.5 text-sm text-white">
              {user?.email || 'N/A'}
            </div>
          </div>
          <div>
            <label className="text-[11px] text-slate-500 uppercase tracking-wider font-medium mb-1 block">Role</label>
            <div className="bg-dark-800/60 border border-dark-700/50 rounded-lg px-3 py-2.5 text-sm text-white capitalize">
              {user?.role?.toLowerCase() || 'user'}
            </div>
          </div>
          <div>
            <label className="text-[11px] text-slate-500 uppercase tracking-wider font-medium mb-1 block">Member Since</label>
            <div className="bg-dark-800/60 border border-dark-700/50 rounded-lg px-3 py-2.5 text-sm text-white">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : 'N/A'}
            </div>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-dark-900/80 border border-dark-700/50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-brand-400" /> Security
        </h3>

        {!showPasswordForm ? (
          <button onClick={() => setShowPasswordForm(true)}
            className="btn-secondary text-xs py-2 px-4 gap-1.5">
            <Lock className="w-3 h-3" /> Change Password
          </button>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-3 max-w-sm">
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider font-medium mb-1 block">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={passwordData.current}
                  onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                  className="w-full bg-dark-800/60 border border-dark-700/50 rounded-lg px-3 py-2.5 text-sm text-white pr-10 focus:outline-none focus:border-brand-500/50"
                  required
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider font-medium mb-1 block">New Password</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={passwordData.newPass}
                  onChange={(e) => setPasswordData({ ...passwordData, newPass: e.target.value })}
                  className="w-full bg-dark-800/60 border border-dark-700/50 rounded-lg px-3 py-2.5 text-sm text-white pr-10 focus:outline-none focus:border-brand-500/50"
                  required
                  minLength={8}
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 uppercase tracking-wider font-medium mb-1 block">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                className="w-full bg-dark-800/60 border border-dark-700/50 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500/50"
                required
              />
            </div>

            {passwordMsg.text && (
              <p className={`text-xs flex items-center gap-1.5 ${
                passwordMsg.type === 'error' ? 'text-red-400' :
                passwordMsg.type === 'success' ? 'text-green-400' :
                'text-blue-400'
              }`}>
                <AlertCircle className="w-3 h-3" /> {passwordMsg.text}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <button type="submit" className="btn-primary text-xs py-2 px-4">Save Password</button>
              <button type="button" onClick={() => { setShowPasswordForm(false); setPasswordMsg({ type: '', text: '' }); }}
                className="btn-secondary text-xs py-2 px-4">Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* Account Actions */}
      <div className="bg-dark-900/80 border border-dark-700/50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-brand-400" /> Account
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">Sign Out</p>
              <p className="text-slate-500 text-xs">Sign out of your account on this device</p>
            </div>
            <button onClick={logout} className="btn-secondary text-xs py-2 px-4 gap-1.5 text-red-400 hover:text-red-300 hover:border-red-500/30">
              <LogOut className="w-3 h-3" /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
