const { S3Client } = require('@aws-sdk/client-s3');
const logger = require('../utils/logger');

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  logger.warn('\u26a0\ufe0f  AWS S3 credentials missing! Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env');
}
if (!process.env.AWS_S3_BUCKET) {
  logger.warn('\u26a0\ufe0f  AWS_S3_BUCKET not set in .env!');
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

module.exports = s3Client;