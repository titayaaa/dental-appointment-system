import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  createSchedule,
  getSchedules,
  getAppointments,
  updateAppointmentStatus,
} from '../controllers/admin.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Staff Role Protection: All /api/admin routes require STAFF role (BR-05)
router.use(requireAuth, requireRole([Role.STAFF]));

// Duty schedules
router.post('/schedules', createSchedule);
router.get('/schedules', getSchedules);

// Master appointment review & status transitions
router.get('/appointments', getAppointments);
router.patch('/appointments/:id/status', updateAppointmentStatus);

export default router;
