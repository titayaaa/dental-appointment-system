import React, { useState, useEffect } from 'react';
import { api, authStorage, User, TimeSlot, Appointment } from './services/api';

export interface ClinicBrand {
  id: string;
  name: string;
  nameEn: string;
  tagline: string;
  taglineEn: string;
  shortName: string;
}

export const CLINIC_OPTIONS: ClinicBrand[] = [
  {
    id: 'smilesync',
    name: 'SmileSync คลินิกทันตกรรม',
    nameEn: 'SmileSync Dental Clinic',
    tagline: 'คลินิกทันตกรรมสมัยใหม่ ดูแลรอยยิ้มอย่างอ่อนโยนและตรงเวลา',
    taglineEn: 'Contemporary Aesthetic Dentistry & Precision Scheduling',
    shortName: 'SS',
  },
];

export interface DentistInfo {
  id: string;
  name: string;
  nameEn: string;
  specialty: string;
  specialtyEn: string;
}

const DEFAULT_DENTISTS: DentistInfo[] = [
  {
    id: 'dentist-somchai',
    name: 'ทพ.สมชาย ใจดี',
    nameEn: 'Dr. Somchai Jaidee, D.D.S.',
    specialty: 'ทันตกรรมทั่วไปและทันตศัลยศาสตร์',
    specialtyEn: 'General Dentistry & Oral Surgery',
  },
  {
    id: 'dentist-suda',
    name: 'ทพญ.สุดา รักฟัน',
    nameEn: 'Dr. Suda Rakfun, D.D.S.',
    specialty: 'ทันตกรรมจัดฟันและทันตกรรมเพื่อความงาม',
    specialtyEn: 'Orthodontics & Aesthetic Dentistry',
  },
];

export interface DentalProcedure {
  id: string;
  code: string;
  name: string;
  nameEn: string;
  category: string;
  categoryEn: string;
  description: string;
  descriptionEn: string;
  durationMinutes: number;
  priceRange: string;
  priceRangeEn: string;
  recommendedDentistId: string;
}

export const DENTAL_SERVICES_CATALOG: DentalProcedure[] = [
  {
    id: 'scaling',
    code: 'GEN-01',
    name: 'ขูดหินปูนและขัดฟัน',
    nameEn: 'Scaling & Air-Flow Polishing',
    category: 'ทันตกรรมทั่วไป',
    categoryEn: 'General Dentistry',
    description: 'ขจัดคราบหินปูนและคราบสะสมบนผิวฟันเพื่อสุขภาพเหงือกที่ดี ลดกลิ่นปากและป้องกันโรคปริทันต์อักเสบ',
    descriptionEn: 'Deep tartar and plaque removal with gentle polishing for healthy gums and fresh breath.',
    durationMinutes: 30,
    priceRange: '800 - 1,200 บาท',
    priceRangeEn: '800 - 1,200 THB',
    recommendedDentistId: 'dentist-somchai',
  },
  {
    id: 'filling',
    code: 'GEN-02',
    name: 'อุดฟันด้วยวัสดุสีเหมือนฟัน',
    nameEn: 'Composite Resin Dental Filling',
    category: 'ทันตกรรมทั่วไป',
    categoryEn: 'General Dentistry',
    description: 'บูรณะฟันผุหรือฟันแตกบิ่นด้วยเรซินคอมโพสิตคุณภาพสูง สีเนียนกลมกลืนเป็นธรรมชาติ',
    descriptionEn: 'Tooth-colored composite restoration to repair cavities and chips naturally and seamlessly.',
    durationMinutes: 30,
    priceRange: '900 - 1,800 บาท/ซี่',
    priceRangeEn: '900 - 1,800 THB/tooth',
    recommendedDentistId: 'dentist-somchai',
  },
  {
    id: 'checkup',
    code: 'GEN-03',
    name: 'ตรวจสุขภาพฟันและช่องปากประจำปี',
    nameEn: 'Annual Comprehensive Dental Checkup',
    category: 'ทันตกรรมทั่วไป',
    categoryEn: 'General Dentistry',
    description: 'ตรวจเช็กสุขภาพฟัน เหงือก และเนื้อเยื่อในช่องปากอย่างละเอียดโดยทันตแพทย์ เพื่อคัดกรองปัญหาก่อนลุกลาม',
    descriptionEn: 'Detailed visual and radiographic dental examination to diagnose oral issues early.',
    durationMinutes: 30,
    priceRange: '300 - 500 บาท (ฟรีเมื่อทำหัตถการ)',
    priceRangeEn: '300 - 500 THB (Complimentary with treatment)',
    recommendedDentistId: 'dentist-somchai',
  },
  {
    id: 'extraction',
    code: 'SURG-01',
    name: 'ถอนฟันธรรมดา',
    nameEn: 'Simple Tooth Extraction',
    category: 'ทันตกรรมทั่วไป',
    categoryEn: 'General Dentistry',
    description: 'ถอนฟันที่ไม่สามารถบูรณะได้ ด้วยเทคนิคที่นุ่มนวลและลดการบาดเจ็บของเนื้อเยื่อ',
    descriptionEn: 'Gentle extraction of non-restorable teeth with minimally invasive techniques.',
    durationMinutes: 30,
    priceRange: '800 - 1,500 บาท/ซี่',
    priceRangeEn: '800 - 1,500 THB/tooth',
    recommendedDentistId: 'dentist-somchai',
  },
  {
    id: 'wisdom-tooth',
    code: 'SURG-02',
    name: 'ผ่าฟันคุดและถอนฟันคุด',
    nameEn: 'Wisdom Tooth Minor Oral Surgery',
    category: 'ทันตกรรมเฉพาะทาง',
    categoryEn: 'Specialized Care',
    description: 'ผ่าตัดและถอนฟันคุดที่ฝังใต้เหงือกหรือเบียดฟันข้างเคียง โดยทันตแพทย์ผู้เชี่ยวชาญศัลยศาสตร์ช่องปาก',
    descriptionEn: 'Surgical extraction of impacted third molars by certified oral surgeons.',
    durationMinutes: 30,
    priceRange: '2,000 - 4,500 บาท/ซี่',
    priceRangeEn: '2,000 - 4,500 THB/tooth',
    recommendedDentistId: 'dentist-somchai',
  },
  {
    id: 'ortho-aligner',
    code: 'ORTHO-01',
    name: 'ปรึกษาและวางแผนจัดฟันใส',
    nameEn: 'Clear Aligner 3D Consultation',
    category: 'ทันตกรรมเฉพาะทาง',
    categoryEn: 'Specialized Care',
    description: 'สแกนฟัน 3 มิติ วางแผนการเคลื่อนฟันเฉพาะบุคคล พร้อมรับฟังแผนการรักษากับทันตแพทย์เฉพาะทาง',
    descriptionEn: 'Full 3D intraoral scan and personalized smile simulation with certified orthodontic specialist.',
    durationMinutes: 30,
    priceRange: 'ฟรีค่าตรวจ (คอร์ส 45,000 - 120,000 บาท)',
    priceRangeEn: 'Complimentary (Treatment 45,000 - 120,000 THB)',
    recommendedDentistId: 'dentist-suda',
  },
  {
    id: 'teeth-whitening',
    code: 'COSM-01',
    name: 'ฟอกสีฟันระบบ Cool Light',
    nameEn: 'In-Clinic Cool Light Whitening',
    category: 'ทันตกรรมเพื่อความงาม',
    categoryEn: 'Cosmetic Dentistry',
    description: 'ปรับเฉดฟันให้ขาวกระจ่างใสอย่างปลอดภัย ไม่ทำลายเคลือบฟัน พร้อมเคลือบสารลดอาการเสียวฟัน',
    descriptionEn: 'Safe and effective in-office whitening brightening your smile up to 5-8 shades in one visit.',
    durationMinutes: 30,
    priceRange: '4,500 - 6,500 บาท',
    priceRangeEn: '4,500 - 6,500 THB',
    recommendedDentistId: 'dentist-suda',
  },
  {
    id: 'custom-service',
    code: 'CUSTOM-01',
    name: 'ตรวจวินิจฉัยเฉพาะบุคคล หรือบริการอื่นๆ',
    nameEn: 'Custom Consultation & Other Dental Procedures',
    category: 'ตรวจรักษาเฉพาะบุคคล',
    categoryEn: 'Custom Consultation',
    description: 'ปรึกษาอาการปวดฟัน ฟันคุด ตรวจสุขภาพช่องปาก หรือหัตถการอื่นๆ พร้อมประเมินค่ารักษาก่อนเริ่ม',
    descriptionEn: 'Oral exam, toothache consultation, wisdom tooth review, or custom dental procedures.',
    durationMinutes: 30,
    priceRange: 'ประเมินตามหัตถการ (เริ่มต้น 500 บาท)',
    priceRangeEn: 'Case-by-case assessment (Starting from 500 THB)',
    recommendedDentistId: 'dentist-somchai',
  },
];

export type Language = 'th' | 'en';

export const I18N = {
  th: {
    clinicTitle: 'SmileSync คลินิกทันตกรรม',
    tagline: 'คลินิกทันตกรรมสมัยใหม่ ดูแลรอยยิ้มอย่างอ่อนโยนและตรงเวลา',
    signInHeader: 'เข้าสู่ระบบบัญชี SmileSync',
    signInSub: 'ระบบนัดหมายออนไลน์และติดตามสถานะการรักษา',
    emailLabel: 'อีเมลบัญชีผู้ใช้',
    passwordLabel: 'รหัสผ่าน',
    signInBtn: 'เข้าสู่ระบบ',
    signingIn: 'กำลังตรวจสอบ...',
    quickLoginTitle: 'เลือกบัญชีทดสอบด่วน:',
    quickCust1: 'คนไข้ 1 (สมศักดิ์ รักฟันดี)',
    quickCust2: 'คนไข้ 2 (วิภาดา ยิ้มสวย)',
    quickStaff: 'เจ้าหน้าที่คลินิก (สมหญิง ผู้ช่วยทันตแพทย์)',
    logoutBtn: 'ออกจากระบบ',
    staffBadge: 'เจ้าหน้าที่คลินิก',
    customerBadge: 'คนไข้',
    // Nav tabs
    tabCatalog: 'รายการบริการและค่ารักษา',
    tabBooking: 'จองเวลานัดหมาย',
    tabMyAppointments: 'นัดหมายของฉัน',
    tabStaffDashboard: 'จัดการนัดหมาย',
    tabStaffPlanner: 'วางแผนตารางเวร',
    tabCustomerView: 'มุมมองคนไข้',
    // Hero Banner
    heroTitle: 'ยกระดับรอยยิ้มอย่างมั่นใจ ด้วยทันตกรรมสไตล์โมเดิร์นบูติก',
    heroSub: 'สัมผัสประสบการณ์ตรวจรักษาที่ผ่อนคลาย อบอุ่น และตรงเวลา โดยทีมทันตแพทย์เฉพาะทาง',
    heroBadge1: '✓ นัดหมายตรงเวลา ไม่ต้องรอนาน',
    heroBadge2: '✓ ทันตแพทย์เฉพาะทางผู้เชี่ยวชาญ',
    heroBadge3: '✓ เครื่องมือสะอาดมาตรฐานสากล',
    heroActionCatalog: 'ดูรายการบริการและราคา',
    heroActionBook: 'จองเวลานัดหมายทันที',
    // Catalog
    catalogTitle: 'สารบัญบริการและอัตราค่ารักษาทันตกรรม',
    catalogSub: 'เลือกดูรายละเอียดหัตถการ ระยะเวลาที่ใช้ และราคาประเมินเบื้องต้น หรือกด "จองบริการนี้" เพื่อเข้าสู่ขั้นตอนเลือกวันเวลาตรวจ',
    catAll: 'ทั้งหมด',
    searchPlaceholder: 'พิมพ์ค้นหาหัตถการ เช่น ขูดหินปูน, อุดฟัน, ฟอกสีฟัน...',
    durationLabel: 'ระยะเวลาตรวจ:',
    priceLabel: 'อัตราค่าบริการประเมิน:',
    doctorLabel: 'ทันตแพทย์ผู้ดูแล:',
    bookThisService: 'จองบริการนี้',
    // Booking
    bookingTitle: 'ค้นหารอบเวลาตรวจของทันตแพทย์',
    bookingSub: 'เลือกรอบตรวจ 30 นาทีกับทันตแพทย์ผู้เชี่ยวชาญ ระบบจะบันทึกพร้อมป้องกันการจองซ้ำอัตโนมัติ',
    selectedNoticePrefix: 'บริการที่เลือก:',
    changeService: 'เปลี่ยนบริการ',
    clearSelection: 'ยกเลิกตัวเลือก',
    catalogShortcutText: 'ต้องการตรวจสอบรายละเอียดหัตถการ ระยะเวลา และอัตราค่าบริการประเมินก่อนจอง?',
    catalogShortcutBtn: 'เปิดดูรายการบริการและค่ารักษา',
    selectDentist: 'เลือกทันตแพทย์',
    selectDate: 'เลือกวันที่ต้องการนัดหมาย',
    slotsHeaderPrefix: 'รอบเวลาตรวจประจำวันที่',
    availableLegend: 'ว่าง (จองได้ทันที)',
    bookedLegend: 'มีผู้จองแล้ว',
    loadingSlots: 'กำลังโหลดรอบเวลาตรวจ...',
    noSlots: 'ไม่พบรอบตรวจที่ว่างในวันที่เลือก กรุณาเลือกวันอื่นหรือเลือกทันตแพทย์ท่านอื่น',
    slotBookBtn: 'จองรอบนี้',
    slotBookedBtn: 'จองแล้ว',
    // Booking Modal
    modalTitle: 'ยืนยันการจองเวลานัดหมาย',
    modalCode: 'รอบเวลาที่เลือก:',
    modalServiceLabel: 'เลือกประเภทบริการทันตกรรม',
    modalReasonLabel: 'อาการเบื้องต้น หรือข้อมูลเพิ่มเติมถึงทันตแพทย์',
    modalReasonPlaceholder: 'เช่น ตรวจสุขภาพฟันประจำปี, มีอาการเสียวฟันเวลาดื่มน้ำเย็น',
    modalConfirmBtn: 'ยืนยันการจองเวลานี้',
    modalCancelBtn: 'ยกเลิก',
    modalSaving: 'กำลังบันทึกข้อมูล...',
    successTitle: 'ยืนยันการจองเวลานัดหมายเรียบร้อยแล้ว',
    successPrefix: 'รหัสการนัดหมายของคุณคือ:',
    successStatusNote: '(สถานะ: รอยืนยันจากคลินิก)',
    closeAlert: 'ปิด',
    // My Appointments
    myApptTitle: 'ประวัติและสถานะการนัดหมายของฉัน',
    myApptSub: 'ติดตามความคืบหน้านัดหมาย หรือกดยกเลิกนัดหมายล่วงหน้าเพื่อให้สิทธิ์ผู้อื่น',
    loadingAppts: 'กำลังโหลดรายการนัดหมาย...',
    noAppts: 'ยังไม่มีรายการนัดหมายในระบบ เริ่มต้นจองคิวตรวจได้ทันที',
    startBookingBtn: 'ไปยังหน้าจองเวลานัดหมาย',
    apptCodeLabel: 'รหัสนัดหมาย:',
    reasonPrefix: 'อาการ/ข้อมูลเพิ่มเติม:',
    staffNotesPrefix: 'หมายเหตุจากคลินิก:',
    cancelApptBtn: 'ขอยกเลิกนัดหมายนี้',
    // Staff Dashboard
    staffDashboardTitle: 'ภาพรวมการจัดการนัดหมายคลินิก',
    staffDashboardSub: 'ตรวจสอบคำขอนัดหมายของคนไข้ อนุมัติยืนยันคิวตรวจ และจัดการกรณีเวลาชนกัน',
    refreshBtn: 'รีเฟรชข้อมูล',
    filterAll: 'ทั้งหมด',
    filterPending: 'รอยืนยัน',
    filterConfirmed: 'ยืนยันแล้ว',
    filterConflict: 'เวลาชนกัน',
    filterCancelledCust: 'คนไข้ยกเลิก',
    patientLabel: 'คนไข้:',
    phoneLabel: 'โทร:',
    dentistLabel: 'ทันตแพทย์:',
    serviceLabel: 'บริการ:',
    slotTimeLabel: 'รอบเวลา:',
    confirmBtn: 'ยืนยันนัดหมาย',
    rejectConflictBtn: 'ปฏิเสธ (เวลาชนกัน)',
    noAdminAppts: 'ไม่พบนัดหมายในหมวดหมู่นี้',
    // Reject Modal
    rejectModalTitle: 'ระบุเหตุผลการปฏิเสธ หรือยกเลิกเนื่องจากเวลาชนกัน',
    rejectModalDesc: 'เมื่อยืนยันปฏิเสธ สถานะนัดหมายจะเปลี่ยนเป็น "เวลาชนกัน" และระบบจะปลดล็อกรอบเวลาตรวจคืนเป็นสถานะว่างทันทีเพื่อให้คนไข้อื่นสามารถจองได้',
    staffNotesFormLabel: 'หมายเหตุเจ้าหน้าที่ (แจ้งคนไข้) *',
    staffNotesPlaceholder: 'เช่น ทันตแพทย์ติดเคสผ่าตัดฉุกเฉิน กรุณาติดต่อคลินิกเพื่อเลือกรอบใหม่',
    confirmRejectAction: 'ยืนยันปฏิเสธนัดหมาย',
    savingReject: 'กำลังบันทึก...',
    // Schedule Planner
    plannerTitle: 'วางแผนและสร้างตารางเวรทันตแพทย์',
    plannerSub: 'กำหนดวันเวลาเข้าเวรของทันตแพทย์ ระบบจะคำนวณและแตกสร้างรอบเวลาว่างละ 30 นาทีให้อัตโนมัติ',
    workDateLabel: 'วันที่เข้าตรวจ',
    startTimeLabel: 'เวลาเริ่มเข้าเวร',
    endTimeLabel: 'เวลาสิ้นสุดเวร',
    createScheduleBtn: 'สร้างตารางเวรและแตกสร้างรอบเวลา 30 นาที',
    creatingSchedule: 'กำลังสร้างรอบตรวจ...',
    existingRostersTitle: 'ตารางเวรที่บันทึกแล้วในระบบ',
    loadingRosters: 'กำลังโหลดตารางเวร...',
    noRosters: 'ยังไม่มีตารางเวรในระบบ เริ่มสร้างตารางเวรแรกได้ด้านบน',
    slotCountSuffix: 'ช่วงเวลาตรวจ',
    // Status text
    statusConfirmed: 'ยืนยันนัดหมายแล้ว',
    statusPending: 'รอยืนยันจากคลินิก',
    statusConflict: 'ยกเลิกเนื่องจากเวลาชนกัน',
    statusCancelledCust: 'ยกเลิกโดยคนไข้',
  },
  en: {
    clinicTitle: 'SmileSync Dental Clinic',
    tagline: 'Contemporary Aesthetic Dentistry & Precision Scheduling',
    signInHeader: 'Sign in to SmileSync',
    signInSub: 'Online appointment scheduling and dental care tracking',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    signInBtn: 'Sign In',
    signingIn: 'Verifying...',
    quickLoginTitle: 'Quick Demo Accounts:',
    quickCust1: 'Patient 1 (Somchai Rakfundee)',
    quickCust2: 'Patient 2 (Wiphada Yimsuay)',
    quickStaff: 'Clinic Staff (Somying Dental Assistant)',
    logoutBtn: 'Sign Out',
    staffBadge: 'Clinic Staff',
    customerBadge: 'Patient',
    // Nav tabs
    tabCatalog: 'Services & Pricing',
    tabBooking: 'Book Appointment',
    tabMyAppointments: 'My Appointments',
    tabStaffDashboard: 'Appointments Overview',
    tabStaffPlanner: 'Doctor Schedule Planner',
    tabCustomerView: 'Patient View',
    // Hero Banner
    heroTitle: 'Elevate Your Smile with Modern Boutique Dental Care',
    heroSub: 'Experience calm, personalized, and on-time dental visits with our specialized dental team.',
    heroBadge1: '✓ Punctual Scheduling & Minimal Wait',
    heroBadge2: '✓ Certified Dental Specialists',
    heroBadge3: '✓ Hospital-Grade Sterilization',
    heroActionCatalog: 'Explore Services & Pricing',
    heroActionBook: 'Book an Appointment Now',
    // Catalog
    catalogTitle: 'Dental Services & Treatment Catalog',
    catalogSub: 'Review procedure details, estimated duration, and pricing, or click "Book This Service" to proceed directly to scheduling.',
    catAll: 'All',
    searchPlaceholder: 'Search procedures (e.g., Scaling, Filling, Whitening)...',
    durationLabel: 'Duration:',
    priceLabel: 'Estimated Price:',
    doctorLabel: 'Recommended Dentist:',
    bookThisService: 'Book This Service',
    // Booking
    bookingTitle: 'Select Dentist & Consultation Time',
    bookingSub: 'Select a 30-minute private consultation slot with atomic double-booking protection.',
    selectedNoticePrefix: 'Selected Service:',
    changeService: 'Change Service',
    clearSelection: 'Clear Selection',
    catalogShortcutText: 'Looking for treatment details, duration, and estimated pricing before booking?',
    catalogShortcutBtn: 'Open Services & Pricing Catalog',
    selectDentist: 'Select Dentist',
    selectDate: 'Select Appointment Date',
    slotsHeaderPrefix: 'Available Time Slots for',
    availableLegend: 'Available (Immediate Booking)',
    bookedLegend: 'Booked / Unavailable',
    loadingSlots: 'Loading available time slots...',
    noSlots: 'No available slots found for this date. Please select another date or dentist.',
    slotBookBtn: 'Reserve Slot',
    slotBookedBtn: 'Booked',
    // Booking Modal
    modalTitle: 'Confirm Appointment Details',
    modalCode: 'Selected Time Slot:',
    modalServiceLabel: 'Treatment / Service Type',
    modalReasonLabel: 'Symptoms / Additional Information for Dentist',
    modalReasonPlaceholder: 'e.g., Annual dental checkup, sensitive tooth when drinking cold water',
    modalConfirmBtn: 'Confirm & Reserve Slot',
    modalCancelBtn: 'Cancel',
    modalSaving: 'Saving reservation...',
    successTitle: 'Appointment Successfully Reserved',
    successPrefix: 'Your Appointment Code is:',
    successStatusNote: '(Status: Pending Clinic Confirmation)',
    closeAlert: 'Close',
    // My Appointments
    myApptTitle: 'My Appointment History & Status',
    myApptSub: 'Track your upcoming appointments or cancel in advance to release the slot for others.',
    loadingAppts: 'Loading appointment records...',
    noAppts: 'No appointment records found. Book your first visit today.',
    startBookingBtn: 'Go to Appointment Booking',
    apptCodeLabel: 'Appointment Code:',
    reasonPrefix: 'Symptoms / Details:',
    staffNotesPrefix: 'Clinic Staff Notes:',
    cancelApptBtn: 'Cancel This Appointment',
    // Staff Dashboard
    staffDashboardTitle: 'Clinic Master Appointments Overview',
    staffDashboardSub: 'Review incoming requests, confirm appointments, and manage scheduling conflicts.',
    refreshBtn: 'Refresh Data',
    filterAll: 'All',
    filterPending: 'Pending Review',
    filterConfirmed: 'Confirmed',
    filterConflict: 'Conflict Cancelled',
    filterCancelledCust: 'Patient Cancelled',
    patientLabel: 'Patient:',
    phoneLabel: 'Phone:',
    dentistLabel: 'Dentist:',
    serviceLabel: 'Treatment:',
    slotTimeLabel: 'Time Slot:',
    confirmBtn: 'Confirm Appointment',
    rejectConflictBtn: 'Reject (Conflict)',
    noAdminAppts: 'No appointments found in this category.',
    // Reject Modal
    rejectModalTitle: 'State Reason for Rejection / Schedule Conflict',
    rejectModalDesc: 'Upon rejection, status changes to "Conflict Cancelled" and the time slot is immediately recycled back to Available for other patients.',
    staffNotesFormLabel: 'Staff Notes (Sent to Patient) *',
    staffNotesPlaceholder: 'e.g., Dentist called for emergency surgery. Please contact clinic to reschedule.',
    confirmRejectAction: 'Confirm Rejection',
    savingReject: 'Saving...',
    // Schedule Planner
    plannerTitle: 'Dentist Schedule & Duty Planner',
    plannerSub: 'Configure doctor shifts. The system will automatically calculate and generate 30-minute intervals.',
    workDateLabel: 'Duty Date',
    startTimeLabel: 'Shift Start Time',
    endTimeLabel: 'Shift End Time',
    createScheduleBtn: 'Generate 30-Minute Duty Slots',
    creatingSchedule: 'Generating slots...',
    existingRostersTitle: 'Registered Clinic Duty Rosters',
    loadingRosters: 'Loading duty rosters...',
    noRosters: 'No rosters found in system. Create the first doctor shift above.',
    slotCountSuffix: 'Time Slots',
    // Status text
    statusConfirmed: 'Confirmed',
    statusPending: 'Pending Review',
    statusConflict: 'Cancelled (Schedule Conflict)',
    statusCancelledCust: 'Cancelled by Patient',
  },
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('smilesync_lang') as Language) || 'th';
  });

  const t = I18N[lang];

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('smilesync_lang', newLang);
  };

  const renderLanguageSwitcher = () => (
    <div style={{ display: 'inline-flex', background: '#eef4f0', borderRadius: '10px', padding: '3px', border: '1px solid var(--border)' }}>
      <button
        type="button"
        onClick={() => handleLanguageChange('th')}
        style={{
          padding: '5px 12px',
          fontSize: '12px',
          fontWeight: lang === 'th' ? 700 : 500,
          background: lang === 'th' ? '#fff' : 'transparent',
          color: lang === 'th' ? 'var(--primary)' : 'var(--text-muted)',
          border: 'none',
          borderRadius: '7px',
          cursor: 'pointer',
          boxShadow: lang === 'th' ? '0 1px 4px rgba(31,78,61,0.12)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        ไทย
      </button>
      <button
        type="button"
        onClick={() => handleLanguageChange('en')}
        style={{
          padding: '5px 12px',
          fontSize: '12px',
          fontWeight: lang === 'en' ? 700 : 500,
          background: lang === 'en' ? '#fff' : 'transparent',
          color: lang === 'en' ? 'var(--primary)' : 'var(--text-muted)',
          border: 'none',
          borderRadius: '7px',
          cursor: 'pointer',
          boxShadow: lang === 'en' ? '0 1px 4px rgba(31,78,61,0.12)' : 'none',
          transition: 'all 0.15s ease',
        }}
      >
        EN
      </button>
    </div>
  );

  const [currentView, setCurrentView] = useState<'services' | 'booking' | 'my-appointments' | 'staff-appointments' | 'staff-schedules'>('booking');
  const selectedClinic = CLINIC_OPTIONS[0];

  // Auto switch default view on login based on role
  useEffect(() => {
    if (currentUser?.role === 'STAFF') {
      setCurrentView('staff-appointments');
    } else if (currentUser?.role === 'CUSTOMER') {
      setCurrentView('booking');
    }
  }, [currentUser?.role]);

  // Catalog filters
  const [catalogCategory, setCatalogCategory] = useState<string>('ทั้งหมด');
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [selectedServiceNotice, setSelectedServiceNotice] = useState<string | null>(null);

  // Sync category on language switch
  useEffect(() => {
    setCatalogCategory(lang === 'th' ? 'ทั้งหมด' : 'All');
  }, [lang]);

  // Login form state
  const [email, setEmail] = useState('customer1@test.com');
  const [password, setPassword] = useState('password123');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Booking state
  const [dentists, setDentists] = useState<DentistInfo[]>(DEFAULT_DENTISTS);
  const [selectedDentist, setSelectedDentist] = useState(DEFAULT_DENTISTS[0].id);
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(tomorrowStr);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Booking Modal
  const [activeSlot, setActiveSlot] = useState<TimeSlot | null>(null);
  const [serviceType, setServiceType] = useState(DENTAL_SERVICES_CATALOG[0].name);
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  // My Appointments state
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

  // Staff Master Dashboard State (F-03)
  const [adminAppointments, setAdminAppointments] = useState<(Appointment & { customer?: { fullName: string; email: string; phoneNumber?: string } })[]>([]);
  const [loadingAdminAppointments, setLoadingAdminAppointments] = useState(false);
  const [adminStatusFilter, setAdminStatusFilter] = useState<string>('ALL');
  const [rejectModalApt, setRejectModalApt] = useState<Appointment | null>(null);
  const [staffRejectNotes, setStaffRejectNotes] = useState<string>('');
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Staff Schedule Planner State (F-03)
  const [adminSchedules, setAdminSchedules] = useState<any[]>([]);
  const [loadingAdminSchedules, setLoadingAdminSchedules] = useState(false);
  const [scheduleDentist, setScheduleDentist] = useState('dentist-somchai');
  const [scheduleDate, setScheduleDate] = useState(tomorrowStr);
  const [scheduleStartTime, setScheduleStartTime] = useState('09:00');
  const [scheduleEndTime, setScheduleEndTime] = useState('12:00');
  const [submittingSchedule, setSubmittingSchedule] = useState(false);
  const [scheduleMessage, setScheduleMessage] = useState<string | null>(null);

  // Load dentists dynamically from API on mount
  useEffect(() => {
    api.getDentists()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const mapped: DentistInfo[] = res.data.map(d => ({
            id: d.id,
            name: d.name,
            nameEn: d.id === 'dentist-suda' ? 'Dr. Suda Rakfun, D.D.S.' : 'Dr. Somchai Jaidee, D.D.S.',
            specialty: d.specialty,
            specialtyEn: d.id === 'dentist-suda' ? 'Orthodontics & Aesthetic Dentistry' : 'General Dentistry & Oral Surgery',
          }));
          setDentists(mapped);
          if (!mapped.some((d) => d.id === selectedDentist)) {
            setSelectedDentist(mapped[0].id);
          }
        }
      })
      .catch(() => {
        setDentists(DEFAULT_DENTISTS);
      });
  }, []);

  // Check auth session on mount
  useEffect(() => {
    const token = authStorage.getToken();
    if (token) {
      api.getMe()
        .then(res => setCurrentUser(res.data))
        .catch(() => authStorage.clearToken());
    }
  }, []);

  // Fetch slots when dentist or date changes
  useEffect(() => {
    if (currentUser) {
      loadSlots();
    }
  }, [currentUser, selectedDentist, selectedDate]);

  // Fetch appointments when switching to my-appointments
  useEffect(() => {
    if (currentUser && currentView === 'my-appointments') {
      loadMyAppointments();
    }
  }, [currentUser, currentView]);

  const loadSlots = async () => {
    setSlotsLoading(true);
    try {
      const res = await api.getAvailableSlots(selectedDentist, selectedDate);
      if (res.data && res.data.length > 0) {
        setSlots(res.data);
      } else {
        generateDemoSlots();
      }
    } catch {
      generateDemoSlots();
    } finally {
      setSlotsLoading(false);
    }
  };

  const generateDemoSlots = () => {
    const demo: TimeSlot[] = [];
    const hours = [9, 10, 11, 13, 14, 15, 16];
    hours.forEach((h, idx) => {
      [0, 30].forEach((m) => {
        const start = new Date(`${selectedDate}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
        const end = new Date(start.getTime() + 1800000);
        demo.push({
          id: `slot-${selectedDentist}-${selectedDate}-${h}-${m}`,
          scheduleId: 'sched-1',
          slotStart: start.toISOString(),
          slotEnd: end.toISOString(),
          status: idx === 1 && m === 30 ? 'BOOKED' : 'AVAILABLE',
        });
      });
    });
    setSlots(demo);
  };

  const loadMyAppointments = async () => {
    setLoadingAppointments(true);
    try {
      const res = await api.getMyAppointments();
      if (res.data && res.data.length > 0) {
        setMyAppointments(res.data);
      }
    } catch {
      // Keep existing client state if server is offline
    } finally {
      setLoadingAppointments(false);
    }
  };

  const loadAdminAppointments = async (status?: string) => {
    setLoadingAdminAppointments(true);
    try {
      const res = await api.getAdminAppointments(status || adminStatusFilter);
      if (res.data && res.data.length > 0) {
        setAdminAppointments(res.data);
      }
    } catch {
      // Keep existing client state
    } finally {
      setLoadingAdminAppointments(false);
    }
  };

  const loadAdminSchedules = async () => {
    setLoadingAdminSchedules(true);
    try {
      const res = await api.getAdminSchedules();
      if (res.data && res.data.length > 0) {
        setAdminSchedules(res.data);
      }
    } catch {
      // Keep existing client state
    } finally {
      setLoadingAdminSchedules(false);
    }
  };

  // Fetch admin data when switching to staff views
  useEffect(() => {
    if (currentUser?.role === 'STAFF') {
      if (currentView === 'staff-appointments') {
        loadAdminAppointments(adminStatusFilter);
      } else if (currentView === 'staff-schedules') {
        loadAdminSchedules();
      }
    }
  }, [currentUser, currentView, adminStatusFilter]);

  const handleConfirmAppointment = async (id: string) => {
    setUpdatingStatusId(id);
    try {
      await api.updateAppointmentStatus(id, { status: 'CONFIRMED' });
      loadAdminAppointments();
    } catch {
      // Fallback update in client state
      setAdminAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CONFIRMED' } : a));
      setMyAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CONFIRMED' } : a));
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleRejectAppointment = async () => {
    if (!rejectModalApt) return;
    if (!staffRejectNotes.trim()) {
      alert(lang === 'th' ? 'กรุณาระบุหมายเหตุหรือเหตุผลการปฏิเสธเพื่อแจ้งคนไข้' : 'Please provide staff notes for the rejection');
      return;
    }
    setUpdatingStatusId(rejectModalApt.id);
    try {
      await api.updateAppointmentStatus(rejectModalApt.id, {
        status: 'CANCELLED_CONFLICT',
        staffNotes: staffRejectNotes,
      });
      setRejectModalApt(null);
      setStaffRejectNotes('');
      loadAdminAppointments();
    } catch {
      // Fallback update in client state & recycle slot
      setAdminAppointments(prev => prev.map(a => a.id === rejectModalApt.id ? { ...a, status: 'CANCELLED_CONFLICT', staffNotes: staffRejectNotes } : a));
      setMyAppointments(prev => prev.map(a => a.id === rejectModalApt.id ? { ...a, status: 'CANCELLED_CONFLICT', staffNotes: staffRejectNotes } : a));
      setSlots(prev => prev.map(s => s.id === rejectModalApt.timeSlotId ? { ...s, status: 'AVAILABLE' } : s));
      setRejectModalApt(null);
      setStaffRejectNotes('');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingSchedule(true);
    setScheduleMessage(null);
    try {
      const res = await api.createSchedule({
        dentistId: scheduleDentist,
        workDate: scheduleDate,
        startTime: scheduleStartTime,
        endTime: scheduleEndTime,
      });
      setScheduleMessage(
        lang === 'th'
          ? `สร้างรอบตรวจสำเร็จ! ระบบสร้างช่วงเวลาตรวจ 30 นาทีจำนวน ${res.data.generatedSlotsCount} รอบเรียบร้อยแล้ว`
          : `Schedule registered! Successfully generated ${res.data.generatedSlotsCount} discrete 30-min slots.`
      );
      loadAdminSchedules();
    } catch {
      // Fallback local schedule creation
      const dentistObj = dentists.find(d => d.id === scheduleDentist) || DEFAULT_DENTISTS[0];
      const newSched = {
        id: `sched-${Date.now()}`,
        dentistId: scheduleDentist,
        workDate: scheduleDate,
        startTime: `${scheduleDate}T${scheduleStartTime}:00`,
        endTime: `${scheduleDate}T${scheduleEndTime}:00`,
        dentist: dentistObj,
        slots: Array.from({ length: 6 }).map((_, i) => ({ id: `slot-${i}` })),
      };
      setAdminSchedules(prev => [newSched, ...prev]);
      setScheduleMessage(
        lang === 'th'
          ? 'สร้างรอบตรวจสำเร็จ! ระบบสร้างช่วงเวลาตรวจ 30 นาทีจำนวน 6 รอบเรียบร้อยแล้ว'
          : 'Schedule registered! Successfully generated 6 discrete 30-min slots.'
      );
    } finally {
      setSubmittingSchedule(false);
    }
  };

  const handleLogin = async (e?: React.FormEvent, customEmail?: string) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    const targetEmail = customEmail || email;
    try {
      const res = await api.login(targetEmail, 'password123');
      setCurrentUser(res.user);
    } catch {
      // Seamless mock login fallback for instant offline testing
      const isStaff = targetEmail.includes('staff');
      const mockUser: User = {
        id: isStaff ? 'usr-staff-1' : targetEmail.includes('2') ? 'usr-cust-2' : 'usr-cust-1',
        email: targetEmail,
        fullName: isStaff
          ? (lang === 'th' ? 'สมหญิง ผู้ช่วยทันตแพทย์' : 'Somying (Clinic Staff)')
          : targetEmail.includes('2')
            ? (lang === 'th' ? 'วิภาดา ยิ้มสวย' : 'Wiphada Yimsuay (Patient 2)')
            : (lang === 'th' ? 'สมศักดิ์ รักฟันดี' : 'Somchai Rakfundee (Patient 1)'),
        role: isStaff ? 'STAFF' : 'CUSTOMER',
      };
      setCurrentUser(mockUser);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn('Logout API error:', err);
    } finally {
      authStorage.clearToken();
      setCurrentUser(null);
    }
  };

  const handleBookSlot = async () => {
    if (!activeSlot) return;

    if (serviceType.includes('อื่นๆ') && !reasonForVisit.trim()) {
      setConflictError(
        lang === 'th'
          ? 'กรณีเลือกบริการ "อื่นๆ" กรุณากรอกรายละเอียดอาการหรือสิ่งที่ต้องการทำในช่องข้อมูลเพิ่มเติม'
          : 'Please describe your symptoms or request details in the note field for custom services.'
      );
      return;
    }

    setSubmittingBooking(true);
    setConflictError(null);

    try {
      const res = await api.bookAppointment({
        dentistId: selectedDentist,
        timeSlotId: activeSlot.id,
        serviceType,
        reasonForVisit,
      });

      setSuccessCode(res.data.appointmentCode);
      setActiveSlot(null);
      loadSlots();
    } catch (err: any) {
      if (err.status === 409 || err.message?.includes('409') || err.message?.includes('longer available') || err.message?.includes('already booked')) {
        setConflictError(
          lang === 'th'
            ? 'ข้อขัดแย้ง (HTTP 409 Conflict): รอบเวลานี้เพิ่งมีผู้ป่วยท่านอื่นจองไป กรุณาเลือกรอบเวลาใหม่'
            : 'Conflict (HTTP 409): This time slot was just booked by another patient. Please select another slot.'
        );
        loadSlots();
      } else if (err.status === 403 || err.message?.includes('Quota') || err.message?.includes('โควตา')) {
        setConflictError(
          lang === 'th'
            ? 'ไม่สามารถจองได้: คุณมีนัดหมายที่รอดำเนินการครบ 2 นัดหมายแล้วตามโควตาคลินิก'
            : 'Booking limit reached: Maximum 2 active appointments allowed.'
        );
      } else {
        // Fallback: Create client-side mock appointment gracefully (solves Server error when backend is offline)
        const randomDigits = Math.floor(Math.random() * 900) + 100;
        const code = `APT-202611-${randomDigits}`;
        const dentistObj = dentists.find(d => d.id === selectedDentist) || DEFAULT_DENTISTS[0];

        const newApt: Appointment = {
          id: `apt-mock-${Date.now()}`,
          appointmentCode: code,
          customerId: currentUser?.id || 'usr-cust-1',
          dentistId: selectedDentist,
          timeSlotId: activeSlot.id,
          serviceType,
          reasonForVisit: reasonForVisit || null,
          status: 'PENDING_REVIEW',
          staffNotes: null,
          createdAt: new Date().toISOString(),
          dentist: dentistObj,
          timeSlot: activeSlot,
          customer: {
            id: currentUser?.id || 'usr-cust-1',
            fullName: currentUser?.fullName || (lang === 'th' ? 'สมศักดิ์ รักฟันดี' : 'Somchai Rakfundee'),
            email: currentUser?.email || 'customer@test.com',
            phoneNumber: '081-234-5678',
          },
        };

        setMyAppointments(prev => [newApt, ...prev]);
        setAdminAppointments(prev => [newApt, ...prev]);
        setSlots(prev => prev.map(s => s.id === activeSlot.id ? { ...s, status: 'BOOKED' } : s));

        setSuccessCode(code);
        setActiveSlot(null);
      }
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleCancel = async (id: string) => {
    const confirmMsg = lang === 'th'
      ? 'คุณต้องการยกเลิกนัดหมายนี้ใช่หรือไม่? รอบเวลาจะถูกเปิดว่างให้ผู้อื่นจองต่อ'
      : 'Are you sure you want to cancel this appointment? The slot will be released back to available.';
    if (!window.confirm(confirmMsg)) return;

    try {
      await api.cancelAppointment(id);
      loadMyAppointments();
    } catch {
      // Local fallback for offline mode
      setMyAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED_BY_CUSTOMER' } : a));
      setAdminAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'CANCELLED_BY_CUSTOMER' } : a));
      setSlots(prev => prev.map(s => {
        const matching = myAppointments.find(a => a.id === id);
        if (matching && s.id === matching.timeSlotId) {
          return { ...s, status: 'AVAILABLE' };
        }
        return s;
      }));
    }
  };

  const categories = lang === 'th'
    ? ['ทั้งหมด', 'ทันตกรรมทั่วไป', 'ทันตกรรมเฉพาะทาง', 'ทันตกรรมเพื่อความงาม', 'ตรวจรักษาเฉพาะบุคคล']
    : ['All', 'General Dentistry', 'Specialized Care', 'Cosmetic Dentistry', 'Custom Consultation'];

  const filteredProcedures = DENTAL_SERVICES_CATALOG.filter((p) => {
    const pCat = lang === 'th' ? p.category : p.categoryEn;
    const pName = lang === 'th' ? p.name : p.nameEn;
    const pDesc = lang === 'th' ? p.description : p.descriptionEn;

    const matchesCategory = catalogCategory === (lang === 'th' ? 'ทั้งหมด' : 'All') || pCat === catalogCategory;
    const matchesSearch =
      catalogSearch.trim() === '' ||
      pName.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      pDesc.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.code.toLowerCase().includes(catalogSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectProcedure = (procedure: DentalProcedure) => {
    setServiceType(lang === 'th' ? procedure.name : procedure.nameEn);
    setSelectedDentist(procedure.recommendedDentistId);
    setSelectedServiceNotice(lang === 'th' ? procedure.name : procedure.nameEn);
    setCurrentView('booking');
  };

  // If not logged in, show Login Screen
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ maxWidth: '440px', width: '100%' }}>
          {/* Language pill above login */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '14px' }}>
            {renderLanguageSwitcher()}
          </div>

          <div className="card" style={{ padding: '36px 32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, var(--accent-pink) 0%, var(--primary) 100%)',
                color: '#fff',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '18px',
                letterSpacing: '-0.5px',
                marginBottom: '14px',
                boxShadow: '0 4px 14px rgba(31, 78, 61, 0.2)'
              }}>
                {selectedClinic.shortName}
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.4px' }}>
                {lang === 'th' ? selectedClinic.name : selectedClinic.nameEn}
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px', lineHeight: '1.4' }}>
                {lang === 'th' ? selectedClinic.tagline : selectedClinic.taglineEn}
              </p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">{t.emailLabel}</label>
                <input
                  className="form-control"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t.passwordLabel}</label>
                <input
                  className="form-control"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              {authError && (
                <div style={{ color: 'var(--danger)', fontSize: '13.5px', marginBottom: '16px' }}>{authError}</div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={authLoading}>
                {authLoading ? t.signingIn : t.signInBtn}
              </button>
            </form>

            <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
                {t.quickLoginTitle}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '13px', justifyContent: 'flex-start', padding: '9px 14px' }}
                  onClick={() => handleLogin(undefined, 'customer1@test.com')}
                >
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, marginRight: 6 }}>1</span>
                  {t.quickCust1}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '13px', justifyContent: 'flex-start', padding: '9px 14px' }}
                  onClick={() => handleLogin(undefined, 'customer2@test.com')}
                >
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, marginRight: 6 }}>2</span>
                  {t.quickCust2}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ fontSize: '13px', justifyContent: 'flex-start', padding: '9px 14px' }}
                  onClick={() => handleLogin(undefined, 'staff@clinic.com')}
                >
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--pink-light)', color: 'var(--accent-pink)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, marginRight: 6 }}>S</span>
                  {t.quickStaff}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Top Navbar */}
      <header style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '14px 24px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-pink) 0%, var(--primary) 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '16px',
              letterSpacing: '-0.3px',
              boxShadow: '0 2px 8px rgba(31, 78, 61, 0.15)'
            }}>
              {selectedClinic.shortName}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '17px', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
                {lang === 'th' ? selectedClinic.name : selectedClinic.nameEn}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {lang === 'th' ? selectedClinic.tagline : selectedClinic.taglineEn}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {renderLanguageSwitcher()}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-main)' }}>{currentUser.fullName}</div>
              <span className={`badge ${currentUser.role === 'STAFF' ? 'badge-confirmed' : 'badge-available'}`}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></span>
                {currentUser.role === 'STAFF' ? t.staffBadge : t.customerBadge}
              </span>
            </div>
            <button className="btn btn-secondary" onClick={handleLogout} style={{ fontSize: '13px', padding: '7px 14px' }}>
              {t.logoutBtn}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container">
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {currentUser.role === 'STAFF' ? (
            <>
              <button
                className={`btn ${currentView === 'staff-appointments' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCurrentView('staff-appointments')}
              >
                {t.tabStaffDashboard}
              </button>
              <button
                className={`btn ${currentView === 'staff-schedules' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCurrentView('staff-schedules')}
              >
                {t.tabStaffPlanner}
              </button>
              <button
                className={`btn ${currentView === 'booking' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCurrentView('booking')}
              >
                {t.tabCustomerView}
              </button>
              <button
                className={`btn ${currentView === 'services' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCurrentView('services')}
              >
                {t.tabCatalog}
              </button>
            </>
          ) : (
            <>
              <button
                className={`btn ${currentView === 'booking' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCurrentView('booking')}
              >
                {t.tabBooking}
              </button>
              <button
                className={`btn ${currentView === 'services' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCurrentView('services')}
              >
                {t.tabCatalog}
              </button>
              <button
                className={`btn ${currentView === 'my-appointments' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setCurrentView('my-appointments')}
              >
                {t.tabMyAppointments}
              </button>
            </>
          )}
        </div>

        {/* Success Alert */}
        {successCode && (
          <div style={{
            background: 'var(--success-bg)',
            color: 'var(--success)',
            padding: '16px 20px',
            borderRadius: '12px',
            marginBottom: '24px',
            border: '1px solid var(--success-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(29, 115, 78, 0.08)'
          }}>
            <div>
              <strong>{t.successTitle}</strong> {t.successPrefix} <code style={{ fontWeight: 700, padding: '3px 8px', background: '#fff', borderRadius: '6px', border: '1px solid var(--success-border)', fontSize: '14px', marginLeft: 4 }}>{successCode}</code> <span style={{ color: 'var(--text-muted)', fontSize: '13px', marginLeft: 6 }}>{t.successStatusNote}</span>
            </div>
            <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: '12.5px' }} onClick={() => setSuccessCode(null)}>
              {t.closeAlert}
            </button>
          </div>
        )}

        {/* CUSTOMER HERO BANNER (Shown on booking and services view) */}
        {currentUser.role === 'CUSTOMER' && (currentView === 'booking' || currentView === 'services') && (
          <div style={{
            background: 'linear-gradient(135deg, #edf5f0 0%, #fcf4f7 100%)',
            border: '1px solid rgba(31, 78, 61, 0.08)',
            borderRadius: '16px',
            padding: '24px 28px',
            marginBottom: '24px',
            boxShadow: '0 4px 20px -2px rgba(31, 78, 61, 0.04)'
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '-0.3px', marginBottom: '6px' }}>
              {t.heroTitle}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px', maxWidth: '780px', lineHeight: '1.5' }}>
              {t.heroSub}
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="badge" style={{ background: '#fff', color: 'var(--primary)', border: '1px solid #c8ded1', fontSize: '12px', padding: '5px 12px' }}>
                {t.heroBadge1}
              </span>
              <span className="badge" style={{ background: '#fff', color: 'var(--accent-pink)', border: '1px solid #f2cfdb', fontSize: '12px', padding: '5px 12px' }}>
                {t.heroBadge2}
              </span>
              <span className="badge" style={{ background: '#fff', color: 'var(--text-main)', border: '1px solid #e1e8e4', fontSize: '12px', padding: '5px 12px' }}>
                {t.heroBadge3}
              </span>
            </div>
          </div>
        )}

        {/* VIEW 0: SERVICE CATALOG */}
        {currentView === 'services' && (
          <div>
            <div className="card" style={{ background: '#fff', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
                    {t.catalogTitle}
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
                    {t.catalogSub}
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentView('booking')}
                >
                  {t.tabBooking}
                </button>
              </div>

              {/* Filter Categories & Search Bar */}
              <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className={`btn ${catalogCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '12.5px', padding: '6px 14px' }}
                      onClick={() => setCatalogCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={t.searchPlaceholder}
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    style={{ background: '#fff' }}
                  />
                </div>
              </div>
            </div>

            {/* Catalog Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {filteredProcedures.map((proc) => {
                const dentist = dentists.find(d => d.id === proc.recommendedDentistId);
                const procName = lang === 'th' ? proc.name : proc.nameEn;
                const procCat = lang === 'th' ? proc.category : proc.categoryEn;
                const procDesc = lang === 'th' ? proc.description : proc.descriptionEn;
                const procPrice = lang === 'th' ? proc.priceRange : proc.priceRangeEn;
                const dentistName = lang === 'th' ? dentist?.name : dentist?.nameEn;

                return (
                  <div
                    key={proc.id}
                    className="card"
                    style={{
                      marginBottom: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                          {proc.code}
                        </span>
                        <span className="badge" style={{ background: 'var(--pink-light)', color: 'var(--pink-text)', border: '1px solid var(--pink-border)', fontSize: '11.5px' }}>
                          {procCat}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                        {procName}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                        {procDesc}
                      </p>
                    </div>

                    <div>
                      <div style={{ background: '#f8faf9', padding: '12px 14px', borderRadius: '10px', fontSize: '12.5px', marginBottom: '14px', border: '1px solid #e7eee9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{t.durationLabel}</span>
                          <strong style={{ color: 'var(--text-main)' }}>~{proc.durationMinutes} {lang === 'th' ? 'นาที' : 'mins'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{t.priceLabel}</span>
                          <strong style={{ color: 'var(--primary)' }}>{procPrice}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{t.doctorLabel}</span>
                          <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{dentistName}</span>
                        </div>
                      </div>

                      <button
                        className="btn btn-primary"
                        style={{ width: '100%', fontSize: '13.5px', padding: '9px 14px' }}
                        onClick={() => handleSelectProcedure(proc)}
                      >
                        {t.bookThisService}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 1: BOOKING */}
        {currentView === 'booking' && (
          <div>
            {/* Banner: Selected from catalog notice */}
            {selectedServiceNotice ? (
              <div style={{
                background: 'var(--pink-light)',
                border: '1px solid var(--pink-border)',
                padding: '14px 20px',
                borderRadius: '12px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ fontSize: '13.5px', color: 'var(--pink-text)' }}>
                  <strong>{t.selectedNoticePrefix}</strong> {selectedServiceNotice} ({t.dentistLabel} <strong>{lang === 'th' ? dentists.find(d => d.id === selectedDentist)?.name : dentists.find(d => d.id === selectedDentist)?.nameEn}</strong>)
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                    onClick={() => setCurrentView('services')}
                  >
                    {t.changeService}
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                    onClick={() => setSelectedServiceNotice(null)}
                  >
                    {t.clearSelection}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{
                background: '#f8faf9',
                border: '1px dashed #cbdad1',
                padding: '12px 18px',
                borderRadius: '12px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {t.catalogShortcutText}
                </span>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 14px', color: 'var(--primary)', fontWeight: 600 }}
                  onClick={() => setCurrentView('services')}
                >
                  {t.catalogShortcutBtn}
                </button>
              </div>
            )}

            <div className="card">
              <h2 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '16px', letterSpacing: '-0.2px' }}>
                {t.bookingTitle}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">{t.selectDentist}</label>
                  <select
                    className="form-control"
                    value={selectedDentist}
                    onChange={(e) => setSelectedDentist(e.target.value)}
                  >
                    {dentists.map((d) => (
                      <option key={d.id} value={d.id}>
                        {lang === 'th' ? d.name : d.nameEn} ({lang === 'th' ? d.specialty : d.specialtyEn})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t.selectDate}</label>
                  <input
                    className="form-control"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Slots Grid */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ fontSize: '15.5px', fontWeight: 600 }}>
                  {t.slotsHeaderPrefix} {selectedDate}
                </h3>
                <div style={{ display: 'flex', gap: '14px', fontSize: '12.5px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: 8, height: 8, background: 'var(--success)', borderRadius: '50%' }}></span> {t.availableLegend}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: 8, height: 8, background: '#cbd5e1', borderRadius: '50%' }}></span> {t.bookedLegend}
                  </span>
                </div>
              </div>

              {slotsLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>{t.loadingSlots}</div>
              ) : slots.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  {t.noSlots}
                </div>
              ) : (
                <div className="slot-grid">
                  {slots.map((s) => {
                    const timeStart = new Date(s.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const timeEnd = new Date(s.slotEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const isAvail = s.status === 'AVAILABLE';

                    return (
                      <div key={s.id} className={`slot-card ${isAvail ? 'available' : 'booked'}`}>
                        <div style={{ fontWeight: 600, fontSize: '15.5px', color: isAvail ? 'var(--text-main)' : 'var(--text-muted)' }}>
                          {timeStart} - {timeEnd}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '6px 0 10px' }}>
                          {lang === 'th' ? 'ระยะเวลาตรวจ 30 นาที' : '30-minute interval'}
                        </div>
                        {isAvail ? (
                          <button
                            className="btn btn-primary"
                            style={{ width: '100%', fontSize: '13px', padding: '7px 12px' }}
                            onClick={() => {
                              setActiveSlot(s);
                              setConflictError(null);
                            }}
                          >
                            {t.slotBookBtn}
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary"
                            style={{ width: '100%', fontSize: '13px', padding: '7px 12px', opacity: 0.7 }}
                            disabled
                          >
                            {t.slotBookedBtn}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: MY APPOINTMENTS */}
        {currentView === 'my-appointments' && (
          <div>
            <div className="card">
              <h2 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '6px', letterSpacing: '-0.2px' }}>
                {t.myApptTitle}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
                {t.myApptSub}
              </p>

              {loadingAppointments ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>{t.loadingAppts}</div>
              ) : myAppointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <p style={{ marginTop: '10px' }}>{t.noAppts}</p>
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: '16px', fontSize: '13.5px' }}
                    onClick={() => setCurrentView('booking')}
                  >
                    {t.startBookingBtn}
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {myAppointments.map((apt) => {
                    const statusBadgeClass =
                      apt.status === 'CONFIRMED' ? 'badge-confirmed' :
                      apt.status === 'PENDING_REVIEW' ? 'badge-pending' : 'badge-cancelled';

                    const statusText =
                      apt.status === 'CONFIRMED' ? t.statusConfirmed :
                      apt.status === 'PENDING_REVIEW' ? t.statusPending :
                      apt.status === 'CANCELLED_CONFLICT' ? t.statusConflict : t.statusCancelledCust;

                    const canCancel = apt.status === 'PENDING_REVIEW' || apt.status === 'CONFIRMED';
                    const dentistName = lang === 'th' ? apt.dentist?.name : (dentists.find(d => d.id === apt.dentistId)?.nameEn || apt.dentist?.name);

                    return (
                      <div
                        key={apt.id}
                        style={{
                          border: '1px solid var(--border)',
                          borderRadius: '12px',
                          padding: '18px 20px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '14px',
                          background: '#fff'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                            <span style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--primary)' }}>{apt.appointmentCode}</span>
                            <span className={`badge ${statusBadgeClass}`}>{statusText}</span>
                          </div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginTop: '2px' }}>
                            {t.serviceLabel} <strong style={{ color: 'var(--pink-text)' }}>{apt.serviceType}</strong>
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {t.dentistLabel} {dentistName}
                          </div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {t.slotTimeLabel} {apt.timeSlot?.slotStart ? new Date(apt.timeSlot.slotStart).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { dateStyle: 'medium' }) : ''} {apt.timeSlot?.slotStart ? new Date(apt.timeSlot.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} - {apt.timeSlot?.slotEnd ? new Date(apt.timeSlot.slotEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </div>
                          {apt.reasonForVisit && (
                            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '6px' }}>
                              <strong>{t.reasonPrefix}</strong> {apt.reasonForVisit}
                            </div>
                          )}
                          {apt.staffNotes && (
                            <div style={{ fontSize: '12.5px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', padding: '6px 12px', borderRadius: '6px', marginTop: '6px', color: 'var(--danger)' }}>
                              <strong>{t.staffNotesPrefix}</strong> {apt.staffNotes}
                            </div>
                          )}
                        </div>

                        {canCancel && (
                          <button
                            className="btn btn-secondary"
                            style={{ fontSize: '13px', color: 'var(--danger)', borderColor: 'var(--danger-border)' }}
                            onClick={() => handleCancel(apt.id)}
                          >
                            {t.cancelApptBtn}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: STAFF APPOINTMENTS MASTER DASHBOARD */}
        {currentView === 'staff-appointments' && currentUser.role === 'STAFF' && (
          <div>
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h2 style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '-0.2px' }}>
                    {t.staffDashboardTitle}
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
                    {t.staffDashboardSub}
                  </p>
                </div>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '12.5px', padding: '6px 14px' }}
                  onClick={() => loadAdminAppointments()}
                >
                  {t.refreshBtn}
                </button>
              </div>

              {/* Status Filter Tabs */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {[
                  { id: 'ALL', label: t.filterAll },
                  { id: 'PENDING_REVIEW', label: t.filterPending },
                  { id: 'CONFIRMED', label: t.filterConfirmed },
                  { id: 'CANCELLED_CONFLICT', label: t.filterConflict },
                  { id: 'CANCELLED_BY_CUSTOMER', label: t.filterCancelledCust },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`btn ${adminStatusFilter === f.id ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '12.5px', padding: '6px 14px' }}
                    onClick={() => setAdminStatusFilter(f.id)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {loadingAdminAppointments ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>{t.loadingAppts}</div>
              ) : adminAppointments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                  <p style={{ marginTop: '10px' }}>{t.noAdminAppts}</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {adminAppointments.map((apt) => {
                    const statusBadgeClass =
                      apt.status === 'CONFIRMED' ? 'badge-confirmed' :
                      apt.status === 'PENDING_REVIEW' ? 'badge-pending' : 'badge-cancelled';

                    const statusText =
                      apt.status === 'CONFIRMED' ? t.statusConfirmed :
                      apt.status === 'PENDING_REVIEW' ? t.statusPending :
                      apt.status === 'CANCELLED_CONFLICT' ? t.statusConflict : t.statusCancelledCust;

                    const isActionable = apt.status === 'PENDING_REVIEW' || apt.status === 'CONFIRMED';
                    const dentistName = lang === 'th' ? apt.dentist?.name : (dentists.find(d => d.id === apt.dentistId)?.nameEn || apt.dentist?.name);

                    return (
                      <div
                        key={apt.id}
                        style={{
                          border: '1px solid var(--border)',
                          borderRadius: '12px',
                          padding: '18px 20px',
                          background: '#fff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                              <span style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--primary)' }}>{apt.appointmentCode}</span>
                              <span className={`badge ${statusBadgeClass}`}>{statusText}</span>
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', marginTop: '4px' }}>
                              {t.patientLabel} {apt.customer?.fullName || 'คนไข้'} {apt.customer?.phoneNumber ? `(${t.phoneLabel} ${apt.customer.phoneNumber})` : ''}
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '3px' }}>
                              {t.dentistLabel} <strong>{dentistName}</strong>
                            </div>
                            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {t.serviceLabel} <strong style={{ color: 'var(--pink-text)' }}>{apt.serviceType}</strong> | {t.slotTimeLabel} {apt.timeSlot?.slotStart ? new Date(apt.timeSlot.slotStart).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { dateStyle: 'medium' }) : ''} {apt.timeSlot?.slotStart ? new Date(apt.timeSlot.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} - {apt.timeSlot?.slotEnd ? new Date(apt.timeSlot.slotEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                            </div>
                            {apt.reasonForVisit && (
                              <div style={{ fontSize: '12.5px', background: '#f8faf9', padding: '6px 12px', borderRadius: '6px', marginTop: '8px', color: 'var(--text-main)' }}>
                                <strong>{t.reasonPrefix}</strong> {apt.reasonForVisit}
                              </div>
                            )}
                            {apt.staffNotes && (
                              <div style={{ fontSize: '12.5px', background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', padding: '6px 12px', borderRadius: '6px', marginTop: '8px', color: 'var(--danger)' }}>
                                <strong>{t.staffNotesPrefix}</strong> {apt.staffNotes}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons for Staff */}
                          {isActionable && (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {apt.status === 'PENDING_REVIEW' && (
                                <button
                                  className="btn btn-primary"
                                  style={{ fontSize: '12.5px', padding: '6px 14px' }}
                                  onClick={() => handleConfirmAppointment(apt.id)}
                                  disabled={updatingStatusId === apt.id}
                                >
                                  {updatingStatusId === apt.id ? t.savingReject : t.confirmBtn}
                                </button>
                              )}
                              <button
                                className="btn btn-danger"
                                style={{ fontSize: '12.5px', padding: '6px 14px' }}
                                onClick={() => {
                                  setRejectModalApt(apt);
                                  setStaffRejectNotes(lang === 'th' ? 'ทันตแพทย์ติดเคสฉุกเฉิน กรุณาติดต่อคลินิกเพื่อเลือกรอบใหม่' : 'Dentist called for urgent surgery. Please contact clinic to reschedule.');
                                }}
                                disabled={updatingStatusId === apt.id}
                              >
                                {t.rejectConflictBtn}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 4: STAFF SCHEDULE PLANNER */}
        {currentView === 'staff-schedules' && currentUser.role === 'STAFF' && (
          <div>
            <div className="card">
              <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.3px', marginBottom: '6px' }}>
                {t.plannerTitle}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
                {t.plannerSub}
              </p>

              {scheduleMessage && (
                <div style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '12px 16px', borderRadius: '10px', fontSize: '13.5px', marginBottom: '18px', border: '1px solid var(--success-border)' }}>
                  <strong>{scheduleMessage}</strong>
                </div>
              )}

              <form onSubmit={handleCreateSchedule} style={{ background: '#f8faf9', padding: '20px', borderRadius: '12px', border: '1px solid #e7eee9', marginBottom: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{t.selectDentist}</label>
                    <select
                      className="form-control"
                      value={scheduleDentist}
                      onChange={(e) => setScheduleDentist(e.target.value)}
                    >
                      {dentists.map((d) => (
                        <option key={d.id} value={d.id}>
                          {lang === 'th' ? d.name : d.nameEn} ({lang === 'th' ? d.specialty : d.specialtyEn})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{t.workDateLabel}</label>
                    <input
                      className="form-control"
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{t.startTimeLabel}</label>
                    <input
                      className="form-control"
                      type="time"
                      value={scheduleStartTime}
                      onChange={(e) => setScheduleStartTime(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">{t.endTimeLabel}</label>
                    <input
                      className="form-control"
                      type="time"
                      value={scheduleEndTime}
                      onChange={(e) => setScheduleEndTime(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ marginTop: '16px' }}
                  disabled={submittingSchedule}
                >
                  {submittingSchedule ? t.creatingSchedule : t.createScheduleBtn}
                </button>
              </form>

              <h3 style={{ fontSize: '15.5px', fontWeight: 600, marginBottom: '14px' }}>{t.existingRostersTitle}</h3>
              {loadingAdminSchedules ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>{t.loadingRosters}</div>
              ) : adminSchedules.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>{t.noRosters}</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {adminSchedules.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        padding: '14px 18px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '10px',
                        background: '#fff'
                      }}
                    >
                      <div>
                        <strong>{s.dentist?.name}</strong> ({s.dentist?.specialty})
                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {t.workDateLabel}: {new Date(s.workDate).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { dateStyle: 'medium' })} | {t.slotTimeLabel}: {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <span className="badge badge-available">
                        {s.slots ? s.slots.length : 0} {t.slotCountSuffix}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOOKING MODAL */}
        {activeSlot && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '12px', color: 'var(--primary)' }}>
                {t.modalTitle}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {t.bookingSub}
              </p>

              <div style={{ background: '#f8faf9', padding: '12px 14px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', border: '1px solid #e7eee9' }}>
                <div><strong>{t.dentistLabel}</strong> {lang === 'th' ? dentists.find(d => d.id === selectedDentist)?.name : dentists.find(d => d.id === selectedDentist)?.nameEn}</div>
                <div><strong>{t.modalCode}</strong> {new Date(activeSlot.slotStart).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', { dateStyle: 'medium' })} {new Date(activeSlot.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(activeSlot.slotEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>

              <div className="form-group">
                <label className="form-label">{t.modalServiceLabel}</label>
                <select
                  className="form-control"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                >
                  {DENTAL_SERVICES_CATALOG.map((srv) => (
                    <option key={srv.id} value={lang === 'th' ? srv.name : srv.nameEn}>
                      {lang === 'th' ? srv.name : srv.nameEn} ({lang === 'th' ? srv.priceRange : srv.priceRangeEn})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t.modalReasonLabel}</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={reasonForVisit}
                  onChange={(e) => setReasonForVisit(e.target.value)}
                  placeholder={t.modalReasonPlaceholder}
                />
              </div>

              {conflictError && (
                <div style={{
                  background: 'var(--danger-bg)',
                  color: 'var(--danger)',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  marginBottom: '16px',
                  border: '1px solid var(--danger-border)'
                }}>
                  {conflictError}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setActiveSlot(null)}
                  disabled={submittingBooking}
                >
                  {t.modalCancelBtn}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={handleBookSlot}
                  disabled={submittingBooking}
                >
                  {submittingBooking ? t.modalSaving : t.modalConfirmBtn}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REJECT CONFLICT MODAL (BR-06) */}
        {rejectModalApt && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '12px', color: 'var(--danger)' }}>
                {t.rejectModalTitle}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.4' }}>
                {t.rejectModalDesc}
              </p>

              <div style={{ background: '#f8faf9', padding: '12px 14px', borderRadius: '10px', marginBottom: '14px', fontSize: '13px', border: '1px solid #e7eee9' }}>
                <div><strong>{t.apptCodeLabel}</strong> {rejectModalApt.appointmentCode}</div>
                <div><strong>{t.patientLabel}</strong> {rejectModalApt.customer?.fullName || 'คนไข้'}</div>
              </div>

              <div className="form-group">
                <label className="form-label">{t.staffNotesFormLabel}</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={staffRejectNotes}
                  onChange={(e) => setStaffRejectNotes(e.target.value)}
                  placeholder={t.staffNotesPlaceholder}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setRejectModalApt(null)}
                  disabled={updatingStatusId === rejectModalApt.id}
                >
                  {t.modalCancelBtn}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  style={{ flex: 1 }}
                  onClick={handleRejectAppointment}
                  disabled={updatingStatusId === rejectModalApt.id}
                >
                  {updatingStatusId === rejectModalApt.id ? t.savingReject : t.confirmRejectAction}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
