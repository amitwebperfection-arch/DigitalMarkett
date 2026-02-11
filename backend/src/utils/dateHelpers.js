export const startOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

export const endOfMonth = (date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
};

export const startOfDay = (date) => {
  return new Date(date.setHours(0, 0, 0, 0));
};

export const endOfDay = (date) => {
  return new Date(date.setHours(23, 59, 59, 999));
};