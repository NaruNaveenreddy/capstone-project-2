import { ref, get, set, push, update, remove, onValue, off } from 'firebase/database';
import { database } from './firebase';

// Database structure:
// users/
//   {userId}/
//     role: 'patient' | 'doctor' | 'admin'
//     firstName: string
//     lastName: string
//     email: string
//     phone?: string
//     dateOfBirth?: string
//     createdAt: string
//     isActive: boolean
//     // Doctor specific
//     specialization?: string
//     licenseNumber?: string
//     // Patient specific
//     address?: string
//     emergencyContact?: string
//     medicalHistory?: object
//     appointments?: object

// appointments/
//   {appointmentId}/
//     patientId: string
//     doctorId: string
//     date: string
//     time: string
//     status: 'scheduled' | 'completed' | 'cancelled'
//     notes?: string
//     createdAt: string

// User Management Functions
export const createUser = async (userId, userData) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    await set(userRef, {
      ...userData,
      createdAt: new Date().toISOString(),
      isActive: true
    });
    return true;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUser = async (userId) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const updateUser = async (userId, updates) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    await update(userRef, updates);
    return true;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const getAllUsers = async (role = null) => {
  try {
    const usersRef = ref(database, 'users');
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const users = snapshot.val();
      const userList = Object.entries(users).map(([id, data]) => ({
        id,
        ...data
      }));
      
      if (role) {
        return userList.filter(user => user.role === role);
      }
      return userList;
    }
    return [];
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
};

// Appointment Management Functions
export const createAppointment = async (appointmentData) => {
  try {
    const appointmentsRef = ref(database, 'appointments');
    const newAppointmentRef = push(appointmentsRef);
    await set(newAppointmentRef, {
      ...appointmentData,
      createdAt: new Date().toISOString(),
      status: 'scheduled'
    });
    return newAppointmentRef.key;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

export const getAppointments = async (userId, role) => {
  try {
    const appointmentsRef = ref(database, 'appointments');
    const snapshot = await get(appointmentsRef);
    if (snapshot.exists()) {
      const appointments = snapshot.val();
      const appointmentList = Object.entries(appointments).map(([id, data]) => ({
        id,
        ...data
      }));
      
      if (role === 'patient') {
        return appointmentList.filter(appointment => appointment.patientId === userId);
      } else if (role === 'doctor') {
        return appointmentList.filter(appointment => appointment.doctorId === userId);
      }
      return appointmentList;
    }
    return [];
  } catch (error) {
    console.error('Error getting appointments:', error);
    throw error;
  }
};

export const updateAppointment = async (appointmentId, updates) => {
  try {
    const appointmentRef = ref(database, `appointments/${appointmentId}`);
    await update(appointmentRef, updates);
    return true;
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};

export const cancelAppointment = async (appointmentId) => {
  try {
    const appointmentRef = ref(database, `appointments/${appointmentId}`);
    await update(appointmentRef, { status: 'cancelled' });
    return true;
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
};

// Real-time listeners
export const listenToUserAppointments = (userId, role, callback) => {
  const appointmentsRef = ref(database, 'appointments');
  
  const listener = onValue(appointmentsRef, (snapshot) => {
    if (snapshot.exists()) {
      const appointments = snapshot.val();
      const appointmentList = Object.entries(appointments).map(([id, data]) => ({
        id,
        ...data
      }));
      
      let filteredAppointments = appointmentList;
      if (role === 'patient') {
        filteredAppointments = appointmentList.filter(appointment => appointment.patientId === userId);
      } else if (role === 'doctor') {
        filteredAppointments = appointmentList.filter(appointment => appointment.doctorId === userId);
      }
      
      callback(filteredAppointments);
    } else {
      callback([]);
    }
  });
  
  return () => off(appointmentsRef, 'value', listener);
};

// Medical Records Functions
export const updateMedicalHistory = async (patientId, medicalData) => {
  try {
    const medicalRef = ref(database, `users/${patientId}/medicalHistory`);
    await set(medicalRef, medicalData);
    return true;
  } catch (error) {
    console.error('Error updating medical history:', error);
    throw error;
  }
};

export const getMedicalHistory = async (patientId) => {
  try {
    const medicalRef = ref(database, `users/${patientId}/medicalHistory`);
    const snapshot = await get(medicalRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error getting medical history:', error);
    throw error;
  }
};

// Admin Functions
export const deactivateUser = async (userId) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    await update(userRef, { isActive: false });
    return true;
  } catch (error) {
    console.error('Error deactivating user:', error);
    throw error;
  }
};

export const activateUser = async (userId) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    await update(userRef, { isActive: true });
    return true;
  } catch (error) {
    console.error('Error activating user:', error);
    throw error;
  }
};

// Prescription Management Functions
// prescriptions/
//   {prescriptionId}/
//     patientId: string
//     doctorId: string
//     doctorName?: string
//     medicationName: string
//     dosage: string
//     frequency: string
//     duration?: string
//     instructions?: string
//     quantity?: string
//     refills?: string | number
//     prescribedDate: string (YYYY-MM-DD)
//     notes?: string
//     status: 'active' | 'completed' | 'cancelled'
//     createdAt: ISO string

export const createPrescription = async (prescriptionData) => {
  try {
    const prescriptionsRef = ref(database, 'prescriptions');
    const newPrescriptionRef = push(prescriptionsRef);
    await set(newPrescriptionRef, {
      ...prescriptionData,
      status: prescriptionData.status || 'active',
      createdAt: new Date().toISOString(),
    });
    return newPrescriptionRef.key;
  } catch (error) {
    console.error('Error creating prescription:', error);
    throw error;
  }
};

export const getPrescriptionsByPatient = async (patientId) => {
  try {
    const prescriptionsRef = ref(database, 'prescriptions');
    const snapshot = await get(prescriptionsRef);
    if (snapshot.exists()) {
      const prescriptions = snapshot.val();
      return Object.entries(prescriptions)
        .map(([id, data]) => ({ id, ...data }))
        .filter((p) => p.patientId === patientId)
        .sort((a, b) => new Date(b.prescribedDate || b.createdAt) - new Date(a.prescribedDate || a.createdAt));
    }
    return [];
  } catch (error) {
    console.error('Error getting prescriptions by patient:', error);
    throw error;
  }
};

export const getPrescriptionsByDoctor = async (doctorId) => {
  try {
    const prescriptionsRef = ref(database, 'prescriptions');
    const snapshot = await get(prescriptionsRef);
    if (snapshot.exists()) {
      const prescriptions = snapshot.val();
      return Object.entries(prescriptions)
        .map(([id, data]) => ({ id, ...data }))
        .filter((p) => p.doctorId === doctorId)
        .sort((a, b) => new Date(b.prescribedDate || b.createdAt) - new Date(a.prescribedDate || a.createdAt));
    }
    return [];
  } catch (error) {
    console.error('Error getting prescriptions by doctor:', error);
    throw error;
  }
};

export const updatePrescription = async (prescriptionId, updates) => {
  try {
    const prescriptionRef = ref(database, `prescriptions/${prescriptionId}`);
    await update(prescriptionRef, updates);
    return true;
  } catch (error) {
    console.error('Error updating prescription:', error);
    throw error;
  }
};

export const deletePrescription = async (prescriptionId) => {
  try {
    const prescriptionRef = ref(database, `prescriptions/${prescriptionId}`);
    await remove(prescriptionRef);
    return true;
  } catch (error) {
    console.error('Error deleting prescription:', error);
    throw error;
  }
};

// Patient Medical History Functions for Doctor Access
// patientMedicalHistory/
//   {patientId}/
//     conditions: array
//     medications: array
//     allergies: array
//     surgeries: array
//     immunizations: array
//     labResults: array
//     lastUpdated: ISO string

export const savePatientMedicalHistory = async (patientId, medicalData) => {
  try {
    const medicalRef = ref(database, `patientMedicalHistory/${patientId}`);
    await set(medicalRef, {
      ...medicalData,
      lastUpdated: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error saving patient medical history:', error);
    throw error;
  }
};

export const getPatientMedicalHistory = async (patientId) => {
  try {
    const medicalRef = ref(database, `patientMedicalHistory/${patientId}`);
    const snapshot = await get(medicalRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return null;
  } catch (error) {
    console.error('Error getting patient medical history:', error);
    throw error;
  }
};

export const getAllPatientsMedicalHistory = async () => {
  try {
    const medicalRef = ref(database, 'patientMedicalHistory');
    const snapshot = await get(medicalRef);
    if (snapshot.exists()) {
      const medicalHistories = snapshot.val();
      return Object.entries(medicalHistories).map(([patientId, data]) => ({
        patientId,
        ...data
      }));
    }
    return [];
  } catch (error) {
    console.error('Error getting all patients medical history:', error);
    throw error;
  }
};

export const getPatientsByCondition = async (conditionName) => {
  try {
    const medicalRef = ref(database, 'patientMedicalHistory');
    const snapshot = await get(medicalRef);
    if (snapshot.exists()) {
      const medicalHistories = snapshot.val();
      const patientsWithCondition = [];
      
      Object.entries(medicalHistories).forEach(([patientId, data]) => {
        if (data.conditions && Array.isArray(data.conditions)) {
          const hasCondition = data.conditions.some(condition => 
            condition.name && condition.name.toLowerCase().includes(conditionName.toLowerCase())
          );
          if (hasCondition) {
            patientsWithCondition.push({
              patientId,
              ...data
            });
          }
        }
      });
      
      return patientsWithCondition;
    }
    return [];
  } catch (error) {
    console.error('Error getting patients by condition:', error);
    throw error;
  }
};

export const getPatientsByMedication = async (medicationName) => {
  try {
    const medicalRef = ref(database, 'patientMedicalHistory');
    const snapshot = await get(medicalRef);
    if (snapshot.exists()) {
      const medicalHistories = snapshot.val();
      const patientsWithMedication = [];
      
      Object.entries(medicalHistories).forEach(([patientId, data]) => {
        if (data.medications && Array.isArray(data.medications)) {
          const hasMedication = data.medications.some(medication => 
            medication.name && medication.name.toLowerCase().includes(medicationName.toLowerCase())
          );
          if (hasMedication) {
            patientsWithMedication.push({
              patientId,
              ...data
            });
          }
        }
      });
      
      return patientsWithMedication;
    }
    return [];
  } catch (error) {
    console.error('Error getting patients by medication:', error);
    throw error;
  }
};

