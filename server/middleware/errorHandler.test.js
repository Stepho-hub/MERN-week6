/* eslint-env jest */
import { errorHandler } from './errorHandler.js';

describe('errorHandler middleware', () => {
  let err, req, res;
  let consoleSpy;

  beforeEach(() => {
    err = new Error('Test error');
    req = { method: 'GET', url: '/test', ip: '127.0.0.1' };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  test('logs error and sends 500 response', () => {
    errorHandler(err, req, res);

    expect(consoleSpy).toHaveBeenCalledTimes(3);
    expect(consoleSpy).toHaveBeenNthCalledWith(1, expect.stringContaining('Error: Test error'));
    expect(consoleSpy).toHaveBeenNthCalledWith(2, expect.stringContaining('Stack:'));
    expect(consoleSpy).toHaveBeenNthCalledWith(3, 'Request: GET /test - IP: 127.0.0.1');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error', stack: err.stack });
  });
});