export interface Patient {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  recordNumber: string;
  address: string;
  birthDate: string;
  gender: string;
}

export interface WorkingHours {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

export interface Dentist {
  id: string;
  licenseNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  workingHours: WorkingHours[];
  active: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  dentistId: string;
  dateTime: string;
  status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
  consultationNumber: string;
  notes: string;
}

export interface Treatment {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;
}

export interface DentalRecord {
  id: string;
  patientId: string;
  dentistId: string;
  date: string;
  diagnosis: string;
  treatment: string;
  notes: string;
} 