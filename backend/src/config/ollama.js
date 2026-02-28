// Ollama HTTP client config
const OLLAMA_BASE_URL = process.env.OLLAMA_URL  || 'http://localhost:11434';
const OLLAMA_MODEL    = process.env.OLLAMA_MODEL || 'phi3:mini';

module.exports = { OLLAMA_BASE_URL, OLLAMA_MODEL };