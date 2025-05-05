// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDK_SCWiL1J3OfGFSU84G5FOrCiBiligFM",
  authDomain: "ai-trip-4b9c4.firebaseapp.com",
  projectId: "ai-trip-4b9c4",
  storageBucket: "ai-trip-4b9c4.firebasestorage.app",
  messagingSenderId: "7797624159",
  appId: "1:7797624159:web:7f764340ed8e5afeaa7aea",
  measurementId: "G-0CS33V77NP"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

 

