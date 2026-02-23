import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

export const generateLicenseKey = () => {
  const parts = [];
  
  for (let i = 0; i < 4; i++) {
    const part = crypto.randomBytes(4).toString('hex').toUpperCase();
    parts.push(part);
  }

  return parts.join('-');
};

export const generateActivationKey = (licenseKey, domain) => {
  const hash = crypto
    .createHash('sha256')
    .update(`${licenseKey}-${domain}`)
    .digest('hex');

  return hash.substring(0, 32).toUpperCase();
};