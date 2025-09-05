# Healthcare Management System - Setup Guide

## Prerequisites

1. Node.js (v18 or higher)
2. Firebase project with Authentication and Realtime Database enabled

## Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password provider
3. Enable Realtime Database
4. Get your Firebase configuration from Project Settings > General > Your apps

## Environment Configuration

1. Copy the `.env` file and update it with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

## Initial Admin Setup

To create the first admin user, you'll need to:

1. Run the application
2. Use the signup form to create a patient account first
3. Manually update the user role in Firebase Realtime Database to 'admin'
4. Or use the Firebase Console to create an admin user directly

## Database Structure

The application uses Firebase Realtime Database with the following structure:

```
users/
  {userId}/
    role: 'patient' | 'doctor' | 'admin'
    firstName: string
    lastName: string
    email: string
    phone?: string
    dateOfBirth?: string
    createdAt: string
    isActive: boolean
    // Doctor specific
    specialization?: string
    licenseNumber?: string
    // Patient specific
    medicalHistory?: object

appointments/
  {appointmentId}/
    patientId: string
    doctorId: string
    date: string
    time: string
    status: 'scheduled' | 'completed' | 'cancelled'
    notes?: string
    createdAt: string
```

## User Roles

### Admin
- Manage all users (create, read, update, delete)
- System settings and maintenance
- View analytics and logs
- Manage appointments

### Doctor
- View and update patient records
- Manage own schedule
- View own appointments
- Create prescriptions
- Update appointment status

### Patient
- View own medical records
- Update own profile
- Book and cancel appointments
- Access AI health assistant
- View appointment history

## Features Implemented

✅ **Authentication & Routing**
- Firebase Authentication integration
- Role-based access control
- Protected routes
- Login/signup forms

✅ **Database Integration**
- Firebase Realtime Database
- User management
- Role-based data separation
- Appointment structure

✅ **UI Components**
- Modern UI with shadcn/ui components
- Responsive design
- Role-based dashboards
- Error handling

## Next Steps

The foundation is now ready for implementing:
- Appointment booking system
- Medical records management
- AI health assistant integration
- Real-time notifications
- Advanced admin features

## Security Notes

- All Firebase API keys are stored in environment variables
- Role-based access control is implemented
- Protected routes prevent unauthorized access
- User data is properly separated by roles

## Troubleshooting

1. **Firebase connection issues**: Check your environment variables
2. **Authentication errors**: Ensure Firebase Auth is enabled
3. **Database errors**: Verify Realtime Database rules
4. **Build errors**: Run `npm install` to ensure all dependencies are installed

