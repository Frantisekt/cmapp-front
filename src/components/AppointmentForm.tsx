import * as React from 'react';
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';
import type { Appointment, Patient, Dentist } from '../types';

interface AppointmentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (appointment: Omit<Appointment, 'id'>) => void;
  initialData?: Appointment;
  title: string;
  patients: Patient[];
  dentists: Dentist[];
}

interface FormErrors {
  patientId?: string;
  dentistId?: string;
  dateTime?: string;
  notes?: string;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialData, 
  title,
  patients,
  dentists 
}) => {
  const [formData, setFormData] = React.useState<Omit<Appointment, 'id'>>({
    patientId: '',
    dentistId: '',
    dateTime: new Date().toISOString(),
    status: 'SCHEDULED',
    consultationNumber: '',
    notes: ''
  });

  const [errors, setErrors] = React.useState<FormErrors>({});

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        patientId: initialData.patientId,
        dentistId: initialData.dentistId,
        dateTime: initialData.dateTime,
        status: initialData.status,
        consultationNumber: initialData.consultationNumber,
        notes: initialData.notes
      });
    } else {
      setFormData({
        patientId: '',
        dentistId: '',
        dateTime: new Date().toISOString(),
        status: 'SCHEDULED',
        consultationNumber: '',
        notes: ''
      });
    }
    setErrors({});
  }, [initialData, open]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.patientId) {
      newErrors.patientId = 'Debe seleccionar un paciente';
    }

    if (!formData.dentistId) {
      newErrors.dentistId = 'Debe seleccionar un odontólogo';
    }

    if (!formData.dateTime) {
      newErrors.dateTime = 'Debe seleccionar una fecha y hora';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateTimeChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        dateTime: date.toISOString()
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth error={!!errors.patientId}>
              <InputLabel>Paciente</InputLabel>
              <Select
                name="patientId"
                value={formData.patientId}
                onChange={handleSelectChange}
                label="Paciente"
                required
              >
                {patients.map((patient) => (
                  <MenuItem key={patient.id} value={patient.id}>
                    {patient.firstName} {patient.lastName} - {patient.dni}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth error={!!errors.dentistId}>
              <InputLabel>Odontólogo</InputLabel>
              <Select
                name="dentistId"
                value={formData.dentistId}
                onChange={handleSelectChange}
                label="Odontólogo"
                required
              >
                {dentists.map((dentist) => (
                  <MenuItem key={dentist.id} value={dentist.id}>
                    {dentist.firstName} {dentist.lastName} - {dentist.licenseNumber}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DateTimePicker
                label="Fecha y Hora"
                value={new Date(formData.dateTime)}
                onChange={handleDateTimeChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.dateTime,
                    helperText: errors.dateTime
                  }
                }}
              />
            </LocalizationProvider>

            <TextField
              name="notes"
              label="Notas"
              value={formData.notes}
              onChange={handleTextChange}
              fullWidth
              multiline
              rows={4}
              placeholder="Ingrese notas adicionales sobre la cita"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" color="primary">
            {initialData ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}; 