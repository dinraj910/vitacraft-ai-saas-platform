// src/services/ai.service.js
// Multi-provider LLM service with automatic fallback
// Order: Groq → Gemini → Cohere → HuggingFace

const axios  = require('axios');
const logger = require('../utils/logger');
const { PROVIDERS, getEnabledProviders } = require('../config/llm');

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER IMPLEMENTATIONS
// Each function takes (prompt, systemPrompt, maxTokens) → returns string
// ─────────────────────────────────────────────────────────────────────────────

const callGroq = async (prompt, systemPrompt, maxTokens) => {
  const response = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: prompt },
      ],
      max_tokens:  maxTokens,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization:  `Bearer ${PROVIDERS.groq.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );
  return response.data.choices[0].message.content;
};

const callGemini = async (prompt, systemPrompt, maxTokens) => {
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${PROVIDERS.gemini.apiKey}`,
    {
      contents: [
        {
          parts: [{ text: `${systemPrompt}\n\n${prompt}` }],
        },
      ],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature:     0.7,
      },
    },
    {
      headers:  { 'Content-Type': 'application/json' },
      timeout:  30000,
    }
  );
  return response.data.candidates[0].content.parts[0].text;
};

const callCohere = async (prompt, systemPrompt, maxTokens) => {
  const response = await axios.post(
    'https://api.cohere.ai/v1/chat',
    {
      model:       'command-r',
      message:     prompt,
      preamble:    systemPrompt,
      max_tokens:  maxTokens,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization:  `Bearer ${PROVIDERS.cohere.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 40000,
    }
  );
  return response.data.text;
};

const callHuggingFace = async (prompt, systemPrompt, maxTokens) => {
  const response = await axios.post(
    'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
    {
      inputs: `<s>[INST] ${systemPrompt}\n\n${prompt} [/INST]`,
      parameters: {
        max_new_tokens: maxTokens,
        temperature:    0.7,
        return_full_text: false,
      },
    },
    {
      headers: {
        Authorization:  `Bearer ${PROVIDERS.huggingface.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000,
    }
  );

  // HF returns array
  const raw = response.data;
  if (Array.isArray(raw)) return raw[0].generated_text;
  return raw.generated_text || raw;
};

// Map provider key → call function
const CALLER_MAP = {
  groq:        callGroq,
  gemini:      callGemini,
  cohere:      callCohere,
  huggingface: callHuggingFace,
};

// ─────────────────────────────────────────────────────────────────────────────
// CORE — generateWithFallback
// Tries each enabled provider in order. If one fails, tries the next.
// ─────────────────────────────────────────────────────────────────────────────

const generateWithFallback = async (prompt, options = {}) => {
  const {
    maxTokens    = 1000,
    systemPrompt = 'You are a professional career document writer.',
  } = options;

  const enabledProviders = getEnabledProviders();

  if (enabledProviders.length === 0) {
    const err = new Error(
      'No LLM providers configured. Please add at least one API key to your .env file (GROQ_API_KEY, GEMINI_API_KEY, COHERE_API_KEY, or HF_API_KEY).'
    );
    err.status = 503;
    err.code   = 'AI_SERVICE_UNAVAILABLE';
    throw err;
  }

  const errors = [];

  for (const providerKey of enabledProviders) {
    const provider = PROVIDERS[providerKey];
    const caller   = CALLER_MAP[providerKey];
    const startTime = Date.now();

    try {
      logger.info(`Trying LLM provider: ${provider.name}`);

      const text = await caller(prompt, systemPrompt, maxTokens);

      const processingMs = Date.now() - startTime;
      logger.info(`✅ ${provider.name} responded in ${processingMs}ms`);

      return {
        text:         text.trim(),
        processingMs,
        model:        provider.name,
        provider:     providerKey,
      };
    } catch (error) {
      const msg = error.response?.data?.error?.message
                || error.response?.data?.message
                || error.message;

      logger.warn(`❌ ${provider.name} failed: ${msg} — trying next provider`);
      errors.push(`${provider.name}: ${msg}`);

      // Check if it's an auth error — log prominently
      if (error.response?.status === 401 || error.response?.status === 403) {
        logger.error(`🔑 ${provider.name}: Invalid API key — check your .env`);
      }

      // Continue to next provider
    }
  }

  // All providers failed
  const err = new Error(
    `All AI providers failed. Errors: ${errors.join(' | ')}`
  );
  err.status = 503;
  err.code   = 'AI_SERVICE_UNAVAILABLE';
  throw err;
};

// ─────────────────────────────────────────────────────────────────────────────
// RESUME GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

const buildResumePrompt = ({ name, jobTitle, experience, skills, education, summary, tone, targetCompany, yearsOfExperience, certifications, languages, customInstructions }) => {
  const skillList = Array.isArray(skills) ? skills.join(', ') : skills;

  let personalization = '';
  if (tone)              personalization += `\n- Tone / Style: ${tone}`;
  if (targetCompany)     personalization += `\n- Target Company: ${targetCompany}`;
  if (yearsOfExperience) personalization += `\n- Years of Experience: ${yearsOfExperience}`;
  if (certifications)    personalization += `\n- Certifications: ${certifications}`;
  if (languages)         personalization += `\n- Languages: ${languages}`;

  return `
Create a professional, ATS-optimized resume for the following person.

CANDIDATE DETAILS:
- Full Name: ${name}
- Target Job Title: ${jobTitle}
- Professional Summary Input: ${summary || 'Not provided — write a strong one based on the experience'}
- Work Experience: ${experience}
- Skills: ${skillList}
- Education: ${education}${personalization}

${customInstructions ? `ADDITIONAL INSTRUCTIONS FROM CANDIDATE:\n${customInstructions}\n` : ''}STRICT OUTPUT RULES:
- Use ONLY plain text — no markdown, no asterisks, no hash symbols
- Section headers must be in ALL CAPS (SUMMARY, EXPERIENCE, SKILLS, EDUCATION${certifications ? ', CERTIFICATIONS' : ''}${languages ? ', LANGUAGES' : ''})
- Use bullet points with the • character
- Do NOT use placeholder text like [Company Name]
- Keep it concise, professional, and ATS-friendly
- Start directly with the candidate's name
${tone ? `- Write in a ${tone} tone throughout` : ''}

OUTPUT FORMAT:
${name.toUpperCase()}
${jobTitle}

SUMMARY
Write 2-3 sentences here.

EXPERIENCE
Job Title | Company Name | Start Year – End Year
• Achievement with measurable result
• Another key responsibility or achievement

SKILLS
• Technical Skills: list them here
• Soft Skills: list them here

EDUCATION
Degree | Institution | Year
${certifications ? '\nCERTIFICATIONS\n• List certifications here' : ''}${languages ? '\nLANGUAGES\n• List languages here' : ''}
`.trim();
};

const generateResume = async (userInput) => {
  return generateWithFallback(
    buildResumePrompt(userInput),
    {
      maxTokens:    900,
      systemPrompt: 'You are an expert ATS resume writer with 15 years of HR experience. You write clean, professional, keyword-optimized resumes. Output plain text only — absolutely no markdown formatting.',
    }
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COVER LETTER GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

const buildCoverLetterPrompt = ({ name, jobTitle, company, experience, skills, whyCompany, tone, hiringManager, achievements, customInstructions }) => {
  const skillList = Array.isArray(skills) ? skills.join(', ') : skills;
  return `
Write a professional cover letter for a job application.

APPLICANT: ${name}
APPLYING FOR: ${jobTitle} at ${company}
EXPERIENCE: ${experience}
SKILLS: ${skillList}
WHY THIS COMPANY: ${whyCompany || 'passionate about the mission and growth opportunities'}${hiringManager ? `\nHIRING MANAGER: ${hiringManager}` : ''}${achievements ? `\nKEY ACHIEVEMENTS TO HIGHLIGHT: ${achievements}` : ''}

${customInstructions ? `ADDITIONAL INSTRUCTIONS:\n${customInstructions}\n` : ''}RULES:
- 3 paragraphs: strong opening hook, experience body, confident closing
- ${tone ? `Write in a ${tone} tone` : 'Professional but personable tone'}
- Plain text only — no markdown
- ${hiringManager ? `Address to "${hiringManager}"` : 'Address to "Hiring Manager" if no name given'}
- End with a call to action
`.trim();
};

const generateCoverLetter = async (userInput) => {
  return generateWithFallback(
    buildCoverLetterPrompt(userInput),
    {
      maxTokens:    700,
      systemPrompt: 'You are an expert cover letter writer who crafts compelling, personalized cover letters that get interviews. Output plain text only.',
    }
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// JOB DESCRIPTION ANALYZER
// ─────────────────────────────────────────────────────────────────────────────

const buildJobAnalysisPrompt = ({ jobDescription, skills, targetRole, experienceLevel, industry, customInstructions }) => {
  const skillList = Array.isArray(skills) ? skills.join(', ') : skills;
  return `
Analyze this job description and provide a structured career coaching report.

JOB DESCRIPTION:
${jobDescription}

CANDIDATE SKILLS: ${skillList || 'Not provided'}${targetRole ? `\nTARGET ROLE: ${targetRole}` : ''}${experienceLevel ? `\nEXPERIENCE LEVEL: ${experienceLevel}` : ''}${industry ? `\nINDUSTRY: ${industry}` : ''}

${customInstructions ? `ADDITIONAL ANALYSIS INSTRUCTIONS:\n${customInstructions}\n` : ''}Provide this exact structure:
KEY REQUIREMENTS
• List the top 5 must-have requirements

ATS KEYWORDS
• List 10 important keywords to include in the resume

SKILL MATCH
• Skills the candidate already has that match
• Skills that are missing or need development
${experienceLevel ? `\nEXPERIENCE FIT\n• How well the ${experienceLevel}-level experience aligns with this role` : ''}
RECOMMENDATIONS
• 3 specific, actionable tips to improve the resume for this role${targetRole ? `, tailored for the ${targetRole} position` : ''}

Plain text only. Use • for bullets.
`.trim();
};

const analyzeJobDescription = async (userInput) => {
  return generateWithFallback(
    buildJobAnalysisPrompt(userInput),
    {
      maxTokens:    800,
      systemPrompt: 'You are an expert career coach and ATS optimization specialist. Give specific, actionable advice. Output plain text only.',
    }
  );
};

module.exports = {
  generateResume,
  generateCoverLetter,
  analyzeJobDescription,
  generateWithFallback,
};