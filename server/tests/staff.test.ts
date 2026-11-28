import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { Role, ScheduleStatus, SlotStatus, AppointmentStatus } from '@prisma/client';
import app from '../src/app';
import prisma from '../src/lib/prisma';
import { generateToken } from '../src/utils/jwt';

describe('Feature F-03: Staff Schedule Planner & Master Appointment Management', () => {
  const staffUser = {
    id: 'usr-staff-1',
    email: 'staff@clinic.com',
    fullName: 'สมหญิง ผู้ช่วยทันตแพทย์',
    role: Role.STAFF,
  };

  const customerUser = {
    id: 'usr-cust-1',
    email: 'customer1@test.com',
    fullName: 'สมศักดิ์ รักฟันดี',
    role: Role.CUSTOMER,
  };

  const staffToken = generateToken(staffUser);
  const customerToken = generateToken(customerUser);

  const mockDentistId = 'dentist-somchai';

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Security & RBAC Enforcement (TEST-STAFF-01, TEST-STAFF-02 / BR-05)', () => {
    it('TEST-STAFF-02: should reject access with 401 Unauthorized when token is missing', async () => {
      const res = await request(app).get('/api/admin/appointments');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Unauthorized: Authentication token is missing or malformed');
    });

    it('TEST-STAFF-01: should reject customer with 403 Forbidden when attempting to access staff endpoints', async () => {
      const resAppointments = await request(app)
        .get('/api/admin/appointments')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(resAppointments.status).toBe(403);
      expect(resAppointments.body.success).toBe(false);
      expect(resAppointments.body.error).toContain('Forbidden: Access restricted to [STAFF]');

      const resSchedules = await request(app)
        .post('/api/admin/schedules')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          dentistId: mockDentistId,
          workDate: '2028-11-25',
          startTime: '09:00',
          endTime: '12:00',
        });

      expect(resSchedules.status).toBe(403);
      expect(resSchedules.body.success).toBe(false);
    });
  });

  describe('POST /api/admin/schedules (TEST-STAFF-03 / FR-02)', () => {
    it('should reject with 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/admin/schedules')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ dentistId: mockDentistId });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('dentistId, workDate, startTime, and endTime are required');
    });

    it('should reject with 404 when dentist is not found', async () => {
      vi.spyOn(prisma.dentist, 'findUnique').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/admin/schedules')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          dentistId: 'non-existent-dentist',
          workDate: '2028-11-25',
          startTime: '09:00',
          endTime: '12:00',
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Dentist does not exist');
    });

    it('should reject with 400 when shiftStart is in the past', async () => {
      vi.spyOn(prisma.dentist, 'findUnique').mockResolvedValue({
        id: mockDentistId,
        name: 'ทพ.สมชาย ใจดี',
        specialty: 'ทันตกรรมทั่วไป',
        isActive: true,
      } as any);

      const res = await request(app)
        .post('/api/admin/schedules')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          dentistId: mockDentistId,
          workDate: '2020-01-01',
          startTime: '09:00',
          endTime: '12:00',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Cannot create duty schedules in the past');
    });

    it('should reject with 400 when endTime is before or equal to startTime', async () => {
      vi.spyOn(prisma.dentist, 'findUnique').mockResolvedValue({
        id: mockDentistId,
        name: 'ทพ.สมชาย ใจดี',
        specialty: 'ทันตกรรมทั่วไป',
        isActive: true,
      } as any);

      const res = await request(app)
        .post('/api/admin/schedules')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          dentistId: mockDentistId,
          workDate: '2028-11-25',
          startTime: '14:00',
          endTime: '11:00',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('endTime must be strictly after startTime');
    });

    it('TEST-STAFF-03: should successfully register schedule and generate discrete 30-min AVAILABLE slots', async () => {
      vi.spyOn(prisma.dentist, 'findUnique').mockResolvedValue({
        id: mockDentistId,
        name: 'ทพ.สมชาย ใจดี',
        specialty: 'ทันตกรรมทั่วไป',
        isActive: true,
      } as any);

      const mockSchedule = {
        id: 'sched-101',
        dentistId: mockDentistId,
        workDate: new Date('2028-11-25T00:00:00.000Z'),
        startTime: new Date('2028-11-25T09:00:00.000Z'),
        endTime: new Date('2028-11-25T12:00:00.000Z'),
        status: ScheduleStatus.ACTIVE,
      };

      vi.spyOn(prisma, '$transaction').mockImplementation(async (cb: any) => {
        return cb({
          dentistSchedule: {
            create: vi.fn().mockResolvedValue(mockSchedule),
          },
          timeSlot: {
            createMany: vi.fn().mockResolvedValue({ count: 6 }),
          },
        });
      });

      const res = await request(app)
        .post('/api/admin/schedules')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          dentistId: mockDentistId,
          workDate: '2028-11-25',
          startTime: '09:00',
          endTime: '12:00',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.schedule.id).toBe('sched-101');
      // 09:00 to 12:00 = 3 hours = 6 x 30-min slots
      expect(res.body.data.generatedSlotsCount).toBe(6);
    });
  });

  describe('GET /api/admin/schedules', () => {
    it('should return all schedules with dentist and slot information', async () => {
      const mockSchedules = [
        {
          id: 'sched-101',
          dentistId: mockDentistId,
          workDate: new Date('2028-11-25'),
          startTime: new Date('2028-11-25T09:00:00.000Z'),
          endTime: new Date('2028-11-25T12:00:00.000Z'),
          status: ScheduleStatus.ACTIVE,
          dentist: { id: mockDentistId, name: 'ทพ.สมชาย ใจดี', specialty: 'ทันตกรรมทั่วไป' },
          timeSlots: [{ id: 'slot-1', status: SlotStatus.AVAILABLE }],
        },
      ];

      vi.spyOn(prisma.dentistSchedule, 'findMany').mockResolvedValue(mockSchedules as any);

      const res = await request(app)
        .get('/api/admin/schedules')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].dentist.name).toBe('ทพ.สมชาย ใจดี');
    });
  });

  describe('GET /api/admin/appointments (TEST-STAFF-04 / FR-05)', () => {
    it('TEST-STAFF-04: should return master list of appointments filtered by status', async () => {
      const mockAppointments = [
        {
          id: 'apt-1',
          appointmentCode: 'APT-202611-001',
          customerId: customerUser.id,
          dentistId: mockDentistId,
          timeSlotId: 'slot-1',
          serviceType: 'ขูดหินปูน',
          status: AppointmentStatus.PENDING_REVIEW,
          staffNotes: null,
          customer: { fullName: customerUser.fullName, email: customerUser.email, phoneNumber: '0812345678' },
          dentist: { name: 'ทพ.สมชาย ใจดี', specialty: 'ทันตกรรมทั่วไป' },
          timeSlot: { slotStart: new Date(), slotEnd: new Date(), status: SlotStatus.BOOKED },
        },
      ];

      vi.spyOn(prisma.appointment, 'findMany').mockResolvedValue(mockAppointments as any);

      const res = await request(app)
        .get('/api/admin/appointments?status=PENDING_REVIEW')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].appointmentCode).toBe('APT-202611-001');
      expect(res.body.data[0].customer.fullName).toBe('สมศักดิ์ รักฟันดี');
    });
  });

  describe('PATCH /api/admin/appointments/:id/status (TEST-STAFF-05, TEST-STAFF-06 / FR-06, BR-06)', () => {
    it('should reject with 400 when status is not CONFIRMED or CANCELLED_CONFLICT', async () => {
      const res = await request(app)
        .patch('/api/admin/appointments/apt-1/status')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: 'INVALID_STATUS' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('status must be either CONFIRMED or CANCELLED_CONFLICT');
    });

    it('should reject with 404 when appointment does not exist', async () => {
      vi.spyOn(prisma.appointment, 'findUnique').mockResolvedValue(null);

      const res = await request(app)
        .patch('/api/admin/appointments/apt-non-existent/status')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: AppointmentStatus.CONFIRMED });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Appointment record does not exist');
    });

    it('should reject with 400 when trying to alter COMPLETED or CANCELLED_CONFLICT appointment', async () => {
      vi.spyOn(prisma.appointment, 'findUnique').mockResolvedValue({
        id: 'apt-completed',
        status: AppointmentStatus.COMPLETED,
      } as any);

      const res1 = await request(app)
        .patch('/api/admin/appointments/apt-completed/status')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: AppointmentStatus.CANCELLED_CONFLICT });

      expect(res1.status).toBe(400);
      expect(res1.body.success).toBe(false);
      expect(res1.body.error).toContain('Cannot alter appointment that is completed or already cancelled');

      vi.spyOn(prisma.appointment, 'findUnique').mockResolvedValue({
        id: 'apt-conflict-cancelled',
        status: AppointmentStatus.CANCELLED_CONFLICT,
      } as any);

      const res2 = await request(app)
        .patch('/api/admin/appointments/apt-conflict-cancelled/status')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: AppointmentStatus.CONFIRMED });

      expect(res2.status).toBe(400);
      expect(res2.body.success).toBe(false);
      expect(res2.body.error).toContain('Cannot alter appointment that is completed or already cancelled');
    });

    it('TEST-STAFF-05: should successfully transition status to CONFIRMED', async () => {
      vi.spyOn(prisma.appointment, 'findUnique').mockResolvedValue({
        id: 'apt-1',
        timeSlotId: 'slot-1',
        status: AppointmentStatus.PENDING_REVIEW,
      } as any);

      vi.spyOn(prisma.appointment, 'update').mockResolvedValue({
        id: 'apt-1',
        status: AppointmentStatus.CONFIRMED,
        staffNotes: 'Confirmed by receptionist',
      } as any);

      const res = await request(app)
        .patch('/api/admin/appointments/apt-1/status')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          status: AppointmentStatus.CONFIRMED,
          staffNotes: 'Confirmed by receptionist',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.appointment.status).toBe('CONFIRMED');
      expect(res.body.data.message).toContain('Appointment successfully confirmed');
    });

    it('TEST-STAFF-06 (BR-06): should transition status to CANCELLED_CONFLICT and atomically release TimeSlot to AVAILABLE', async () => {
      const mockSlotId = 'slot-conflict-1';

      vi.spyOn(prisma.appointment, 'findUnique').mockResolvedValue({
        id: 'apt-conflict',
        timeSlotId: mockSlotId,
        status: AppointmentStatus.PENDING_REVIEW,
      } as any);

      const mockUpdatedAppointment = {
        id: 'apt-conflict',
        status: AppointmentStatus.CANCELLED_CONFLICT,
        staffNotes: 'ทันตแพทย์ติดเคสผ่าตัดด่วน ขออภัยในความไม่สะดวก',
      };

      vi.spyOn(prisma, '$transaction').mockImplementation(async (cb: any) => {
        return cb({
          appointment: {
            update: vi.fn().mockResolvedValue(mockUpdatedAppointment),
          },
          timeSlot: {
            update: vi.fn().mockResolvedValue({ id: mockSlotId, status: SlotStatus.AVAILABLE }),
          },
        });
      });

      const res = await request(app)
        .patch('/api/admin/appointments/apt-conflict/status')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          status: AppointmentStatus.CANCELLED_CONFLICT,
          staffNotes: 'ทันตแพทย์ติดเคสผ่าตัดด่วน ขออภัยในความไม่สะดวก',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.appointment.status).toBe('CANCELLED_CONFLICT');
      expect(res.body.data.message).toContain('time slot released back to AVAILABLE');
    });
  });
});
