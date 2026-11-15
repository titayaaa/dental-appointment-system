import { Request, Response } from 'express';
import { Role, SlotStatus, AppointmentStatus, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../types/auth.types';

/**
 * Generate unique appointment code like APT-202611-001
 */
function generateAppointmentCode(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(100 + Math.random() * 900);
  return `APT-${timestamp}-${random}`;
}

/**
 * GET /api/dentists
 * Query active dentists for client appointment booking
 */
export async function getDentists(req: Request, res: Response): Promise<void> {
  try {
    const dentists = await prisma.dentist.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        specialty: true,
      },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: dentists,
    });
  } catch (error) {
    console.error('Error in getDentists:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error: Unable to query dentists',
    });
  }
}

/**
 * GET /api/slots/available
 * Query future unreserved slots for a specific dentist and date
 */
export async function getAvailableSlots(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { dentistId, date } = req.query;

    if (!dentistId || !date) {
      res.status(400).json({
        success: false,
        error: 'Bad Request: Both dentistId and date are required query parameters',
      });
      return;
    }

    const targetDate = new Date(date as string);
    if (isNaN(targetDate.getTime())) {
      res.status(400).json({
        success: false,
        error: 'Bad Request: Invalid date format. Use YYYY-MM-DD',
      });
      return;
    }

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const now = new Date();

    const slots = await prisma.timeSlot.findMany({
      where: {
        status: SlotStatus.AVAILABLE,
        slotStart: {
          gt: now, // BR-02: Strictly future slots
          gte: startOfDay,
          lte: endOfDay,
        },
        schedule: {
          dentistId: dentistId as string,
        },
      },
      include: {
        schedule: {
          include: {
            dentist: {
              select: {
                id: true,
                name: true,
                specialty: true,
              },
            },
          },
        },
      },
      orderBy: {
        slotStart: 'asc',
      },
    });

    res.status(200).json({
      success: true,
      data: slots,
    });
  } catch (error) {
    console.error('Error in getAvailableSlots:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error: Unable to query available slots',
    });
  }
}

/**
 * POST /api/appointments
 * Atomically reserve a slot and create an appointment (BR-01, BR-02, BR-03)
 */
export async function bookAppointment(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: User authentication required',
      });
      return;
    }

    // Role Guard: Only CUSTOMER can book appointments
    if (req.user.role !== Role.CUSTOMER) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: Only customers can book appointments',
      });
      return;
    }

    const { dentistId, timeSlotId, serviceType, reasonForVisit } = req.body;

    if (!dentistId || !timeSlotId || !serviceType) {
      res.status(400).json({
        success: false,
        error: 'Bad Request: dentistId, timeSlotId, and serviceType are required',
      });
      return;
    }

    // 1. Check slot existence, current status, and dentist ownership
    const targetSlot = await prisma.timeSlot.findUnique({
      where: { id: timeSlotId },
      include: { schedule: true },
    });

    if (!targetSlot) {
      res.status(404).json({
        success: false,
        error: 'Not Found: Target time slot does not exist',
      });
      return;
    }

    // Data Integrity Guard: Ensure the slot belongs to the requested dentist
    if (targetSlot.schedule && targetSlot.schedule.dentistId !== dentistId) {
      res.status(400).json({
        success: false,
        error: 'Bad Request: Target time slot does not belong to the specified dentist',
      });
      return;
    }

    // BR-02: Reject slots in the past
    const now = new Date();
    if (new Date(targetSlot.slotStart) <= now) {
      res.status(400).json({
        success: false,
        error: 'Bad Request: Cannot reserve slots in the past',
      });
      return;
    }

    // BR-01: Reject if slot is already booked
    if (targetSlot.status !== SlotStatus.AVAILABLE) {
      res.status(409).json({
        success: false,
        error: 'Conflict: This time slot is no longer available. Please select another slot.',
      });
      return;
    }

    // BR-03: Check active booking quota (max 2 active appointments)
    const activeBookingsCount = await prisma.appointment.count({
      where: {
        customerId: req.user.id,
        status: {
          in: [AppointmentStatus.PENDING_REVIEW, AppointmentStatus.CONFIRMED],
        },
      },
    });

    if (activeBookingsCount >= 2) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: Booking limit reached: Max 2 active appointments allowed.',
      });
      return;
    }

    // 2. Execute Atomic Transaction (Lock -> Book Slot -> Create Appointment)
    const newAppointment = await prisma.$transaction(async (tx) => {
      // Re-verify slot availability inside transaction
      const currentSlot = await tx.timeSlot.findUnique({
        where: { id: timeSlotId },
      });

      if (!currentSlot || currentSlot.status !== SlotStatus.AVAILABLE) {
        throw new Error('CONCURRENCY_CONFLICT');
      }

      // Mark slot as BOOKED
      await tx.timeSlot.update({
        where: { id: timeSlotId },
        data: { status: SlotStatus.BOOKED },
      });

      // Create appointment record
      const appointment = await tx.appointment.create({
        data: {
          appointmentCode: generateAppointmentCode(),
          customerId: req.user!.id,
          dentistId,
          timeSlotId,
          serviceType,
          reasonForVisit: reasonForVisit || null,
          status: AppointmentStatus.PENDING_REVIEW,
        },
      });

      return appointment;
    });

    res.status(201).json({
      success: true,
      data: newAppointment,
    });
  } catch (error: any) {
    if (error.message === 'CONCURRENCY_CONFLICT' || error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      res.status(409).json({
        success: false,
        error: 'Conflict: This time slot is no longer available. Please select another slot.',
      });
      return;
    }

    console.error('Error in bookAppointment:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error: Unable to complete appointment booking',
    });
  }
}

/**
 * GET /api/my-appointments
 * Retrieve personal appointments for authenticated customer (BR-04 Data Privacy)
 */
export async function getMyAppointments(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: User authentication required',
      });
      return;
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        customerId: req.user.id, // Strictly isolated to current user
      },
      include: {
        dentist: {
          select: {
            id: true,
            name: true,
            specialty: true,
          },
        },
        timeSlot: {
          select: {
            id: true,
            slotStart: true,
            slotEnd: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error('Error in getMyAppointments:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error: Unable to retrieve appointments',
    });
  }
}

/**
 * PATCH /api/my-appointments/:id/cancel
 * Patient cancels their own appointment, releasing the time slot back to AVAILABLE (BR-06)
 */
export async function cancelMyAppointment(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: User authentication required',
      });
      return;
    }

    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      res.status(404).json({
        success: false,
        error: 'Not Found: Appointment record does not exist',
      });
      return;
    }

    // Data Privacy: Customer can only cancel their own appointment
    if (appointment.customerId !== req.user.id) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You are not authorized to cancel this appointment',
      });
      return;
    }

    // State Transition Guard: Cannot cancel appointment that is already completed or cancelled
    if (
      appointment.status !== AppointmentStatus.PENDING_REVIEW &&
      appointment.status !== AppointmentStatus.CONFIRMED
    ) {
      res.status(400).json({
        success: false,
        error: 'Bad Request: Cannot cancel an appointment that is already completed or cancelled',
      });
      return;
    }

    // Atomic cancellation & slot release
    await prisma.$transaction([
      prisma.appointment.update({
        where: { id },
        data: { status: AppointmentStatus.CANCELLED_BY_CUSTOMER },
      }),
      prisma.timeSlot.update({
        where: { id: appointment.timeSlotId },
        data: { status: SlotStatus.AVAILABLE },
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        message: 'Appointment cancelled successfully. Time slot has been released.',
      },
    });
  } catch (error) {
    console.error('Error in cancelMyAppointment:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error: Unable to cancel appointment',
    });
  }
}

