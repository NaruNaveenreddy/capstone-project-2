import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Stethoscope, 
  LogOut, 
  User,
  Calendar,
  Clock,
  FileText,
  MessageSquare,
  Activity,
  TrendingUp,
  Users
} from 'lucide-react';
import AppointmentManagement from '../components/doctor/AppointmentManagement';
import PatientRecords from '../components/doctor/PatientRecords';
import PrescriptionManagement from '../components/doctor/PrescriptionManagement';
import DoctorProfile from '../components/doctor/DoctorProfile';
import { getAppointments, getAllUsers } from '../utils/database';

const DoctorDashboard = () => {
  const { currentUser, userRole, logout } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  const fetchDashboardData = async () => {
    if (currentUser) {
      try {
        // Fetch doctor's appointments
        const appointments = await getAppointments(currentUser.uid, 'doctor');
        
        // Filter upcoming appointments (next 7 days)
        const upcoming = appointments
          .filter(apt => apt.status === 'scheduled' && new Date(apt.date) >= new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5);
        
        // Filter today's appointments
        const today = new Date().toISOString().split('T')[0];
        const todayApts = appointments
          .filter(apt => apt.date === today && apt.status === 'scheduled')
          .sort((a, b) => a.time.localeCompare(b.time));

        setUpcomingAppointments(upcoming);
        setTodayAppointments(todayApts);

        // Count unique patients
        const uniquePatients = new Set(appointments.map(apt => apt.patientId));
        setTotalPatients(uniquePatients.size);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getPatientName = async (patientId) => {
    try {
      const allUsers = await getAllUsers();
      const patient = allUsers.find(user => user.id === patientId);
      return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
    } catch (error) {
      return 'Unknown Patient';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Stethoscope className="h-8 w-8 text-green-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Doctor Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">
                  Dr. {currentUser?.email}
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
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Your Medical Practice
            </h2>
            <p className="text-gray-600">
              Manage your appointments, review patient records, and provide quality healthcare.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{todayAppointments.length}</div>
                <p className="text-xs text-muted-foreground">
                  Scheduled for today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
                <p className="text-xs text-muted-foreground">
                  Next 7 days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPatients}</div>
                <p className="text-xs text-muted-foreground">
                  Unique patients seen
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Practice Status</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Active</div>
                <p className="text-xs text-muted-foreground">
                  Ready for consultations
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Today's Appointments */}
          {todayAppointments.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Today's Appointments
                </CardTitle>
                <CardDescription>
                  Your scheduled appointments for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todayAppointments.map(async (appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <User className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{await getPatientName(appointment.patientId)}</p>
                          <p className="text-sm text-gray-600">Patient ID: {appointment.patientId}</p>
                          {appointment.notes && (
                            <p className="text-sm text-gray-500 mt-1">
                              Notes: {appointment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatTime(appointment.time)}</p>
                        <p className="text-sm text-gray-600">Scheduled</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content Tabs */}
          <Card>
            <CardContent className="p-6">
              <Tabs defaultValue="appointments" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="appointments" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Appointments
                  </TabsTrigger>
                  <TabsTrigger value="patients" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Patient Records
                  </TabsTrigger>
                  <TabsTrigger value="prescriptions" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Prescriptions
                  </TabsTrigger>
                  <TabsTrigger value="profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="appointments" className="mt-6">
                  <AppointmentManagement onDataUpdate={fetchDashboardData} />
                </TabsContent>

                <TabsContent value="patients" className="mt-6">
                  <PatientRecords />
                </TabsContent>

                <TabsContent value="prescriptions" className="mt-6">
                  <PrescriptionManagement />
                </TabsContent>

                <TabsContent value="profile" className="mt-6">
                  <DoctorProfile />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default DoctorDashboard;
