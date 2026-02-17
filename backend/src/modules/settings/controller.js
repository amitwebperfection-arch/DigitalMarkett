import * as settingsService from './service.js';

export const getSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();
    // Flat spread so frontend can do settings.siteName directly
    res.json({ success: true, ...settings.toObject() });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.updateSettings(req.body);
    res.json({ success: true, ...settings.toObject() });
  } catch (error) {
    next(error);
  }
};

export const getRobotsTxt = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();
    const content = settings?.seo?.robotsTxt || 'User-agent: *\nAllow: /';
    res.setHeader('Content-Type', 'text/plain');
    res.send(content);
  } catch (error) {
    next(error);
  }
};