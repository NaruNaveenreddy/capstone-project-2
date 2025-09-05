import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { ref, get, set, push } from 'firebase/database';
import { auth, database } from '../utils/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up function for patients
  const signup = async (email, password, userData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Store user data in Firebase Realtime Database
      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, {
        ...userData,
        role: 'patient',
        createdAt: new Date().toISOString(),
        email: user.email,
        isActive: true
      });
      
      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  // Sign in function for all user types
  const login = async (email, password, expectedRole = null) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // If an expected role is provided, validate it
      if (expectedRole) {
        const userRole = await getUserRole(user.uid);
        if (userRole !== expectedRole) {
          // Sign out the user if role doesn't match
          await signOut(auth);
          const roleNames = {
            'patient': 'Patient',
            'doctor': 'Doctor', 
            'admin': 'Administrator'
          };
          throw new Error(`Access denied. This account is for ${roleNames[userRole]}s. Please use the ${roleNames[userRole]} login form.`);
        }
      }
      
      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth);
      setUserRole(null);
    } catch (error) {
      throw error;
    }
  };

  // Get user role from database
  const getUserRole = async (uid) => {
    try {
      const userRef = ref(database, `users/${uid}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const userData = snapshot.val();
        return userData.role;
      }
      return null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  };

  // Create admin user (for initial setup)
  const createAdmin = async (email, password, adminData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, {
        ...adminData,
        role: 'admin',
        createdAt: new Date().toISOString(),
        email: user.email
      });
      
      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  // Create doctor user (admin function)
  const createDoctor = async (email, password, doctorData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, {
        ...doctorData,
        role: 'doctor',
        createdAt: new Date().toISOString(),
        email: user.email,
        isActive: true
      });
      
      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        const role = await getUserRole(user.uid);
        setUserRole(role);
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    login,
    signup,
    logout,
    createAdmin,
    createDoctor,
    getUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

