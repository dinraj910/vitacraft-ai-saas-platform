const { z } = require('zod');

const resumeSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100)
    .trim(),

  jobTitle: z
    .string()
    .min(2, 'Job title is required')
    .max(100)
    .trim(),

  experience: z
    .string()
    .min(20, 'Please provide at least some work experience detail')
    .max(3000, 'Experience description is too long')
    .trim(),

  skills: z
    .union([
      z.array(z.string()).min(1, 'At least one skill required'),
      z.string().min(2, 'Skills are required'),
    ]),

  education: z
    .string()
    .min(5, 'Education is required')
    .max(500)
    .trim(),

  summary: z
    .string()
    .max(500)
    .optional(),
});

const coverLetterSchema = z.object({
  name:       z.string().min(2).max(100).trim(),
  jobTitle:   z.string().min(2).max(100).trim(),
  company:    z.string().min(2).max(100).trim(),
  experience: z.string().min(20).max(2000).trim(),
  skills:     z.union([z.array(z.string()), z.string().min(2)]),
  whyCompany: z.string().max(500).optional(),
});

const jobAnalysisSchema = z.object({
  jobDescription: z
    .string()
    .min(50, 'Please paste the full job description (min 50 characters)')
    .max(5000)
    .trim(),

  skills: z.string().max(500).optional(),
});

module.exports = { resumeSchema, coverLetterSchema, jobAnalysisSchema };