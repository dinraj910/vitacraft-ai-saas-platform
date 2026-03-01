import { useState } from 'react';
import { Plus, X, Mail, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const INITIAL = {
  name: '', jobTitle: '', company: '',
  experience: '', whyCompany: '', skills: [],
  // Optional personalization fields
  tone: '',
  hiringManager: '',
  achievements: '',
  customInstructions: '',
};

const CoverLetterForm = ({ onSubmit, isLoading }) => {
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
    if (s && !form.skills.includes(s) && form.skills.length < 20) {
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
    if (!form.name.trim())       e.name       = 'Full name is required';
    if (!form.jobTitle.trim())   e.jobTitle   = 'Target job title is required';
    if (!form.company.trim())    e.company    = 'Company name is required';
    if (!form.experience.trim()) e.experience = 'Work experience is required';
    else if (form.experience.trim().length < 20) e.experience = 'Please provide more detail (at least 20 characters)';
    if (form.skills.length === 0) e.skills    = 'Add at least one skill';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Name + Job Title */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="input-label">Full Name *</label>
          <input name="name" value={form.name} onChange={onChange}
            placeholder="Alex Johnson" className={`input-field ${errors.name ? 'border-red-500/70' : ''}`} />
          {errors.name && <p className="input-error">{errors.name}</p>}
        </div>
        <div>
          <label className="input-label">Target Job Title *</label>
          <input name="jobTitle" value={form.jobTitle} onChange={onChange}
            placeholder="Senior Software Engineer" className={`input-field ${errors.jobTitle ? 'border-red-500/70' : ''}`} />
          {errors.jobTitle && <p className="input-error">{errors.jobTitle}</p>}
        </div>
      </div>

      {/* Company */}
      <div>
        <label className="input-label">Company Name *</label>
        <input name="company" value={form.company} onChange={onChange}
          placeholder="Google, Microsoft, etc." className={`input-field ${errors.company ? 'border-red-500/70' : ''}`} />
        {errors.company && <p className="input-error">{errors.company}</p>}
      </div>

      {/* Experience */}
      <div>
        <label className="input-label">Relevant Experience *</label>
        <textarea name="experience" value={form.experience} onChange={onChange} rows={5}
          placeholder={`Describe your relevant experience. Example:\n\n3+ years building scalable web applications with React and Node.js.\nLed a team of 4 to deliver a customer portal used by 10k+ users.\nImplemented CI/CD pipelines reducing deploy time by 60%.`}
          className={`input-field resize-none ${errors.experience ? 'border-red-500/70' : ''}`} />
        {errors.experience && <p className="input-error">{errors.experience}</p>}
      </div>

      {/* Skills */}
      <div>
        <label className="input-label">Key Skills *</label>
        <div className="flex gap-2 mb-2">
          <input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={onSkillKeyDown}
            placeholder="Type a skill and press Enter or +"
            className={`input-field ${errors.skills ? 'border-red-500/70' : ''}`}
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
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs rounded-full">
                {skill}
                <button type="button" onClick={() => removeSkill(skill)}>
                  <X className="w-3 h-3 hover:text-red-400" />
                </button>
              </span>
            ))}
          </div>
        )}
        {errors.skills && <p className="input-error">{errors.skills}</p>}
      </div>

      {/* Why this company */}
      <div>
        <label className="input-label">
          Why This Company? <span className="text-slate-500 font-normal">(optional — improves personalization)</span>
        </label>
        <textarea name="whyCompany" value={form.whyCompany} onChange={onChange} rows={3}
          placeholder="What excites you about the company? e.g., their mission, recent product launch, engineering culture…"
          className="input-field resize-none" />
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
          <span className="text-xs text-slate-600">(optional — improves results)</span>
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4 pl-1 border-l-2 border-blue-500/20 ml-2">
            <div className="pl-4 space-y-4">
              {/* Tone + Hiring Manager */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Letter Tone</label>
                  <select name="tone" value={form.tone} onChange={onChange} className="input-field">
                    <option value="">Auto (Professional)</option>
                    <option value="formal">Formal & Corporate</option>
                    <option value="enthusiastic">Enthusiastic & Passionate</option>
                    <option value="confident">Confident & Direct</option>
                    <option value="creative">Creative & Storytelling</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Hiring Manager Name</label>
                  <input name="hiringManager" value={form.hiringManager} onChange={onChange}
                    placeholder="e.g., Sarah Chen (leave blank for 'Hiring Manager')"
                    className="input-field" />
                </div>
              </div>

              {/* Key Achievements */}
              <div>
                <label className="input-label">Key Achievement to Highlight</label>
                <textarea name="achievements" value={form.achievements} onChange={onChange} rows={2}
                  placeholder="e.g., Increased revenue by 30% through a new feature I designed and shipped"
                  className="input-field resize-none" />
              </div>

              {/* Custom Instructions */}
              <div>
                <label className="input-label">Custom Instructions</label>
                <textarea name="customInstructions" value={form.customInstructions} onChange={onChange} rows={2}
                  placeholder="Any special requests? e.g., 'Mention my open source contributions', 'Keep it under 300 words'"
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
            AI is writing your cover letter... (3–10 seconds)
          </>
        ) : (
          <>
            <Mail className="w-5 h-5" />
            Generate Cover Letter — 1 Credit
          </>
        )}
      </button>

      {isLoading && (
        <p className="text-center text-xs text-slate-500">
          ⏳ Please wait — the AI model is crafting your cover letter
        </p>
      )}
    </form>
  );
};

export default CoverLetterForm;
