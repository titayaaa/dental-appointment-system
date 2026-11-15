import { PrismaClient, Role, ScheduleStatus, SlotStatus, AppointmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for SmileSync Dental Clinic...');

  // 1. Clean existing records (in reverse dependency order)
  await prisma.appointment.deleteMany();
  await prisma.timeSlot.deleteMany();
  await prisma.dentistSchedule.deleteMany();
  await prisma.dentist.deleteMany();
  await prisma.user.deleteMany();
  console.log('🧹 Cleaned existing database records.');

  // 2. Hash default password ("password123")
  const salt = await bcrypt.genSalt(10);
  const defaultPasswordHash = await bcrypt.hash('password123', salt);

  // 3. Create Seed Users
  const staffUser = await prisma.user.create({
    data: {
      email: 'staff@clinic.com',
      passwordHash: defaultPasswordHash,
      fullName: 'สมหญิง ผู้ช่วยทันตแพทย์ (Staff)',
      phoneNumber: '0812345678',
      role: Role.STAFF,
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: 'customer1@test.com',
      passwordHash: defaultPasswordHash,
      fullName: 'สมศักดิ์ รักฟันดี (Customer 1)',
      phoneNumber: '0898765432',
      role: Role.CUSTOMER,
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'customer2@test.com',
      passwordHash: defaultPasswordHash,
      fullName: 'วิภาดา ยิ้มสวย (Customer 2)',
      phoneNumber: '0861112233',
      role: Role.CUSTOMER,
    },
  });

  console.log(`✅ Seeded Users:
  - Staff: ${staffUser.email} (Role: STAFF)
  - Customer 1: ${customer1.email} (Role: CUSTOMER)
  - Customer 2: ${customer2.email} (Role: CUSTOMER)
  (All accounts use password: "password123")`);

  // 4. Create Dentists (using deterministic IDs matching frontend discovery)
  const dentist1 = await prisma.dentist.create({
    data: {
      id: 'dentist-somchai',
      name: 'ทพ.สมชาย ใจดี',
      specialty: 'ทันตกรรมทั่วไป',
      isActive: true,
    },
  });

  const dentist2 = await prisma.dentist.create({
    data: {
      id: 'dentist-suda',
      name: 'ทพญ.สุดา รักฟัน',
      specialty: 'ทันตกรรมจัดฟัน',
      isActive: true,
    },
  });

  console.log(`✅ Seeded Dentists:
  - ${dentist1.name} (ความเชี่ยวชาญ: ${dentist1.specialty})
  - ${dentist2.name} (ความเชี่ยวชาญ: ${dentist2.specialty})`);

  // 5. Create Schedules and 30-min Time Slots for Tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  // Schedule for Dr. Somchai (09:00 - 12:00)
  const shiftStart1 = new Date(tomorrow);
  shiftStart1.setHours(9, 0, 0, 0);

  const shiftEnd1 = new Date(tomorrow);
  shiftEnd1.setHours(12, 0, 0, 0);

  const schedule1 = await prisma.dentistSchedule.create({
    data: {
      dentistId: dentist1.id,
      workDate: tomorrow,
      startTime: shiftStart1,
      endTime: shiftEnd1,
      status: ScheduleStatus.ACTIVE,
    },
  });

  // Generate discrete 30-min slots for Schedule 1 (6 slots: 09:00, 09:30, 10:00, 10:30, 11:00, 11:30)
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

  await prisma.timeSlot.createMany({
    data: slotsData1,
  });

  // Schedule for Dr. Suda (13:00 - 16:00)
  const shiftStart2 = new Date(tomorrow);
  shiftStart2.setHours(13, 0, 0, 0);

  const shiftEnd2 = new Date(tomorrow);
  shiftEnd2.setHours(16, 0, 0, 0);

  const schedule2 = await prisma.dentistSchedule.create({
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

  await prisma.timeSlot.createMany({
    data: slotsData2,
  });

  // 6. Seed a sample Appointment (Customer 1 books slot 1 of Dr. Somchai at 09:00)
  const bookedSlot = await prisma.timeSlot.findFirst({
    where: {
      scheduleId: schedule1.id,
    },
    orderBy: {
      slotStart: 'asc',
    },
  });

  if (bookedSlot) {
    // Update slot status to BOOKED
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

    console.log(`✅ Seeded Sample Appointment:
  - Code: ${appointment.appointmentCode}
  - Patient: ${customer1.fullName}
  - Dentist: ${dentist1.name}
  - Slot Time: ${bookedSlot.slotStart.toLocaleTimeString()}
  - Status: ${appointment.status}`);
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

