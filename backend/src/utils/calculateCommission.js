import { COMMISSION_RATE } from '../config/env.js';

export const calculateEarnings = (price, commissionRate = COMMISSION_RATE) => {
  const platformFee = price * commissionRate;
  const vendorEarning = price - platformFee;

  return {
    price,
    platformFee: Math.round(platformFee * 100) / 100,
    vendorEarning: Math.round(vendorEarning * 100) / 100
  };
};