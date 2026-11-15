import { Router } from 'express';
import { Role } from '@prisma/client';
import {
  getDentists,
  getAvailableSlots,
  bookAppointment,
  getMyAppointments,
  cancelMyAppointment,
} from '../controllers/appointment.controller';
import { requireAuth, requireRole } from '../middlewares/auth.middleware';

const router = Router();

// Dentists listing
router.get('/dentists', getDentists);

// Available slots query (Logged in users: Customer or Staff)
router.get('/slots/available', requireAuth, getAvailableSlots);

// Customer booking and history
router.post('/appointments', requireAuth, requireRole([Role.CUSTOMER]), bookAppointment);
router.get('/my-appointments', requireAuth, requireRole([Role.CUSTOMER]), getMyAppointments);
router.patch('/my-appointments/:id/cancel', requireAuth, requireRole([Role.CUSTOMER]), cancelMyAppointment);

export default router;

