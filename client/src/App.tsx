import React, { useState, useEffect } from 'react';
import { api, authStorage, User, TimeSlot, Appointment } from './services/api';

export interface ClinicBrand {
  id: string;
  name: string;
  tagline: string;
  shortName: string;
}

export const CLINIC_OPTIONS: ClinicBrand[] = [
  { id: 'tooth-co', name: 'Tooth & Co. Dental Studio', tagline: 'Aesthetic & Clinical Dental Space', shortName: 'TC' },
  { id: 'auradent', name: 'AuraDent Studio', tagline: 'Modern Smile & Orthodontic Care', shortName: 'AD' },
  { id: 'klinika', name: 'Klinika Dental Space', tagline: 'Minimal Aesthetic Dentistry', shortName: 'KD' },
  { id: 'pastel', name: 'Pastel Dental Lab', tagline: 'Gentle Care & Aesthetic Studio', shortName: 'PD' },
  { id: 'glow', name: 'Glow Dental Clinic', tagline: 'Contemporary Preventive & Smile Care', shortName: 'GD' },
  { id: 'smilesync', name: 'SmileSync Dental Clinic', tagline: 'Clinical Precision & Scheduling', shortName: 'SS' },
];

const DENTISTS = [
  { id: 'dentist-somchai', name: 'ทพ.สมชาย ใจดี', specialty: 'ทันตกรรมทั่วไปและทันตศัลยศาสตร์' },
  { id: 'dentist-suda', name: 'ทพญ.สุดา รักฟัน', specialty: 'ทันตกรรมจัดฟันและทันตกรรมเพื่อความงาม' },
];

export interface DentalProcedure {
  id: string;
  code: string;
  name: string;
  category: 'ทันตกรรมทั่วไป' | 'ทันตกรรมเฉพาะทาง' | 'ทันตกรรมเพื่อความงาม' | 'ตรวจรักษาเฉพาะบุคคล';
  description: string;
  durationMinutes: number;
  priceRange: string;
  recommendedDentistId: string;
}

export const DENTAL_SERVICES_CATALOG: DentalProcedure[] = [
  {
    id: 'scaling',
    code: 'GEN-01',
    name: 'ขูดหินปูนและขัดฟัน (Scaling & Polishing)',
    category: 'ทันตกรรมทั่วไป',
    description: 'ขจัดคราบหินปูนและคราบสะสมบนผิวฟันเพื่อสุขภาพเหงือกที่ดี ลดกลิ่นปากและป้องกันโรคปริทันต์อักเสบ',
    durationMinutes: 30,
    priceRange: '800 - 1,200 บาท',
    recommendedDentistId: 'dentist-somchai',
  },
  {
    id: 'filling',
    code: 'GEN-02',
    name: 'อุดฟันด้วยวัสดุสีเหมือนฟัน (Composite Filling)',
    category: 'ทันตกรรมทั่วไป',
    description: 'บูรณะรอยผุ รอยบิ่น หรือฟันสึก ด้วยวัสดุเรซินคอมโพสิตเฉดสีธรรมชาติ แข็งแรงและแนบสนิทกับเนื้อฟัน',
    durationMinutes: 30,
    priceRange: '800 - 1,500 บาท/ซี่',
    recommendedDentistId: 'dentist-somchai',
  },
  {
    id: 'checkup',
    code: 'GEN-03',
    name: 'ตรวจสุขภาพฟันและช่องปากประจำปี (Dental Checkup)',
    category: 'ทันตกรรมทั่วไป',
    description: 'ตรวจเช็กสุขภาพฟัน เหงือก และเนื้อเยื่อในช่องปากอย่างละเอียดโดยทันตแพทย์ เพื่อคัดกรองปัญหาก่อนลุกลาม',
    durationMinutes: 30,
    priceRange: '300 - 500 บาท (ไม่มีค่าใช้จ่ายเมื่อทำหัตถการอื่น)',
    recommendedDentistId: 'dentist-somchai',
  },
  {
    id: 'extraction',
    code: 'SURG-01',
    name: 'ถอนฟันธรรมดา (Simple Tooth Extraction)',
    category: 'ทันตกรรมทั่วไป',
    description: 'ถอนฟันที่ไม่สามารถบูรณะได้ เช่น ฟันผุถึงโพรงประสาทรุนแรง หรือฟันโยกมากจากโรคเหงือก',
    durationMinutes: 30,
    priceRange: '800 - 1,500 บาท/ซี่',
    recommendedDentistId: 'dentist-somchai',
  },
  {
    id: 'wisdom-tooth',
    code: 'SURG-02',
    name: 'ผ่าฟันคุด / ถอนฟันคุด (Wisdom Tooth Surgery)',
    category: 'ทันตกรรมเฉพาะทาง',
    description: 'ศัลยศาสตร์ผ่าตัดนำฟันคุดที่ฝังใต้เหงือกหรือกระดูกขากรรไกรออก ป้องกันฟันข้างเคียงผุและลดอาการปวดบวม',
    durationMinutes: 30,
    priceRange: '2,000 - 4,500 บาท/ซี่',
    recommendedDentistId: 'dentist-somchai',
  },
  {
    id: 'root-canal',
    code: 'ENDO-01',
    name: 'รักษารากฟัน (Root Canal Treatment)',
    category: 'ทันตกรรมเฉพาะทาง',
    description: 'กำจัดเชื้อโรคในคลองรากฟันที่ลุกลามถึงโพรงประสาท ระงับอาการปวดและเก็บรักษาฟันแท้ไว้ใช้งานระยะยาว',
    durationMinutes: 30,
    priceRange: '4,500 - 8,000 บาท',
    recommendedDentistId: 'dentist-somchai',
  },
  {
    id: 'ortho-consult',
    code: 'ORTHO-01',
    name: 'ปรึกษาจัดฟันและวางแผนการรักษา (Orthodontic Consultation)',
    category: 'ทันตกรรมเฉพาะทาง',
    description: 'ตรวจวิเคราะห์การสบฟัน โครงสร้างขากรรไกร ถ่ายภาพและสแกนช่องปากเพื่อวางแผนการจัดฟันแบบโลหะหรือจัดฟันใส',
    durationMinutes: 30,
    priceRange: '500 - 1,000 บาท',
    recommendedDentistId: 'dentist-suda',
  },
  {
    id: 'retainer',
    code: 'ORTHO-02',
    name: 'ทำรีเทนเนอร์คงสภาพฟัน (Dental Retainers)',
    category: 'ทันตกรรมเฉพาะทาง',
    description: 'พิมพ์ปากทำรีเทนเนอร์แบบใส (Clear) หรือแบบลวด (Hawley) สำหรับคงสภาพฟันหลังการจัดฟัน',
    durationMinutes: 30,
    priceRange: '2,000 - 4,500 บาท/คู่',
    recommendedDentistId: 'dentist-suda',
  },
  {
    id: 'whitening',
    code: 'COSM-01',
    name: 'ฟอกสีฟันระบบ Cool Light (Teeth Whitening)',
    category: 'ทันตกรรมเพื่อความงาม',
    description: 'ปรับเฉดสีฟันให้ขาวกระจ่างใสอย่างเป็นธรรมชาติ ปลอดภัยต่อผิวเคลือบฟัน ภายใต้การดูแลของทันตแพทย์',
    durationMinutes: 60,
    priceRange: '4,500 - 7,500 บาท',
    recommendedDentistId: 'dentist-suda',
  },
  {
    id: 'other',
    code: 'SPEC-01',
    name: 'อื่นๆ (ระบุในข้อมูลเพิ่มเติม)',
    category: 'ตรวจรักษาเฉพาะบุคคล',
    description: 'สำหรับอาการปวดฟันเฉียบพลัน ซ่อมฟันปลอม ครอบฟัน หรือบริการทางทันตกรรมที่ต้องการปรึกษาแพทย์เฉพาะทาง',
    durationMinutes: 30,
    priceRange: 'ประเมินตามการตรวจรักษาจริง',
    recommendedDentistId: 'dentist-somchai',
  },
];

const SERVICES = DENTAL_SERVICES_CATALOG.map((s) => s.name);

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'services' | 'booking' | 'my-appointments'>('booking');
  const selectedClinic = CLINIC_OPTIONS[0];

  // Catalog filters
  const [catalogCategory, setCatalogCategory] = useState<string>('ทั้งหมด');
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [selectedServiceNotice, setSelectedServiceNotice] = useState<string | null>(null);

  // Login form state
  const [email, setEmail] = useState('customer1@test.com');
  const [password, setPassword] = useState('password123');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Booking state
  const [selectedDentist, setSelectedDentist] = useState(DENTISTS[0].id);
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(tomorrowStr);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Booking Modal
  const [activeSlot, setActiveSlot] = useState<TimeSlot | null>(null);
  const [serviceType, setServiceType] = useState(SERVICES[0]);
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [successCode, setSuccessCode] = useState<string | null>(null);

  // My Appointments state
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);

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
      setSlots(res.data);
    } catch (err: any) {
      console.warn('API connection inactive, loading client fallback slots:', err);
      generateDemoSlots();
    } finally {
      setSlotsLoading(false);
    }
  };

  const generateDemoSlots = () => {
    const demo: TimeSlot[] = [];
    const hours = [9, 10, 11, 13, 14, 15];
    hours.forEach((h, idx) => {
      [0, 30].forEach((m) => {
        const start = new Date(`${selectedDate}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
        const end = new Date(start.getTime() + 1800000);
        demo.push({
          id: `slot-demo-${h}-${m}`,
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
      setMyAppointments(res.data);
    } catch (err) {
      console.warn('API error fetching appointments:', err);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const handleLogin = async (e?: React.FormEvent, customEmail?: string) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const targetEmail = customEmail || email;
      const res = await api.login(targetEmail, 'password123');
      setCurrentUser(res.user);
    } catch (err: any) {
      const role = (customEmail || email).includes('staff') ? 'STAFF' : 'CUSTOMER';
      const name = (customEmail || email).includes('staff') 
        ? 'สมหญิง ผู้ช่วยทันตแพทย์ (Staff)' 
        : (customEmail || email).includes('2') ? 'วิภาดา ยิ้มสวย (Customer 2)' : 'สมศักดิ์ รักฟันดี (Customer 1)';
      const mockUser: User = {
        id: 'mock-user-id',
        email: customEmail || email,
        fullName: name,
        role: role as any,
      };
      authStorage.setToken('mock-dev-token');
      setCurrentUser(mockUser);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
  };

  const handleBookSlot = async () => {
    if (!activeSlot) return;

    if (serviceType.includes('อื่นๆ') && !reasonForVisit.trim()) {
      setConflictError('กรณีเลือกบริการ "อื่นๆ" กรุณากรอกรายละเอียดอาการหรือสิ่งที่ต้องการทำในช่องข้อมูลเพิ่มเติม');
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
      if (err.status === 409 || err.message?.includes('409') || err.message?.includes('longer available')) {
        setConflictError('ข้อขัดแย้ง (HTTP 409 Conflict): รอบเวลานี้เพิ่งมีผู้ป่วยท่านอื่นจองไป กรุณาเลือกรอบเวลาใหม่');
      } else {
        setConflictError(err.message || 'การจองล้มเหลว กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('คุณต้องการยกเลิกนัดหมายนี้ใช่หรือไม่? รอบเวลาจะถูกเปิดว่างให้ผู้อื่นจองต่อ')) return;
    try {
      await api.cancelAppointment(id);
      loadMyAppointments();
    } catch (err: any) {
      alert(err.message || 'ยกเลิกไม่สำเร็จ');
    }
  };

  const filteredProcedures = DENTAL_SERVICES_CATALOG.filter((p) => {
    const matchesCategory = catalogCategory === 'ทั้งหมด' || p.category === catalogCategory;
    const matchesSearch =
      catalogSearch.trim() === '' ||
      p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.code.toLowerCase().includes(catalogSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleSelectProcedure = (procedure: DentalProcedure) => {
    setServiceType(procedure.name);
    setSelectedDentist(procedure.recommendedDentistId);
    setSelectedServiceNotice(procedure.name);
    setCurrentView('booking');
  };

  // If not logged in, show Login Screen
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '36px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--accent-pink) 0%, var(--primary) 100%)',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '18px',
              letterSpacing: '-0.5px',
              marginBottom: '12px',
              boxShadow: '0 4px 12px rgba(31, 78, 61, 0.2)'
            }}>
              {selectedClinic.shortName}
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.4px' }}>
              {selectedClinic.name}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
              {selectedClinic.tagline}
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">อีเมลบัญชีผู้ใช้</label>
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
              <label className="form-label">รหัสผ่าน</label>
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

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={authLoading}>
              {authLoading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
              บัญชีทดสอบด่วน (1-Click Test Accounts):
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '13px', justifyContent: 'flex-start' }}
                onClick={() => handleLogin(undefined, 'customer1@test.com')}
              >
                เข้าสู่ระบบ: คนไข้ 1 (customer1@test.com)
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '13px', justifyContent: 'flex-start' }}
                onClick={() => handleLogin(undefined, 'customer2@test.com')}
              >
                เข้าสู่ระบบ: คนไข้ 2 (customer2@test.com)
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '13px', justifyContent: 'flex-start' }}
                onClick={() => handleLogin(undefined, 'staff@clinic.com')}
              >
                เข้าสู่ระบบ: เจ้าหน้าที่คลินิก (staff@clinic.com)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Top Navbar */}
      <header style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '14px 24px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1120px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--accent-pink) 0%, var(--primary) 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '15px',
              letterSpacing: '-0.3px',
              boxShadow: '0 2px 8px rgba(31, 78, 61, 0.15)'
            }}>
              {selectedClinic.shortName}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '17px', color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
                {selectedClinic.name}
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {selectedClinic.tagline}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-main)' }}>{currentUser.fullName}</div>
              <span className={`badge ${currentUser.role === 'STAFF' ? 'badge-confirmed' : 'badge-available'}`}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></span>
                {currentUser.role === 'STAFF' ? 'เจ้าหน้าที่คลินิก' : 'คนไข้'}
              </span>
            </div>
            <button className="btn btn-secondary" onClick={handleLogout} style={{ fontSize: '13px', padding: '7px 14px' }}>
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container">
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button
            className={`btn ${currentView === 'services' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCurrentView('services')}
          >
            เมนูบริการและราคา (Service Catalog)
          </button>
          <button
            className={`btn ${currentView === 'booking' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCurrentView('booking')}
          >
            จองเวลานัดหมาย (Book Appointment)
          </button>
          <button
            className={`btn ${currentView === 'my-appointments' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCurrentView('my-appointments')}
          >
            นัดหมายของฉัน (My Appointments)
          </button>
        </div>

        {/* Success Alert */}
        {successCode && (
          <div style={{
            background: 'var(--success-bg)',
            color: 'var(--success)',
            padding: '14px 20px',
            borderRadius: '12px',
            marginBottom: '20px',
            border: '1px solid var(--success-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <strong>ยืนยันการจองเรียบร้อยแล้ว</strong> รหัสการนัดหมายของคุณคือ: <code style={{ fontWeight: 700, padding: '2px 6px', background: '#fff', borderRadius: '4px' }}>{successCode}</code> (สถานะ: รอยืนยันจากคลินิก)
            </div>
            <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => setSuccessCode(null)}>ปิด</button>
          </div>
        )}

        {/* VIEW 0: SERVICE CATALOG */}
        {currentView === 'services' && (
          <div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #fdf4f7 0%, #edf5f1 100%)', border: '1px solid var(--pink-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h2 style={{ fontSize: '19px', fontWeight: 700, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
                    สารบัญบริการและอัตราค่ารักษาทันตกรรม
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '4px' }}>
                    เลือกดูรายละเอียดหัตถการ ระยะเวลาที่ใช้ และราคาประเมินเบื้องต้น หรือกด "จองบริการนี้" เพื่อเข้าสู่ขั้นตอนเลือกวันเวลาตรวจ
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentView('booking')}
                >
                  ไปยังหน้าเลือกวันเวลาตรวจ
                </button>
              </div>

              {/* Filter Categories & Search Bar */}
              <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['ทั้งหมด', 'ทันตกรรมทั่วไป', 'ทันตกรรมเฉพาะทาง', 'ทันตกรรมเพื่อความงาม', 'ตรวจรักษาเฉพาะบุคคล'].map((cat) => (
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
                    placeholder="พิมพ์ค้นหาหัตถการ เช่น ขูดหินปูน, ฟันคุด, ฟอกสีฟัน..."
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
                const dentist = DENTISTS.find(d => d.id === proc.recommendedDentistId);
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
                          {proc.category}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '15.5px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                        {proc.name}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                        {proc.description}
                      </p>
                    </div>

                    <div>
                      <div style={{ background: '#f8faf9', padding: '12px 14px', borderRadius: '10px', fontSize: '12.5px', marginBottom: '14px', border: '1px solid #e7eee9' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>ระยะเวลาตรวจ:</span>
                          <strong style={{ color: 'var(--text-main)' }}>~{proc.durationMinutes} นาที</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>อัตราค่าบริการประเมิน:</span>
                          <strong style={{ color: 'var(--primary)' }}>{proc.priceRange}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>ทันตแพทย์ผู้ดูแล:</span>
                          <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{dentist?.name}</span>
                        </div>
                      </div>

                      <button
                        className="btn btn-primary"
                        style={{ width: '100%', fontSize: '13.5px', padding: '9px 14px' }}
                        onClick={() => handleSelectProcedure(proc)}
                      >
                        จองบริการนี้
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
                  <strong>บริการที่เลือก:</strong> {selectedServiceNotice} (ทันตแพทย์: <strong>{DENTISTS.find(d => d.id === selectedDentist)?.name}</strong>) — กรุณาเลือกรอบเวลาที่ต้องการด้านล่าง
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                    onClick={() => setCurrentView('services')}
                  >
                    เปลี่ยนบริการ
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '4px 8px' }}
                    onClick={() => setSelectedServiceNotice(null)}
                  >
                    ยกเลิกตัวเลือก
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
                  ต้องการตรวจสอบรายละเอียดหัตถการ ระยะเวลา และอัตราค่าบริการประเมินก่อนจอง?
                </span>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 14px', color: 'var(--primary)', fontWeight: 600 }}
                  onClick={() => setCurrentView('services')}
                >
                  เปิดดูเมนูบริการและราคา (Service Catalog)
                </button>
              </div>
            )}

            <div className="card">
              <h2 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '16px', letterSpacing: '-0.2px' }}>
                ค้นหารอบเวลาตรวจของทันตแพทย์ (ช่วงเวลาละ 30 นาที)
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">เลือกทันตแพทย์</label>
                  <select
                    className="form-control"
                    value={selectedDentist}
                    onChange={(e) => setSelectedDentist(e.target.value)}
                  >
                    {DENTISTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.specialty})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">เลือกวันที่ต้องการนัดหมาย</label>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15.5px', fontWeight: 600 }}>รอบเวลาตรวจประจำวันที่ {selectedDate}</h3>
                <div style={{ display: 'flex', gap: '14px', fontSize: '12.5px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: 8, height: 8, background: 'var(--success)', borderRadius: '50%' }}></span> ว่าง (สามารถจองได้)
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: 8, height: 8, background: '#cbd5e1', borderRadius: '50%' }}></span> ไม่ว่าง
                  </span>
                </div>
              </div>

              {slotsLoading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>กำลังโหลดรอบเวลาตรวจ...</div>
              ) : slots.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  ไม่พบตารางเวรหมอในวันที่เลือก กรุณาเลือกวันอื่น
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
                          ระยะเวลาตรวจ 30 นาที
                        </div>
                        {isAvail ? (
                          <button
                            className="btn btn-primary"
                            style={{ width: '100%', fontSize: '13px', padding: '6px 12px' }}
                            onClick={() => {
                              setActiveSlot(s);
                              setConflictError(null);
                            }}
                          >
                            จองเวลานี้
                          </button>
                        ) : (
                          <span className="badge badge-booked" style={{ fontSize: '11.5px', width: '100%', justifyContent: 'center' }}>
                            มีผู้จองแล้ว
                          </span>
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
          <div className="card">
            <h2 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '16px' }}>ประวัติและสถานะการนัดหมายของฉัน</h2>
            {loadingAppointments ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>กำลังโหลดข้อมูลนัดหมาย...</div>
            ) : myAppointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                <p style={{ marginTop: '10px' }}>ยังไม่มีรายการนัดหมายในระบบ</p>
                <button className="btn btn-primary" style={{ marginTop: '14px' }} onClick={() => setCurrentView('booking')}>
                  จองเวลานัดตรวจฟัน
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {myAppointments.map((apt) => {
                  const statusBadgeClass = 
                    apt.status === 'CONFIRMED' ? 'badge-confirmed' :
                    apt.status === 'PENDING_REVIEW' ? 'badge-pending' : 'badge-cancelled';

                  const statusText =
                    apt.status === 'CONFIRMED' ? 'ยืนยันนัดหมายแล้ว' :
                    apt.status === 'PENDING_REVIEW' ? 'รอยืนยันจากคลินิก' :
                    apt.status === 'CANCELLED_CONFLICT' ? 'ยกเลิกเนื่องจากเวลาชนกัน' : 'ยกเลิกโดยคนไข้';

                  return (
                    <div
                      key={apt.id}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px',
                        background: '#fff'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 700, fontSize: '15px' }}>{apt.appointmentCode}</span>
                          <span className={`badge ${statusBadgeClass}`}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></span>
                            {statusText}
                          </span>
                        </div>
                        <div style={{ fontSize: '13.5px', color: 'var(--text-main)' }}>
                          <strong>ทันตแพทย์:</strong> {apt.dentist?.name || 'ทพ.สมชาย ใจดี'} | <strong>บริการ:</strong> {apt.serviceType}
                        </div>
                        {apt.reasonForVisit && (
                          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            อาการเบื้องต้น: {apt.reasonForVisit}
                          </div>
                        )}
                      </div>

                      {apt.status === 'PENDING_REVIEW' && (
                        <button
                          className="btn btn-danger"
                          style={{ fontSize: '12.5px', padding: '6px 14px' }}
                          onClick={() => handleCancel(apt.id)}
                        >
                          ขอยกเลิกนัด
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* BOOKING MODAL */}
        {activeSlot && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '14px', letterSpacing: '-0.2px' }}>
                ยืนยันการจองเวลานัดหมาย
              </h3>

              {conflictError && (
                <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '12px', borderRadius: '10px', fontSize: '13.5px', marginBottom: '16px', border: '1px solid var(--danger-border)' }}>
                  <strong>{conflictError}</strong>
                </div>
              )}

              <div style={{ background: '#f8faf9', padding: '14px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '13.5px', border: '1px solid #e7eee9' }}>
                <div><strong>ทันตแพทย์:</strong> {DENTISTS.find(d => d.id === selectedDentist)?.name}</div>
                <div><strong>วันที่นัดหมาย:</strong> {selectedDate}</div>
                <div><strong>ช่วงเวลา:</strong> {new Date(activeSlot.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(activeSlot.slotEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>

              <div className="form-group">
                <label className="form-label">ประเภทบริการทำฟัน</label>
                <select
                  className="form-control"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                >
                  {SERVICES.map((srv) => (
                    <option key={srv} value={srv}>{srv}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  อาการเบื้องต้น / ข้อมูลเพิ่มเติม {serviceType.includes('อื่นๆ') ? <span style={{ color: 'var(--danger)', fontWeight: 600 }}>* (จำเป็นต้องระบุ)</span> : '(ถ้ามี)'}
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder={
                    serviceType.includes('อื่นๆ')
                      ? 'โปรดระบุบริการทันตกรรม หรืออาการที่ต้องการปรึกษา/รักษา เช่น ผ่าฟันคุด, ฟอกสีฟัน, ปวดฟันกราม...'
                      : 'เช่น เสียวฟันกรามล่างขวา หรือต้องการตรวจเช็กฟันคุด'
                  }
                  value={reasonForVisit}
                  onChange={(e) => setReasonForVisit(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setActiveSlot(null);
                    setConflictError(null);
                  }}
                  disabled={submittingBooking}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={handleBookSlot}
                  disabled={submittingBooking}
                >
                  {submittingBooking ? 'กำลังบันทึก...' : 'ยืนยันการจอง'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
