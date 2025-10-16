import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Search, 
  FileText, 
  Heart, 
  Pill, 
  AlertTriangle,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Activity
} from 'lucide-react';
import { getAllUsers, getAppointments, getMedicalHistory, getPatientMedicalHistory, getAllPatientsMedicalHistory } from '../../utils/database';

const PatientRecords = () => {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [patientMedicalHistory, setPatientMedicalHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchPatients();
  }, [currentUser]);

  const fetchPatients = async () => {
    try {
      const allUsers = await getAllUsers();
      const patientUsers = allUsers.filter(user => user.role === 'patient' && user.isActive);
      setPatients(patientUsers);
    } catch (error) {
      console.error('Error fetching patients:', error);
      setError('Failed to load patients');
    }
  };

  const fetchPatientDetails = async (patientId) => {
    setLoading(true);
    setError('');

    try {
      // Fetch patient appointments with this doctor
      const allAppointments = await getAppointments(currentUser.uid, 'doctor');
      const patientApts = allAppointments.filter(apt => apt.patientId === patientId);
      setPatientAppointments(patientApts);

      // Fetch patient medical history from new database structure
      const medicalHistory = await getPatientMedicalHistory(patientId);
      if (!medicalHistory) {
        // Fallback to old structure
        const oldMedicalHistory = await getMedicalHistory(patientId);
        setPatientMedicalHistory(oldMedicalHistory);
      } else {
        setPatientMedicalHistory(medicalHistory);
      }

    } catch (error) {
      console.error('Error fetching patient details:', error);
      setError('Failed to load patient details');
    } finally {
      setLoading(false);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    fetchPatientDetails(patient.id);
    setActiveTab('overview');
  };

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    const email = patient.email.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           email.includes(searchTerm.toLowerCase());
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Patient Records</h3>
          <p className="text-sm text-gray-600">View and manage patient information and medical history</p>
        </div>
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-64"
          />
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Patients ({filteredPatients.length})
              </CardTitle>
              <CardDescription>Select a patient to view their records</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPatients.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No patients found</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedPatient?.id === patient.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handlePatientSelect(patient)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-green-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {patient.firstName} {patient.lastName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {patient.email}
                          </p>
                          {patient.phone && (
                            <p className="text-xs text-gray-500">
                              {patient.phone}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Patient Details */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </CardTitle>
                <CardDescription>Patient medical records and history</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="appointments">Appointments</TabsTrigger>
                    <TabsTrigger value="medical">Medical History</TabsTrigger>
                    <TabsTrigger value="lifestyle">Lifestyle</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Personal Information</Label>
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{selectedPatient.email}</span>
                            </div>
                            {selectedPatient.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{selectedPatient.phone}</span>
                              </div>
                            )}
                            {selectedPatient.dateOfBirth && (
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">
                                  DOB: {formatDate(selectedPatient.dateOfBirth)}
                                </span>
                              </div>
                            )}
                            {selectedPatient.address && (
                              <div className="flex items-center space-x-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{selectedPatient.address}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Emergency Contact</Label>
                          {selectedPatient.emergencyContact ? (
                            <p className="text-sm mt-1">{selectedPatient.emergencyContact}</p>
                          ) : (
                            <p className="text-sm text-gray-500 mt-1">Not provided</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Appointment Summary</Label>
                          <div className="mt-2 space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Total Appointments:</span>
                              <span className="font-medium">{patientAppointments.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Completed:</span>
                              <span className="font-medium text-green-600">
                                {patientAppointments.filter(apt => apt.status === 'completed').length}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Last Visit:</span>
                              <span className="font-medium">
                                {patientAppointments.length > 0 
                                  ? formatDate(patientAppointments[patientAppointments.length - 1].date)
                                  : 'Never'
                                }
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Account Status</Label>
                          <div className="mt-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              selectedPatient.isActive 
                                ? 'text-green-600 bg-green-100' 
                                : 'text-red-600 bg-red-100'
                            }`}>
                              {selectedPatient.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Appointments Tab */}
                  <TabsContent value="appointments" className="space-y-4">
                    {patientAppointments.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No appointments found</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {patientAppointments
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .map((appointment) => (
                            <div key={appointment.id} className="border rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium">
                                    {formatDate(appointment.date)} at {formatTime(appointment.time)}
                                  </h4>
                                  {appointment.notes && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      Notes: {appointment.notes}
                                    </p>
                                  )}
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
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                                  {appointment.status}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Medical History Tab */}
                  <TabsContent value="medical" className="space-y-4">
                    {patientMedicalHistory ? (
                      <div className="space-y-6">
                        {/* Health Summary for Doctor */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                            <Activity className="h-5 w-5 mr-2" />
                            Health Summary
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-blue-800">Active Conditions:</span>
                              <span className="ml-2 text-blue-700">
                                {patientMedicalHistory.conditions?.filter(c => c.status === 'active').length || 0}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-blue-800">Current Medications:</span>
                              <span className="ml-2 text-blue-700">
                                {patientMedicalHistory.medications?.length || 0}
                              </span>
                            </div>
                            <div>
                              <span className="font-medium text-blue-800">Known Allergies:</span>
                              <span className="ml-2 text-blue-700">
                                {patientMedicalHistory.allergies?.length || 0}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Medical Conditions */}
                        {patientMedicalHistory.conditions && patientMedicalHistory.conditions.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium flex items-center">
                              <Heart className="h-4 w-4 mr-2" />
                              Medical Conditions ({patientMedicalHistory.conditions.length})
                            </Label>
                            <div className="mt-2 space-y-3">
                              {patientMedicalHistory.conditions.map((condition, index) => (
                                <div key={index} className="p-4 bg-white border rounded-lg shadow-sm">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <h5 className="font-semibold text-lg">{condition.name}</h5>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                          condition.status === 'active' ? 'bg-red-100 text-red-800' :
                                          condition.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                          condition.status === 'chronic' ? 'bg-orange-100 text-orange-800' :
                                          'bg-blue-100 text-blue-800'
                                        }`}>
                                          {condition.status}
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <div>
                                          <span className="font-medium text-gray-700">Diagnosed:</span>
                                          <span className="ml-2 text-gray-600">{formatDate(condition.diagnosisDate)}</span>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Duration:</span>
                                          <span className="ml-2 text-gray-600">
                                            {condition.diagnosisDate ? 
                                              `${Math.floor((new Date() - new Date(condition.diagnosisDate)) / (1000 * 60 * 60 * 24 * 365.25))} years` : 
                                              'Unknown'
                                            }
                                          </span>
                                        </div>
                                      </div>
                                      {condition.notes && (
                                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                          <span className="font-medium text-gray-700">Notes:</span>
                                          <p className="text-gray-600 mt-1">{condition.notes}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Medications */}
                        {patientMedicalHistory.medications && patientMedicalHistory.medications.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium flex items-center">
                              <Pill className="h-4 w-4 mr-2" />
                              Current Medications ({patientMedicalHistory.medications.length})
                            </Label>
                            <div className="mt-2 space-y-3">
                              {patientMedicalHistory.medications.map((medication, index) => (
                                <div key={index} className="p-4 bg-white border rounded-lg shadow-sm">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-3 mb-2">
                                        <h5 className="font-semibold text-lg">{medication.name}</h5>
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                          Current Medication
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-2">
                                        <div>
                                          <span className="font-medium text-gray-700">Dosage:</span>
                                          <span className="ml-2 text-gray-600">{medication.dosage}</span>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Frequency:</span>
                                          <span className="ml-2 text-gray-600">{medication.frequency}</span>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Start Date:</span>
                                          <span className="ml-2 text-gray-600">{formatDate(medication.startDate)}</span>
                                        </div>
                                        <div>
                                          <span className="font-medium text-gray-700">Prescribed By:</span>
                                          <span className="ml-2 text-gray-600">{medication.prescribedBy || 'Not specified'}</span>
                                        </div>
                                      </div>
                                      {medication.endDate && (
                                        <div className="text-sm">
                                          <span className="font-medium text-gray-700">End Date:</span>
                                          <span className="ml-2 text-gray-600">{formatDate(medication.endDate)}</span>
                                        </div>
                                      )}
                                      {medication.startDate && (
                                        <div className="mt-2 text-sm">
                                          <span className="font-medium text-gray-700">Duration:</span>
                                          <span className="ml-2 text-gray-600">
                                            {medication.endDate ? 
                                              `${Math.floor((new Date(medication.endDate) - new Date(medication.startDate)) / (1000 * 60 * 60 * 24))} days` :
                                              `${Math.floor((new Date() - new Date(medication.startDate)) / (1000 * 60 * 60 * 24))} days (ongoing)`
                                            }
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Allergies */}
                        {patientMedicalHistory.allergies && patientMedicalHistory.allergies.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium flex items-center">
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Allergies
                            </Label>
                            <div className="mt-2 space-y-2">
                              {patientMedicalHistory.allergies.map((allergy, index) => (
                                <div key={index} className="p-3 bg-red-50 rounded-lg">
                                  <h5 className="font-medium text-red-800">{allergy.allergen}</h5>
                                  <p className="text-sm text-red-600">
                                    Severity: {allergy.severity}
                                  </p>
                                  {allergy.symptoms && (
                                    <p className="text-sm text-red-500 mt-1">
                                      Symptoms: {allergy.symptoms}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {(!patientMedicalHistory.conditions || patientMedicalHistory.conditions.length === 0) &&
                         (!patientMedicalHistory.medications || patientMedicalHistory.medications.length === 0) &&
                         (!patientMedicalHistory.allergies || patientMedicalHistory.allergies.length === 0) && (
                          <div className="text-center py-8">
                            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">No medical history recorded</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Loading medical history...</p>
                      </div>
                    )}
                  </TabsContent>

                  {/* Lifestyle Tab */}
                  <TabsContent value="lifestyle" className="space-y-4">
                    {patientMedicalHistory?.lifestylePlans ? (
                      <div className="space-y-6">
                        {/* Diet Plan */}
                        {patientMedicalHistory.lifestylePlans.dietPlan && (
                          <div>
                            <Label className="text-sm font-medium flex items-center">
                              <Activity className="h-4 w-4 mr-2" />
                              Diet & Nutrition
                            </Label>
                            <div className="mt-2 space-y-2">
                              {patientMedicalHistory.lifestylePlans.dietPlan.goals && (
                                <div className="p-3 bg-green-50 rounded-lg">
                                  <h5 className="font-medium text-green-800">Diet Goals</h5>
                                  <p className="text-sm text-green-700">{patientMedicalHistory.lifestylePlans.dietPlan.goals}</p>
                                </div>
                              )}
                              {patientMedicalHistory.lifestylePlans.dietPlan.waterIntake > 0 && (
                                <div className="p-3 bg-blue-50 rounded-lg">
                                  <h5 className="font-medium text-blue-800">Water Intake</h5>
                                  <p className="text-sm text-blue-700">
                                    {patientMedicalHistory.lifestylePlans.dietPlan.waterIntake} glasses per day
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Exercise Plan */}
                        {patientMedicalHistory.lifestylePlans.exercisePlan && (
                          <div>
                            <Label className="text-sm font-medium flex items-center">
                              <Activity className="h-4 w-4 mr-2" />
                              Exercise & Fitness
                            </Label>
                            <div className="mt-2 space-y-2">
                              {patientMedicalHistory.lifestylePlans.exercisePlan.goals && (
                                <div className="p-3 bg-blue-50 rounded-lg">
                                  <h5 className="font-medium text-blue-800">Fitness Goals</h5>
                                  <p className="text-sm text-blue-700">{patientMedicalHistory.lifestylePlans.exercisePlan.goals}</p>
                                </div>
                              )}
                              {patientMedicalHistory.lifestylePlans.exercisePlan.weeklyTarget > 0 && (
                                <div className="p-3 bg-purple-50 rounded-lg">
                                  <h5 className="font-medium text-purple-800">Weekly Target</h5>
                                  <p className="text-sm text-purple-700">
                                    {patientMedicalHistory.lifestylePlans.exercisePlan.weeklyTarget} hours per week
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No lifestyle information available</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Patient</h3>
                <p className="text-gray-500">Choose a patient from the list to view their medical records</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientRecords;
