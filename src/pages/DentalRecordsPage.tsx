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
  Tabs,
  Tab,
  TextField,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dentalRecordsApi } from '../services/api';
import type { DentalRecord } from '../types';
import { DentalRecordForm } from '../components/DentalRecordForm';

export const DentalRecordsPage = () => {
  const [openForm, setOpenForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DentalRecord | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<DentalRecord | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [currentTab, setCurrentTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: records, isLoading, error } = useQuery({
    queryKey: ['dental-records'],
    queryFn: async () => {
      const response = await dentalRecordsApi.getAll();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (newRecord: Omit<DentalRecord, 'id' | 'createdAt' | 'updatedAt'>) => 
      dentalRecordsApi.create(newRecord),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dental-records'] });
      setOpenForm(false);
      setSnackbar({
        open: true,
        message: 'Expediente creado exitosamente',
        severity: 'success'
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'Error al crear el expediente',
        severity: 'error'
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (record: DentalRecord) => dentalRecordsApi.update(record.id, record),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dental-records'] });
      setOpenForm(false);
      setSelectedRecord(undefined);
      setSnackbar({
        open: true,
        message: 'Expediente actualizado exitosamente',
        severity: 'success'
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'Error al actualizar el expediente',
        severity: 'error'
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => dentalRecordsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dental-records'] });
      setDeleteDialogOpen(false);
      setRecordToDelete(null);
      setSnackbar({
        open: true,
        message: 'Expediente eliminado exitosamente',
        severity: 'success'
      });
    },
    onError: () => {
      setSnackbar({
        open: true,
        message: 'Error al eliminar el expediente',
        severity: 'error'
      });
    }
  });

  const handleCreate = () => {
    setSelectedRecord(undefined);
    setOpenForm(true);
  };

  const handleEdit = (record: DentalRecord) => {
    setSelectedRecord(record);
    setOpenForm(true);
  };

  const handleDelete = (record: DentalRecord) => {
    setRecordToDelete(record);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (recordToDelete) {
      deleteMutation.mutate(recordToDelete.id);
    }
  };

  const handleSubmit = (recordData: Omit<DentalRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (selectedRecord) {
      updateMutation.mutate({ ...recordData, id: selectedRecord.id } as DentalRecord);
    } else {
      createMutation.mutate(recordData);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const filteredRecords = records?.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    return (
      record.patientId.toLowerCase().includes(searchLower) ||
      record.visits.some(visit => 
        visit.diagnosis.toLowerCase().includes(searchLower) ||
        visit.treatment.toLowerCase().includes(searchLower)
      ) ||
      record.procedures.some(procedure =>
        procedure.name.toLowerCase().includes(searchLower)
      )
    );
  });

  if (isLoading) {
    return <Typography>Cargando...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error al cargar los expedientes</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Expedientes Dentales</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Nuevo Expediente
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar por paciente, diagnóstico o procedimiento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              fullWidth
            >
              Filtros Avanzados
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Tabs value={currentTab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Todos" />
        <Tab label="Activos" />
        <Tab label="Recientes" />
      </Tabs>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID Paciente</TableCell>
              <TableCell>Última Visita</TableCell>
              <TableCell>Diagnóstico</TableCell>
              <TableCell>Tratamiento</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRecords?.map((record) => {
              const lastVisit = record.visits[record.visits.length - 1];
              return (
                <TableRow key={record.id}>
                  <TableCell>{record.patientId}</TableCell>
                  <TableCell>{lastVisit?.date || 'N/A'}</TableCell>
                  <TableCell>{lastVisit?.diagnosis || 'N/A'}</TableCell>
                  <TableCell>{lastVisit?.treatment || 'N/A'}</TableCell>
                  <TableCell>
                    {record.active ? 'Activo' : 'Inactivo'}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(record)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(record)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <DentalRecordForm
        open={openForm}
        onClose={() => {
          setOpenForm(false);
          setSelectedRecord(undefined);
        }}
        onSubmit={handleSubmit}
        initialData={selectedRecord}
        title={selectedRecord ? 'Editar Expediente' : 'Nuevo Expediente'}
      />

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar este expediente?
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