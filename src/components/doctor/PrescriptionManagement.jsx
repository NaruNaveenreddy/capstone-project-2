import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Pill, 
  Plus, 
  Search, 
  AlertCircle, 
  CheckCircle,
  User,
  Calendar,
  FileText,
  Trash2,
  Edit
} from 'lucide-react';
import { getAllUsers, getAppointments, createPrescription, getPrescriptionsByPatient, updatePrescription as dbUpdatePrescription, deletePrescription as dbDeletePrescription } from '../../utils/database';

const PrescriptionManagement = () => {
  const { currentUser } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);

  // Prescription form state
  const [prescriptionForm, setPrescriptionForm] = useState({
    patientId: '',
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    instructions: '',
    quantity: '',
    refills: '0',
    prescribedDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

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

  const fetchPatientAppointments = async (patientId) => {
    try {
      const allAppointments = await getAppointments(currentUser.uid, 'doctor');
      const patientApts = allAppointments.filter(apt => apt.patientId === patientId);
      setPatientAppointments(patientApts);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handlePatientSelect = async (patient) => {
    setSelectedPatient(patient);
    setPrescriptionForm(prev => ({ ...prev, patientId: patient.id }));
    await fetchPatientAppointments(patient.id);
    // Load existing prescriptions for this patient
    await loadPatientPrescriptions(patient.id);
  };

  const loadPatientPrescriptions = async (patientId) => {
    try {
      const list = await getPrescriptionsByPatient(patientId);
      setPrescriptions(list);
    } catch (e) {
      console.error('Error loading prescriptions:', e);
    }
  };

  const handlePrescriptionSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate form
    if (!prescriptionForm.medicationName || !prescriptionForm.dosage || !prescriptionForm.frequency) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      const newId = await createPrescription({
        ...prescriptionForm,
        doctorId: currentUser.uid,
        doctorName: `Dr. ${currentUser.email}`,
        status: 'active'
      });
      await loadPatientPrescriptions(prescriptionForm.patientId);
      setSuccess('Prescription created successfully!');
      
      // Reset form
      setPrescriptionForm({
        patientId: selectedPatient?.id || '',
        medicationName: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
        quantity: '',
        refills: '0',
        prescribedDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      
      setShowPrescriptionForm(false);
    } catch (error) {
      console.error('Error creating prescription:', error);
      setError('Failed to create prescription');
    } finally {
      setLoading(false);
    }
  };

  const handlePrescriptionUpdate = async (prescriptionId, updates) => {
    try {
      await dbUpdatePrescription(prescriptionId, updates);
      setSuccess('Prescription updated successfully!');
      if (selectedPatient) await loadPatientPrescriptions(selectedPatient.id);
    } catch (e) {
      console.error('Error updating prescription:', e);
      setError('Failed to update prescription');
    }
  };

  const handlePrescriptionDelete = async (prescriptionId) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) return;
    try {
      await dbDeletePrescription(prescriptionId);
      setSuccess('Prescription deleted successfully!');
      if (selectedPatient) await loadPatientPrescriptions(selectedPatient.id);
    } catch (e) {
      console.error('Error deleting prescription:', e);
      setError('Failed to delete prescription');
    }
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
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Prescription Management</h3>
          <p className="text-sm text-gray-600">Create and manage patient prescriptions</p>
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
          {selectedPatient && (
            <Button onClick={() => setShowPrescriptionForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Prescription
            </Button>
          )}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Patients ({filteredPatients.length})
              </CardTitle>
              <CardDescription>Select a patient to manage prescriptions</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredPatients.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Prescription Management */}
        <div className="lg:col-span-2">
          {selectedPatient ? (
            <div className="space-y-6">
              {/* Patient Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Pill className="h-5 w-5 mr-2" />
                    Prescriptions for {selectedPatient.firstName} {selectedPatient.lastName}
                  </CardTitle>
                  <CardDescription>Manage prescriptions and medication history</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{prescriptions.length}</div>
                      <div className="text-sm text-blue-600">Total Prescriptions</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {prescriptions.filter(p => p.status === 'active').length}
                      </div>
                      <div className="text-sm text-green-600">Active</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-600">
                        {prescriptions.filter(p => p.status === 'completed').length}
                      </div>
                      <div className="text-sm text-gray-600">Completed</div>
                    </div>
                  </div>

                  {/* Prescriptions List */}
                  {prescriptions.length === 0 ? (
                    <div className="text-center py-8">
                      <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No prescriptions found</p>
                      <p className="text-sm text-gray-400">Create a new prescription to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {prescriptions.map((prescription) => (
                        <div key={prescription.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4">
                                <div>
                                  <h4 className="font-medium text-lg">{prescription.medicationName}</h4>
                                  <p className="text-sm text-gray-600">
                                    {prescription.dosage} - {prescription.frequency}
                                  </p>
                                  {prescription.duration && (
                                    <p className="text-sm text-gray-500">
                                      Duration: {prescription.duration}
                                    </p>
                                  )}
                                  {prescription.instructions && (
                                    <p className="text-sm text-gray-500 mt-1">
                                      Instructions: {prescription.instructions}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Prescribed: {formatDate(prescription.prescribedDate)}
                                </div>
                                {prescription.refills > 0 && (
                                  <div>Refills: {prescription.refills}</div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(prescription.status)}`}>
                                {prescription.status}
                              </span>
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handlePrescriptionUpdate(prescription.id, { 
                                    status: prescription.status === 'active' ? 'completed' : 'active' 
                                  })}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handlePrescriptionDelete(prescription.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Pill className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Patient</h3>
                <p className="text-gray-500">Choose a patient from the list to manage their prescriptions</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Prescription Form Modal */}
      {showPrescriptionForm && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pill className="h-5 w-5 mr-2" />
                New Prescription
              </CardTitle>
              <CardDescription>
                Create a prescription for {selectedPatient.firstName} {selectedPatient.lastName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicationName">Medication Name *</Label>
                    <Input
                      id="medicationName"
                      value={prescriptionForm.medicationName}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medicationName: e.target.value })}
                      placeholder="e.g., Amoxicillin, Metformin"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dosage">Dosage *</Label>
                    <Input
                      id="dosage"
                      value={prescriptionForm.dosage}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, dosage: e.target.value })}
                      placeholder="e.g., 500mg, 10ml"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency *</Label>
                    <Select value={prescriptionForm.frequency} onValueChange={(value) => setPrescriptionForm({ ...prescriptionForm, frequency: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Once daily">Once daily</SelectItem>
                        <SelectItem value="Twice daily">Twice daily</SelectItem>
                        <SelectItem value="Three times daily">Three times daily</SelectItem>
                        <SelectItem value="Four times daily">Four times daily</SelectItem>
                        <SelectItem value="As needed">As needed</SelectItem>
                        <SelectItem value="Every 4 hours">Every 4 hours</SelectItem>
                        <SelectItem value="Every 6 hours">Every 6 hours</SelectItem>
                        <SelectItem value="Every 8 hours">Every 8 hours</SelectItem>
                        <SelectItem value="Every 12 hours">Every 12 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={prescriptionForm.duration}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, duration: e.target.value })}
                      placeholder="e.g., 7 days, 2 weeks"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      value={prescriptionForm.quantity}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, quantity: e.target.value })}
                      placeholder="e.g., 30 tablets, 100ml"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="refills">Refills</Label>
                    <Select value={prescriptionForm.refills} onValueChange={(value) => setPrescriptionForm({ ...prescriptionForm, refills: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0</SelectItem>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={prescriptionForm.instructions}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, instructions: e.target.value })}
                    placeholder="e.g., Take with food, Avoid alcohol, Store in refrigerator"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={prescriptionForm.notes}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })}
                    placeholder="Additional notes or warnings..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prescribedDate">Prescribed Date</Label>
                  <Input
                    id="prescribedDate"
                    type="date"
                    value={prescriptionForm.prescribedDate}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, prescribedDate: e.target.value })}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPrescriptionForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Prescription'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PrescriptionManagement;
