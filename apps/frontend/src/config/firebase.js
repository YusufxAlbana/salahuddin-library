import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdh86FbZV072vMUw4Ss9UR-eWmlxHqsPA",
  authDomain: "salahuddin-library.firebaseapp.com",
  databaseURL: "https://salahuddin-library-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "salahuddin-library",
  storageBucket: "salahuddin-library.firebasestorage.app",
  messagingSenderId: "611904361908",
  appId: "1:611904361908:web:0b70d5db6508433e388ee1",
  measurementId: "G-P3SMSP6K5B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

import { getStorage } from "firebase/storage";

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
