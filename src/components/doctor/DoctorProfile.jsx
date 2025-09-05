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
  User, 
  Edit, 
  Save, 
  AlertCircle, 
  CheckCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Clock,
  Stethoscope
} from 'lucide-react';
import { getUser, updateUser } from '../../utils/database';

const DoctorProfile = () => {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    licenseNumber: '',
    experience: '',
    bio: '',
    address: '',
    consultationFee: '',
    availableHours: {
      monday: { start: '09:00', end: '17:00', available: true },
      tuesday: { start: '09:00', end: '17:00', available: true },
      wednesday: { start: '09:00', end: '17:00', available: true },
      thursday: { start: '09:00', end: '17:00', available: true },
      friday: { start: '09:00', end: '17:00', available: true },
      saturday: { start: '09:00', end: '13:00', available: false },
      sunday: { start: '09:00', end: '13:00', available: false }
    }
  });

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

  useEffect(() => {
    fetchProfile();
  }, [currentUser]);

  const fetchProfile = async () => {
    if (currentUser) {
      try {
        const userProfile = await getUser(currentUser.uid);
        if (userProfile) {
          setProfile(userProfile);
          setFormData({
            firstName: userProfile.firstName || '',
            lastName: userProfile.lastName || '',
            email: userProfile.email || '',
            phone: userProfile.phone || '',
            specialization: userProfile.specialization || '',
            licenseNumber: userProfile.licenseNumber || '',
            experience: userProfile.experience || '',
            bio: userProfile.bio || '',
            address: userProfile.address || '',
            consultationFee: userProfile.consultationFee || '',
            availableHours: userProfile.availableHours || formData.availableHours
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile');
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateUser(currentUser.uid, formData);
      setProfile({ ...profile, ...formData });
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      phone: profile.phone || '',
      specialization: profile.specialization || '',
      licenseNumber: profile.licenseNumber || '',
      experience: profile.experience || '',
      bio: profile.bio || '',
      address: profile.address || '',
      consultationFee: profile.consultationFee || '',
      availableHours: profile.availableHours || formData.availableHours
    });
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const daysOfWeek = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  const dayLabels = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Doctor Profile</h3>
          <p className="text-sm text-gray-600">Manage your professional profile and availability</p>
        </div>
        <div className="flex space-x-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
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

      {profile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Profile Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Stethoscope className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold">
                    Dr. {profile.firstName} {profile.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{profile.specialization}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{profile.email}</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{profile.phone}</span>
                    </div>
                  )}
                  {profile.address && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{profile.address}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">
                      Joined: {formatDate(profile.createdAt)}
                    </span>
                  </div>
                  {profile.experience && (
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{profile.experience} years experience</span>
                    </div>
                  )}
                </div>

                {profile.bio && (
                  <div>
                    <Label className="text-sm font-medium">Bio</Label>
                    <p className="text-sm text-gray-600 mt-1">{profile.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your professional information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-medium">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-gray-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h4 className="font-medium">Professional Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Specialization</Label>
                      <Select 
                        value={formData.specialization} 
                        onValueChange={(value) => setFormData({ ...formData, specialization: value })}
                        disabled={!isEditing}
                      >
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
                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber">License Number</Label>
                      <Input
                        id="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input
                        id="experience"
                        type="number"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                        disabled={!isEditing}
                        min="0"
                        max="50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="consultationFee">Consultation Fee</Label>
                      <Input
                        id="consultationFee"
                        value={formData.consultationFee}
                        onChange={(e) => setFormData({ ...formData, consultationFee: e.target.value })}
                        disabled={!isEditing}
                        placeholder="e.g., $100"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      disabled={!isEditing}
                      placeholder="Tell patients about your background and approach to healthcare..."
                      rows={4}
                    />
                  </div>
                </div>

                {/* Availability */}
                {isEditing && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Availability</h4>
                    <div className="space-y-3">
                      {daysOfWeek.map((day) => (
                        <div key={day} className="flex items-center space-x-4">
                          <div className="w-24">
                            <Label className="text-sm font-medium">{dayLabels[day]}</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.availableHours[day].available}
                              onChange={(e) => setFormData({
                                ...formData,
                                availableHours: {
                                  ...formData.availableHours,
                                  [day]: {
                                    ...formData.availableHours[day],
                                    available: e.target.checked
                                  }
                                }
                              })}
                              className="rounded"
                            />
                            <span className="text-sm">Available</span>
                          </div>
                          {formData.availableHours[day].available && (
                            <div className="flex items-center space-x-2">
                              <Input
                                type="time"
                                value={formData.availableHours[day].start}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  availableHours: {
                                    ...formData.availableHours,
                                    [day]: {
                                      ...formData.availableHours[day],
                                      start: e.target.value
                                    }
                                  }
                                })}
                                className="w-32"
                              />
                              <span className="text-sm">to</span>
                              <Input
                                type="time"
                                value={formData.availableHours[day].end}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  availableHours: {
                                    ...formData.availableHours,
                                    [day]: {
                                      ...formData.availableHours[day],
                                      end: e.target.value
                                    }
                                  }
                                })}
                                className="w-32"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorProfile;
