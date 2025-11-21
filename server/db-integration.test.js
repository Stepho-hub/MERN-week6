import Database from 'better-sqlite3';
import { getUserById, getAllUsers, createUser } from './utils/dbUtils.js';
import fs from 'fs';

describe('Database Integration Tests', () => {
  let db;
  let dbPath;

  beforeEach(() => {
    dbPath = `./test-db-${Date.now()}-${Math.random()}.db`;
    db = new Database(dbPath);

    // Create tables
    db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL
      );
    `);
  });

  afterEach(() => {
    if (db) {
      db.close();
    }
    // Clean up database file
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
  });

  describe('getAllUsers', () => {
    test('returns empty array when no users exist', () => {
      const users = getAllUsers(db);
      expect(users).toEqual([]);
    });

    test('returns all users', () => {
      // Insert test data
      const stmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
      stmt.run('John Doe', 'john@example.com');
      stmt.run('Jane Smith', 'jane@example.com');

      const users = getAllUsers(db);
      expect(users).toHaveLength(2);
      expect(users[0]).toMatchObject({ name: 'John Doe', email: 'john@example.com' });
      expect(users[1]).toMatchObject({ name: 'Jane Smith', email: 'jane@example.com' });
      expect(users[0]).toHaveProperty('id');
      expect(users[1]).toHaveProperty('id');
    });
  });

  describe('getUserById', () => {
    test('returns user by id', () => {
      // Insert test data
      const stmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
      const result = stmt.run('John Doe', 'john@example.com');

      const user = getUserById(db, result.lastInsertRowid);
      expect(user).toMatchObject({ name: 'John Doe', email: 'john@example.com' });
      expect(user.id).toBe(result.lastInsertRowid);
    });

    test('returns undefined for non-existent user', () => {
      const user = getUserById(db, 999);
      expect(user).toBeUndefined();
    });
  });

  describe('createUser', () => {
    test('creates a user successfully', () => {
      const result = createUser(db, 'John Doe', 'john@example.com');

      expect(result.lastInsertRowid).toBeDefined();
      expect(typeof result.lastInsertRowid).toBe('number');

      // Verify user was created
      const user = getUserById(db, result.lastInsertRowid);
      expect(user).toMatchObject({ name: 'John Doe', email: 'john@example.com' });
    });

    test('throws error for duplicate email', () => {
      // Create first user
      createUser(db, 'John Doe', 'john@example.com');

      // Try to create duplicate
      expect(() => {
        createUser(db, 'Jane Smith', 'john@example.com');
      }).toThrow('UNIQUE constraint failed: users.email');
    });
  });

  describe('Database constraints', () => {
    test('enforces NOT NULL constraint on name', () => {
      expect(() => {
        db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(null, 'test@example.com');
      }).toThrow();
    });

    test('enforces NOT NULL constraint on email', () => {
      expect(() => {
        db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run('Test User', null);
      }).toThrow();
    });

    test('enforces UNIQUE constraint on email', () => {
      db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run('User 1', 'test@example.com');

      expect(() => {
        db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run('User 2', 'test@example.com');
      }).toThrow('UNIQUE constraint failed: users.email');
    });
  });
});