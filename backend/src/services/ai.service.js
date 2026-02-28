const axios  = require('axios');
const { OLLAMA_BASE_URL, OLLAMA_MODEL } = require('../config/ollama');
const logger = require('../utils/logger');

// Timeout: 2 minutes — phi3:mini is slow on CPU
const OLLAMA_TIMEOUT = 120_000;

/**
 * Core Ollama invocation.
 * Calls the /api/generate endpoint with stream:false.
 * Model is loaded on-demand — first request after idle takes ~5s to load.
 */
const generateWithOllama = async (prompt, options = {}) => {
  const {
    maxTokens    = 1000,
    temperature  = 0.7,
    systemPrompt = 'You are a professional career document writer.',
  } = options;

  const startTime = Date.now();
  logger.info(`Ollama request started — model: ${OLLAMA_MODEL}`);

  try {
    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/generate`,
      {
        model:  OLLAMA_MODEL,
        prompt: `${systemPrompt}\n\n${prompt}`,
        stream: false,
        options: {
          num_predict: maxTokens,
          temperature,
          top_p: 0.9,
        },
      },
      { timeout: OLLAMA_TIMEOUT }
    );

    const processingMs = Date.now() - startTime;
    logger.info(`Ollama response received in ${processingMs}ms`);

    return {
      text:         response.data.response,
      processingMs,
      model:        OLLAMA_MODEL,
    };
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      const err = new Error('AI service is currently unavailable. Please try again in a moment.');
      err.status = 503;
      err.code   = 'AI_SERVICE_UNAVAILABLE';
      throw err;
    }
    if (error.code === 'ECONNABORTED') {
      const err = new Error('AI generation timed out. Please try again with a shorter input.');
      err.status = 504;
      err.code   = 'AI_TIMEOUT';
      throw err;
    }
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// RESUME GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

const buildResumePrompt = ({ name, jobTitle, experience, skills, education, summary }) => {
  return `
Create a professional, ATS-optimized resume for the following person.

CANDIDATE INFORMATION:
- Full Name: ${name}
- Target Job Title: ${jobTitle}
- Professional Summary: ${summary || 'Not provided — write a suitable one'}
- Work Experience: ${experience}
- Key Skills: ${Array.isArray(skills) ? skills.join(', ') : skills}
- Education: ${education}

INSTRUCTIONS:
- Format with clear section headers: SUMMARY, EXPERIENCE, SKILLS, EDUCATION
- Use bullet points (•) for experience and skills
- Make it ATS-friendly with relevant keywords for the target role
- Keep language professional, action-verb driven, and concise
- Do NOT include placeholder text like [Company Name] — use realistic examples based on the context provided
- Output plain text only — no markdown, no asterisks for bold

OUTPUT FORMAT:
${name.toUpperCase()}
${jobTitle}

SUMMARY
[2-3 sentence professional summary]

EXPERIENCE
[Job Title | Company Name | Duration]
- [Achievement/responsibility]
- [Achievement/responsibility]

SKILLS
- [Skill category]: [skills]

EDUCATION
[Degree | Institution | Year]
`.trim();
};

const generateResume = async (userInput) => {
  const prompt = buildResumePrompt(userInput);
  return generateWithOllama(prompt, {
    maxTokens:    1400,
    temperature:  0.6,
    systemPrompt: 'You are an expert resume writer with 15 years of experience in HR and talent acquisition. You write clean, ATS-optimized, professional resumes.',
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// COVER LETTER GENERATOR (stub for Phase 2 — full implementation Phase 3)
// ─────────────────────────────────────────────────────────────────────────────

const buildCoverLetterPrompt = ({ name, jobTitle, company, experience, skills, whyCompany }) => {
  return `
Write a professional cover letter for:
- Applicant: ${name}
- Applying for: ${jobTitle} at ${company}
- Experience: ${experience}
- Skills: ${Array.isArray(skills) ? skills.join(', ') : skills}
- Why this company: ${whyCompany || 'passionate about the company mission'}

Write a 3-paragraph cover letter: opening hook, body with relevant experience, closing call-to-action.
Output plain text only — no markdown.
`.trim();
};

const generateCoverLetter = async (userInput) => {
  const prompt = buildCoverLetterPrompt(userInput);
  return generateWithOllama(prompt, {
    maxTokens:    800,
    temperature:  0.7,
    systemPrompt: 'You are an expert cover letter writer who crafts compelling, personalized cover letters.',
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// JOB ANALYZER (stub — Phase 3)
// ─────────────────────────────────────────────────────────────────────────────

const buildJobAnalysisPrompt = ({ jobDescription, skills }) => {
  return `
Analyze this job description and provide a structured breakdown:

JOB DESCRIPTION:
${jobDescription}

CANDIDATE SKILLS: ${skills || 'Not provided'}

Provide:
1. KEY REQUIREMENTS — top 5 must-have requirements
2. KEYWORDS — ATS keywords to include in resume
3. SKILL MATCH — which candidate skills match and which are missing
4. RECOMMENDATIONS — 3 specific tips to tailor the resume for this role

Output plain text with clear section headers.
`.trim();
};

const analyzeJobDescription = async (userInput) => {
  const prompt = buildJobAnalysisPrompt(userInput);
  return generateWithOllama(prompt, {
    maxTokens:    900,
    temperature:  0.5,
    systemPrompt: 'You are an expert career coach and ATS optimization specialist.',
  });
};

module.exports = { generateResume, generateCoverLetter, analyzeJobDescription, generateWithOllama };