import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Clock, Zap, Loader2 } from 'lucide-react';
import { aiAPI } from '../api/ai.api';

const TYPE_LABELS = {
  RESUME:       { label: 'Resume',       color: 'text-brand-300 bg-brand-500/15 border-brand-500/30' },
  COVER_LETTER: { label: 'Cover Letter', color: 'text-blue-300 bg-blue-500/15 border-blue-500/30' },
  JOB_ANALYSIS: { label: 'Job Analysis', color: 'text-purple-300 bg-purple-500/15 border-purple-500/30' },
};

const History = () => {
  const [history, setHistory]   = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await aiAPI.getHistory();
        setHistory(res.data.data || []);
      } catch {
        setError('Failed to load history. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="max-w-4xl mx-auto px-4 py-8">

        <div className="flex items-center gap-3 mb-8">
          <Link to="/dashboard" className="btn-ghost p-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Generation History</h1>
            <p className="text-slate-400 text-sm">All your AI-generated documents</p>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
          </div>
        )}

        {error && <p className="text-red-400 text-center py-10">{error}</p>}

        {!isLoading && !error && history.length === 0 && (
          <div className="card text-center py-16">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No documents generated yet</p>
            <Link to="/resume" className="btn-primary mt-4 inline-flex">Generate Your First Resume</Link>
          </div>
        )}

        <div className="space-y-3">
          {history.map((gen) => {
            const t = TYPE_LABELS[gen.type] || { label: gen.type, color: 'text-slate-300 bg-dark-700 border-dark-600' };
            return (
              <div key={gen.id} className="card flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-dark-800 rounded-xl border border-dark-700">
                    <FileText className="w-5 h-5 text-brand-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${t.color}`}>
                        {t.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
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
                    className="btn-secondary text-xs py-2 px-4 gap-1.5">
                    <Download className="w-3.5 h-3.5" /> PDF
                  </a>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default History;