import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Role } from '@prisma/client';
import authRoutes from './routes/auth.routes';
import appointmentRoutes from './routes/appointment.routes';
import { requireAuth, requireRole } from './middlewares/auth.middleware';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      service: 'SmileSync Dental Clinic API',
      timestamp: new Date().toISOString(),
    },
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Appointment & Slot routes (Customer domain)
app.use('/api', appointmentRoutes);

// Protected verification endpoint for role authorization testing (TEST-SEC-02 / TEST-05)
app.get('/api/test/staff-only', requireAuth, requireRole([Role.STAFF]), (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Access granted: Authorized staff member',
    },
  });
});

export default app;
