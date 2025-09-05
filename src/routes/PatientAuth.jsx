import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, ArrowLeft, AlertCircle, Heart } from 'lucide-react';

const PatientAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, 'patient');
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'Failed to sign in. Please check your credentials.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        firstName,
        lastName,
        dateOfBirth,
        phone,
        address,
        emergencyContact,
        role: 'patient'
      };
      
      await signup(email, password, userData);
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to create account. Email may already be in use.');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setDateOfBirth('');
    setPhone('');
    setAddress('');
    setEmergencyContact('');
    setError('');
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    resetForm();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-purple-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Patient Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your healthcare services
          </p>
        </div>

        <Card className="border-purple-200">
          <CardHeader className="bg-purple-50">
            <CardTitle className="text-center text-purple-800">Patient Access</CardTitle>
            <CardDescription className="text-center text-purple-600">
              Sign in to your account or create a new patient account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  New Patient
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email Address</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email"
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password"
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700" 
                    disabled={loading}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        placeholder="First name"
                        className="border-purple-200 focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        placeholder="Last name"
                        className="border-purple-200 focus:border-purple-500"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email Address</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email"
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="Phone number"
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      placeholder="Your address"
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input
                      id="emergencyContact"
                      type="tel"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      required
                      placeholder="Emergency contact number"
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Create a password"
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Confirm your password"
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-purple-600 hover:bg-purple-700" 
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Patient Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert className="mt-4" variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                  {error.includes('Access denied') && (
                    <div className="mt-2 text-sm">
                      <p>Need to access a different portal?</p>
                      <div className="flex space-x-2 mt-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate('/auth/doctor')}
                          className="text-xs"
                        >
                          Doctor Portal
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate('/auth/admin')}
                          className="text-xs"
                        >
                          Admin Portal
                        </Button>
                      </div>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="mt-6 text-center">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Role Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientAuth;
