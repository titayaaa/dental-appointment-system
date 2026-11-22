import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { Role } from '@prisma/client';
import prisma from './lib/prisma';
import authRoutes from './routes/auth.routes';
import appointmentRoutes from './routes/appointment.routes';
import adminRoutes from './routes/admin.routes';
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
    status: 'ok',
    success: true,
    data: {
      status: 'healthy',
      service: 'SmileSync Dental Clinic API',
      timestamp: new Date().toISOString(),
    },
  });
});

// Database readiness check endpoint (used by Cloud Run & smoke tests)
app.get('/api/ready', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ready', db: 'connected' });
  } catch (_error) {
    res.status(503).json({ status: 'not_ready', db: 'disconnected' });
  }
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Appointment & Slot routes (Customer domain)
app.use('/api', appointmentRoutes);

// Admin & Staff routes (Staff domain)
app.use('/api/admin', adminRoutes);

// Protected verification endpoint for role authorization testing (TEST-SEC-02 / TEST-05)
app.get('/api/test/staff-only', requireAuth, requireRole([Role.STAFF]), (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Access granted: Authorized staff member',
    },
  });
});

// Serve frontend SPA in production from /app/client/dist (WORKDIR is /app/server)
const clientDist = path.resolve(process.cwd(), '../client/dist');
app.use(express.static(clientDist));
app.get('*', (req: Request, res: Response) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ success: false, error: 'Not found' });
    return;
  }
  res.sendFile(path.join(clientDist, 'index.html'));
});

export default app;
