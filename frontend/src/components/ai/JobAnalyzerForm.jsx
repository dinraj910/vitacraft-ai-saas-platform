import { useState } from 'react';
import { Plus, X, Briefcase, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const INITIAL = {
  jobDescription: '',
  skills: [],
  // Optional personalization fields
  targetRole: '',
  experienceLevel: '',
  industry: '',
  customInstructions: '',
};

const JobAnalyzerForm = ({ onSubmit, isLoading }) => {
  const [form, setForm]           = useState(INITIAL);
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors]       = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s) && form.skills.length < 30) {
      setForm({ ...form, skills: [...form.skills, s] });
      setSkillInput('');
    }
  };

  const removeSkill = (skill) =>
    setForm({ ...form, skills: form.skills.filter((s) => s !== skill) });

  const onSkillKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
  };

  const validate = () => {
    const e = {};
    if (!form.jobDescription.trim()) e.jobDescription = 'Job description is required';
    if (form.jobDescription.trim().length < 50) e.jobDescription = 'Please paste a more complete job description (at least 50 characters)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Job Description */}
      <div>
        <label className="input-label">Job Description *</label>
        <textarea name="jobDescription" value={form.jobDescription} onChange={onChange} rows={10}
          placeholder={`Paste the full job description here. Example:\n\nWe are looking for a Senior Software Engineer to join our platform team.\n\nResponsibilities:\n- Design and build scalable microservices\n- Mentor junior engineers\n- Own end-to-end feature delivery\n\nRequirements:\n- 5+ years of experience with Python or Go\n- Strong knowledge of distributed systems\n- Experience with Kubernetes and AWS`}
          className={`input-field resize-none ${errors.jobDescription ? 'border-red-500/70' : ''}`} />
        {errors.jobDescription && <p className="input-error">{errors.jobDescription}</p>}
      </div>

      {/* Your Skills (optional) */}
      <div>
        <label className="input-label">
          Your Skills <span className="text-slate-500 font-normal">(optional — helps analyze skill gaps)</span>
        </label>
        <div className="flex gap-2 mb-2">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={onSkillKeyDown}
            placeholder="Add your skills to get gap analysis"
            className="input-field"
          />
          <button type="button" onClick={addSkill}
            className="btn-secondary px-4 shrink-0">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {form.skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {form.skills.map((skill) => (
              <span key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs rounded-full">
                {skill}
                <button type="button" onClick={() => removeSkill(skill)}>
                  <X className="w-3 h-3 hover:text-red-400" />
                </button>
              </span>
            ))}
          </div>
        )}
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
          <div className="mt-4 space-y-4 pl-1 border-l-2 border-purple-500/20 ml-2">
            <div className="pl-4 space-y-4">
              {/* Target Role + Experience Level */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Your Target Role</label>
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
                  placeholder="e.g., 'Focus on remote work compatibility', 'Check if my skills match for a career switch from backend to fullstack'"
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
            AI is analyzing the job description... (3–10 seconds)
          </>
        ) : (
          <>
            <Briefcase className="w-5 h-5" />
            Analyze Job Description — 1 Credit
          </>
        )}
      </button>

      {isLoading && (
        <p className="text-center text-xs text-slate-500">
          ⏳ Please wait — the AI model is extracting insights from the job posting
        </p>
      )}
    </form>
  );
};

export default JobAnalyzerForm;
