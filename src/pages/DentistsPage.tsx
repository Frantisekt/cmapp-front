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
import { dentistsApi } from '../services/api';
import type { Dentist } from '../types';
import { DentistForm } from '../components/DentistForm';

export const DentistsPage = () => {
  const [openForm, setOpenForm] = useState(false);
  const [selectedDentist, setSelectedDentist] = useState<Dentist | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dentistToDelete, setDentistToDelete] = useState<Dentist | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const queryClient = useQueryClient();

  const { data: dentists, isLoading, error } = useQuery({
    queryKey: ['dentists'],
    queryFn: async () => {
      const response = await dentistsApi.getAll();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (newDentist: Omit<Dentist, 'id'>) => dentistsApi.create(newDentist),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dentists'] });
      setOpenForm(false);
      setSnackbar({
        open: true,
        message: 'Odontólogo creado exitosamente',
        severity: 'success'
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'Error al crear el odontólogo',
        severity: 'error'
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (dentist: Dentist) => dentistsApi.update(dentist.id, dentist),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dentists'] });
      setOpenForm(false);
      setSelectedDentist(undefined);
      setSnackbar({
        open: true,
        message: 'Odontólogo actualizado exitosamente',
        severity: 'success'
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'Error al actualizar el odontólogo',
        severity: 'error'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dentistsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dentists'] });
      setDeleteDialogOpen(false);
      setDentistToDelete(null);
      setSnackbar({
        open: true,
        message: 'Odontólogo eliminado exitosamente',
        severity: 'success'
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'Error al eliminar el odontólogo',
        severity: 'error'
      });
    }
  });

  const handleCreate = () => {
    setSelectedDentist(undefined);
    setOpenForm(true);
  };

  const handleEdit = (dentist: Dentist) => {
    setSelectedDentist(dentist);
    setOpenForm(true);
  };

  const handleDelete = (dentist: Dentist) => {
    setDentistToDelete(dentist);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (dentistToDelete) {
      deleteMutation.mutate(dentistToDelete.id);
    }
  };

  const handleSubmit = (dentistData: Omit<Dentist, 'id'>) => {
    if (selectedDentist) {
      updateMutation.mutate({ ...dentistData, id: selectedDentist.id });
    } else {
      createMutation.mutate(dentistData);
    }
  };

  if (isLoading) {
    return <Typography>Cargando...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error al cargar los odontólogos</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Odontólogos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Nuevo Odontólogo
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Estado</TableCell>
              <TableCell>Número de Licencia</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell>Apellido</TableCell>
              <TableCell>Especialidad</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dentists?.map((dentist) => (
              <TableRow key={dentist.id}>
                <TableCell>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: dentist.active ? 'green' : 'red',
                      display: 'inline-block',
                    }}
                  />
                </TableCell>
                <TableCell>{dentist.licenseNumber}</TableCell>
                <TableCell>{dentist.firstName}</TableCell>
                <TableCell>{dentist.lastName}</TableCell>
                <TableCell>{dentist.specialty}</TableCell>
                <TableCell>{dentist.email}</TableCell>
                <TableCell>{dentist.phone}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(dentist)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(dentist)}
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

      <DentistForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setSelectedDentist(undefined);
        }}
        onSubmit={handleSubmit}
        initialData={selectedDentist}
        title={selectedDentist ? 'Editar Odontólogo' : 'Nuevo Odontólogo'}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar al odontólogo {dentistToDelete?.firstName} {dentistToDelete?.lastName}?
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