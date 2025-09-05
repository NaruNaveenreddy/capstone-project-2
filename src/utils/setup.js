import { createAdmin } from '../context/AuthContext';

// This function can be called to create the first admin user
// It should be used only once during initial setup
export const createInitialAdmin = async () => {
  try {
    const adminData = {
      firstName: 'System',
      lastName: 'Administrator',
      role: 'admin',
      isActive: true
    };
    
    // You would call this with actual email and password
    // const result = await createAdmin('admin@healthcare.com', 'admin123', adminData);
    // console.log('Admin created successfully:', result);
    
    console.log('Admin creation function ready. Call with actual credentials.');
  } catch (error) {
    console.error('Error creating admin:', error);
  }
};

// Database structure documentation
export const DATABASE_STRUCTURE = {
  users: {
    description: 'User accounts with role-based access',
    structure: {
      userId: {
        role: 'patient | doctor | admin',
        firstName: 'string',
        lastName: 'string',
        email: 'string',
        phone: 'string (optional)',
        dateOfBirth: 'string (optional)',
        createdAt: 'ISO string',
        isActive: 'boolean',
        // Doctor specific
        specialization: 'string (optional)',
        licenseNumber: 'string (optional)',
        // Patient specific
        medicalHistory: 'object (optional)'
      }
    }
  },
  appointments: {
    description: 'Appointment scheduling and management',
    structure: {
      appointmentId: {
        patientId: 'string',
        doctorId: 'string',
        date: 'string',
        time: 'string',
        status: 'scheduled | completed | cancelled',
        notes: 'string (optional)',
        createdAt: 'ISO string'
      }
    }
  }
};

// Role-based permissions
export const ROLE_PERMISSIONS = {
  admin: [
    'create_users',
    'read_all_users',
    'update_users',
    'delete_users',
    'manage_system_settings',
    'view_analytics',
    'manage_appointments'
  ],
  doctor: [
    'read_patient_records',
    'update_patient_records',
    'manage_own_schedule',
    'view_own_appointments',
    'create_prescriptions',
    'update_appointment_status'
  ],
  patient: [
    'read_own_records',
    'update_own_profile',
    'book_appointments',
    'cancel_own_appointments',
    'view_own_appointments',
    'access_ai_assistant'
  ]
};

