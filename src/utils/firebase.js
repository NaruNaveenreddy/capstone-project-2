import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyCed-w24wELYrlmJaSrUXOT8g2AhecGa0w",
  authDomain: "capstone-project-e070e.firebaseapp.com",
  databaseURL: "https://capstone-project-e070e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "capstone-project-e070e",
  storageBucket: "capstone-project-e070e.firebasestorage.app",
  messagingSenderId: "941108461295",
  appId: "1:941108461295:web:15b19cac69cf6eff17a51a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);

export default app;
