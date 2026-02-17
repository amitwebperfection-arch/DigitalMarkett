import Settings from './model.js';

export const getSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
};

export const updateSettings = async (updates) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create(updates);
  } else {
    // Deep merge for nested objects
    const merge = (target, source) => {
      for (const key of Object.keys(source)) {
        if (
          source[key] &&
          typeof source[key] === 'object' &&
          !Array.isArray(source[key]) &&
          target[key] &&
          typeof target[key] === 'object'
        ) {
          merge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    };
    merge(settings, updates);
    settings.markModified('paymentMethods');
    settings.markModified('smtp');
    settings.markModified('emailNotifications');
    settings.markModified('vendorSettings');
    settings.markModified('seo');
    settings.markModified('socialLinks');
    settings.markModified('security');
    settings.markModified('appearance');
    await settings.save();
  }
  return settings;
};