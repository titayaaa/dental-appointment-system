import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { Role, SlotStatus, AppointmentStatus } from '@prisma/client';
import app from '../src/app';
import prisma from '../src/lib/prisma';
import { generateToken } from '../src/utils/jwt';

describe('Feature F-02: Patient Slot Discovery & Booking Integration Tests', () => {
  const customerUser = {
    id: 'usr-cust-1',
    email: 'customer1@test.com',
    fullName: 'สมศักดิ์ รักฟันดี',
    role: Role.CUSTOMER,
  };

  const staffUser = {
    id: 'usr-staff-1',
    email: 'staff@clinic.com',
    fullName: 'สมหญิง ผู้ช่วยทันตแพทย์',
    role: Role.STAFF,
  };

  const customerToken = generateToken(customerUser);
  const staffToken = generateToken(staffUser);

  const mockDentistId = 'dentist-uuid-1';
  const mockSlotId = 'slot-uuid-1';

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/slots/available (TEST-CUST-01 / AC-01)', () => {
    it('should reject with 401 when Authorization token is missing', async () => {
      const res = await request(app).get(`/api/slots/available?dentistId=${mockDentistId}&date=2026-11-20`);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject with 400 when dentistId or date query params are missing', async () => {
      const res = await request(app)
        .get('/api/slots/available')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Both dentistId and date are required');
    });

    it('TEST-CUST-01: should return only AVAILABLE future slots for the given dentist and date', async () => {
      const futureStart1 = new Date(Date.now() + 86400000);
      futureStart1.setHours(9, 0, 0, 0);
      const futureEnd1 = new Date(futureStart1);
      futureEnd1.setMinutes(30);

      const mockSlots = [
        {
          id: 'slot-1',
          scheduleId: 'sched-1',
          slotStart: futureStart1,
          slotEnd: futureEnd1,
          status: SlotStatus.AVAILABLE,
          schedule: {
            dentist: {
              id: mockDentistId,
              name: 'ทพ.สมชาย ใจดี',
              specialty: 'ทันตกรรมทั่วไป',
            },
          },
        },
      ];

      vi.spyOn(prisma.timeSlot, 'findMany').mockResolvedValue(mockSlots as any);

      const res = await request(app)
        .get(`/api/slots/available?dentistId=${mockDentistId}&date=2026-11-20`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].id).toBe('slot-1');
      expect(res.body.data[0].status).toBe('AVAILABLE');
    });
  });

  describe('POST /api/appointments (TEST-CUST-02, TEST-TDD-01, TEST-VAL-01, TEST-VAL-02)', () => {
    it('should reject with 401 when Authorization token is missing', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .send({
          dentistId: mockDentistId,
          timeSlotId: mockSlotId,
          serviceType: 'ขูดหินปูน',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should reject with 403 when user is not a CUSTOMER (Role restriction)', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          dentistId: mockDentistId,
          timeSlotId: mockSlotId,
          serviceType: 'ขูดหินปูน',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Forbidden: Access restricted to [CUSTOMER]');
    });

    it('should reject with 400 when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ dentistId: mockDentistId });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('dentistId, timeSlotId, and serviceType are required');
    });

    it('TEST-VAL-01: should reject booking with 400 when slot start time is in the past (BR-02)', async () => {
      const pastStart = new Date(Date.now() - 3600000); // 1 hour ago
      const pastEnd = new Date(pastStart.getTime() + 1800000);

      vi.spyOn(prisma.timeSlot, 'findUnique').mockResolvedValue({
        id: mockSlotId,
        scheduleId: 'sched-1',
        slotStart: pastStart,
        slotEnd: pastEnd,
        status: SlotStatus.AVAILABLE,
      } as any);

      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          dentistId: mockDentistId,
          timeSlotId: mockSlotId,
          serviceType: 'ขูดหินปูน',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Cannot reserve slots in the past');
    });

    it('TEST-VAL-02: should reject booking with 403 when patient already has 2 active appointments (BR-03)', async () => {
      const futureStart = new Date(Date.now() + 86400000);
      const futureEnd = new Date(futureStart.getTime() + 1800000);

      vi.spyOn(prisma.timeSlot, 'findUnique').mockResolvedValue({
        id: mockSlotId,
        scheduleId: 'sched-1',
        slotStart: futureStart,
        slotEnd: futureEnd,
        status: SlotStatus.AVAILABLE,
      } as any);

      // Mock user having 2 active bookings
      vi.spyOn(prisma.appointment, 'count').mockResolvedValue(2);

      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          dentistId: mockDentistId,
          timeSlotId: mockSlotId,
          serviceType: 'ขูดหินปูน',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Booking limit reached: Max 2 active appointments allowed');
    });

    it('TEST-TDD-01: should reject competing booking with 409 Conflict when slot is already BOOKED (BR-01 Concurrency)', async () => {
      const futureStart = new Date(Date.now() + 86400000);
      const futureEnd = new Date(futureStart.getTime() + 1800000);

      // Slot is already BOOKED by another customer
      vi.spyOn(prisma.timeSlot, 'findUnique').mockResolvedValue({
        id: mockSlotId,
        scheduleId: 'sched-1',
        slotStart: futureStart,
        slotEnd: futureEnd,
        status: SlotStatus.BOOKED,
      } as any);

      vi.spyOn(prisma.appointment, 'count').mockResolvedValue(0);

      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          dentistId: mockDentistId,
          timeSlotId: mockSlotId,
          serviceType: 'อุดฟัน',
        });

      // Crucial assertion: Must return 409 Conflict
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('This time slot is no longer available');
    });

    it('TEST-CUST-02: should successfully book appointment, set PENDING_REVIEW and return 201 Created (Happy Path)', async () => {
      const futureStart = new Date(Date.now() + 86400000);
      const futureEnd = new Date(futureStart.getTime() + 1800000);

      vi.spyOn(prisma.timeSlot, 'findUnique').mockResolvedValue({
        id: mockSlotId,
        scheduleId: 'sched-1',
        slotStart: futureStart,
        slotEnd: futureEnd,
        status: SlotStatus.AVAILABLE,
      } as any);

      vi.spyOn(prisma.appointment, 'count').mockResolvedValue(0);

      const mockAppointment = {
        id: 'apt-new-uuid',
        appointmentCode: 'APT-202611-002',
        customerId: customerUser.id,
        dentistId: mockDentistId,
        timeSlotId: mockSlotId,
        serviceType: 'ขูดหินปูน',
        reasonForVisit: 'ตรวจสุขภาพฟัน',
        status: AppointmentStatus.PENDING_REVIEW,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock transaction
      vi.spyOn(prisma, '$transaction').mockImplementation(async (cb: any) => {
        return cb({
          timeSlot: {
            findUnique: vi.fn().mockResolvedValue({
              id: mockSlotId,
              status: SlotStatus.AVAILABLE,
              slotStart: futureStart,
            }),
            update: vi.fn().mockResolvedValue({ id: mockSlotId, status: SlotStatus.BOOKED }),
          },
          appointment: {
            create: vi.fn().mockResolvedValue(mockAppointment),
          },
        });
      });

      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          dentistId: mockDentistId,
          timeSlotId: mockSlotId,
          serviceType: 'ขูดหินปูน',
          reasonForVisit: 'ตรวจสุขภาพฟัน',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.appointmentCode).toBe('APT-202611-002');
      expect(res.body.data.status).toBe('PENDING_REVIEW');
    });
  });
});
