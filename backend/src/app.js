const express = require('express');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const { sequelize, initDatabase } = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const storeRoutes = require('./routes/store.routes');
const ratingRoutes = require('./routes/rating.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Robust CORS configuration supporting local dev, Vercel production frontend, and Vercel preview domains
const allowedOrigins = [
  'http://localhost:5173',
  'https://store-rating-platform-tau.vercel.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith('.vercel.app') || 
                      process.env.NODE_ENV !== 'production';
                      
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Database connection middleware for serverless environment compatibility
let isDbConnected = false;
let dbInitPromise = null;

async function ensureDbConnected(req, res, next) {
  if (isDbConnected) {
    return next();
  }
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      await initDatabase();
      if (process.env.DATABASE_URL) {
        // Production (TiDB Cloud): tables already exist, just verify connectivity
        await sequelize.authenticate();
        console.log('Database connection verified');
      } else {
        // Local development: create/update tables as needed
        await sequelize.sync();
        console.log('Database synced successfully');
      }
      isDbConnected = true;
    })();
  }
  try {
    await dbInitPromise;
    next();
  } catch (err) {
    // Reset so next request retries instead of caching the failed promise
    dbInitPromise = null;
    console.error('Database connection error in middleware:', err);
    res.status(500).json({ error: 'Database connection failed', details: err.message });
  }
}

// Apply DB connection check to all API requests
app.use(ensureDbConnected);

// routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/admin', adminRoutes);

// health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// root welcome route
app.get('/', (req, res) => res.json({ status: 'ok', message: 'Store Rating Platform API is active and running!' }));

// Only listen on port when not running as a Vercel Serverless Function
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

