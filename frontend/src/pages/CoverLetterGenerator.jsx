import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, AlertCircle, Zap } from 'lucide-react';
import CoverLetterForm from '../components/ai/CoverLetterForm';
import GeneratedOutput from '../components/ai/GeneratedOutput';
import CreditBadge     from '../components/dashboard/CreditBadge';
import { aiAPI, filesAPI } from '../api/ai.api';
import useCredits      from '../hooks/useCredits';
import useAuthStore    from '../store/authStore';

const CoverLetterGenerator = () => {
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastForm, setLastForm]   = useState(null);

  const { hasCredits, updateCredits } = useCredits();
  const user = useAuthStore((s) => s.user);

  const handleGenerate = async (formData) => {
    setIsLoading(true);
    setError('');
    setLastForm(formData);

    try {
      const response = await aiAPI.generateCoverLetter(formData);
      const { data, meta } = response.data;

      // Get signed download URL for the PDF
      let downloadUrl = null;
      if (data.s3Key) {
        try {
          const filesResponse = await filesAPI.getFiles();
          const file = filesResponse.data.data?.find((f) => f.s3Key === data.s3Key);
          if (file) downloadUrl = file.downloadUrl;
        } catch {
          // Signed URL fetch failed — PDF still exists in S3
        }
      }

      setResult({
        text:             data.text,
        s3Key:            data.s3Key,
        processingMs:     data.processingMs,
        model:            data.model || 'AI',
        provider:         data.provider,
        creditsRemaining: meta.creditsRemaining,
        downloadUrl,
      });

      updateCredits(meta.creditsRemaining);

    } catch (err) {
      const code = err.response?.data?.error?.code;
      const details = err.response?.data?.error?.details;
      if (code === 'INSUFFICIENT_CREDITS') {
        setError('You have no credits remaining. Please upgrade your plan to continue.');
      } else if (code === 'AI_SERVICE_UNAVAILABLE') {
        setError('The AI service is temporarily unavailable. Please try again in a moment.');
      } else if (code === 'VALIDATION_ERROR' && Array.isArray(details)) {
        setError(details.map((d) => `${d.field}: ${d.message}`).join('\n'));
      } else {
        setError(err.response?.data?.message || 'Generation failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (lastForm) handleGenerate(lastForm);
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="btn-ghost p-2">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <Mail className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-none">Cover Letter Writer</h1>
                <p className="text-xs text-slate-500 mt-0.5">AI-powered personalized cover letters</p>
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
          <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6 text-sm">
            <Zap className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="text-slate-300">
              This generation costs <strong className="text-blue-300">1 credit</strong>.
              You have <strong className="text-blue-300">{user?.creditAccount?.balance ?? 0} credits</strong> remaining.
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
            <h2 className="text-lg font-semibold text-white mb-1">Cover Letter Details</h2>
            <p className="text-slate-400 text-sm mb-6">
              Provide your details and the AI will craft a personalized cover letter.
            </p>
            <CoverLetterForm onSubmit={handleGenerate} isLoading={isLoading} />
          </div>
        ) : (
          <div>
            <GeneratedOutput
              result={result}
              onRegenerate={handleRegenerate}
              isLoading={isLoading}
              type="coverLetter"
            />
            <div className="mt-6 text-center">
              <button onClick={() => setResult(null)} className="btn-secondary">
                ← Write Another Cover Letter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoverLetterGenerator;
