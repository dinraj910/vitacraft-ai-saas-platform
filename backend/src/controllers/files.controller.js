const { getSignedDownloadUrl, deleteFromS3 } = require('../services/s3.service');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const prisma = require('../config/db');

// GET /api/v1/files/signed-url/:fileId
const getSignedUrl = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const userId     = req.user.id;

  const file = await prisma.userFile.findUnique({ where: { id: fileId } });

  if (!file) return sendError(res, 404, 'File not found', 'FILE_NOT_FOUND');

  // Security: only the owner can get a signed URL
  if (file.userId !== userId && req.user.role !== 'ADMIN') {
    return sendError(res, 403, 'Access denied', 'FORBIDDEN');
  }

  const url = await getSignedDownloadUrl(file.s3Key);

  return sendSuccess(res, 200, 'Signed URL generated', {
    url,
    fileName: file.fileName,
    mimeType: file.mimeType,
    expiresIn: 900, // 15 minutes
  });
});

// GET /api/v1/files
const getUserFiles = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const files = await prisma.userFile.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  // Attach signed URLs to each file
  const filesWithUrls = await Promise.all(
    files.map(async (file) => ({
      ...file,
      downloadUrl: await getSignedDownloadUrl(file.s3Key),
    }))
  );

  return sendSuccess(res, 200, 'Files retrieved', filesWithUrls);
});

// DELETE /api/v1/files/:fileId
const deleteFile = asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  const userId     = req.user.id;

  const file = await prisma.userFile.findUnique({ where: { id: fileId } });
  if (!file) return sendError(res, 404, 'File not found', 'FILE_NOT_FOUND');
  if (file.userId !== userId) return sendError(res, 403, 'Access denied', 'FORBIDDEN');

  await deleteFromS3(file.s3Key);
  await prisma.userFile.delete({ where: { id: fileId } });

  return sendSuccess(res, 200, 'File deleted successfully');
});

module.exports = { getSignedUrl, getUserFiles, deleteFile };