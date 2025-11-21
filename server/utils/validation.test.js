/* eslint-env jest */
import { isValidEmail, isValidName, sanitizeInput } from './validation.js';

describe('validation', () => {
  describe('isValidEmail', () => {
    test('returns true for valid email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    test('returns false for invalid email', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
    });
  });

  describe('isValidName', () => {
    test('returns true for valid name', () => {
      expect(isValidName('John Doe')).toBe(true);
    });

    test('returns false for empty string', () => {
      expect(isValidName('')).toBe(false);
    });

    test('returns false for whitespace only', () => {
      expect(isValidName('   ')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    test('removes angle brackets', () => {
      expect(sanitizeInput('<script>')).toBe('script');
    });

    test('trims whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });
  });
});