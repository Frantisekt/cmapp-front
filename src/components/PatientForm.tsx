import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import type { Patient } from '../types';

interface PatientFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (patient: Omit<Patient, 'id'>) => void;
  initialData?: Patient;
  title: string;
}

interface FormErrors {
  dni?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  address?: string;
}

export const PatientForm = ({ open, onClose, onSubmit, initialData, title }: PatientFormProps) => {
  const [formData, setFormData] = useState<Omit<Patient, 'id'>>({
    dni: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    recordNumber: '',
    address: '',
    birthDate: '',
    gender: ''
  });

  const [errors, setErrors] = useState<FormErrors>({
    dni: '',
    firstName: '',
    lastName: '',
    email: '',
    address: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        dni: initialData.dni,
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email,
        phone: initialData.phone,
        recordNumber: initialData.recordNumber,
        address: initialData.address,
        birthDate: initialData.birthDate,
        gender: initialData.gender
      });
    } else {
      setFormData({
        dni: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        recordNumber: '',
        address: '',
        birthDate: '',
        gender: ''
      });
    }
    setErrors({});
  }, [initialData, open]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar DNI (debe ser alfanumérico y tener entre 8 y 12 caracteres)
    if (!formData.dni.match(/^[A-Za-z0-9]{8,12}$/)) {
      newErrors.dni = 'El DNI debe tener entre 8 y 12 caracteres alfanuméricos';
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar el error del campo cuando el usuario comienza a escribir
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
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
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="dni"
                label="DNI"
                value={formData.dni}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.dni}
                helperText={errors.dni}
                placeholder="Ingrese el DNI"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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
            </Grid>
            <Grid item xs={12} sm={6}>
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
            </Grid>
            <Grid item xs={12}>
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="phone"
                label="Teléfono"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
                required
                placeholder="Ingrese el número de teléfono"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Dirección"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.address}
                helperText={errors.address}
                placeholder="Ingrese la dirección completa"
              />
            </Grid>
          </Grid>
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