// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAB7YtjFBU3b2iWWjML2HQCyg98fwZ_9Mo",
  authDomain: "vetcare-8bf32.firebaseapp.com",
  projectId: "vetcare-8bf32",
  storageBucket: "vetcare-8bf32.appspot.com",
  messagingSenderId: "688144507799",
  appId: "1:688144507799:web:c1d31faa82f1c9444fdad2",
  measurementId: "G-KTLLYKKV1L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Check if analytics is available (it might not be in environments like server-side rendering)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Export app, firestore, and other services you initialize
export { app, analytics, db }; 