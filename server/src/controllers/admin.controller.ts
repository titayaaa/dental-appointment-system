import { Response } from 'express';
import { Role, ScheduleStatus, SlotStatus, AppointmentStatus, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { AuthenticatedRequest } from '../types/auth.types';

/**
 * POST /api/admin/schedules
 * Register dentist shift and automatically generate discrete 30-minute slots (FR-02)
 */
export async function createSchedule(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { dentistId, workDate, startTime, endTime } = req.body;

    if (!dentistId || !workDate || !startTime || !endTime) {
      res.status(400).json({
        success: false,
        error: 'Bad Request: dentistId, workDate, startTime, and endTime are required',
      });
      return;
    }

    // Verify dentist exists
    const dentist = await prisma.dentist.findUnique({
      where: { id: dentistId },
    });

    if (!dentist) {
      res.status(404).json({
        success: false,
        error: 'Not Found: Dentist does not exist',
      });
      return;
    }

    const dateObj = new Date(workDate);
    if (isNaN(dateObj.getTime())) {
      res.status(400).json({
        success: false,
        error: 'Bad Request: Invalid workDate format. Use YYYY-MM-DD',
      });
      return;
    }

    // Parse shift start and end times
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    if (
      isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM) ||
      startH < 0 || startH > 23 || endH < 0 || endH > 23
    ) {
      res.status(400).json({
        success: false,
        error: 'Bad Request: Invalid time format. Use HH:MM in 24-hour format',
      });
      return;
    }

    const shiftStart = new Date(dateObj);
    shiftStart.setHours(startH, startM, 0, 0);

    const shiftEnd = new Date(dateObj);
    shiftEnd.setHours(endH, endM, 0, 0);

    // Prevent creating schedules in the past
    if (shiftStart < new Date()) {
      res.status(400).json({
        success: false,
        error: 'Bad Request: Cannot create duty schedules in the past',
      });
      return;
    }

    if (shiftEnd <= shiftStart) {
      res.status(400).json({
        success: false,
        error: 'Bad Request: endTime must be strictly after startTime',
      });
      return;
    }

    // Generate discrete 30-minute time intervals
    const slotsToCreate: { slotStart: Date; slotEnd: Date; status: SlotStatus }[] = [];
    let current = new Date(shiftStart);

    while (current.getTime() + 30 * 60 * 1000 <= shiftEnd.getTime()) {
      const slotStart = new Date(current);
      const slotEnd = new Date(current.getTime() + 30 * 60 * 1000);

      slotsToCreate.push({
        slotStart,
        slotEnd,
        status: SlotStatus.AVAILABLE,
      });

      current = slotEnd;
    }

    if (slotsToCreate.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Bad Request: Time range must be at least 30 minutes long',
      });
      return;
    }

    // Execute atomic creation of schedule and associated slots
    const result = await prisma.$transaction(async (tx) => {
      const newSchedule = await tx.dentistSchedule.create({
        data: {
          dentistId,
          workDate: dateObj,
          startTime: shiftStart,
          endTime: shiftEnd,
          status: ScheduleStatus.ACTIVE,
        },
      });

      const slotsData = slotsToCreate.map((slot) => ({
        scheduleId: newSchedule.id,
        slotStart: slot.slotStart,
        slotEnd: slot.slotEnd,
        status: slot.status,
      }));

      await tx.timeSlot.createMany({
        data: slotsData,
      });

      return {
        schedule: newSchedule,
        generatedSlotsCount: slotsData.length,
      };
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in createSchedule:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error: Unable to create schedule',
    });
  }
}

/**
 * GET /api/admin/schedules
 * Retrieve all registered schedules with dentists and slot counts (FR-02)
 */
export async function getSchedules(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const schedules = await prisma.dentistSchedule.findMany({
      include: {
        dentist: {
          select: {
            id: true,
            name: true,
            specialty: true,
          },
        },
        slots: {
          select: {
            id: true,
            slotStart: true,
            slotEnd: true,
            status: true,
          },
        },
      },
      orderBy: {
        workDate: 'asc',
      },
    });

    res.status(200).json({
      success: true,
      data: schedules,
    });
  } catch (error) {
    console.error('Error in getSchedules:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error: Unable to query schedules',
    });
  }
}

/**
 * GET /api/admin/appointments
 * Master appointment review list for clinic staff (FR-05, BR-05)
 */
export async function getAppointments(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { status, date } = req.query;

    const whereClause: Prisma.AppointmentWhereInput = {};

    if (status && status !== 'ALL') {
      whereClause.status = status as AppointmentStatus;
    }

    if (date) {
      const targetDate = new Date(date as string);
      if (!isNaN(targetDate.getTime())) {
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        whereClause.timeSlot = {
          slotStart: {
            gte: startOfDay,
            lte: endOfDay,
          },
        };
      }
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phoneNumber: true,
          },
        },
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
    console.error('Error in getAppointments:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error: Unable to query appointments',
    });
  }
}

/**
 * PATCH /api/admin/appointments/:id/status
 * Staff manages appointment state transitions and conflict slot release (FR-06, BR-06)
 */
export async function updateAppointmentStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { status, staffNotes } = req.body;

    if (!status || ![AppointmentStatus.CONFIRMED, AppointmentStatus.CANCELLED_CONFLICT].includes(status)) {
      res.status(400).json({
        success: false,
        error: 'Bad Request: status must be either CONFIRMED or CANCELLED_CONFLICT',
      });
      return;
    }

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

    // State transition guard
    if (
      appointment.status === AppointmentStatus.COMPLETED ||
      appointment.status === AppointmentStatus.CANCELLED_BY_CUSTOMER ||
      appointment.status === AppointmentStatus.CANCELLED_CONFLICT
    ) {
      res.status(400).json({
        success: false,
        error: 'Bad Request: Cannot alter appointment that is completed or already cancelled',
      });
      return;
    }

    // Handle atomic status update & slot recycle (BR-06)
    if (status === AppointmentStatus.CANCELLED_CONFLICT) {
      const updatedAppointment = await prisma.$transaction(async (tx) => {
        const apt = await tx.appointment.update({
          where: { id },
          data: {
            status: AppointmentStatus.CANCELLED_CONFLICT,
            staffNotes: staffNotes || 'Cancelled due to scheduling conflict or provider emergency',
          },
        });

        // Crucial BR-06 rule: release timeSlot back to AVAILABLE
        await tx.timeSlot.update({
          where: { id: appointment.timeSlotId },
          data: { status: SlotStatus.AVAILABLE },
        });

        return apt;
      });

      res.status(200).json({
        success: true,
        data: {
          appointment: updatedAppointment,
          message: 'Appointment marked as CANCELLED_CONFLICT and time slot released back to AVAILABLE',
        },
      });
      return;
    }

    // Status is CONFIRMED
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.CONFIRMED,
        staffNotes: staffNotes || appointment.staffNotes,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        appointment: updatedAppointment,
        message: 'Appointment successfully confirmed',
      },
    });
  } catch (error) {
    console.error('Error in updateAppointmentStatus:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error: Unable to update appointment status',
    });
  }
}
