import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Stethoscope, ArrowLeft, AlertCircle, UserCheck } from 'lucide-react';

const DoctorAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password, 'doctor');
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'Failed to sign in. Please check your credentials or contact your administrator.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Stethoscope className="h-12 w-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Doctor Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your medical practice dashboard
          </p>
        </div>

        <Card className="border-green-200">
          <CardHeader className="bg-green-50">
            <CardTitle className="text-center text-green-800">Doctor Login</CardTitle>
            <CardDescription className="text-center text-green-600">
              Sign in with your doctor credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="border-green-200 focus:border-green-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="border-green-200 focus:border-green-500"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700" 
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>

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
                          onClick={() => navigate('/auth/patient')}
                          className="text-xs"
                        >
                          Patient Portal
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

            <div className="mt-6 space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                  <UserCheck className="h-4 w-4" />
                  <span>Doctor accounts are created by administrators</span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="w-full border-green-200 text-green-600 hover:bg-green-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Role Selection
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800 mb-2">Doctor Portal Features</h3>
            <ul className="text-xs text-green-700 space-y-1">
              <li>• Manage your appointment schedule</li>
              <li>• Review patient medical records</li>
              <li>• Provide diagnoses and prescriptions</li>
              <li>• Communicate with patients</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorAuth;
