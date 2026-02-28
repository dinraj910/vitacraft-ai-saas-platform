import { useState } from 'react';
import { Download, Copy, Check, RefreshCw, FileText, Clock, Zap } from 'lucide-react';

const GeneratedOutput = ({ result, onRegenerate, isLoading }) => {
  const [copied, setCopied] = useState(false);

  const copyText = async () => {
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPDF = () => {
    if (result.downloadUrl) {
      window.open(result.downloadUrl, '_blank');
    } else {
      alert('PDF URL not available. Please use the download button after page refresh.');
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-green-500/10 border border-green-500/25 rounded-xl">
        <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
          <Check className="w-4 h-4" /> Resume generated successfully!
        </div>
        <div className="flex items-center gap-3 ml-auto text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {(result.processingMs / 1000).toFixed(1)}s
          </span>
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-brand-400" />
            {result.creditsRemaining} credits left
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        {result.downloadUrl && (
          <button onClick={downloadPDF} className="btn-primary gap-2">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        )}
        <button onClick={copyText} className="btn-secondary gap-2">
          {copied ? <><Check className="w-4 h-4 text-green-400" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Text</>}
        </button>
        <button onClick={onRegenerate} disabled={isLoading} className="btn-ghost gap-2 ml-auto">
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Regenerate
        </button>
      </div>

      {/* Generated text preview */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-dark-700">
          <FileText className="w-4 h-4 text-brand-400" />
          <span className="text-sm font-semibold text-white">Generated Resume</span>
          <span className="text-xs text-slate-500 ml-auto">AI Model: {result.model}</span>
        </div>
        <pre className="whitespace-pre-wrap font-mono text-xs text-slate-300 leading-relaxed max-h-[500px] overflow-y-auto">
          {result.text}
        </pre>
      </div>

      <p className="text-xs text-slate-500 text-center">
        💡 Download the PDF for a formatted version. Copy the text to paste directly into job portals.
      </p>
    </div>
  );
};

export default GeneratedOutput;