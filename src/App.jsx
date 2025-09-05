
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleSelection from './routes/RoleSelection';
import PatientAuth from './routes/PatientAuth';
import DoctorAuth from './routes/DoctorAuth';
import AdminAuth from './routes/AdminAuth';
import Dashboard from './routes/Dashboard';
import Unauthorized from './routes/Unauthorized';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<RoleSelection />} />
        <Route path="/auth/patient" element={<PatientAuth />} />
        <Route path="/auth/doctor" element={<DoctorAuth />} />
        <Route path="/auth/admin" element={<AdminAuth />} />
        
        {/* Protected Routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Admin Only Routes */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Doctor Only Routes */}
        <Route 
          path="/doctor/*" 
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Patient Only Routes */}
        <Route 
          path="/patient/*" 
          element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Error Routes */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
