// import { COMMISSION_RATE } from '../config/env.js';

// export const calculateEarnings = (price, commissionRate = COMMISSION_RATE) => {
//   const platformFee = price * commissionRate;
//   const vendorEarning = price - platformFee;

//   return {
//     price,
//     platformFee: Math.round(platformFee * 100) / 100,
//     vendorEarning: Math.round(vendorEarning * 100) / 100
//   };
// };
import Settings from '../../src/modules/settings/model.js';
import { COMMISSION_RATE as ENV_COMMISSION_RATE } from '../config/env.js';

export const calculateEarnings = async (price) => {
  // Ensure price is number
  price = Number(price);

  if (!price || price <= 0) {
    throw new Error('Invalid price provided to calculateEarnings');
  }

  // 1️⃣ Try DB first
  const settings = await Settings.findOne().lean();

  let commissionRate;

  if (settings && settings.commissionRate != null) {
    // DB stores percentage (example: 20)
    commissionRate = Number(settings.commissionRate) / 100;
  } else {
    // 2️⃣ Fallback to .env (decimal like 0.20)
    commissionRate = Number(ENV_COMMISSION_RATE) || 0.20;
  }

  // Safety clamp (prevent 200% etc)
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
