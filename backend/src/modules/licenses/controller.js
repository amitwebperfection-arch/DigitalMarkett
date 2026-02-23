import * as licenseService from './service.js';

export const verifyLicense = async (req, res, next) => {
  try {
    const { licenseKey, domain } = req.body;
    const license = await licenseService.verifyLicense(licenseKey, domain);
    res.json({ success: true, license });
  } catch (error) {
    next(error);
  }
};

export const revokeLicense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const license = await licenseService.revokeLicense(id);
    res.json({ success: true, license });
  } catch (error) {
    next(error);
  }
};

export const getMyLicenses = async (req, res, next) => {
  try {
    const licenses = await licenseService.getUserLicenses(req.user.id);
    res.json({ success: true, licenses });
  } catch (error) {
    next(error);
  }
};