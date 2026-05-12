import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import exerciseRoutes from './routes/exercises.js';
import templateRoutes from './routes/templates.js';
import sessionRoutes from './routes/sessions.js';
import analyticsRoutes from './routes/analytics.js';
import adminRoutes from './routes/admin.js';
import { errorHandler } from './middleware/error.js';
import { seedCatalogIfEmpty } from './seed/defaultCatalog.js';

dotenv.config();

const defaultOrigins = "http://localhost:5173";
const allowedOrigins = (process.env.CLIENT_URL || defaultOrigins)
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""))
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, false);
  },
  credentials: true,
};

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Підключено до MongoDB');
    await seedCatalogIfEmpty();
  })
  .catch(err => console.error('Помилка MongoDB:', err));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/exercises', exerciseRoutes);
app.use('/api/v1/templates', templateRoutes);
app.use('/api/v1/sessions', sessionRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Сервер на порту ${PORT}`);
  console.log(`CORS: ${allowedOrigins.join(", ")}`);
});
