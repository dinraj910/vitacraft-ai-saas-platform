import { useState, useRef } from 'react';
import { Upload, X, FileText, Loader2, Search, ChevronDown, ChevronUp } from 'lucide-react';

const INITIAL = {
  jobDescription: '',
  targetRole: '',
  experienceLevel: '',
  industry: '',
  customInstructions: '',
};

const ResumeAnalyzerForm = ({ onSubmit, isLoading }) => {
  const [form, setForm]             = useState(INITIAL);
  const [file, setFile]             = useState(null);
  const [errors, setErrors]         = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.type !== 'application/pdf') {
        setErrors({ ...errors, file: 'Only PDF files are accepted' });
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, file: 'File must be under 5 MB' });
        return;
      }
      setFile(selected);
      setErrors({ ...errors, file: '' });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      if (dropped.type !== 'application/pdf') {
        setErrors({ ...errors, file: 'Only PDF files are accepted' });
        return;
      }
      if (dropped.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, file: 'File must be under 5 MB' });
        return;
      }
      setFile(dropped);
      setErrors({ ...errors, file: '' });
    }
  };

  const removeFile = () => {
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const validate = () => {
    const e = {};
    if (!file) e.file = 'Please upload your resume PDF';
    if (!form.jobDescription.trim()) e.jobDescription = 'Job description is required';
    else if (form.jobDescription.trim().length < 50) e.jobDescription = 'Please paste a more complete job description (at least 50 characters)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Build FormData for multipart upload
      const formData = new FormData();
      formData.append('resumeFile', file);
      formData.append('jobDescription', form.jobDescription);
      if (form.targetRole) formData.append('targetRole', form.targetRole);
      if (form.experienceLevel) formData.append('experienceLevel', form.experienceLevel);
      if (form.industry) formData.append('industry', form.industry);
      if (form.customInstructions) formData.append('customInstructions', form.customInstructions);
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* PDF Upload Drop Zone */}
      <div>
        <label className="input-label">Upload Resume (PDF) *</label>
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => !file && inputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
            ${dragActive
              ? 'border-emerald-500/60 bg-emerald-500/10'
              : file
                ? 'border-emerald-500/40 bg-emerald-500/5'
                : errors.file
                  ? 'border-red-500/50 bg-red-500/5 hover:border-red-500/60'
                  : 'border-dark-600 hover:border-dark-500 bg-dark-800/50 hover:bg-dark-800'
            }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          {file ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <FileText className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-left">
                <p className="text-white text-sm font-medium truncate max-w-[250px]">{file.name}</p>
                <p className="text-slate-500 text-xs">{(file.size / 1024).toFixed(1)} KB · PDF</p>
              </div>
              <button type="button" onClick={(e) => { e.stopPropagation(); removeFile(); }}
                className="ml-2 p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="py-4">
              <div className="w-12 h-12 rounded-xl bg-dark-700 border border-dark-600 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-5 h-5 text-slate-400" />
              </div>
              <p className="text-slate-300 text-sm font-medium">
                Drop your resume PDF here or <span className="text-emerald-400">browse</span>
              </p>
              <p className="text-slate-600 text-xs mt-1">PDF only · Max 5 MB · Text-based resumes work best</p>
            </div>
          )}
        </div>
        {errors.file && <p className="input-error mt-1.5">{errors.file}</p>}
      </div>

      {/* Job Description */}
      <div>
        <label className="input-label">Job Description *</label>
        <textarea name="jobDescription" value={form.jobDescription} onChange={onChange} rows={8}
          placeholder={`Paste the full job description you want to match against. Example:\n\nWe are looking for a Senior Software Engineer...\n\nResponsibilities:\n- Design and build scalable microservices\n- Mentor junior engineers\n\nRequirements:\n- 5+ years of experience with Python or Go\n- Strong knowledge of distributed systems`}
          className={`input-field resize-none ${errors.jobDescription ? 'border-red-500/70' : ''}`} />
        {errors.jobDescription && <p className="input-error">{errors.jobDescription}</p>}
      </div>

      {/* Advanced / Personalization toggle */}
      <div className="border-t border-dark-700 pt-4">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors w-full"
        >
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span className="font-medium">Personalization Options</span>
          <span className="text-xs text-slate-600">(optional — improves analysis)</span>
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 pl-1 border-l-2 border-emerald-500/20 ml-2">
            <div className="pl-4 space-y-4">
              {/* Target Role + Experience Level */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Target Role</label>
                  <input name="targetRole" value={form.targetRole} onChange={onChange}
                    placeholder="e.g., Senior Frontend Developer"
                    className="input-field" />
                </div>
                <div>
                  <label className="input-label">Experience Level</label>
                  <select name="experienceLevel" value={form.experienceLevel} onChange={onChange} className="input-field">
                    <option value="">Not specified</option>
                    <option value="entry">Entry Level (0–2 years)</option>
                    <option value="mid">Mid Level (3–5 years)</option>
                    <option value="senior">Senior (5–8 years)</option>
                    <option value="lead">Lead / Staff (8+ years)</option>
                    <option value="executive">Director / Executive</option>
                  </select>
                </div>
              </div>

              {/* Industry */}
              <div>
                <label className="input-label">Industry</label>
                <input name="industry" value={form.industry} onChange={onChange}
                  placeholder="e.g., Fintech, Healthcare, SaaS, E-commerce"
                  className="input-field" />
              </div>

              {/* Custom Instructions */}
              <div>
                <label className="input-label">Custom Instructions</label>
                <textarea name="customInstructions" value={form.customInstructions} onChange={onChange} rows={2}
                  placeholder="e.g., 'Focus on ATS keyword density', 'Check if my resume works for a career switch from backend to fullstack'"
                  className="input-field resize-none" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Submit */}
      <button type="submit" disabled={isLoading} className="btn-primary w-full py-4 text-base">
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            AI is analyzing your resume... (5–15 seconds)
          </>
        ) : (
          <>
            <Search className="w-5 h-5" />
            Analyze Resume — 1 Credit
          </>
        )}
      </button>

      {isLoading && (
        <p className="text-center text-xs text-slate-500">
          ⏳ Please wait — the AI is comparing your resume against the job description
        </p>
      )}
    </form>
  );
};

export default ResumeAnalyzerForm;
