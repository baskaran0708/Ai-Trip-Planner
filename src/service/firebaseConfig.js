// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDK_SCWiL1J3OfGFSU84G5FOrCiBiligFM",
  authDomain: "ai-trip-4b9c4.firebaseapp.com",
  projectId: "ai-trip-4b9c4",
  storageBucket: "ai-trip-4b9c4.appspot.com",
  messagingSenderId: "7797624159",
  appId: "1:7797624159:web:7f764340ed8e5afeaa7aea",
  measurementId: "G-0CS33V77NP"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Analytics for production only
let analyticsInstance = null;
try {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    analyticsInstance = getAnalytics(app);
  }
} catch (error) {
  console.error('Analytics initialization error:', error);
}

export const analytics = analyticsInstance;

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Authentication
export const auth = getAuth(app);

// Set up cookie handling options for auth
auth.settings = {
  appVerificationDisabledForTesting: false // False in production, could be true for local dev
};

// If running locally with emulators
// Uncomment this if using Firebase emulators
// if (window.location.hostname === "localhost") {
//   connectAuthEmulator(auth, "http://localhost:9099");
//   connectFirestoreEmulator(db, "localhost", 8080);
// }

 

