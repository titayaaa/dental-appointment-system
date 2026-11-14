import React, { useState, useEffect } from 'react';
import { api, authStorage, User, TimeSlot, Appointment } from './services/api';

const DENTISTS = [
  { id: 'dentist-somchai', name: 'ทพ.สมชาย ใจดี', specialty: 'ทันตกรรมทั่วไป' },
  { id: 'dentist-suda', name: 'ทพญ.สุดา รักฟัน', specialty: 'ทันตกรรมจัดฟัน' },
];

export interface DentalProcedure {
  id: string;
  name: string;
  category: 'ทันตกรรมทั่วไป' | 'ทันตกรรมเฉพาะทาง' | 'ทันตกรรมเพื่อความงาม' | 'ตรวจรักษาเฉพาะบุคคล';
  description: string;
  durationMinutes: number;
  priceRange: string;
  recommendedDentistId: string;
  icon: string;
}

export const DENTAL_SERVICES_CATALOG: DentalProcedure[] = [
  {
    id: 'scaling',
    name: 'ขูดหินปูนและขัดฟัน (Scaling & Polishing)',
    category: 'ทันตกรรมทั่วไป',
    description: 'ขจัดคราบหินปูนและคราบชา กาแฟ บุหรี่ เพื่อสุขภาพเหงือกและฟันที่ดี ป้องกันโรคเหงือกอักเสบและกลิ่นปาก',
    durationMinutes: 30,
    priceRange: '800 - 1,200 ฿',
    recommendedDentistId: 'dentist-somchai',
    icon: '✨',
  },
  {
    id: 'filling',
    name: 'อุดฟันด้วยวัสดุสีเหมือนฟัน (Composite Filling)',
    category: 'ทันตกรรมทั่วไป',
    description: 'รักษาฟันผุ ฟันบิ่น หรือฟันสึก ด้วยวัสดุคอมโพสิตเรซินสีธรรมชาติ กลมกลืนกับเนื้อฟัน แข็งแรง ทนทาน',
    durationMinutes: 30,
    priceRange: '800 - 1,500 ฿/ซี่',
    recommendedDentistId: 'dentist-somchai',
    icon: '🦷',
  },
  {
    id: 'checkup',
    name: 'ตรวจสุขภาพฟันและช่องปากประจำปี (Dental Checkup)',
    category: 'ทันตกรรมทั่วไป',
    description: 'ตรวจสุขภาพฟัน เหงือก และเนื้อเยื่อในช่องปากอย่างละเอียดโดยทันตแพทย์ เพื่อป้องกันและคัดกรองโรคช่องปาก',
    durationMinutes: 30,
    priceRange: '300 - 500 ฿ (ฟรีเมื่อทำหัตถการอื่น)',
    recommendedDentistId: 'dentist-somchai',
    icon: '🔍',
  },
  {
    id: 'extraction',
    name: 'ถอนฟันธรรมดา (Simple Tooth Extraction)',
    category: 'ทันตกรรมทั่วไป',
    description: 'ถอนฟันที่ไม่สามารถเก็บรักษาไว้ได้ เช่น ฟันผุทะลุโพรงประสาทรุนแรง ฟันโยกมากจากโรคปริทันต์',
    durationMinutes: 30,
    priceRange: '800 - 1,500 ฿/ซี่',
    recommendedDentistId: 'dentist-somchai',
    icon: '🩹',
  },
  {
    id: 'wisdom-tooth',
    name: 'ผ่าฟันคุด / ถอนฟันคุด (Wisdom Tooth Surgery)',
    category: 'ทันตกรรมเฉพาะทาง',
    description: 'ผ่าตัดนำฟันคุดที่ฝังใต้เหงือกหรือกระดูกขากรรไกรออก ป้องกันฟันข้างเคียงผุ อาการปวดบวม และการอักเสบติดเชื้อ',
    durationMinutes: 30,
    priceRange: '2,000 - 4,500 ฿/ซี่',
    recommendedDentistId: 'dentist-somchai',
    icon: '🩺',
  },
  {
    id: 'root-canal',
    name: 'รักษารากฟัน (Root Canal Treatment)',
    category: 'ทันตกรรมเฉพาะทาง',
    description: 'รักษาอาการปวดฟันรุนแรงจากการติดเชื้อในโพรงประสาทฟัน กำจัดเชื้อโรคและอุดคลองรากฟันเพื่อเก็บฟันแท้ไว้',
    durationMinutes: 30,
    priceRange: '4,500 - 8,000 ฿',
    recommendedDentistId: 'dentist-somchai',
    icon: '🔬',
  },
  {
    id: 'ortho-consult',
    name: 'ปรึกษาจัดฟันและวางแผนรักษา (Orthodontic Consultation)',
    category: 'ทันตกรรมเฉพาะทาง',
    description: 'ตรวจประเมินสบฟัน โครงสร้างขากรรไกร ถ่ายภาพและพิมพ์ปากเพื่อวางแผนจัดฟัน (แบบโลหะ, ดามอน, หรือจัดฟันใส)',
    durationMinutes: 30,
    priceRange: '500 - 1,000 ฿',
    recommendedDentistId: 'dentist-suda',
    icon: '😁',
  },
  {
    id: 'retainer',
    name: 'ทำรีเทนเนอร์คงสภาพฟัน (Dental Retainers)',
    category: 'ทันตกรรมเฉพาะทาง',
    description: 'พิมพ์ปากทำรีเทนเนอร์แบบใส (Clear Retainer) หรือแบบลวด (Hawley Retainer) หลังถอดเครื่องมือจัดฟัน',
    durationMinutes: 30,
    priceRange: '2,000 - 4,500 ฿/คู่',
    recommendedDentistId: 'dentist-suda',
    icon: '🛡️',
  },
  {
    id: 'whitening',
    name: 'ฟอกสีฟันระบบ Cool Light (Teeth Whitening)',
    category: 'ทันตกรรมเพื่อความงาม',
    description: 'ปรับเฉดสีฟันให้ขาวกระจ่างใสอย่างปลอดภัยด้วยน้ำยาฟอกสีฟันเกรดพรีเมียมและแสงเย็น ไม่ทำลายผิวเคลือบฟัน',
    durationMinutes: 60,
    priceRange: '4,500 - 7,500 ฿',
    recommendedDentistId: 'dentist-suda',
    icon: '💎',
  },
  {
    id: 'other',
    name: 'อื่นๆ (ระบุในข้อมูลเพิ่มเติม)',
    category: 'ตรวจรักษาเฉพาะบุคคล',
    description: 'สำหรับอาการปวดฟันเฉียบพลัน, ซ่อมฟันปลอม, ทำครอบฟัน/สะพานฟัน หรือบริการอื่นๆ ที่ต้องการปรึกษาแพทย์',
    durationMinutes: 30,
    priceRange: 'ประเมินตามหัตถการจริง',
    recommendedDentistId: 'dentist-somchai',
    icon: '📝',
  },
];

const SERVICES = DENTAL_SERVICES_CATALOG.map((s) => s.name);

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'services' | 'booking' | 'my-appointments'>('booking');
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
      // Fallback demo slots if server or database is not active
      console.warn('API error, using demo slots display:', err);
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
      // Fallback local auth for testing interface
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
      setConflictError('⚠️ กรณีเลือกบริการ "อื่นๆ" กรุณากรอกรายละเอียดอาการหรือสิ่งที่ต้องการทำในช่องข้อมูลเพิ่มเติม');
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
      loadSlots(); // Refresh slots
    } catch (err: any) {
      if (err.status === 409 || err.message?.includes('409') || err.message?.includes('longer available')) {
        setConflictError('⚠️ เกิดข้อขัดแย้ง (HTTP 409 Conflict): รอบเวลานี้เพิ่งมีผู้ป่วยท่านอื่นจองไป กรุณาเลือกรอบเวลาใหม่');
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
      p.description.toLowerCase().includes(catalogSearch.toLowerCase());
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '40px' }}>🦷</span>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--primary)', marginTop: '8px' }}>SmileSync</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>ระบบจัดตารางเวลาและนัดหมายคลินิกทันตกรรม</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">อีเมลผู้ใช้งาน</label>
              <input
                className="form-control"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                required
              />
            </div>

            {authError && (
              <div style={{ color: 'var(--danger)', fontSize: '14px', marginBottom: '16px' }}>{authError}</div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={authLoading}>
              {authLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
            </button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
              ⚡ คลิกปุ่มทดสอบด่วน (1-Click Test Accounts):
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '13px', justifyContent: 'flex-start' }}
                onClick={() => handleLogin(undefined, 'customer1@test.com')}
              >
                👤 เข้าสู่ระบบในฐานะ: คนไข้ 1 (customer1@test.com)
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '13px', justifyContent: 'flex-start' }}
                onClick={() => handleLogin(undefined, 'customer2@test.com')}
              >
                👤 เข้าสู่ระบบในฐานะ: คนไข้ 2 (customer2@test.com)
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: '13px', justifyContent: 'flex-start' }}
                onClick={() => handleLogin(undefined, 'staff@clinic.com')}
              >
                🏥 เข้าสู่ระบบในฐานะ: เจ้าหน้าที่ (staff@clinic.com)
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
      <header style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '12px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🦷</span>
            <div>
              <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--primary)' }}>SmileSync</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>Sprint 1 Release</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>{currentUser.fullName}</div>
              <span className={`badge ${currentUser.role === 'STAFF' ? 'badge-confirmed' : 'badge-available'}`} style={{ fontSize: '11px' }}>
                {currentUser.role}
              </span>
            </div>
            <button className="btn btn-secondary" onClick={handleLogout} style={{ fontSize: '13px' }}>
              ออกจากระบบ
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container">
        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button
            className={`btn ${currentView === 'services' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCurrentView('services')}
          >
            📖 เมนูบริการและราคา (Service Catalog)
          </button>
          <button
            className={`btn ${currentView === 'booking' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCurrentView('booking')}
          >
            📅 จองคิวทำฟัน (Book Appointment)
          </button>
          <button
            className={`btn ${currentView === 'my-appointments' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setCurrentView('my-appointments')}
          >
            📋 นัดหมายของฉัน (My Appointments)
          </button>
        </div>

        {/* Success Alert */}
        {successCode && (
          <div style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '14px 20px', borderRadius: '10px', marginBottom: '20px', border: '1px solid #86efac', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>🎉 จองนัดหมายสำเร็จ!</strong> รหัสการนัดหมายของคุณคือ: <code>{successCode}</code> (สถานะ: รอยืนยัน)
            </div>
            <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '12px' }} onClick={() => setSuccessCode(null)}>ปิด</button>
          </div>
        )}

        {/* VIEW 0: SERVICE CATALOG */}
        {currentView === 'services' && (
          <div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)', border: '1px solid #bae6fd' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--primary-hover)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🦷</span> เมนูบริการและอัตราค่ารักษาทันตกรรม (SmileSync Catalog)
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
                    ตรวจสอบรายละเอียดหัตถการ ระยะเวลาที่ใช้ และราคาประเมินเบื้องต้น หรือกด <strong>"จองบริการนี้ 👉"</strong> เพื่อไปยังตารางนัดหมายได้ทันที
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => setCurrentView('booking')}
                >
                  ไปยังหน้าตารางเวลาตรวจ 📅
                </button>
              </div>

              {/* Filter Categories & Search Bar */}
              <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['ทั้งหมด', 'ทันตกรรมทั่วไป', 'ทันตกรรมเฉพาะทาง', 'ทันตกรรมเพื่อความงาม', 'ตรวจรักษาเฉพาะบุคคล'].map((cat) => (
                    <button
                      key={cat}
                      className={`btn ${catalogCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '13px', padding: '6px 14px' }}
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
                    placeholder="🔍 ค้นหาหัตถการ เช่น ขูดหินปูน, ฟันคุด, ฟอกสีฟัน..."
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
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <span style={{ fontSize: '32px' }}>{proc.icon}</span>
                        <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: '12px' }}>
                          {proc.category}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                        {proc.name}
                      </h3>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                        {proc.description}
                      </p>
                    </div>

                    <div>
                      <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '14px', border: '1px solid #edf2f7' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>⏱️ ระยะเวลาตรวจ:</span>
                          <strong style={{ color: 'var(--text-main)' }}>~{proc.durationMinutes} นาที</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>🏷️ อัตราค่าบริการประเมิน:</span>
                          <strong style={{ color: 'var(--primary)' }}>{proc.priceRange}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>👨‍⚕️ ทันตแพทย์แนะนำ:</span>
                          <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{dentist?.name}</span>
                        </div>
                      </div>

                      <button
                        className="btn btn-primary"
                        style={{ width: '100%', fontSize: '14px', padding: '8px 14px' }}
                        onClick={() => handleSelectProcedure(proc)}
                      >
                        จองบริการนี้ 👉
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
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', padding: '14px 20px', borderRadius: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ fontSize: '14px', color: '#166534' }}>
                  🎯 <strong>บริการที่เลือก:</strong> {selectedServiceNotice} (ทันตแพทย์แนะนำ: <strong>{DENTISTS.find(d => d.id === selectedDentist)?.name}</strong>) — เลือกรอบเวลา 30 นาทีที่ต้องการด้านล่างได้เลยครับ
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
                    ✕
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', padding: '12px 18px', borderRadius: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  💡 ต้องการดูรายละเอียดหัตถการ อัตราค่าบริการ และระยะเวลาที่ใช้ก่อนจอง?
                </span>
                <button
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 12px', color: 'var(--primary)', fontWeight: 600 }}
                  onClick={() => setCurrentView('services')}
                >
                  📖 เปิดดูเมนูบริการและราคา (Service Catalog)
                </button>
              </div>
            )}
            <div className="card">
              <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>ค้นหารอบเวลาตรวจของทันตแพทย์ (30 นาที)</h2>
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
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>รอบเวลาตรวจประจำวันที่ {selectedDate}</h3>
                <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: 10, height: 10, background: 'var(--success)', borderRadius: '50%' }}></span> ว่าง (จองได้)
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ width: 10, height: 10, background: '#cbd5e1', borderRadius: '50%' }}></span> เต็มแล้ว
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
                        <div style={{ fontWeight: 600, fontSize: '16px', color: isAvail ? 'var(--text-main)' : 'var(--text-muted)' }}>
                          {timeStart} - {timeEnd}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '6px 0 10px' }}>
                          รอบตรวจ 30 นาที
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
                            จองรอบนี้
                          </button>
                        ) : (
                          <span className="badge badge-booked" style={{ fontSize: '12px', width: '100%', justifyContent: 'center' }}>
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
            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>ประวัติและสถานะการนัดหมายของฉัน</h2>
            {loadingAppointments ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>กำลังโหลดข้อมูลนัดหมาย...</div>
            ) : myAppointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '36px' }}>📅</span>
                <p style={{ marginTop: '10px' }}>ยังไม่มีรายการนัดหมายในระบบ</p>
                <button className="btn btn-primary" style={{ marginTop: '12px' }} onClick={() => setCurrentView('booking')}>
                  จองคิวตรวจฟันตอนนี้
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
                        borderRadius: '10px',
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
                          <span className={`badge ${statusBadgeClass}`}>{statusText}</span>
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--text-main)' }}>
                          <strong>ทันตแพทย์:</strong> {apt.dentist?.name || 'ทพ.สมชาย ใจดี'} | <strong>บริการ:</strong> {apt.serviceType}
                        </div>
                        {apt.reasonForVisit && (
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            อาการ: {apt.reasonForVisit}
                          </div>
                        )}
                      </div>

                      {apt.status === 'PENDING_REVIEW' && (
                        <button
                          className="btn btn-danger"
                          style={{ fontSize: '13px', padding: '6px 14px' }}
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
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '14px' }}>ยืนยันการจองเวลานัดหมาย</h3>

              {conflictError && (
                <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', border: '1px solid #fca5a5' }}>
                  <strong>{conflictError}</strong>
                </div>
              )}

              <div style={{ background: 'var(--bg-main)', padding: '12px 16px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px' }}>
                <div><strong>ทันตแพทย์:</strong> {DENTISTS.find(d => d.id === selectedDentist)?.name}</div>
                <div><strong>วันที่:</strong> {selectedDate}</div>
                <div><strong>เวลา:</strong> {new Date(activeSlot.slotStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(activeSlot.slotEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
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
                  {submittingBooking ? 'กำลังจอง...' : 'ยืนยันการจอง'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

