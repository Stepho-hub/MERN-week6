import '@testing-library/jest-dom';

// Mock fetch globally for client-side tests
global.fetch = jest.fn();