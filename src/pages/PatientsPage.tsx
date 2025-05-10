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
  DialogActions
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientsApi } from '../services/api';
import type { Patient } from '../types';
import { PatientForm } from '../components/PatientForm';

export const PatientsPage = () => {
  const [openForm, setOpenForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const queryClient = useQueryClient();

  const { data: patients, isLoading, error } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await patientsApi.getAll();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (newPatient: Omit<Patient, 'id'>) => patientsApi.create(newPatient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setOpenForm(false);
      setSnackbar({
        open: true,
        message: 'Paciente creado exitosamente',
        severity: 'success'
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'Error al crear el paciente',
        severity: 'error'
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (patient: Patient) => patientsApi.update(patient.id, patient),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setOpenForm(false);
      setSelectedPatient(undefined);
      setSnackbar({
        open: true,
        message: 'Paciente actualizado exitosamente',
        severity: 'success'
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'Error al actualizar el paciente',
        severity: 'error'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => patientsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setDeleteDialogOpen(false);
      setPatientToDelete(null);
      setSnackbar({
        open: true,
        message: 'Paciente eliminado exitosamente',
        severity: 'success'
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'Error al eliminar el paciente',
        severity: 'error'
      });
    }
  });

  const handleCreate = () => {
    setSelectedPatient(undefined);
    setOpenForm(true);
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setOpenForm(true);
  };

  const handleDelete = (patient: Patient) => {
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (patientToDelete) {
      deleteMutation.mutate(patientToDelete.id);
    }
  };

  const handleSubmit = (patientData: Omit<Patient, 'id'>) => {
    if (selectedPatient) {
      updateMutation.mutate({ ...patientData, id: selectedPatient.id });
    } else {
      createMutation.mutate(patientData);
    }
  };

  if (isLoading) {
    return <Typography>Cargando...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error al cargar los pacientes</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Pacientes</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Nuevo Paciente
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Número de Expediente</TableCell>
              <TableCell>DNI</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Apellido</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {patients?.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell>{patient.recordNumber}</TableCell>
                <TableCell>{patient.dni}</TableCell>
                <TableCell>{patient.firstName}</TableCell>
                <TableCell>{patient.lastName}</TableCell>
                <TableCell>{patient.email}</TableCell>
                <TableCell>{patient.phone}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(patient)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(patient)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <PatientForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setSelectedPatient(undefined);
        }}
        onSubmit={handleSubmit}
        initialData={selectedPatient}
        title={selectedPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar al paciente {patientToDelete?.firstName} {patientToDelete?.lastName}?
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