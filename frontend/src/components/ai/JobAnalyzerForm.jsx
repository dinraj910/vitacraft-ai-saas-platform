import { useState } from 'react';
import { Plus, X, Briefcase, Loader2 } from 'lucide-react';

const INITIAL = {
  jobDescription: '',
  skills: [],
};

const JobAnalyzerForm = ({ onSubmit, isLoading }) => {
  const [form, setForm]           = useState(INITIAL);
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors]       = useState({});

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

      {/* Submit */}
      <button type="submit" disabled={isLoading} className="btn-primary w-full py-4 text-base">
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            AI is analyzing the job description... (30–60 seconds)
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
