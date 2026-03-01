import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Download, Copy, Check, RefreshCw, FileText, Clock, Zap, Eye, AlignLeft, ExternalLink } from 'lucide-react';

const GeneratedOutput = ({ result, onRegenerate, isLoading, type = 'resume' }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('formatted'); // 'formatted' | 'raw' | 'pdf'

  const TYPE_CONFIG = {
    resume:       { label: 'Resume',        successMsg: 'Resume generated successfully!',       previewLabel: 'Generated Resume',       tip: 'Download the PDF for a formatted version. Copy the text to paste directly into job portals.', accent: 'brand' },
    coverLetter:  { label: 'Cover Letter',  successMsg: 'Cover letter generated successfully!', previewLabel: 'Generated Cover Letter', tip: 'Download the PDF for a formatted version. Copy the text to personalize further.', accent: 'blue' },
    jobAnalysis:  { label: 'Job Analysis',  successMsg: 'Job analysis complete!',               previewLabel: 'Job Analysis Results',   tip: 'Use these insights to tailor your resume and cover letter to this role.', accent: 'purple' },
  };
  const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.resume;

  const copyText = async () => {
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPDF = () => {
    if (result.downloadUrl) {
      window.open(result.downloadUrl, '_blank');
    } else {
      alert('PDF URL not available. Please try downloading from the History page.');
    }
  };

  // Convert plain text with section headers (ALL CAPS lines) to markdown-like structured output
  const formatTextToStructured = (text) => {
    if (!text) return '';
    return text
      // Convert ALL CAPS lines to markdown headers
      .replace(/^([A-Z][A-Z &\/\-]{2,})$/gm, '\n## $1\n')
      // Convert • bullets to markdown bullets
      .replace(/^[•●▪]/gm, '-')
      // Convert lines starting with - to ensure spacing
      .replace(/^(\s*-\s)/gm, '$1')
      // Add bold to Name | Company | Date patterns in experience
      .replace(/^(.+?\s*\|\s*.+?\s*\|\s*.+)$/gm, '**$1**')
      .trim();
  };

  const hasPdf = !!result.downloadUrl;

  const tabs = [
    { id: 'formatted', label: 'Formatted', icon: FileText },
    { id: 'raw', label: 'Plain Text', icon: AlignLeft },
    ...(hasPdf ? [{ id: 'pdf', label: 'PDF Preview', icon: Eye }] : []),
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-green-500/10 border border-green-500/25 rounded-xl">
        <div className="flex items-center gap-2 text-green-400 text-sm font-semibold">
          <Check className="w-4 h-4" /> {cfg.successMsg}
        </div>
        <div className="flex items-center gap-3 ml-auto text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {(result.processingMs / 1000).toFixed(1)}s
          </span>
          {result.model && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-dark-800 rounded-full text-slate-500">
              {result.model}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-brand-400" />
            {result.creditsRemaining} credits left
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {hasPdf && (
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

      {/* Tab switcher */}
      <div className="flex gap-1 p-1 bg-dark-800/50 rounded-xl border border-dark-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-dark-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-300 hover:bg-dark-700/50'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content area */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-dark-700">
          <FileText className="w-4 h-4 text-brand-400" />
          <span className="text-sm font-semibold text-white">{cfg.previewLabel}</span>
          {result.provider && (
            <span className="text-xs text-slate-500 ml-auto">
              Provider: {result.provider}
            </span>
          )}
        </div>

        {/* Formatted view */}
        {activeTab === 'formatted' && (
          <div className="prose prose-invert prose-sm max-w-none
            prose-headings:text-brand-300 prose-headings:font-bold prose-headings:border-b prose-headings:border-dark-700 prose-headings:pb-2 prose-headings:mb-3
            prose-h2:text-base prose-h2:mt-6
            prose-p:text-slate-300 prose-p:leading-relaxed
            prose-li:text-slate-300 prose-li:marker:text-brand-400
            prose-strong:text-white
            max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <ReactMarkdown>
              {formatTextToStructured(result.text)}
            </ReactMarkdown>
          </div>
        )}

        {/* Raw text view */}
        {activeTab === 'raw' && (
          <pre className="whitespace-pre-wrap font-mono text-xs text-slate-300 leading-relaxed max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {result.text}
          </pre>
        )}

        {/* PDF Preview */}
        {activeTab === 'pdf' && hasPdf && (
          <div className="space-y-3">
            <div className="relative bg-dark-900 rounded-lg overflow-hidden border border-dark-700" style={{ height: '600px' }}>
              <iframe
                src={result.downloadUrl}
                title="PDF Preview"
                className="w-full h-full"
                style={{ border: 'none' }}
              />
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
              <ExternalLink className="w-3 h-3" />
              <span>PDF preview may not render in all browsers.</span>
              <button onClick={downloadPDF} className="text-brand-400 hover:text-brand-300 underline">
                Open in new tab
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1">
        💡 {cfg.tip}
      </p>
    </div>
  );
};

export default GeneratedOutput;