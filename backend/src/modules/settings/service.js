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
    Object.assign(settings, updates);
    await settings.save();
  }

  return settings;
};