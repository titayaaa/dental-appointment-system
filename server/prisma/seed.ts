import { PrismaClient, Role, ScheduleStatus, SlotStatus, AppointmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for SmileSync Dental Clinic...');

  // 1. Password configuration from environment or secure defaults
  const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
  const demoPassword = process.env.DEMO_USER_PASSWORD || 'password123';

  const staffPasswordHash = await bcrypt.hash(adminPassword, 10);
  const demoPasswordHash = await bcrypt.hash(demoPassword, 10);

  // 2. Upsert Seed Users (Non-destructive / idempotent)
  const staffUser = await prisma.user.upsert({
    where: { email: 'staff@clinic.com' },
    update: {
      passwordHash: staffPasswordHash,
      role: Role.STAFF,
    },
    create: {
      email: 'staff@clinic.com',
      passwordHash: staffPasswordHash,
      fullName: 'สมหญิง ผู้ช่วยทันตแพทย์ (Staff)',
      phoneNumber: '0812345678',
      role: Role.STAFF,
    },
  });

  const customer1 = await prisma.user.upsert({
    where: { email: 'customer1@test.com' },
    update: {},
    create: {
      email: 'customer1@test.com',
      passwordHash: demoPasswordHash,
      fullName: 'สมศักดิ์ รักฟันดี (Customer 1)',
      phoneNumber: '0898765432',
      role: Role.CUSTOMER,
    },
  });

  const customer2 = await prisma.user.upsert({
    where: { email: 'customer2@test.com' },
    update: {},
    create: {
      email: 'customer2@test.com',
      passwordHash: demoPasswordHash,
      fullName: 'วิภาดา ยิ้มสวย (Customer 2)',
      phoneNumber: '0861112233',
      role: Role.CUSTOMER,
    },
  });

  console.log(`✅ Seeded Users:
  - Staff: ${staffUser.email} (Role: STAFF)
  - Customer 1: ${customer1.email} (Role: CUSTOMER)
  - Customer 2: ${customer2.email} (Role: CUSTOMER)`);

  // 3. Upsert Dentists (using deterministic IDs matching frontend discovery)
  const dentist1 = await prisma.dentist.upsert({
    where: { id: 'dentist-somchai' },
    update: {},
    create: {
      id: 'dentist-somchai',
      name: 'ทพ.สมชาย ใจดี',
      specialty: 'ทันตกรรมทั่วไป',
      isActive: true,
    },
  });

  const dentist2 = await prisma.dentist.upsert({
    where: { id: 'dentist-suda' },
    update: {},
    create: {
      id: 'dentist-suda',
      name: 'ทพญ.สุดา รักฟัน',
      specialty: 'ทันตกรรมจัดฟัน',
      isActive: true,
    },
  });

  console.log(`✅ Seeded Dentists:
  - ${dentist1.name} (ความเชี่ยวชาญ: ${dentist1.specialty})
  - ${dentist2.name} (ความเชี่ยวชาญ: ${dentist2.specialty})`);

  // 4. Create Schedules and 30-min Time Slots for Tomorrow if not already existing
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  let schedule1 = await prisma.dentistSchedule.findFirst({
    where: { dentistId: dentist1.id, workDate: tomorrow },
  });

  if (!schedule1) {
    const shiftStart1 = new Date(tomorrow);
    shiftStart1.setHours(9, 0, 0, 0);
    const shiftEnd1 = new Date(tomorrow);
    shiftEnd1.setHours(12, 0, 0, 0);

    schedule1 = await prisma.dentistSchedule.create({
      data: {
        dentistId: dentist1.id,
        workDate: tomorrow,
        startTime: shiftStart1,
        endTime: shiftEnd1,
        status: ScheduleStatus.ACTIVE,
      },
    });

    const slotsData1 = [];
    for (let hour = 9; hour < 12; hour++) {
      for (const minute of [0, 30]) {
        const slotStart = new Date(tomorrow);
        slotStart.setHours(hour, minute, 0, 0);
        const slotEnd = new Date(tomorrow);
        slotEnd.setHours(minute === 0 ? hour : hour + 1, minute === 0 ? 30 : 0, 0, 0);

        slotsData1.push({
          scheduleId: schedule1.id,
          slotStart,
          slotEnd,
          status: SlotStatus.AVAILABLE,
        });
      }
    }
    await prisma.timeSlot.createMany({ data: slotsData1 });
  }

  let schedule2 = await prisma.dentistSchedule.findFirst({
    where: { dentistId: dentist2.id, workDate: tomorrow },
  });

  if (!schedule2) {
    const shiftStart2 = new Date(tomorrow);
    shiftStart2.setHours(13, 0, 0, 0);
    const shiftEnd2 = new Date(tomorrow);
    shiftEnd2.setHours(16, 0, 0, 0);

    schedule2 = await prisma.dentistSchedule.create({
      data: {
        dentistId: dentist2.id,
        workDate: tomorrow,
        startTime: shiftStart2,
        endTime: shiftEnd2,
        status: ScheduleStatus.ACTIVE,
      },
    });

    const slotsData2 = [];
    for (let hour = 13; hour < 16; hour++) {
      for (const minute of [0, 30]) {
        const slotStart = new Date(tomorrow);
        slotStart.setHours(hour, minute, 0, 0);
        const slotEnd = new Date(tomorrow);
        slotEnd.setHours(minute === 0 ? hour : hour + 1, minute === 0 ? 30 : 0, 0, 0);

        slotsData2.push({
          scheduleId: schedule2.id,
          slotStart,
          slotEnd,
          status: SlotStatus.AVAILABLE,
        });
      }
    }
    await prisma.timeSlot.createMany({ data: slotsData2 });
  }

  // 5. Seed sample Appointment if not exists
  const existingAppt = await prisma.appointment.findFirst({
    where: { appointmentCode: 'APT-202611-001' },
  });

  if (!existingAppt) {
    const bookedSlot = await prisma.timeSlot.findFirst({
      where: {
        scheduleId: schedule1.id,
        status: SlotStatus.AVAILABLE,
      },
      orderBy: { slotStart: 'asc' },
    });

    if (bookedSlot) {
      await prisma.timeSlot.update({
        where: { id: bookedSlot.id },
        data: { status: SlotStatus.BOOKED },
      });

      const appointment = await prisma.appointment.create({
        data: {
          appointmentCode: 'APT-202611-001',
          customerId: customer1.id,
          dentistId: dentist1.id,
          timeSlotId: bookedSlot.id,
          serviceType: 'ขูดหินปูน',
          reasonForVisit: 'ตรวจฟันประจำปี และมีอาการเสียวฟันกรามล่างขวา',
          status: AppointmentStatus.PENDING_REVIEW,
        },
      });

      console.log(`✅ Seeded Sample Appointment: ${appointment.appointmentCode}`);
    }
  }

  console.log('🎉 Non-destructive Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
