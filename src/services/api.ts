import axios from 'axios';
import type { 
  Patient, 
  Dentist, 
  Appointment, 
  Treatment, 
  DentalRecord,
  DentalVisit,
  DentalProcedure,
  DentalImage,
  Prescription 
} from '../types';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Pacientes
export const patientsApi = {
  getAll: () => api.get<Patient[]>('/patients'),
  getById: (id: string) => api.get<Patient>(`/patients/${id}`),
  getByDni: (dni: string) => api.get<Patient>(`/patients/dni/${dni}`),
  getByRecordNumber: (recordNumber: string) => api.get<Patient>(`/patients/record/${recordNumber}`),
  create: (patient: Omit<Patient, 'id'>) => api.post<Patient>('/patients', patient),
  update: (id: string, patient: Patient) => api.put<Patient>(`/patients/${id}`, patient),
  delete: (id: string) => api.delete(`/patients/${id}`),
};

// Odontólogos
export const dentistsApi = {
  getAll: () => api.get<Dentist[]>('/dentists'),
  getById: (id: string) => api.get<Dentist>(`/dentists/${id}`),
  getByLicenseNumber: (licenseNumber: string) => api.get<Dentist>(`/dentists/license/${licenseNumber}`),
  getBySpecialty: (specialty: string) => api.get<Dentist[]>(`/dentists/specialty/${specialty}`),
  create: (dentist: Omit<Dentist, 'id'>) => api.post<Dentist>('/dentists', dentist),
  update: (id: string, dentist: Dentist) => api.put<Dentist>(`/dentists/${id}`, dentist),
  delete: (id: string) => api.delete(`/dentists/${id}`),
};

// Citas
export const appointmentsApi = {
  getAll: () => api.get<Appointment[]>('/appointments'),
  getById: (id: string) => api.get<Appointment>(`/appointments/${id}`),
  getByPatientId: (patientId: string) => api.get<Appointment[]>(`/appointments/patient/${patientId}`),
  getByDentistId: (dentistId: string) => api.get<Appointment[]>(`/appointments/dentist/${dentistId}`),
  getByDentistIdAndDate: (dentistId: string, date: string) => 
    api.get<Appointment[]>(`/appointments/dentist/${dentistId}/date?date=${date}`),
  create: (appointment: Omit<Appointment, 'id'>) => api.post<Appointment>('/appointments', appointment),
  update: (id: string, appointment: Appointment) => api.put<Appointment>(`/appointments/${id}`, appointment),
  cancel: (id: string) => api.post(`/appointments/${id}/cancel`),
  delete: (id: string) => api.delete(`/appointments/${id}`),
};

// Tratamientos
export const treatmentsApi = {
  getAll: () => api.get<Treatment[]>('/treatments'),
  getById: (id: string) => api.get<Treatment>(`/treatments/${id}`),
  getByCategory: (category: string) => api.get<Treatment[]>(`/treatments/category/${category}`),
  create: (treatment: Omit<Treatment, 'id'>) => api.post<Treatment>('/treatments', treatment),
  update: (id: string, treatment: Treatment) => api.put<Treatment>(`/treatments/${id}`, treatment),
  delete: (id: string) => api.delete(`/treatments/${id}`),
};

// Expedientes dentales
export const dentalRecordsApi = {
  getAll: () => api.get<DentalRecord[]>('/dental-records'),
  getById: (id: string) => api.get<DentalRecord>(`/dental-records/${id}`),
  getByPatientId: (patientId: string) => api.get<DentalRecord>(`/dental-records/patient/${patientId}`),
  create: (dentalRecord: Omit<DentalRecord, 'id' | 'createdAt' | 'updatedAt'>) => 
    api.post<DentalRecord>('/dental-records', dentalRecord),
  update: (id: string, dentalRecord: DentalRecord) => 
    api.put<DentalRecord>(`/dental-records/${id}`, dentalRecord),
  delete: (id: string) => api.delete(`/dental-records/${id}`),
  
  // Métodos para actualizaciones parciales
  addVisit: (recordId: string, visit: Omit<DentalVisit, 'id'>) =>
    api.post<DentalRecord>(`/dental-records/${recordId}/visits`, visit),
  addProcedure: (recordId: string, procedure: Omit<DentalProcedure, 'id'>) =>
    api.post<DentalRecord>(`/dental-records/${recordId}/procedures`, procedure),
  addImage: (recordId: string, image: Omit<DentalImage, 'id'>) =>
    api.post<DentalRecord>(`/dental-records/${recordId}/images`, image),
  addPrescription: (recordId: string, prescription: Omit<Prescription, 'id'>) =>
    api.post<DentalRecord>(`/dental-records/${recordId}/prescriptions`, prescription),
  
  // Métodos de búsqueda
  findByDentistId: (dentistId: string) =>
    api.get<DentalRecord[]>(`/dental-records/dentist/${dentistId}`),
  findByDateRange: (startDate: string, endDate: string) =>
    api.get<DentalRecord[]>(`/dental-records/date-range?startDate=${startDate}&endDate=${endDate}`),
  findByProcedure: (procedureName: string) =>
    api.get<DentalRecord[]>(`/dental-records/procedure/${procedureName}`),
  findByMedication: (medication: string) =>
    api.get<DentalRecord[]>(`/dental-records/medication/${medication}`),
  findByAllergy: (allergy: string) =>
    api.get<DentalRecord[]>(`/dental-records/allergy/${allergy}`)
}; 