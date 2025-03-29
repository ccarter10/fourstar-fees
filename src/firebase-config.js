// firebase-config.js
import { initializeApp } from 'firebase/app';
import { getAnalytics, setAnalyticsCollectionEnabled } from 'firebase/analytics';

// Replace these values with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCr3Vy5vlRUOZl1ng8M_9e20g1g4HjmQNc",
  authDomain: "fourstarfees.firebaseapp.com",
  projectId: "fourstarfees",
  storageBucket: "fourstarfees.firebasestorage.app",
  messagingSenderId: "857666205292",
  appId: "1:857666205292:web:2908a0e08d37a4caf80a49",
  measurementId: "G-0WEMNMMTX7"
};

// Initialize Firebase with imported functions
const firebaseApp = initializeApp(firebaseConfig);

// Initialize Analytics with imported function
const analyticsInstance = getAnalytics(firebaseApp);

// Enable analytics collection
// You can set this to false during development if needed
setAnalyticsCollectionEnabled(analyticsInstance, true);

// Export the initialized instances
export const app = firebaseApp;
export const analytics = analyticsInstance;