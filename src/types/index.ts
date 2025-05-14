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

export interface DentalVisit {
  id: string;
  date: string;
  reason: string;
  diagnosis: string;
  treatment: string;
  observations: string;
  dentistId: string;
  additionalInfo: Record<string, any>;
}

export interface DentalProcedure {
  id: string;
  date: string;
  type: string;
  description: string;
  cost: number;
  status: 'pending' | 'completed' | 'cancelled';
  dentistId: string;
  additionalInfo: Record<string, any>;
}

export interface DentalImage {
  id: string;
  date: string;
  type: string;
  url: string;
  description: string;
  additionalInfo: Record<string, any>;
}

export interface Prescription {
  id: string;
  date: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  dentistId: string;
  additionalInfo: Record<string, any>;
}

export interface DentalRecord {
  id: string;
  patientId: string;
  personalInfo: Record<string, any>;
  visits: DentalVisit[];
  procedures: DentalProcedure[];
  images: DentalImage[];
  prescriptions: Prescription[];
  medicalHistory: Record<string, any>;
  dentalHistory: Record<string, any>;
  allergies: string[];
  medications: string[];
  notes: Record<string, any>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
} 