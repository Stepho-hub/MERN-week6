/* eslint-env jest */
import Database from 'better-sqlite3';
import { getUserById, getAllUsers, createUser } from './dbUtils.js';

// Mock better-sqlite3
jest.mock('better-sqlite3');

describe('dbUtils', () => {
  let mockDb;

  beforeEach(() => {
    mockDb = {
      prepare: jest.fn().mockReturnThis(),
      get: jest.fn(),
      all: jest.fn(),
      run: jest.fn(),
    };
    Database.mockReturnValue(mockDb);
  });

  describe('getUserById', () => {
    test('returns user by id', () => {
      const user = { id: 1, name: 'John' };
      mockDb.get.mockReturnValue(user);

      const result = getUserById(mockDb, 1);
      expect(mockDb.prepare).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?');
      expect(mockDb.get).toHaveBeenCalledWith(1);
      expect(result).toBe(user);
    });
  });

  describe('getAllUsers', () => {
    test('returns all users', () => {
      const users = [{ id: 1, name: 'John' }];
      mockDb.all.mockReturnValue(users);

      const result = getAllUsers(mockDb);
      expect(mockDb.prepare).toHaveBeenCalledWith('SELECT * FROM users');
      expect(mockDb.all).toHaveBeenCalled();
      expect(result).toBe(users);
    });
  });

  describe('createUser', () => {
    test('creates a user', () => {
      const result = { lastInsertRowid: 1 };
      mockDb.run.mockReturnValue(result);

      const dbResult = createUser(mockDb, 'John', 'john@example.com');
      expect(mockDb.prepare).toHaveBeenCalledWith('INSERT INTO users (name, email) VALUES (?, ?)');
      expect(mockDb.run).toHaveBeenCalledWith('John', 'john@example.com');
      expect(dbResult).toBe(result);
    });
  });
});