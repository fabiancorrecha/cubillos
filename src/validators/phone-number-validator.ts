export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const matches = !!phoneNumber.match(/^\+?[-0-9]+$/);
  const sanitized = phoneNumber.replace(/[+-]/g, '');

  return matches && sanitized.length >= 7 && sanitized.length <= 15;
};
