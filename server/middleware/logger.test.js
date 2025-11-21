/* eslint-env jest */
import { logger } from './logger.js';

describe('logger middleware', () => {
  let req, res, next;
  let consoleSpy;

  beforeEach(() => {
    req = {
      method: 'GET',
      url: '/test',
      ip: '127.0.0.1',
      get: jest.fn((header) => header === 'User-Agent' ? 'TestAgent/1.0' : undefined)
    };
    res = {
      on: jest.fn(),
      statusCode: 200
    };
    next = jest.fn();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test('logs request method and url', () => {
    logger(req, res, next);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('GET /test - IP: 127.0.0.1 - User-Agent: TestAgent/1.0'));
    expect(next).toHaveBeenCalled();
  });
});