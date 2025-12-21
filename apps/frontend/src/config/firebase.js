import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getAnalytics } from "firebase/analytics"

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCdh86FbZV072vMUw4Ss9UR-eWmlxHqsPA",
  authDomain: "salahuddin-library.firebaseapp.com",
  projectId: "salahuddin-library",
  storageBucket: "salahuddin-library.firebasestorage.app",
  messagingSenderId: "611904361908",
  appId: "1:611904361908:web:0b70d5db6508433e388ee1",
  measurementId: "G-P3SMSP6K5B"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const analytics = getAnalytics(app)

export default app
