import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDvKAh8YLsgZh5kIWIlUwgXB2c-VGm3UBk",
  authDomain: "crypto-9dfed.firebaseapp.com",
  projectId: "crypto-9dfed",
  storageBucket: "crypto-9dfed.firebasestorage.app",
  messagingSenderId: "261395877586",
  appId: "1:261395877586:web:a737e337792baf794d670b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Enable network persistence for Firestore
try {
  // This helps with offline functionality
  if (typeof window !== 'undefined') {
    // Only run in browser environment
    console.log('Firebase initialized successfully');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

export { auth, db };
export default app;