import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Stethoscope, Shield } from 'lucide-react';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelection = (role) => {
    navigate(`/auth/${role}`);
  };

  const roles = [
    {
      id: 'patient',
      title: 'Patient',
      description: 'Access your medical records, book appointments, and get AI health insights',
      icon: User,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      features: [
        'Book & manage appointments',
        'View medical history',
        'AI health assistant',
        'Lifestyle management'
      ]
    },
    {
      id: 'doctor',
      title: 'Doctor',
      description: 'Manage your schedule, review patient records, and provide medical care',
      icon: Stethoscope,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      features: [
        'Manage appointments',
        'Review patient records',
        'Provide diagnoses',
        'Schedule management'
      ]
    },
    {
      id: 'admin',
      title: 'Administrator',
      description: 'Manage users, system settings, and oversee platform operations',
      icon: Shield,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: [
        'User management',
        'System settings',
        'Analytics & reports',
        'Platform maintenance'
      ]
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Healthcare Management System
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Select your role to access the appropriate portal
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((role) => {
            const IconComponent = role.icon;
            return (
              <Card 
                key={role.id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${role.borderColor} border-2`}
                onClick={() => handleRoleSelection(role.id)}
              >
                <CardHeader className={`${role.bgColor} text-center`}>
                  <div className="flex justify-center mb-4">
                    <IconComponent className={`h-12 w-12 ${role.color}`} />
                  </div>
                  <CardTitle className="text-xl">{role.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ul className="space-y-2 text-sm text-gray-600">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${role.color.replace('text-', 'bg-')} mr-2`}></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full mt-4 ${role.color.replace('text-', 'bg-').replace('-600', '-600')} hover:${role.color.replace('text-', 'bg-').replace('-600', '-700')}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoleSelection(role.id);
                    }}
                  >
                    Access {role.title} Portal
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact your system administrator
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
