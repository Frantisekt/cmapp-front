import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material';
import { MainLayout } from './layouts/MainLayout';
import { PatientsPage } from './pages/PatientsPage';
import { DentistsPage } from './pages/DentistsPage';
import { AppointmentsPage } from './pages/AppointmentsPage';

// Crear el cliente de React Query
const queryClient = new QueryClient();

// Crear el tema de Material-UI
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/patients" replace />} />
              <Route path="/patients" element={<PatientsPage />} />
              <Route path="/dentists" element={<DentistsPage />} />
              <Route path="/appointments" element={<AppointmentsPage />} />
              <Route path="/treatments/*" element={<div>Tratamientos</div>} />
              <Route path="/dental-records/*" element={<div>Expedientes</div>} />
            </Routes>
          </MainLayout>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
