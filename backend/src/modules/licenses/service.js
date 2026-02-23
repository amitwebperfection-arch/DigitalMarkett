import License from './model.js';
import { generateLicenseKey } from '../../utils/generateLicense.js';

export const generateLicense = async (userId, productId, orderId) => {
  const licenseKey = generateLicenseKey();

  const license = await License.create({
    licenseKey,
    user: userId,
    product: productId,
    order: orderId,
    status: 'active'
  });

  return license;
};

export const verifyLicense = async (licenseKey, domain = null) => {
  const license = await License.findOne({ licenseKey }).populate('product', 'title version');

  if (!license) {
    throw new Error('Invalid license key');
  }

  if (license.status !== 'active') {
    throw new Error(`License is ${license.status}`);
  }

  if (license.expiresAt && new Date() > license.expiresAt) {
    license.status = 'expired';
    await license.save();
    throw new Error('License has expired');
  }

  if (domain) {
    const existingActivation = license.activations.find(a => a.domain === domain);
    
    if (!existingActivation && license.activations.length >= license.maxActivations) {
      throw new Error('Maximum activations reached');
    }

    if (!existingActivation) {
      license.activations.push({
        domain,
        activatedAt: new Date()
      });
      await license.save();
    }
  }

  return license;
};

export const revokeLicense = async (licenseId) => {
  const license = await License.findByIdAndUpdate(
    licenseId,
    { status: 'revoked' },
    { new: true }
  );

  if (!license) {
    throw new Error('License not found');
  }

  return license;
};

export const getUserLicenses = async (userId) => {
  return await License.find({ user: userId })
    .populate('product', 'title version thumbnail')
    .sort({ createdAt: -1 });
};

export const trackDownload = async (licenseId) => {
  return await License.findByIdAndUpdate(
    licenseId,
    {
      $inc: { downloadCount: 1 },
      lastDownloadAt: new Date()
    },
    { new: true }
  );
};