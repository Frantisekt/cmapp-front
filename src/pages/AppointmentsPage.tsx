import { useState } from 'react';
import { 
  Box, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi, patientsApi, dentistsApi } from '../services/api';
import type { Appointment, Patient, Dentist } from '../types';
import { AppointmentForm } from '../components/AppointmentForm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const AppointmentsPage = () => {
  const [openForm, setOpenForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const queryClient = useQueryClient();

  const { data: appointments, isLoading, error } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const response = await appointmentsApi.getAll();
      return response.data;
    },
  });

  const { data: patients } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await patientsApi.getAll();
      return response.data;
    },
  });

  const { data: dentists } = useQuery({
    queryKey: ['dentists'],
    queryFn: async () => {
      const response = await dentistsApi.getAll();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (newAppointment: Omit<Appointment, 'id'>) => appointmentsApi.create(newAppointment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setOpenForm(false);
      setSnackbar({
        open: true,
        message: 'Cita creada exitosamente',
        severity: 'success'
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'Error al crear la cita',
        severity: 'error'
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (appointment: Appointment) => appointmentsApi.update(appointment.id, appointment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setOpenForm(false);
      setSelectedAppointment(undefined);
      setSnackbar({
        open: true,
        message: 'Cita actualizada exitosamente',
        severity: 'success'
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'Error al actualizar la cita',
        severity: 'error'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => appointmentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setDeleteDialogOpen(false);
      setAppointmentToDelete(null);
      setSnackbar({
        open: true,
        message: 'Cita eliminada exitosamente',
        severity: 'success'
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'Error al eliminar la cita',
        severity: 'error'
      });
    }
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => appointmentsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setSnackbar({
        open: true,
        message: 'Cita cancelada exitosamente',
        severity: 'success'
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'Error al cancelar la cita',
        severity: 'error'
      });
    }
  });

  const handleCreate = () => {
    setSelectedAppointment(undefined);
    setOpenForm(true);
  };

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setOpenForm(true);
  };

  const handleDelete = (appointment: Appointment) => {
    setAppointmentToDelete(appointment);
    setDeleteDialogOpen(true);
  };

  const handleCancel = (appointment: Appointment) => {
    cancelMutation.mutate(appointment.id);
  };

  const confirmDelete = () => {
    if (appointmentToDelete) {
      deleteMutation.mutate(appointmentToDelete.id);
    }
  };

  const handleSubmit = (appointmentData: Omit<Appointment, 'id'>) => {
    if (selectedAppointment) {
      updateMutation.mutate({ ...appointmentData, id: selectedAppointment.id });
    } else {
      createMutation.mutate(appointmentData);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'primary';
      case 'CANCELLED':
        return 'error';
      case 'COMPLETED':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'Programada';
      case 'CANCELLED':
        return 'Cancelada';
      case 'COMPLETED':
        return 'Completada';
      default:
        return status;
    }
  };

  if (isLoading) {
    return <Typography>Cargando...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error al cargar las citas</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Citas</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Nueva Cita
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Estado</TableCell>
              <TableCell>Paciente</TableCell>
              <TableCell>Odontólogo</TableCell>
              <TableCell>Fecha y Hora</TableCell>
              <TableCell>Número de Consulta</TableCell>
              <TableCell>Notas</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments?.map((appointment) => (
              <TableRow key={appointment.id}>
                <TableCell>
                  <Chip 
                    label={getStatusLabel(appointment.status)} 
                    color={getStatusColor(appointment.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {patients?.find(p => p.id === appointment.patientId)?.firstName}{' '}
                  {patients?.find(p => p.id === appointment.patientId)?.lastName}
                </TableCell>
                <TableCell>
                  {dentists?.find(d => d.id === appointment.dentistId)?.firstName}{' '}
                  {dentists?.find(d => d.id === appointment.dentistId)?.lastName}
                </TableCell>
                <TableCell>
                  {format(new Date(appointment.dateTime), "PPP 'a las' HH:mm", { locale: es })}
                </TableCell>
                <TableCell>{appointment.consultationNumber}</TableCell>
                <TableCell>{appointment.notes}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(appointment)}
                    color="primary"
                    disabled={appointment.status === 'CANCELLED'}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(appointment)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                  {appointment.status === 'SCHEDULED' && (
                    <Button
                      size="small"
                      onClick={() => handleCancel(appointment)}
                      color="warning"
                      variant="outlined"
                    >
                      Cancelar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <AppointmentForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setSelectedAppointment(undefined);
        }}
        onSubmit={handleSubmit}
        initialData={selectedAppointment}
        title={selectedAppointment ? 'Editar Cita' : 'Nueva Cita'}
        patients={patients || []}
        dentists={dentists || []}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar esta cita?
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}; 