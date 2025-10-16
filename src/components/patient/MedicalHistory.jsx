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
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  Pill,
  FileImage,
  Calendar,
  Stethoscope
} from 'lucide-react';
import { getMedicalHistory, updateMedicalHistory, getPrescriptionsByPatient, savePatientMedicalHistory, getPatientMedicalHistory } from '../../utils/database';

const MedicalHistory = ({ onDataUpdate }) => {
  const { currentUser } = useAuth();
  const [medicalHistory, setMedicalHistory] = useState({
    conditions: [],
    medications: [],
    allergies: [],
    surgeries: [],
    immunizations: [],
    labResults: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('conditions');
  const [prescriptions, setPrescriptions] = useState([]);

  // Form states for different sections
  const [newCondition, setNewCondition] = useState({ name: '', diagnosisDate: '', status: '', notes: '' });
  const [newMedication, setNewMedication] = useState({ name: '', dosage: '', frequency: '', startDate: '', endDate: '', prescribedBy: '' });
  const [newAllergy, setNewAllergy] = useState({ allergen: '', severity: '', symptoms: '', notes: '' });
  const [newSurgery, setNewSurgery] = useState({ procedure: '', date: '', surgeon: '', hospital: '', notes: '' });
  const [newImmunization, setNewImmunization] = useState({ vaccine: '', date: '', provider: '', nextDue: '' });
  const [newLabResult, setNewLabResult] = useState({ testName: '', date: '', result: '', normalRange: '', notes: '' });

  useEffect(() => {
    fetchMedicalHistory();
    fetchPrescriptions();
  }, [currentUser]);

  const fetchMedicalHistory = async () => {
    if (currentUser) {
      try {
        // Try to get from the new patient medical history structure first
        const patientHistory = await getPatientMedicalHistory(currentUser.uid);
        if (patientHistory) {
          // Ensure all arrays are initialized
          const safeHistory = {
            conditions: patientHistory.conditions || [],
            medications: patientHistory.medications || [],
            allergies: patientHistory.allergies || [],
            surgeries: patientHistory.surgeries || [],
            immunizations: patientHistory.immunizations || [],
            labResults: patientHistory.labResults || []
          };
          setMedicalHistory(safeHistory);
        } else {
          // Fallback to old structure
          const history = await getMedicalHistory(currentUser.uid);
          if (history) {
            // Ensure all arrays are initialized
            const safeHistory = {
              conditions: history.conditions || [],
              medications: history.medications || [],
              allergies: history.allergies || [],
              surgeries: history.surgeries || [],
              immunizations: history.immunizations || [],
              labResults: history.labResults || []
            };
            setMedicalHistory(safeHistory);
          }
        }
      } catch (error) {
        console.error('Error fetching medical history:', error);
        setError('Failed to load medical history');
      }
    }
  };

  const saveMedicalHistory = async (updatedHistory) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Save to both old and new database structures for compatibility
      await updateMedicalHistory(currentUser.uid, updatedHistory);
      await savePatientMedicalHistory(currentUser.uid, updatedHistory);
      setMedicalHistory(updatedHistory);
      setSuccess('Medical history updated successfully!');
      
      // Notify parent component of data update
      if (onDataUpdate) {
        onDataUpdate();
      }
    } catch (error) {
      console.error('Error updating medical history:', error);
      setError('Failed to update medical history');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptions = async () => {
    if (currentUser) {
      try {
        const list = await getPrescriptionsByPatient(currentUser.uid);
        setPrescriptions(list);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
      }
    }
  };

  const addCondition = () => {
    if (!newCondition.name) {
      setError('Please enter a condition name');
      return;
    }

    const updatedHistory = {
      ...medicalHistory,
      conditions: [...(medicalHistory.conditions || []), { ...newCondition, id: Date.now() }]
    };
    saveMedicalHistory(updatedHistory);
    setNewCondition({ name: '', diagnosisDate: '', status: '', notes: '' });
  };

  const addMedication = () => {
    if (!newMedication.name) {
      setError('Please enter a medication name');
      return;
    }

    const updatedHistory = {
      ...medicalHistory,
      medications: [...(medicalHistory.medications || []), { ...newMedication, id: Date.now() }]
    };
    saveMedicalHistory(updatedHistory);
    setNewMedication({ name: '', dosage: '', frequency: '', startDate: '', endDate: '', prescribedBy: '' });
  };

  const addAllergy = () => {
    if (!newAllergy.allergen) {
      setError('Please enter an allergen');
      return;
    }

    const updatedHistory = {
      ...medicalHistory,
      allergies: [...(medicalHistory.allergies || []), { ...newAllergy, id: Date.now() }]
    };
    saveMedicalHistory(updatedHistory);
    setNewAllergy({ allergen: '', severity: '', symptoms: '', notes: '' });
  };

  const addSurgery = () => {
    if (!newSurgery.procedure) {
      setError('Please enter a procedure name');
      return;
    }

    const updatedHistory = {
      ...medicalHistory,
      surgeries: [...(medicalHistory.surgeries || []), { ...newSurgery, id: Date.now() }]
    };
    saveMedicalHistory(updatedHistory);
    setNewSurgery({ procedure: '', date: '', surgeon: '', hospital: '', notes: '' });
  };

  const addImmunization = () => {
    if (!newImmunization.vaccine) {
      setError('Please enter a vaccine name');
      return;
    }

    const updatedHistory = {
      ...medicalHistory,
      immunizations: [...(medicalHistory.immunizations || []), { ...newImmunization, id: Date.now() }]
    };
    saveMedicalHistory(updatedHistory);
    setNewImmunization({ vaccine: '', date: '', provider: '', nextDue: '' });
  };

  const addLabResult = () => {
    if (!newLabResult.testName) {
      setError('Please enter a test name');
      return;
    }

    const updatedHistory = {
      ...medicalHistory,
      labResults: [...(medicalHistory.labResults || []), { ...newLabResult, id: Date.now() }]
    };
    saveMedicalHistory(updatedHistory);
    setNewLabResult({ testName: '', date: '', result: '', normalRange: '', notes: '' });
  };

  const removeItem = (section, id) => {
    const updatedHistory = {
      ...medicalHistory,
      [section]: (medicalHistory[section] || []).filter(item => item.id !== id)
    };
    saveMedicalHistory(updatedHistory);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Medical History</h3>
        <p className="text-sm text-gray-600">Manage your medical records, prescriptions, and health information</p>
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

      {/* Health Summary for Doctors */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Health Summary
          </CardTitle>
          <CardDescription>Quick overview of patient's health status for medical professionals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Active Conditions */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-700">Active Conditions</h4>
              <div className="text-2xl font-bold text-red-600">
                {medicalHistory.conditions?.filter(c => c.status === 'active').length || 0}
              </div>
              <p className="text-xs text-gray-500">
                {medicalHistory.conditions?.filter(c => c.status === 'active').length > 0 
                  ? medicalHistory.conditions.filter(c => c.status === 'active').map(c => c.name).join(', ')
                  : 'None'
                }
              </p>
            </div>
            
            {/* Current Medications */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-700">Current Medications</h4>
              <div className="text-2xl font-bold text-blue-600">
                {medicalHistory.medications?.length || 0}
              </div>
              <p className="text-xs text-gray-500">
                {medicalHistory.medications?.length > 0 
                  ? medicalHistory.medications.map(m => m.name).join(', ')
                  : 'None'
                }
              </p>
            </div>
            
            {/* Known Allergies */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-gray-700">Known Allergies</h4>
              <div className="text-2xl font-bold text-orange-600">
                {medicalHistory.allergies?.length || 0}
              </div>
              <p className="text-xs text-gray-500">
                {medicalHistory.allergies?.length > 0 
                  ? medicalHistory.allergies.map(a => a.allergen).join(', ')
                  : 'None'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical History Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="conditions">Conditions</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="allergies">Allergies</TabsTrigger>
          <TabsTrigger value="surgeries">Surgeries</TabsTrigger>
          <TabsTrigger value="immunizations">Immunizations</TabsTrigger>
          <TabsTrigger value="labResults">Lab Results</TabsTrigger>
        </TabsList>

        {/* Prescriptions (from Doctor) */}
        <TabsContent value="prescriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pill className="h-5 w-5 mr-2" />
                Prescriptions
              </CardTitle>
              <CardDescription>View prescriptions provided by your doctor</CardDescription>
            </CardHeader>
            <CardContent>
              {prescriptions.length === 0 ? (
                <div className="text-center py-8">
                  <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No prescriptions available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {prescriptions.map((rx) => (
                    <div key={rx.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-lg">{rx.medicationName}</h4>
                          <p className="text-sm text-gray-600">
                            {rx.dosage} • {rx.frequency}
                          </p>
                          {rx.duration && (
                            <p className="text-sm text-gray-500">Duration: {rx.duration}</p>
                          )}
                          {rx.instructions && (
                            <p className="text-sm text-gray-500 mt-1">Instructions: {rx.instructions}</p>
                          )}
                          {rx.notes && (
                            <p className="text-sm text-gray-500 mt-1">Notes: {rx.notes}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-2">
                            Prescribed on {formatDate(rx.prescribedDate || rx.createdAt)} by {rx.doctorName || 'Doctor'}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          rx.status === 'active' ? 'text-green-700 bg-green-100' :
                          rx.status === 'completed' ? 'text-blue-700 bg-blue-100' : 'text-red-700 bg-red-100'
                        }`}>
                          {rx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medical Conditions */}
        <TabsContent value="conditions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Stethoscope className="h-5 w-5 mr-2" />
                Medical Conditions
              </CardTitle>
              <CardDescription>Track your diagnosed medical conditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Condition Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <Label htmlFor="condition-name">Condition Name</Label>
                  <Input
                    id="condition-name"
                    value={newCondition.name}
                    onChange={(e) => setNewCondition({ ...newCondition, name: e.target.value })}
                    placeholder="e.g., Diabetes, Hypertension"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diagnosis-date">Diagnosis Date</Label>
                  <Input
                    id="diagnosis-date"
                    type="date"
                    value={newCondition.diagnosisDate}
                    onChange={(e) => setNewCondition({ ...newCondition, diagnosisDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition-status">Status</Label>
                  <Select value={newCondition.status} onValueChange={(value) => setNewCondition({ ...newCondition, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="chronic">Chronic</SelectItem>
                      <SelectItem value="monitoring">Under Monitoring</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condition-notes">Notes</Label>
                  <Textarea
                    id="condition-notes"
                    value={newCondition.notes}
                    onChange={(e) => setNewCondition({ ...newCondition, notes: e.target.value })}
                    placeholder="Additional notes about the condition"
                    rows={2}
                  />
                </div>
                <div className="md:col-span-2">
                  <Button onClick={addCondition} disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Condition
                  </Button>
                </div>
              </div>

              {/* Existing Conditions */}
              <div className="space-y-3">
                {medicalHistory.conditions?.map((condition) => (
                  <div key={condition?.id} className="p-4 border rounded-lg bg-white shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg text-gray-900">{condition?.name}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            condition?.status === 'active' ? 'bg-red-100 text-red-800' :
                            condition?.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            condition?.status === 'chronic' ? 'bg-orange-100 text-orange-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {condition?.status?.charAt(0).toUpperCase() + condition?.status?.slice(1)}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Diagnosis Date:</span>
                            <span className="ml-2 text-gray-600">{formatDate(condition?.diagnosisDate)}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Duration:</span>
                            <span className="ml-2 text-gray-600">
                              {condition?.diagnosisDate ? 
                                `${Math.floor((new Date() - new Date(condition.diagnosisDate)) / (1000 * 60 * 60 * 24 * 365.25))} years` : 
                                'Unknown'
                              }
                            </span>
                          </div>
                        </div>
                        
                        {condition?.notes && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <span className="font-medium text-gray-700 text-sm">Notes:</span>
                            <p className="text-gray-600 text-sm mt-1">{condition?.notes}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Edit functionality could be added here
                            console.log('Edit condition:', condition?.id);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeItem('conditions', condition?.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {medicalHistory.conditions?.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No medical conditions recorded</p>
                    <p className="text-gray-400 text-sm mt-1">Add conditions to help doctors understand your health history</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medications */}
        <TabsContent value="medications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Pill className="h-5 w-5 mr-2" />
                Current Medications
              </CardTitle>
              <CardDescription>Track your medications and prescriptions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Medication Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <Label htmlFor="medication-name">Medication Name</Label>
                  <Input
                    id="medication-name"
                    value={newMedication.name}
                    onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                    placeholder="e.g., Metformin, Lisinopril"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medication-dosage">Dosage</Label>
                  <Input
                    id="medication-dosage"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                    placeholder="e.g., 500mg, 10mg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medication-frequency">Frequency</Label>
                  <Input
                    id="medication-frequency"
                    value={newMedication.frequency}
                    onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                    placeholder="e.g., Twice daily, Once a day"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medication-start">Start Date</Label>
                  <Input
                    id="medication-start"
                    type="date"
                    value={newMedication.startDate}
                    onChange={(e) => setNewMedication({ ...newMedication, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medication-end">End Date (if applicable)</Label>
                  <Input
                    id="medication-end"
                    type="date"
                    value={newMedication.endDate}
                    onChange={(e) => setNewMedication({ ...newMedication, endDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medication-prescribed">Prescribed By</Label>
                  <Input
                    id="medication-prescribed"
                    value={newMedication.prescribedBy}
                    onChange={(e) => setNewMedication({ ...newMedication, prescribedBy: e.target.value })}
                    placeholder="Doctor's name"
                  />
                </div>
                <div className="md:col-span-2">
                  <Button onClick={addMedication} disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medication
                  </Button>
                </div>
              </div>

              {/* Existing Medications */}
              <div className="space-y-3">
                {medicalHistory.medications?.map((medication) => (
                  <div key={medication?.id} className="p-4 border rounded-lg bg-white shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg text-gray-900">{medication?.name}</h4>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Current Medication
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-3">
                          <div>
                            <span className="font-medium text-gray-700">Dosage:</span>
                            <span className="ml-2 text-gray-600">{medication?.dosage}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Frequency:</span>
                            <span className="ml-2 text-gray-600">{medication?.frequency}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Start Date:</span>
                            <span className="ml-2 text-gray-600">{formatDate(medication?.startDate)}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Prescribed By:</span>
                            <span className="ml-2 text-gray-600">{medication?.prescribedBy || 'Not specified'}</span>
                          </div>
                        </div>
                        
                        {medication?.endDate && (
                          <div className="text-sm">
                            <span className="font-medium text-gray-700">End Date:</span>
                            <span className="ml-2 text-gray-600">{formatDate(medication?.endDate)}</span>
                          </div>
                        )}
                        
                        {medication?.startDate && (
                          <div className="mt-2 text-sm">
                            <span className="font-medium text-gray-700">Duration:</span>
                            <span className="ml-2 text-gray-600">
                              {medication?.endDate ? 
                                `${Math.floor((new Date(medication.endDate) - new Date(medication.startDate)) / (1000 * 60 * 60 * 24))} days` :
                                `${Math.floor((new Date() - new Date(medication.startDate)) / (1000 * 60 * 60 * 24))} days (ongoing)`
                              }
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Edit functionality could be added here
                            console.log('Edit medication:', medication?.id);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeItem('medications', medication?.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {medicalHistory.medications?.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Pill className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No medications recorded</p>
                    <p className="text-gray-400 text-sm mt-1">Add medications to help doctors understand your current treatment</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Allergies */}
        <TabsContent value="allergies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Allergies
              </CardTitle>
              <CardDescription>Record your allergies and reactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Allergy Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <Label htmlFor="allergen">Allergen</Label>
                  <Input
                    id="allergen"
                    value={newAllergy.allergen}
                    onChange={(e) => setNewAllergy({ ...newAllergy, allergen: e.target.value })}
                    placeholder="e.g., Penicillin, Peanuts, Pollen"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergy-severity">Severity</Label>
                  <Select value={newAllergy.severity} onValueChange={(value) => setNewAllergy({ ...newAllergy, severity: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Mild</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                      <SelectItem value="life-threatening">Life-threatening</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergy-symptoms">Symptoms</Label>
                  <Textarea
                    id="allergy-symptoms"
                    value={newAllergy.symptoms}
                    onChange={(e) => setNewAllergy({ ...newAllergy, symptoms: e.target.value })}
                    placeholder="Describe the symptoms you experience"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergy-notes">Notes</Label>
                  <Textarea
                    id="allergy-notes"
                    value={newAllergy.notes}
                    onChange={(e) => setNewAllergy({ ...newAllergy, notes: e.target.value })}
                    placeholder="Additional notes"
                    rows={2}
                  />
                </div>
                <div className="md:col-span-2">
                  <Button onClick={addAllergy} disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Allergy
                  </Button>
                </div>
              </div>

              {/* Existing Allergies */}
              <div className="space-y-3">
                {medicalHistory.allergies?.map((allergy) => (
                  <div key={allergy?.id} className="p-4 border rounded-lg bg-white shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-lg text-gray-900">{allergy?.allergen}</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            allergy?.severity === 'life-threatening' ? 'bg-red-100 text-red-800' :
                            allergy?.severity === 'severe' ? 'bg-orange-100 text-orange-800' :
                            allergy?.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {allergy?.severity?.charAt(0).toUpperCase() + allergy?.severity?.slice(1)}
                          </span>
                        </div>
                        
                        {allergy?.symptoms && (
                          <div className="mt-2 p-3 bg-red-50 rounded-md">
                            <span className="font-medium text-red-700 text-sm">Symptoms:</span>
                            <p className="text-red-600 text-sm mt-1">{allergy?.symptoms}</p>
                          </div>
                        )}
                        
                        {allergy?.notes && (
                          <div className="mt-2 p-3 bg-gray-50 rounded-md">
                            <span className="font-medium text-gray-700 text-sm">Notes:</span>
                            <p className="text-gray-600 text-sm mt-1">{allergy?.notes}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Edit functionality could be added here
                            console.log('Edit allergy:', allergy?.id);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeItem('allergies', allergy?.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {medicalHistory.allergies?.length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No allergies recorded</p>
                    <p className="text-gray-400 text-sm mt-1">Add allergies to help doctors understand your health risks</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Additional tabs for surgeries, immunizations, and lab results would follow similar patterns */}
        {/* For brevity, I'll include a simplified version of the remaining tabs */}
        
        <TabsContent value="surgeries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Surgical History</CardTitle>
              <CardDescription>Record your surgical procedures</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">Surgical history management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="immunizations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Immunization Records</CardTitle>
              <CardDescription>Track your vaccinations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">Immunization tracking coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="labResults" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lab Results</CardTitle>
              <CardDescription>View your laboratory test results</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">Lab results management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MedicalHistory;