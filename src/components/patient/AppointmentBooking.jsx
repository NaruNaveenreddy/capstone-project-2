import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, Stethoscope, AlertCircle, CheckCircle, X } from 'lucide-react';
import { createAppointment, getAppointments, updateAppointment, cancelAppointment } from '../../utils/database';
import { getAllUsers } from '../../utils/database';

const AppointmentBooking = () => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('book');

  // Booking form state
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [notes, setNotes] = useState('');

  // Available time slots
  const timeSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  useEffect(() => {
    fetchDoctors();
    fetchAppointments();
  }, []);

  const fetchDoctors = async () => {
    try {
      const allUsers = await getAllUsers();
      const doctorUsers = allUsers.filter(user => user.role === 'doctor' && user.isActive);
      setDoctors(doctorUsers);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors');
    }
  };

  const fetchAppointments = async () => {
    if (currentUser) {
      try {
        const userAppointments = await getAppointments(currentUser.uid, 'patient');
        setAppointments(userAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setError('Failed to load appointments');
      }
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!selectedDoctor || !appointmentDate || !appointmentTime) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const appointmentData = {
        patientId: currentUser.uid,
        doctorId: selectedDoctor,
        date: appointmentDate,
        time: appointmentTime,
        notes: notes,
        status: 'scheduled'
      };

      await createAppointment(appointmentData);
      setSuccess('Appointment booked successfully!');
      
      // Reset form
      setSelectedDoctor('');
      setAppointmentDate('');
      setAppointmentTime('');
      setNotes('');
      
      // Refresh appointments
      await fetchAppointments();
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError('Failed to book appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRescheduleAppointment = async (appointmentId, newDate, newTime) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateAppointment(appointmentId, {
        date: newDate,
        time: newTime,
        status: 'scheduled'
      });
      
      setSuccess('Appointment rescheduled successfully!');
      await fetchAppointments();
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      setError('Failed to reschedule appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await cancelAppointment(appointmentId);
      setSuccess('Appointment cancelled successfully!');
      await fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      setError('Failed to cancel appointment');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDoctorName = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Unknown Doctor';
  };

  const getDoctorSpecialization = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor?.specialization || 'General Practice';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Appointment Management</h3>
          <p className="text-sm text-gray-600">Book, reschedule, or cancel your appointments</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={activeTab === 'book' ? 'default' : 'outline'}
            onClick={() => setActiveTab('book')}
            size="sm"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Book New
          </Button>
          <Button
            variant={activeTab === 'manage' ? 'default' : 'outline'}
            onClick={() => setActiveTab('manage')}
            size="sm"
          >
            <Clock className="h-4 w-4 mr-2" />
            Manage Existing
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Book New Appointment */}
      {activeTab === 'book' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Book New Appointment
            </CardTitle>
            <CardDescription>
              Select a doctor and schedule your appointment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doctor">Select Doctor</Label>
                  <Select value={selectedDoctor} onValueChange={setSelectedDoctor} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          <div className="flex items-center">
                            <Stethoscope className="h-4 w-4 mr-2" />
                            <div>
                              <div className="font-medium">
                                Dr. {doctor.firstName} {doctor.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {doctor.specialization || 'General Practice'}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Appointment Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Appointment Time</Label>
                <Select value={appointmentTime} onValueChange={setAppointmentTime} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {formatTime(time)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific concerns or symptoms you'd like to discuss..."
                  rows={3}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Booking...' : 'Book Appointment'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Manage Existing Appointments */}
      {activeTab === 'manage' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Your Appointments
            </CardTitle>
            <CardDescription>
              View and manage your scheduled appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No appointments found</p>
                <p className="text-sm text-gray-400">Book your first appointment to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .map((appointment) => (
                    <div key={appointment.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <Stethoscope className="h-8 w-8 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{getDoctorName(appointment.doctorId)}</h4>
                            <p className="text-sm text-gray-600">{getDoctorSpecialization(appointment.doctorId)}</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(appointment.date)} at {formatTime(appointment.time)}
                            </p>
                            {appointment.notes && (
                              <p className="text-sm text-gray-500 mt-1">
                                Notes: {appointment.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                          {appointment.status === 'scheduled' && (
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  const newDate = prompt('Enter new date (YYYY-MM-DD):', appointment.date);
                                  const newTime = prompt('Enter new time (HH:MM):', appointment.time);
                                  if (newDate && newTime) {
                                    handleRescheduleAppointment(appointment.id, newDate, newTime);
                                  }
                                }}
                              >
                                Reschedule
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleCancelAppointment(appointment.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AppointmentBooking;
