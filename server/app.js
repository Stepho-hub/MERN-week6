import express from 'express';
import cors from 'cors';
import { isValidEmail, isValidName, sanitizeInput } from './utils/validation.js';
import { logger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import connectDB from './db.js';
import User from './models/User.js';

const createApp = async () => {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(logger);

  // Connect to MongoDB
  await connectDB();

  // Serve static files from the React app build directory (only in production)
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
  }

// Routes
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
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
    const user = new User({ name: sanitizedName, email: sanitizedEmail });
    const savedUser = await user.save();
    res.status(201).json(savedUser);
  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      res.status(409).json({ error: 'Email already exists' });
    } else {
      res.status(400).json({ error: error.message });
    }
  }
});

  // Catch all handler: send back React's index.html file for client-side routing (only in production)
  if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
      res.sendFile('index.html', { root: 'dist' });
    });
  }

  // Global error handler
  app.use(errorHandler);

  return app;
};

const createAppInstance = async () => {
  return await createApp();
};

export default createAppInstance;
export { createApp };