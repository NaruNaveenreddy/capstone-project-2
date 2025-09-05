import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Stethoscope, Shield, LogOut } from 'lucide-react';
import PatientDashboard from './PatientDashboard';
import DoctorDashboard from './DoctorDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { currentUser, userRole, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleIcon = () => {
    switch (userRole) {
      case 'admin':
        return <Shield className="h-8 w-8 text-blue-600" />;
      case 'doctor':
        return <Stethoscope className="h-8 w-8 text-green-600" />;
      case 'patient':
        return <User className="h-8 w-8 text-purple-600" />;
      default:
        return <User className="h-8 w-8 text-gray-600" />;
    }
  };

  const getRoleTitle = () => {
    switch (userRole) {
      case 'admin':
        return 'Administrator Dashboard';
      case 'doctor':
        return 'Doctor Dashboard';
      case 'patient':
        return 'Patient Dashboard';
      default:
        return 'Dashboard';
    }
  };

  const getRoleDescription = () => {
    switch (userRole) {
      case 'admin':
        return 'Manage users, system settings, and platform maintenance';
      case 'doctor':
        return 'Manage appointments, review patient records, and provide care';
      case 'patient':
        return 'Book appointments, manage medical history, and access AI assistant';
      default:
        return 'Welcome to your healthcare portal';
    }
  };

  // Route to specific dashboard based on role
  if (userRole === 'patient') {
    return <PatientDashboard />;
  }

  if (userRole === 'admin') {
    return <AdminDashboard />;
  }

  if (userRole === 'doctor') {
    return <DoctorDashboard />;
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Healthcare Management System
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getRoleIcon()}
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {userRole}
                </span>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getRoleIcon()}
                <span>{getRoleTitle()}</span>
              </CardTitle>
              <CardDescription>{getRoleDescription()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">User Info</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">Email: {currentUser?.email}</p>
                      <p className="text-sm text-gray-600">Role: {userRole}</p>
                    </CardContent>
                  </Card>

                  {userRole === 'doctor' && (
                    <>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600">Manage your schedule</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Patients</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600">View patient records</p>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {userRole === 'admin' && (
                    <>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">User Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600">Manage users and roles</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">System Settings</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-gray-600">Configure system settings</p>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

