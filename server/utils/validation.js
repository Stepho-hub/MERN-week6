export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidName(name) {
  return typeof name === 'string' && name.trim().length > 0;
}

export function sanitizeInput(input) {
  return input.trim().replace(/[<>]/g, '');
}