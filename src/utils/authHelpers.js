// Helper function to get the correct login route based on user role
export const getLoginRoute = (role) => {
  const routes = {
    'patient': '/auth/patient',
    'doctor': '/auth/doctor',
    'admin': '/auth/admin'
  };
  return routes[role] || '/';
};

// Helper function to get role display name
export const getRoleDisplayName = (role) => {
  const roleNames = {
    'patient': 'Patient',
    'doctor': 'Doctor',
    'admin': 'Administrator'
  };
  return roleNames[role] || 'User';
};

// Helper function to get role color theme
export const getRoleTheme = (role) => {
  const themes = {
    'patient': {
      primary: 'purple',
      bg: 'from-purple-50 to-pink-50',
      border: 'border-purple-200',
      text: 'text-purple-600',
      button: 'bg-purple-600 hover:bg-purple-700'
    },
    'doctor': {
      primary: 'green',
      bg: 'from-green-50 to-emerald-50',
      border: 'border-green-200',
      text: 'text-green-600',
      button: 'bg-green-600 hover:bg-green-700'
    },
    'admin': {
      primary: 'blue',
      bg: 'from-blue-50 to-indigo-50',
      border: 'border-blue-200',
      text: 'text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700'
    }
  };
  return themes[role] || themes.patient;
};
