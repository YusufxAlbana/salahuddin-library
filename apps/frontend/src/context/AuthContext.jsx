import { createContext, useContext, useState, useEffect } from 'react'
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../config/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Get additional user data from Firestore
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
                const userData = userDoc.data()

                setUser({
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || userData?.name || 'User',
                    email: firebaseUser.email,
                    joinDate: userData?.joinDate || new Date().toLocaleDateString('id-ID'),
                    donatedBooks: userData?.donatedBooks || 0,
                    programsJoined: userData?.programsJoined || []
                })
            } else {
                setUser(null)
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const register = async (name, email, password) => {
        try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const firebaseUser = userCredential.user

            // Update display name
            await updateProfile(firebaseUser, { displayName: name })

            // Create user document in Firestore
            await setDoc(doc(db, 'users', firebaseUser.uid), {
                name: name,
                email: email,
                joinDate: new Date().toLocaleDateString('id-ID'),
                donatedBooks: 0,
                programsJoined: [],
                createdAt: serverTimestamp()
            })

            return { success: true }
        } catch (error) {
            console.error('Register error:', error)
            let message = 'Terjadi kesalahan saat mendaftar'

            if (error.code === 'auth/configuration-not-found') {
                message = 'Firebase Auth belum diaktifkan. Aktifkan Email/Password di Firebase Console.'
            } else if (error.code === 'auth/email-already-in-use') {
                message = 'Email sudah terdaftar'
            } else if (error.code === 'auth/weak-password') {
                message = 'Password terlalu lemah (min. 6 karakter)'
            } else if (error.code === 'auth/invalid-email') {
                message = 'Format email tidak valid'
            }

            return { success: false, error: message }
        }
    }

    const login = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password)
            return { success: true }
        } catch (error) {
            console.error('Login error:', error)
            let message = 'Email atau password salah'

            if (error.code === 'auth/configuration-not-found') {
                message = 'Firebase Auth belum diaktifkan. Aktifkan Email/Password di Firebase Console.'
            } else if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
                message = 'Email atau password salah'
            } else if (error.code === 'auth/wrong-password') {
                message = 'Password salah'
            } else if (error.code === 'auth/invalid-email') {
                message = 'Format email tidak valid'
            } else if (error.code === 'auth/too-many-requests') {
                message = 'Terlalu banyak percobaan. Coba lagi nanti'
            }

            return { success: false, error: message }
        }
    }

    const logout = async () => {
        try {
            await signOut(auth)
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const updateUserProfile = async (updates) => {
        if (!user) return

        try {
            await updateDoc(doc(db, 'users', user.id), updates)
            setUser(prev => ({ ...prev, ...updates }))
        } catch (error) {
            console.error('Update profile error:', error)
        }
    }

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        updateUserProfile
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
