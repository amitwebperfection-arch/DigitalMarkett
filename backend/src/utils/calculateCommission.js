import Settings from '../modules/settings/model.js';
import { COMMISSION_RATE as ENV_COMMISSION_RATE } from '../config/env.js';

export const calculateEarnings = async (price) => {
  price = Number(price);

  if (!price || price <= 0) {
    throw new Error('Invalid price provided to calculateEarnings');
  }

  const settings = await Settings.findOne().lean();
  console.log('Settings from DB:', settings?.commissionRate);

  let commissionRate;

  if (settings && settings.commissionRate != null) {
    commissionRate = Number(settings.commissionRate) / 100;
  } else {
    commissionRate = Number(ENV_COMMISSION_RATE) || 0.20;
  }

  if (commissionRate > 1) commissionRate = 1;
  if (commissionRate < 0) commissionRate = 0;

  const platformFee = price * commissionRate;
  const vendorEarning = price - platformFee;

  return {
    price: Number(price.toFixed(2)),
    commissionRate,
    platformFee: Number(platformFee.toFixed(2)),
    vendorEarning: Number(vendorEarning.toFixed(2))
  };
};
