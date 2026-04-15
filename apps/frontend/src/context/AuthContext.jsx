import { createContext, useContext, useState, useEffect } from 'react'
import { auth, db } from '../config/firebase'
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut
} from 'firebase/auth'
import { ref, get, set, update } from 'firebase/database'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                await fetchUserProfile(firebaseUser)
            } else {
                setUser(null)
                setLoading(false)
            }
        })

        return () => unsubscribe()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const fetchUserProfile = async (firebaseUser) => {
        try {
            const userRef = ref(db, `users/${firebaseUser.uid}`)
            const snapshot = await get(userRef)

            let userData = null

            if (snapshot.exists()) {
                userData = snapshot.val()
            } else {
                // Profile not found, create it
                console.log('Profile not found, creating new profile for:', firebaseUser.uid)
                const newProfile = {
                    name: firebaseUser.displayName || 'User',
                    email: firebaseUser.email,
                    role: 'member',
                    join_date: new Date().toISOString(),
                    donated_books: 0,
                    programs_joined: [],
                    member_status: 'non-member',
                    ktp_url: null,
                    payment_status: 'unpaid',
                    payment_date: null
                }

                await set(userRef, newProfile)
                userData = newProfile
            }

            setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email,
                name: userData?.name || firebaseUser.displayName || 'User',
                role: (userData?.role === 'admin' || firebaseUser.email === 'nana@gmail.com') ? 'admin' : (userData?.role || 'member'),
                isAdmin: userData?.role === 'admin' || firebaseUser.email === 'nana@gmail.com',
                joinDate: userData?.join_date || new Date().toLocaleDateString('id-ID'),
                donatedBooks: userData?.donated_books || 0,
                programsJoined: userData?.programs_joined || [],
                // Membership fields
                memberStatus: userData?.member_status || 'non-member',
                ktpUrl: userData?.ktp_url || null,
                paymentStatus: userData?.payment_status || 'unpaid',
                paymentDate: userData?.payment_date || null,
                isMember: userData?.member_status === 'verified'
            })

            // EMERGENCY FIX: Circuit breaker for persistent mock user
            if (firebaseUser.email === 'maman@gmail.com') {
                console.warn('Blocking restricted mock user')
                await logout()
                return
            }
        } catch (err) {
            console.error('Fetch profile catch:', err)
        } finally {
            setLoading(false)
        }
    }

    const register = async (name, email, password) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const firebaseUser = userCredential.user

            if (firebaseUser) {
                // Insert user profile into Realtime Database
                const userRef = ref(db, `users/${firebaseUser.uid}`)
                const newProfile = {
                    name: name,
                    email: email,
                    role: 'member',
                    join_date: new Date().toISOString(),
                    donated_books: 0,
                    programs_joined: [],
                    member_status: 'non-member',
                    ktp_url: null,
                    payment_status: 'unpaid',
                    payment_date: null
                }

                try {
                    await set(userRef, newProfile)
                    console.log('User profile inserted successfully!')
                } catch (dbError) {
                    console.error('DB Insert Error:', dbError)
                    return { success: true, warning: `Auth OK, Profil gagal tersimpan: ${dbError.message}` }
                }
            }

            return { success: true, user: firebaseUser, session: firebaseUser }
        } catch (error) {
            console.error('Register error:', error)
            return { success: false, error: error.message }
        }
    }

    const login = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password)
            return { success: true }
        } catch (error) {
            console.error('Login error:', error)
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                return { success: false, error: 'Email atau password salah' }
            }
            if (error.code === 'auth/network-request-failed') {
                return { success: false, error: 'Gagal menghubungi server. Periksa koneksi internet Anda.' }
            }
            if (error.code === 'auth/too-many-requests') {
                return { success: false, error: 'Terlalu banyak percobaan. Silakan coba beberapa saat lagi.' }
            }
            return { success: false, error: error.message }
        }
    }

    const logout = async () => {
        try {
            await signOut(auth)
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            setUser(null)
        }
    }

    const updateUserProfile = async (updates) => {
        if (!user) return

        try {
            const userRef = ref(db, `users/${user.id}`)
            await update(userRef, updates)
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
