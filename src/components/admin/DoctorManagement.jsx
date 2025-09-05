import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Stethoscope, 
  Plus, 
  Edit, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  User,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import {  getAllUsers, updateUser, deactivateUser } from '../../utils/database';

const DoctorManagement = () => {
  const { createDoctor: createDoctorAuth } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state for creating new doctor
  const [newDoctor, setNewDoctor] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    specialization: '',
    licenseNumber: '',
    experience: ''
  });

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const allUsers = await getAllUsers();
      const doctorUsers = allUsers.filter(user => user.role === 'doctor');
      setDoctors(doctorUsers);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors');
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validate form
    if (!newDoctor.firstName || !newDoctor.lastName || !newDoctor.email || !newDoctor.password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (newDoctor.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const doctorData = {
        firstName: newDoctor.firstName,
        lastName: newDoctor.lastName,
        phone: newDoctor.phone,
        specialization: newDoctor.specialization,
        licenseNumber: newDoctor.licenseNumber,
        experience: newDoctor.experience,
        role: 'doctor'
      };

      await createDoctorAuth(newDoctor.email, newDoctor.password, doctorData);
      setSuccess('Doctor account created successfully!');
      
      // Reset form
      setNewDoctor({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        specialization: '',
        licenseNumber: '',
        experience: ''
      });
      
      // Refresh doctors list
      await fetchDoctors();
    } catch (error) {
      console.error('Error creating doctor:', error);
      setError('Failed to create doctor account. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateDoctor = async (doctorId) => {
    if (!window.confirm('Are you sure you want to deactivate this doctor?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await deactivateUser(doctorId);
      setSuccess('Doctor deactivated successfully!');
      await fetchDoctors();
    } catch (error) {
      console.error('Error deactivating doctor:', error);
      setError('Failed to deactivate doctor');
    } finally {
      setLoading(false);
    }
  };

  const specializations = [
    'General Practice',
    'Internal Medicine',
    'Pediatrics',
    'Cardiology',
    'Dermatology',
    'Orthopedics',
    'Neurology',
    'Psychiatry',
    'Gynecology',
    'Ophthalmology',
    'ENT',
    'Radiology',
    'Anesthesiology',
    'Emergency Medicine',
    'Family Medicine'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Doctor Management</h3>
        <p className="text-sm text-gray-600">Create and manage doctor accounts</p>
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

      {/* Create New Doctor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Create New Doctor Account
          </CardTitle>
          <CardDescription>Add a new doctor to the system</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateDoctor} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={newDoctor.firstName}
                  onChange={(e) => setNewDoctor({ ...newDoctor, firstName: e.target.value })}
                  required
                  placeholder="First name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={newDoctor.lastName}
                  onChange={(e) => setNewDoctor({ ...newDoctor, lastName: e.target.value })}
                  required
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newDoctor.email}
                  onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                  required
                  placeholder="doctor@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newDoctor.password}
                  onChange={(e) => setNewDoctor({ ...newDoctor, password: e.target.value })}
                  required
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={newDoctor.phone}
                  onChange={(e) => setNewDoctor({ ...newDoctor, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specialization">Specialization</Label>
                <Select value={newDoctor.specialization} onValueChange={(value) => setNewDoctor({ ...newDoctor, specialization: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  value={newDoctor.licenseNumber}
                  onChange={(e) => setNewDoctor({ ...newDoctor, licenseNumber: e.target.value })}
                  placeholder="Medical license number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  value={newDoctor.experience}
                  onChange={(e) => setNewDoctor({ ...newDoctor, experience: e.target.value })}
                  placeholder="Years of experience"
                  min="0"
                  max="50"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Creating Doctor Account...' : 'Create Doctor Account'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Doctors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Stethoscope className="h-5 w-5 mr-2" />
            Existing Doctors
          </CardTitle>
          <CardDescription>Manage current doctor accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {doctors.length === 0 ? (
            <div className="text-center py-8">
              <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No doctors found</p>
              <p className="text-sm text-gray-400">Create your first doctor account above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          {doctor.email}
                        </div>
                        {doctor.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {doctor.phone}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        {doctor.specialization && (
                          <span>Specialization: {doctor.specialization}</span>
                        )}
                        {doctor.experience && (
                          <span>Experience: {doctor.experience} years</span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        Joined: {new Date(doctor.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      doctor.isActive 
                        ? 'text-green-600 bg-green-100' 
                        : 'text-red-600 bg-red-100'
                    }`}>
                      {doctor.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {doctor.isActive && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeactivateDoctor(doctor.id)}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DoctorManagement;
