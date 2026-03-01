// PDF text extraction using pdfjs-dist (Mozilla PDF.js)
// Replaces old pdf-parse package which used pdfjs-dist 1.10 from 2018

const pdfjsLib = require('pdfjs-dist/legacy/build/pdf');
const logger   = require('./logger');

// Disable worker — not needed (or available) in Node.js
pdfjsLib.GlobalWorkerOptions.workerSrc = '';

const MAX_PAGES = 50;

/**
 * Extract all text content from a PDF buffer.
 * @param {Buffer} buffer  – Node.js Buffer containing PDF data
 * @returns {Promise<string>} – The extracted plain text
 */
async function extractTextFromPDF(buffer) {
  const data = new Uint8Array(buffer);

  const doc = await pdfjsLib.getDocument({
    data,
    useSystemFonts: true,
    isEvalSupported: false,   // security: no eval()
    disableFontFace: true,    // not needed in Node.js
  }).promise;

  const pageCount = Math.min(doc.numPages, MAX_PAGES);
  const textParts = [];

  for (let i = 1; i <= pageCount; i++) {
    const page    = await doc.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .filter((item) => item.str)
      .map((item) => item.str)
      .join(' ');

    if (pageText.trim()) textParts.push(pageText.trim());
    page.cleanup();
  }

  if (doc.numPages > MAX_PAGES) {
    logger.warn(`PDF has ${doc.numPages} pages — only processed first ${MAX_PAGES}`);
  }

  doc.cleanup();
  return textParts.join('\n\n');
}

module.exports = { extractTextFromPDF };
