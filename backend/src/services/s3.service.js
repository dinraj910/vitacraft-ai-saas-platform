const {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const s3Client          = require('../config/s3');
const logger            = require('../utils/logger');

const BUCKET = process.env.AWS_S3_BUCKET;

/**
 * Upload a buffer to S3
 * @param {Buffer} buffer - file content
 * @param {string} key    - S3 object key  e.g. users/abc/resumes/123.pdf
 * @param {string} contentType - MIME type
 */
const uploadToS3 = async (buffer, key, contentType) => {
  const command = new PutObjectCommand({
    Bucket:      BUCKET,
    Key:         key,
    Body:        buffer,
    ContentType: contentType,
  });
  await s3Client.send(command);
  logger.info(`S3 upload success: ${key}`);
  return key;
};

/**
 * Generate a pre-signed download URL valid for 15 minutes.
 * Frontend never gets the raw S3 key — only this temporary URL.
 */
const getSignedDownloadUrl = async (key, expiresInSeconds = 900) => {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
  return await getSignedUrl(s3Client, command, { expiresIn: expiresInSeconds });
};

/**
 * Delete a file from S3
 */
const deleteFromS3 = async (key) => {
  const command = new DeleteObjectCommand({ Bucket: BUCKET, Key: key });
  await s3Client.send(command);
  logger.info(`S3 delete success: ${key}`);
};

module.exports = { uploadToS3, getSignedDownloadUrl, deleteFromS3 };