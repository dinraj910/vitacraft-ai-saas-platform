import { useState } from 'react';
import { Plus, X, FileText, Loader2 } from 'lucide-react';

const INITIAL = {
  name: '', jobTitle: '', summary: '',
  experience: '', education: '', skills: [],
};

const ResumeForm = ({ onSubmit, isLoading }) => {
  const [form, setForm]       = useState(INITIAL);
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors]   = useState({});

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
    if (!form.experience.trim()) e.experience = 'Work experience is required';
    if (!form.education.trim())  e.education  = 'Education is required';
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

      {/* Summary */}
      <div>
        <label className="input-label">
          Professional Summary <span className="text-slate-500 font-normal">(optional)</span>
        </label>
        <textarea name="summary" value={form.summary} onChange={onChange} rows={2}
          placeholder="Brief intro about yourself — or leave blank and AI will write one"
          className="input-field resize-none" />
      </div>

      {/* Experience */}
      <div>
        <label className="input-label">Work Experience *</label>
        <textarea name="experience" value={form.experience} onChange={onChange} rows={5}
          placeholder={`Describe your work history. Example:\n\nSoftware Engineer at TechCorp (2021–2024)\n- Built REST APIs with Node.js serving 50k daily users\n- Led migration from monolith to microservices\n\nJunior Developer at Startup (2019–2021)\n- Developed React dashboards`}
          className={`input-field resize-none ${errors.experience ? 'border-red-500/70' : ''}`} />
        {errors.experience && <p className="input-error">{errors.experience}</p>}
      </div>

      {/* Skills */}
      <div>
        <label className="input-label">Skills *</label>
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
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs rounded-full">
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

      {/* Education */}
      <div>
        <label className="input-label">Education *</label>
        <input name="education" value={form.education} onChange={onChange}
          placeholder="B.Tech Computer Science | Kerala University | 2019"
          className={`input-field ${errors.education ? 'border-red-500/70' : ''}`} />
        {errors.education && <p className="input-error">{errors.education}</p>}
      </div>

      {/* Submit */}
      <button type="submit" disabled={isLoading} className="btn-primary w-full py-4 text-base">
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            AI is generating your resume... (this may take 30–60 seconds)
          </>
        ) : (
          <>
            <FileText className="w-5 h-5" />
            Generate Resume — 1 Credit
          </>
        )}
      </button>

      {isLoading && (
        <p className="text-center text-xs text-slate-500">
          ⏳ Please wait — the AI model is working on your resume
        </p>
      )}
    </form>
  );
};

export default ResumeForm;