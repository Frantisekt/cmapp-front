import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControlLabel,
  Switch,
  Typography,
  IconButton,
  Paper,
  Stack
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { Dentist } from '../types';

interface DentistFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (dentist: Omit<Dentist, 'id'>) => void;
  initialData?: Dentist;
  title: string;
}

interface FormErrors {
  licenseNumber?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  specialty?: string;
  workingHours?: string;
}

const specialties = [
  'Odontología General',
  'Ortodoncista',
  'Endodoncista',
  'Periodoncista',
  'Cirujano Oral',
  'Odontopediatra',
  'Prostodoncista'
];

const daysOfWeek = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo'
];

function normalizeTime(value: string): string {
  if (!value) return '';
  
  // Si ya es HH:mm, lo retorna igual
  if (/^\d{2}:\d{2}$/.test(value)) return value;
  
  // Si es HH:mm:ss, lo recorta
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) return value.slice(0, 5);
  
  // Si es HH:mm AM/PM, lo convierte a 24h
  const ampmMatch = value.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampmMatch) {
    let hour = parseInt(ampmMatch[1], 10);
    const minute = ampmMatch[2];
    const ampm = ampmMatch[3].toUpperCase();
    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  }
  
  // Si no reconoce el formato, retorna vacío
  return '';
}

export const DentistForm = ({ open, onClose, onSubmit, initialData, title }: DentistFormProps) => {
  const [formData, setFormData] = useState<Omit<Dentist, 'id'>>({
    licenseNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialty: '',
    workingHours: [],
    active: true
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        licenseNumber: initialData.licenseNumber,
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email,
        phone: initialData.phone,
        specialty: initialData.specialty,
        workingHours: (initialData.workingHours || []).map(wh => ({
          ...wh,
          startTime: normalizeTime(wh.startTime),
          endTime: normalizeTime(wh.endTime)
        })),
        active: initialData.active
      });
    } else {
      setFormData({
        licenseNumber: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialty: '',
        workingHours: [],
        active: true
      });
    }
    setErrors({});
  }, [initialData, open]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar número de licencia (debe ser alfanumérico y tener entre 5 y 10 caracteres)
    if (!formData.licenseNumber.match(/^[A-Za-z0-9]{5,10}$/)) {
      newErrors.licenseNumber = 'El número de licencia debe tener entre 5 y 10 caracteres alfanuméricos';
    }

    // Validar nombre y apellido (solo letras y espacios)
    if (!formData.firstName.match(/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]{2,50}$/)) {
      newErrors.firstName = 'El nombre solo debe contener letras y espacios';
    }

    if (!formData.lastName.match(/^[A-Za-zÁáÉéÍíÓóÚúÑñ\s]{2,50}$/)) {
      newErrors.lastName = 'El apellido solo debe contener letras y espacios';
    }

    // Validar email
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Ingrese un email válido';
    }

    // Validar especialidad
    if (!formData.specialty) {
      newErrors.specialty = 'Debe seleccionar una especialidad';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpiar el error del campo cuando el usuario comienza a escribir
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleWorkingHoursChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      workingHours: prev.workingHours.map((wh, i) =>
        i === index
          ? { ...wh, [field]: (field === 'startTime' || field === 'endTime') ? normalizeTime(value) : value }
          : wh
      )
    }));
  };

  const addWorkingHours = () => {
    setFormData(prev => ({
      ...prev,
      workingHours: [
        ...prev.workingHours,
        { dayOfWeek: '', startTime: '08:30:00', endTime: '17:30:00' }
      ]
    }));
  };

  const removeWorkingHours = (index: number) => {
    setFormData(prev => ({
      ...prev,
      workingHours: prev.workingHours.filter((_, i) => i !== index)
    }));
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
          <Stack spacing={2}>
            <TextField
              name="licenseNumber"
              label="Número de Licencia"
              value={formData.licenseNumber}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.licenseNumber}
              helperText={errors.licenseNumber}
              placeholder="Ej: LIC12345"
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="firstName"
                label="Nombre"
                value={formData.firstName}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.firstName}
                helperText={errors.firstName}
              />
              <TextField
                name="lastName"
                label="Apellido"
                value={formData.lastName}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.lastName}
                helperText={errors.lastName}
              />
            </Box>
            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.email}
              helperText={errors.email}
              placeholder="ejemplo@correo.com"
            />
            <TextField
              name="phone"
              label="Teléfono"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
              required
              placeholder="Ingrese el número de teléfono"
            />
            <TextField
              name="specialty"
              label="Especialidad"
              select
              value={formData.specialty}
              onChange={handleChange}
              fullWidth
              required
              error={!!errors.specialty}
              helperText={errors.specialty}
            >
              {specialties.map((specialty) => (
                <MenuItem key={specialty} value={specialty}>
                  {specialty}
                </MenuItem>
              ))}
            </TextField>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={handleChange}
                  name="active"
                  color="primary"
                />
              }
              label="Activo"
            />
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Horarios de Trabajo</Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addWorkingHours}
                  variant="outlined"
                  size="small"
                >
                  Agregar Horario
                </Button>
              </Box>
              <Stack spacing={2}>
                {formData.workingHours.map((wh, index) => (
                  <Paper key={index} sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <TextField
                        select
                        label="Día"
                        value={wh.dayOfWeek}
                        onChange={(e) => handleWorkingHoursChange(index, 'dayOfWeek', e.target.value)}
                        fullWidth
                      >
                        {daysOfWeek.map((day) => (
                          <MenuItem key={day} value={day}>
                            {day}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        type="time"
                        label="Hora Inicio *"
                        value={wh.startTime}
                        onChange={(e) => handleWorkingHoursChange(index, 'startTime', e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ step: 60 }}
                      />
                      <TextField
                        type="time"
                        label="Hora Fin *"
                        value={wh.endTime}
                        onChange={(e) => handleWorkingHoursChange(index, 'endTime', e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ step: 60 }}
                      />
                      <IconButton
                        onClick={() => removeWorkingHours(index)}
                        color="error"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </Box>
          </Stack>
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