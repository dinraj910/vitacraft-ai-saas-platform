// src/config/llm.js
// LLM provider configuration — multi-provider fallback system

const PROVIDERS = {
  groq: {
    name:    'Groq (llama-3.1-8b)',
    apiKey:  process.env.GROQ_API_KEY,
    enabled: !!process.env.GROQ_API_KEY,
  },
  gemini: {
    name:    'Google Gemini (gemini-1.5-flash)',
    apiKey:  process.env.GEMINI_API_KEY,
    enabled: !!process.env.GEMINI_API_KEY,
  },
  cohere: {
    name:    'Cohere (command-r)',
    apiKey:  process.env.COHERE_API_KEY,
    enabled: !!process.env.COHERE_API_KEY,
  },
  huggingface: {
    name:    'HuggingFace (mistral-7b)',
    apiKey:  process.env.HF_API_KEY,
    enabled: !!process.env.HF_API_KEY,
  },
};

// Priority order — first enabled provider is tried first
const PROVIDER_ORDER = ['groq', 'gemini', 'cohere', 'huggingface'];

const getEnabledProviders = () =>
  PROVIDER_ORDER.filter((key) => PROVIDERS[key].enabled);

module.exports = { PROVIDERS, PROVIDER_ORDER, getEnabledProviders };
