import express from 'express';
import Database from 'better-sqlite3';
import { isValidEmail, isValidName, sanitizeInput } from './utils/validation.js';
import { logger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

const createApp = (dbPath) => {
  const app = express();
  app.use(express.json());
  app.use(logger);

  // Initialize database
  const db = new Database(dbPath || process.env.DB_PATH || './data.db');

// Create tables if not exist
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL
  );
`);

// Routes
app.get('/api/users', (req, res) => {
  const users = db.prepare('SELECT * FROM users').all();
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;

  // Check for required fields
  if (!name) {
    return res.status(400).json({ error: 'Invalid name' });
  }
  if (!email) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  // Sanitize input first
  const sanitizedName = sanitizeInput(name);
  const sanitizedEmail = sanitizeInput(email);

  // Validate sanitized input
  if (!isValidName(sanitizedName)) {
    return res.status(400).json({ error: 'Invalid name' });
  }
  if (!isValidEmail(sanitizedEmail)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  try {
    const stmt = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
    const result = stmt.run(sanitizedName, sanitizedEmail);
    res.status(201).json({ id: result.lastInsertRowid, name: sanitizedName, email: sanitizedEmail });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(409).json({ error: 'Email already exists' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

  // Global error handler
  app.use(errorHandler);

  return app;
};

const app = createApp();
export default app;
export { createApp };