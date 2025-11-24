// Validation utilities

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');

  // US phone numbers should have 10 digits
  return digitsOnly.length === 10;
};

export const formatPhoneNumber = (phone: string): string => {
  const digitsOnly = phone.replace(/\D/g, '');

  if (digitsOnly.length === 10) {
    return `${digitsOnly.slice(0, 3)}-${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }

  return phone;
};

export const validateVIN = (vin: string): boolean => {
  // VIN should be exactly 17 characters, alphanumeric (excluding I, O, Q)
  if (vin.length !== 17) return false;
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;

  return vinRegex.test(vin);
};
