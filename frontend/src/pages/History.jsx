import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, FileText, Download, Clock, Zap, Loader2,
  Eye, EyeOff, ChevronLeft, ChevronRight, Cpu,
} from 'lucide-react';
import { aiAPI } from '../api/ai.api';

const TYPE_LABELS = {
  RESUME:          { label: 'Resume',          color: 'text-brand-300 bg-brand-500/15 border-brand-500/30', icon: '📄' },
  COVER_LETTER:    { label: 'Cover Letter',    color: 'text-blue-300 bg-blue-500/15 border-blue-500/30', icon: '✉️' },
  JOB_ANALYSIS:    { label: 'Job Analysis',    color: 'text-purple-300 bg-purple-500/15 border-purple-500/30', icon: '🔍' },
  RESUME_ANALYSIS: { label: 'Resume Analysis', color: 'text-emerald-300 bg-emerald-500/15 border-emerald-500/30', icon: '📊' },
};

const History = () => {
  const [history, setHistory]       = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [page, setPage]             = useState(1);
  const [meta, setMeta]             = useState({ total: 0, totalPages: 1 });

  const LIMIT = 10;

  const loadHistory = async (p = 1) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await aiAPI.getHistory(p, LIMIT);
      setHistory(res.data.data || []);
      setMeta(res.data.meta || { total: 0, totalPages: 1 });
      setPage(p);
    } catch {
      setError('Failed to load history. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadHistory(); }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' at ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getPromptSummary = (gen) => {
    try {
      const p = JSON.parse(gen.prompt);
      if (gen.type === 'RESUME' || gen.type === 'COVER_LETTER') {
        return `${p.name} — ${p.jobTitle}${p.company ? ` at ${p.company}` : ''}`;
      }
      if (gen.type === 'JOB_ANALYSIS') {
        return p.jobDescription?.substring(0, 80) + (p.jobDescription?.length > 80 ? '…' : '');
      }
    } catch { /* ignore */ }
    return '';
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="btn-ghost p-2">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Generation History</h1>
              <p className="text-slate-400 text-sm">
                {meta.total} document{meta.total !== 1 ? 's' : ''} generated
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
          </div>
        )}

        {/* Error */}
        {error && <p className="text-red-400 text-center py-10">{error}</p>}

        {/* Empty */}
        {!isLoading && !error && history.length === 0 && (
          <div className="card text-center py-16">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No documents generated yet</p>
            <Link to="/resume" className="btn-primary mt-4 inline-flex">
              Generate Your First Resume
            </Link>
          </div>
        )}

        {/* History List */}
        <div className="space-y-3">
          {history.map((gen) => {
            const t = TYPE_LABELS[gen.type] || { label: gen.type, color: 'text-slate-300 bg-dark-700 border-dark-600', icon: '📎' };
            const isExpanded = expandedId === gen.id;
            const summary = getPromptSummary(gen);

            return (
              <div key={gen.id} className="card overflow-hidden">
                {/* Main Row */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="p-2.5 bg-dark-800 rounded-xl border border-dark-700 text-lg shrink-0">
                      {t.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${t.color}`}>
                          {t.label}
                        </span>
                        {gen.model && (
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Cpu className="w-3 h-3" /> {gen.model}
                          </span>
                        )}
                      </div>
                      {summary && (
                        <p className="text-sm text-slate-300 truncate">{summary}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(gen.createdAt)}
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

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleExpand(gen.id)}
                      className="btn-ghost text-xs py-2 px-3 gap-1.5"
                      title={isExpanded ? 'Hide content' : 'View content'}
                    >
                      {isExpanded
                        ? <><EyeOff className="w-3.5 h-3.5" /> Hide</>
                        : <><Eye className="w-3.5 h-3.5" /> View</>
                      }
                    </button>
                    {gen.downloadUrl && (
                      <a
                        href={gen.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary text-xs py-2 px-3 gap-1.5"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5" /> PDF
                      </a>
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && gen.response && (
                  <div className="mt-4 pt-4 border-t border-dark-700">
                    <div className="bg-dark-900 rounded-xl p-4 max-h-96 overflow-y-auto">
                      <pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                        {gen.response}
                      </pre>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(gen.response);
                        }}
                        className="btn-ghost text-xs py-1.5 px-3"
                      >
                        📋 Copy Text
                      </button>
                      {gen.downloadUrl && (
                        <a
                          href={gen.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-ghost text-xs py-1.5 px-3"
                        >
                          📥 Download PDF
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => loadHistory(page - 1)}
              disabled={page <= 1}
              className="btn-ghost py-2 px-3 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-sm text-slate-400">
              Page {page} of {meta.totalPages}
            </span>
            <button
              onClick={() => loadHistory(page + 1)}
              disabled={page >= meta.totalPages}
              className="btn-ghost py-2 px-3 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;