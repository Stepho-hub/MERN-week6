/* eslint-env jest */
import { capitalize, reverse, isPalindrome } from './stringUtils';

describe('stringUtils', () => {
  describe('capitalize', () => {
    test('capitalizes first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
    });

    test('handles empty string', () => {
      expect(capitalize('')).toBe('');
    });

    test('handles null', () => {
      expect(capitalize(null)).toBe(null);
    });

    test('handles already capitalized', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });
  });

  describe('reverse', () => {
    test('reverses string', () => {
      expect(reverse('hello')).toBe('olleh');
    });

    test('reverses empty string', () => {
      expect(reverse('')).toBe('');
    });
  });

  describe('isPalindrome', () => {
    test('returns true for palindrome', () => {
      expect(isPalindrome('racecar')).toBe(true);
      expect(isPalindrome('A man a plan a canal Panama')).toBe(true);
    });

    test('returns false for non-palindrome', () => {
      expect(isPalindrome('hello')).toBe(false);
    });

    test('handles empty string', () => {
      expect(isPalindrome('')).toBe(true);
    });
  });
});