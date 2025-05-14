import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Paper,
  Divider
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import type { DentalRecord, DentalVisit, DentalProcedure, DentalImage, Prescription } from '../types';

interface DentalRecordFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (dentalRecord: Omit<DentalRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: DentalRecord;
  title: string;
}

interface FormErrors {
  patientId?: string;
  visits?: string;
}

export const DentalRecordForm = ({ open, onClose, onSubmit, initialData, title }: DentalRecordFormProps) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [formData, setFormData] = useState<Omit<DentalRecord, 'id' | 'createdAt' | 'updatedAt'>>({
    patientId: '',
    personalInfo: {},
    visits: [],
    procedures: [],
    images: [],
    prescriptions: [],
    medicalHistory: {},
    dentalHistory: {},
    allergies: [],
    medications: [],
    notes: {},
    active: true
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        patientId: initialData.patientId,
        personalInfo: initialData.personalInfo,
        visits: initialData.visits,
        procedures: initialData.procedures,
        images: initialData.images,
        prescriptions: initialData.prescriptions,
        medicalHistory: initialData.medicalHistory,
        dentalHistory: initialData.dentalHistory,
        allergies: initialData.allergies,
        medications: initialData.medications,
        notes: initialData.notes,
        active: initialData.active
      });
    } else {
      setFormData({
        patientId: '',
        personalInfo: {},
        visits: [],
        procedures: [],
        images: [],
        prescriptions: [],
        medicalHistory: {},
        dentalHistory: {},
        allergies: [],
        medications: [],
        notes: {},
        active: true
      });
    }
    setErrors({});
  }, [initialData, open]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.patientId) {
      newErrors.patientId = 'El ID del paciente es requerido';
    }

    if (formData.visits.length === 0) {
      newErrors.visits = 'Se requiere al menos una visita';
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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const addVisit = () => {
    const newVisit: DentalVisit = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      reason: '',
      diagnosis: '',
      treatment: '',
      observations: '',
      dentistId: '',
      additionalInfo: {}
    };
    setFormData(prev => ({
      ...prev,
      visits: [...prev.visits, newVisit]
    }));
  };

  const updateVisit = (index: number, field: keyof DentalVisit, value: any) => {
    setFormData(prev => {
      const updatedVisits = [...prev.visits];
      updatedVisits[index] = {
        ...updatedVisits[index],
        [field]: value
      };
      return {
        ...prev,
        visits: updatedVisits
      };
    });
  };

  const removeVisit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      visits: prev.visits.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                name="patientId"
                label="ID del Paciente"
                value={formData.patientId}
                onChange={handleChange}
                fullWidth
                required
                error={!!errors.patientId}
                helperText={errors.patientId}
              />
            </Grid>

            <Grid item xs={12}>
              <Tabs value={currentTab} onChange={handleTabChange}>
                <Tab label="Visitas" />
                <Tab label="Procedimientos" />
                <Tab label="Historial" />
                <Tab label="Notas" />
              </Tabs>
            </Grid>

            {currentTab === 0 && (
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addVisit}
                    variant="outlined"
                  >
                    Agregar Visita
                  </Button>
                </Box>
                {formData.visits.map((visit, index) => (
                  <Paper key={visit.id} sx={{ p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">Visita {index + 1}</Typography>
                      <IconButton
                        size="small"
                        onClick={() => removeVisit(index)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Fecha"
                          type="date"
                          value={visit.date}
                          onChange={(e) => updateVisit(index, 'date', e.target.value)}
                          fullWidth
                          InputLabelProps={{ shrink: true }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Motivo"
                          value={visit.reason}
                          onChange={(e) => updateVisit(index, 'reason', e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Diagnóstico"
                          value={visit.diagnosis}
                          onChange={(e) => updateVisit(index, 'diagnosis', e.target.value)}
                          fullWidth
                          multiline
                          rows={2}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Tratamiento"
                          value={visit.treatment}
                          onChange={(e) => updateVisit(index, 'treatment', e.target.value)}
                          fullWidth
                          multiline
                          rows={2}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Observaciones"
                          value={visit.observations}
                          onChange={(e) => updateVisit(index, 'observations', e.target.value)}
                          fullWidth
                          multiline
                          rows={2}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
                {errors.visits && (
                  <Typography color="error" variant="caption">
                    {errors.visits}
                  </Typography>
                )}
              </Grid>
            )}

            {currentTab === 1 && (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary">
                  Los procedimientos se pueden agregar después de crear el expediente
                </Typography>
              </Grid>
            )}

            {currentTab === 2 && (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary">
                  El historial médico y dental se puede actualizar después de crear el expediente
                </Typography>
              </Grid>
            )}

            {currentTab === 3 && (
              <Grid item xs={12}>
                <Typography variant="body1" color="text.secondary">
                  Las notas se pueden agregar después de crear el expediente
                </Typography>
              </Grid>
            )}
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