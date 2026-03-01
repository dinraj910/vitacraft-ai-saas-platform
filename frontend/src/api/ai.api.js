import axiosInstance from './axiosInstance';

export const aiAPI = {
  generateResume: (data) =>
    axiosInstance.post('/ai/resume/generate', data),

  generateCoverLetter: (data) =>
    axiosInstance.post('/ai/cover-letter/generate', data),

  analyzeJob: (data) =>
    axiosInstance.post('/ai/job-analyzer/analyze', data),

  analyzeResume: (formData) =>
    axiosInstance.post('/ai/resume-analyzer/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getHistory: (page = 1, limit = 10) =>
    axiosInstance.get(`/ai/history?page=${page}&limit=${limit}`),
};

export const filesAPI = {
  getFiles: () =>
    axiosInstance.get('/files'),

  getSignedUrl: (fileId) =>
    axiosInstance.get(`/files/signed-url/${fileId}`),

  deleteFile: (fileId) =>
    axiosInstance.delete(`/files/${fileId}`),
};

export const billingAPI = {
  /** Get all available plans */
  getPlans: () =>
    axiosInstance.get('/billing/plans'),

  /** Create a Stripe Checkout session for plan upgrade */
  createCheckoutSession: (planName) =>
    axiosInstance.post('/billing/create-checkout-session', { planName }),

  /** Create a Stripe Billing Portal session (manage subscription) */
  createPortalSession: () =>
    axiosInstance.post('/billing/create-portal-session'),

  /** Get current user's subscription details */
  getSubscription: () =>
    axiosInstance.get('/billing/subscription'),
};