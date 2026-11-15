export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'STAFF';
}

export interface Dentist {
  id: string;
  name: string;
  specialty: string;
}

export interface TimeSlot {
  id: string;
  scheduleId: string;
  slotStart: string;
  slotEnd: string;
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED';
  schedule?: {
    dentist?: Dentist;
  };
}

export interface Appointment {
  id: string;
  appointmentCode: string;
  customerId: string;
  dentistId: string;
  timeSlotId: string;
  serviceType: string;
  reasonForVisit: string | null;
  status: 'PENDING_REVIEW' | 'CONFIRMED' | 'CANCELLED_CONFLICT' | 'CANCELLED_BY_CUSTOMER' | 'COMPLETED';
  staffNotes: string | null;
  createdAt: string;
  dentist?: Dentist;
  timeSlot?: TimeSlot;
  customer?: { id?: string; fullName: string; email: string; phoneNumber?: string };
}

const TOKEN_KEY = 'smilesync_token';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({ success: false, error: 'Server error' }));

  if (!response.ok) {
    const error: any = new Error(data.error || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await request<{ success: boolean; data: { token: string; user: User } }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    authStorage.setToken(res.data.token);
    return res.data;
  },
  getMe: async () => {
    return request<{ success: boolean; data: User }>('/api/auth/me');
  },
  logout: async () => {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Backend logout call returned error (session may already be expired):', err);
    } finally {
      authStorage.clearToken();
    }
  },

  // Dentists
  getDentists: async () => {
    return request<{ success: boolean; data: { id: string; name: string; specialty: string }[] }>('/api/dentists');
  },

  // Slots
  getAvailableSlots: async (dentistId: string, date: string) => {
    return request<{ success: boolean; data: TimeSlot[] }>(`/api/slots/available?dentistId=${dentistId}&date=${date}`);
  },

  // Appointments
  bookAppointment: async (payload: { dentistId: string; timeSlotId: string; serviceType: string; reasonForVisit?: string }) => {
    return request<{ success: boolean; data: Appointment }>('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getMyAppointments: async () => {
    return request<{ success: boolean; data: Appointment[] }>('/api/my-appointments');
  },
  cancelAppointment: async (id: string) => {
    return request<{ success: boolean; data: { message: string } }>(`/api/my-appointments/${id}/cancel`, {
      method: 'PATCH',
    });
  },

  // Staff Admin (F-03)
  getAdminSchedules: async () => {
    return request<{ success: boolean; data: any[] }>('/api/admin/schedules');
  },
  createSchedule: async (payload: { dentistId: string; workDate: string; startTime: string; endTime: string }) => {
    return request<{ success: boolean; data: { schedule: any; generatedSlotsCount: number } }>('/api/admin/schedules', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getAdminAppointments: async (status?: string, date?: string) => {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (date) params.append('date', date);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<{ success: boolean; data: (Appointment & { customer?: { fullName: string; email: string; phoneNumber?: string } })[] }>(`/api/admin/appointments${queryString}`);
  },
  updateAppointmentStatus: async (id: string, payload: { status: 'CONFIRMED' | 'CANCELLED_CONFLICT'; staffNotes?: string }) => {
    return request<{ success: boolean; data: { appointment: Appointment; message: string } }>(`/api/admin/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  },
};
