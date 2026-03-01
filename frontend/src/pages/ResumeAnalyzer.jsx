import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, AlertCircle, Zap } from 'lucide-react';
import ResumeAnalyzerForm from '../components/ai/ResumeAnalyzerForm';
import GeneratedOutput from '../components/ai/GeneratedOutput';
import CreditBadge     from '../components/dashboard/CreditBadge';
import { aiAPI }       from '../api/ai.api';
import useCredits      from '../hooks/useCredits';
import useAuthStore    from '../store/authStore';

const ResumeAnalyzer = () => {
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastForm, setLastForm]   = useState(null);

  const { hasCredits, updateCredits } = useCredits();
  const user = useAuthStore((s) => s.user);

  const handleAnalyze = async (formData) => {
    setIsLoading(true);
    setError('');
    setLastForm(formData);

    try {
      const response = await aiAPI.analyzeResume(formData);
      const { data, meta } = response.data;

      setResult({
        text:             data.text,
        processingMs:     data.processingMs,
        model:            data.model || 'AI',
        provider:         data.provider,
        creditsRemaining: meta.creditsRemaining,
        resumeFileName:   data.resumeFileName,
      });

      updateCredits(meta.creditsRemaining);

    } catch (err) {
      const code = err.response?.data?.error?.code;
      const details = err.response?.data?.error?.details;
      if (code === 'INSUFFICIENT_CREDITS') {
        setError('You have no credits remaining. Please upgrade your plan to continue.');
      } else if (code === 'AI_SERVICE_UNAVAILABLE') {
        setError('The AI service is temporarily unavailable. Please try again in a moment.');
      } else if (code === 'PDF_PARSE_ERROR' || code === 'PDF_EMPTY') {
        setError(err.response?.data?.message || 'Could not read the PDF. Please upload a valid text-based PDF.');
      } else if (code === 'VALIDATION_ERROR' && Array.isArray(details)) {
        setError(details.map((d) => `${d.field}: ${d.message}`).join('\n'));
      } else {
        setError(err.response?.data?.message || 'Analysis failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (lastForm) handleAnalyze(lastForm);
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="btn-ghost p-2">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-emerald-500/20 border border-emerald-500/30 rounded-lg">
                <Search className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-none">ATS Resume Analyzer</h1>
                <p className="text-xs text-slate-500 mt-0.5">Upload your resume & compare against any job description</p>
              </div>
            </div>
          </div>
          <CreditBadge />
        </div>

        {/* No credits warning */}
        {!hasCredits && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-6">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-semibold text-sm">No credits remaining</p>
              <p className="text-red-400/70 text-xs mt-0.5">
                Upgrade to Pro for 50 credits/month.{' '}
                <Link to="/billing" className="underline hover:text-red-300">Upgrade now</Link>
              </p>
            </div>
          </div>
        )}

        {/* Credit cost notice */}
        {hasCredits && !result && (
          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-6 text-sm">
            <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-slate-300">
              This analysis costs <strong className="text-emerald-300">1 credit</strong>.
              You have <strong className="text-emerald-300">{user?.creditAccount?.balance ?? 0} credits</strong> remaining.
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-6">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm whitespace-pre-line">{error}</p>
          </div>
        )}

        {/* Main content */}
        {!result ? (
          <div className="card">
            <h2 className="text-lg font-semibold text-white mb-1">Analyze Your Resume</h2>
            <p className="text-slate-400 text-sm mb-6">
              Upload your PDF resume and paste the target job description. The AI will compare them and provide a detailed ATS compatibility analysis with improvement suggestions.
            </p>
            <ResumeAnalyzerForm onSubmit={handleAnalyze} isLoading={isLoading} />
          </div>
        ) : (
          <div>
            {result.resumeFileName && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-sm">
                <Search className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-400">Analyzed:</span>
                <span className="text-emerald-300 font-medium">{result.resumeFileName}</span>
              </div>
            )}
            <GeneratedOutput
              result={result}
              onRegenerate={handleRegenerate}
              isLoading={isLoading}
              type="resumeAnalysis"
            />
            <div className="mt-6 text-center">
              <button onClick={() => setResult(null)} className="btn-secondary">
                ← Analyze Another Resume
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
