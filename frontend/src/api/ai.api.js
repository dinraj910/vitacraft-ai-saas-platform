import axiosInstance from './axiosInstance';

export const aiAPI = {
  generateResume: (data) =>
    axiosInstance.post('/ai/resume/generate', data),

  generateCoverLetter: (data) =>
    axiosInstance.post('/ai/cover-letter/generate', data),

  analyzeJob: (data) =>
    axiosInstance.post('/ai/job-analyzer/analyze', data),

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