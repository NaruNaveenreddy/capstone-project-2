import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, ArrowLeft, AlertCircle, Lock } from 'lucide-react';

const AdminAuth = () => {
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
      await login(email, password, 'admin');
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'Failed to sign in. Please check your credentials or contact your system administrator.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Admin Portal
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            System administration and management
          </p>
        </div>

        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-center text-blue-800">Administrator Login</CardTitle>
            <CardDescription className="text-center text-blue-600">
              Sign in with your administrator credentials
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
                  className="border-blue-200 focus:border-blue-500"
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
                  className="border-blue-200 focus:border-blue-500"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700" 
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
                          onClick={() => navigate('/auth/doctor')}
                          className="text-xs"
                        >
                          Doctor Portal
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
                  <Lock className="h-4 w-4" />
                  <span>Admin accounts are created by system administrators</span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Role Selection
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Admin Portal Features</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Manage user accounts and roles</li>
              <li>• Configure system settings</li>
              <li>• View analytics and reports</li>
              <li>• Monitor platform activity</li>
              <li>• Ensure compliance and security</li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Security Notice:</strong> Admin access is restricted and monitored. 
              All activities are logged for security purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuth;
