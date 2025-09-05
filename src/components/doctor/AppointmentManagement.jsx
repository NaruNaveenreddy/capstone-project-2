import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle,
  MessageSquare,
  FileText,
  Stethoscope,
  Search,
  Filter
} from 'lucide-react';
import { getAppointments, updateAppointment, getAllUsers } from '../../utils/database';

const AppointmentManagement = ({ onDataUpdate }) => {
  const { currentUser } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Feedback form state
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [feedback, setFeedback] = useState({
    diagnosis: '',
    treatment: '',
    notes: '',
    followUpRequired: false,
    followUpDate: '',
    prescription: ''
  });

  useEffect(() => {
    fetchAppointments();
    fetchAllUsers();
  }, [currentUser]);

  const fetchAppointments = async () => {
    if (currentUser) {
      try {
        const userAppointments = await getAppointments(currentUser.uid, 'doctor');
        setAppointments(userAppointments);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        setError('Failed to load appointments');
      }
    }
  };

  const fetchAllUsers = async () => {
    try {
      const users = await getAllUsers();
      setAllUsers(users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const getPatientName = (patientId) => {
    const patient = allUsers.find(user => user.id === patientId);
    return patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown Patient';
  };

  const getPatientInfo = (patientId) => {
    const patient = allUsers.find(user => user.id === patientId);
    return patient || null;
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateAppointment(appointmentId, { status: newStatus });
      setSuccess(`Appointment marked as ${newStatus}`);
      await fetchAppointments();
      if (onDataUpdate) onDataUpdate();
    } catch (error) {
      console.error('Error updating appointment:', error);
      setError('Failed to update appointment status');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateAppointment(selectedAppointment.id, {
        status: 'completed',
        feedback: {
          diagnosis: feedback.diagnosis,
          treatment: feedback.treatment,
          notes: feedback.notes,
          followUpRequired: feedback.followUpRequired,
          followUpDate: feedback.followUpDate,
          prescription: feedback.prescription,
          completedAt: new Date().toISOString()
        }
      });

      setSuccess('Appointment completed and feedback saved!');
      setSelectedAppointment(null);
      setFeedback({
        diagnosis: '',
        treatment: '',
        notes: '',
        followUpRequired: false,
        followUpDate: '',
        prescription: ''
      });
      
      await fetchAppointments();
      if (onDataUpdate) onDataUpdate();
    } catch (error) {
      console.error('Error saving feedback:', error);
      setError('Failed to save feedback');
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
      case 'no-show': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const patientName = getPatientName(appointment.patientId).toLowerCase();
    const matchesSearch = patientName.includes(searchTerm.toLowerCase()) || 
                         appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = filteredAppointments.filter(apt => apt.date === today);
  const upcomingAppointments = filteredAppointments.filter(apt => apt.date > today);
  const pastAppointments = filteredAppointments.filter(apt => apt.date < today);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Appointment Management</h3>
          <p className="text-sm text-gray-600">Manage your appointments and provide patient feedback</p>
        </div>
        <div className="flex space-x-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="no-show">No Show</SelectItem>
            </SelectContent>
          </Select>
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

      {/* Appointment Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Today ({todayAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Past ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        {/* Today's Appointments */}
        <TabsContent value="today" className="space-y-4">
          {todayAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No appointments scheduled for today</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <User className="h-10 w-10 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-lg">{getPatientName(appointment.patientId)}</h4>
                          <p className="text-sm text-gray-600">
                            Time: {formatTime(appointment.time)}
                          </p>
                          {appointment.notes && (
                            <p className="text-sm text-gray-500 mt-1">
                              Notes: {appointment.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                        {appointment.status === 'scheduled' && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => setSelectedAppointment(appointment)}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(appointment.id, 'no-show')}
                            >
                              No Show
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Upcoming Appointments */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No upcoming appointments</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <User className="h-10 w-10 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-lg">{getPatientName(appointment.patientId)}</h4>
                          <p className="text-sm text-gray-600">
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
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                        {appointment.status === 'scheduled' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Past Appointments */}
        <TabsContent value="past" className="space-y-4">
          {pastAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No past appointments</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pastAppointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <User className="h-10 w-10 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-lg">{getPatientName(appointment.patientId)}</h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(appointment.date)} at {formatTime(appointment.time)}
                          </p>
                          {appointment.feedback && (
                            <div className="mt-2 text-sm">
                              <p className="text-gray-700">
                                <strong>Diagnosis:</strong> {appointment.feedback.diagnosis}
                              </p>
                              {appointment.feedback.treatment && (
                                <p className="text-gray-700">
                                  <strong>Treatment:</strong> {appointment.feedback.treatment}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                        {appointment.feedback && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedAppointment(appointment)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Feedback Modal */}
      {selectedAppointment && (
        <Card className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <CardContent className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedAppointment.feedback ? 'Appointment Details' : 'Complete Appointment'}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAppointment(null)}
              >
                Close
              </Button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium">{getPatientName(selectedAppointment.patientId)}</h4>
              <p className="text-sm text-gray-600">
                {formatDate(selectedAppointment.date)} at {formatTime(selectedAppointment.time)}
              </p>
              {selectedAppointment.notes && (
                <p className="text-sm text-gray-500 mt-1">
                  Patient Notes: {selectedAppointment.notes}
                </p>
              )}
            </div>

            {!selectedAppointment.feedback ? (
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis *</Label>
                  <Textarea
                    id="diagnosis"
                    value={feedback.diagnosis}
                    onChange={(e) => setFeedback({ ...feedback, diagnosis: e.target.value })}
                    placeholder="Enter diagnosis..."
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="treatment">Treatment Plan</Label>
                  <Textarea
                    id="treatment"
                    value={feedback.treatment}
                    onChange={(e) => setFeedback({ ...feedback, treatment: e.target.value })}
                    placeholder="Describe treatment plan..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prescription">Prescription</Label>
                  <Textarea
                    id="prescription"
                    value={feedback.prescription}
                    onChange={(e) => setFeedback({ ...feedback, prescription: e.target.value })}
                    placeholder="Prescription details..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={feedback.notes}
                    onChange={(e) => setFeedback({ ...feedback, notes: e.target.value })}
                    placeholder="Additional notes..."
                    rows={2}
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="followUp"
                      checked={feedback.followUpRequired}
                      onChange={(e) => setFeedback({ ...feedback, followUpRequired: e.target.checked })}
                      className="mr-2"
                    />
                    <Label htmlFor="followUp">Follow-up required</Label>
                  </div>
                  {feedback.followUpRequired && (
                    <div className="flex-1">
                      <Label htmlFor="followUpDate">Follow-up Date</Label>
                      <Input
                        id="followUpDate"
                        type="date"
                        value={feedback.followUpDate}
                        onChange={(e) => setFeedback({ ...feedback, followUpDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedAppointment(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Complete Appointment'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Diagnosis</Label>
                  <p className="p-3 bg-gray-50 rounded">{selectedAppointment.feedback.diagnosis}</p>
                </div>

                {selectedAppointment.feedback.treatment && (
                  <div className="space-y-2">
                    <Label>Treatment Plan</Label>
                    <p className="p-3 bg-gray-50 rounded">{selectedAppointment.feedback.treatment}</p>
                  </div>
                )}

                {selectedAppointment.feedback.prescription && (
                  <div className="space-y-2">
                    <Label>Prescription</Label>
                    <p className="p-3 bg-gray-50 rounded">{selectedAppointment.feedback.prescription}</p>
                  </div>
                )}

                {selectedAppointment.feedback.notes && (
                  <div className="space-y-2">
                    <Label>Additional Notes</Label>
                    <p className="p-3 bg-gray-50 rounded">{selectedAppointment.feedback.notes}</p>
                  </div>
                )}

                {selectedAppointment.feedback.followUpRequired && (
                  <div className="space-y-2">
                    <Label>Follow-up Required</Label>
                    <p className="p-3 bg-yellow-50 rounded">
                      Yes - {selectedAppointment.feedback.followUpDate}
                    </p>
                  </div>
                )}

                <div className="text-sm text-gray-500">
                  Completed on: {new Date(selectedAppointment.feedback.completedAt).toLocaleString()}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AppointmentManagement;
