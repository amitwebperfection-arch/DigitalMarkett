import { getSignedUrl } from '../config/s3.js';

export const generateDownloadUrl = async (fileKey, expiresIn = 3600) => {
  return getSignedUrl(fileKey, expiresIn);
};