import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  FileText, 
  Heart, 
  MessageCircle, 
  LogOut, 
  User,
  Clock,
  Stethoscope,
  Activity,
  Brain
} from 'lucide-react';
import AppointmentBooking from '../components/patient/AppointmentBooking';
import MedicalHistory from '../components/patient/MedicalHistory';
import LifestylePlans from '../components/patient/LifestylePlans';
import AIAssistant from '../components/patient/AIAssistant';
import { getAppointments } from '../utils/database';

const PatientDashboard = () => {
  const { currentUser, userRole, logout } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (currentUser) {
        try {
          const appointments = await getAppointments(currentUser.uid, 'patient');
          const upcoming = appointments
            .filter(apt => apt.status === 'scheduled' && new Date(apt.date) >= new Date())
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .slice(0, 3);
          setUpcomingAppointments(upcoming);
        } catch (error) {
          console.error('Error fetching appointments:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAppointments();
  }, [currentUser]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-purple-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Patient Portal
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">
                  {currentUser?.email}
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
              Welcome to Your Health Portal
            </h2>
            <p className="text-gray-600">
              Manage your appointments, medical records, and health insights all in one place.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{upcomingAppointments.length}</div>
                <p className="text-xs text-muted-foreground">
                  Next appointment scheduled
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Medical Records</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">
                  View your medical history
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Health Plans</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">
                  Diet & exercise plans
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Assistant</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24/7</div>
                <p className="text-xs text-muted-foreground">
                  Health insights available
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Upcoming Appointments
                </CardTitle>
                <CardDescription>
                  Your next scheduled appointments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <Stethoscope className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Dr. {appointment.doctorName || 'Doctor'}</p>
                          <p className="text-sm text-gray-600">{appointment.specialization || 'General Practice'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatDate(appointment.date)}</p>
                        <p className="text-sm text-gray-600">{formatTime(appointment.time)}</p>
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
                  <TabsTrigger value="medical" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Medical History
                  </TabsTrigger>
                  <TabsTrigger value="lifestyle" className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Health Plans
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    AI Assistant
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="appointments" className="mt-6">
                  <AppointmentBooking />
                </TabsContent>

                <TabsContent value="medical" className="mt-6">
                  <MedicalHistory />
                </TabsContent>

                <TabsContent value="lifestyle" className="mt-6">
                  <LifestylePlans />
                </TabsContent>

                <TabsContent value="ai" className="mt-6">
                  <AIAssistant />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PatientDashboard;
