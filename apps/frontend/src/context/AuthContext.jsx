import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../config/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // Listen for auth state changes
    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                fetchUserProfile(session.user)
            } else {
                setUser(null)
                setLoading(false)
            }
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session) {
                fetchUserProfile(session.user)
            } else {
                setUser(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const fetchUserProfile = async (authUser) => {
        try {
            const { data: userData, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single()

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error)
            }

            setUser({
                id: authUser.id,
                email: authUser.email,
                name: userData?.name || authUser.user_metadata?.name || 'User',
                role: userData?.role || 'member',
                isAdmin: userData?.role === 'admin',
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

            // Fetch active loans separately or via join if relation exists. 
            // For now, let's fetch in Profile.jsx component to keep AuthContext lighter?
            // User requested "My Loans" in profile.
            // Let's stick to basic profile here. Extra data can be fetched in component.
        } catch (err) {
            console.error('Fetch profile catch:', err)
        } finally {
            setLoading(false)
        }
    }

    const register = async (name, email, password) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { name }
                }
            })

            if (error) throw error

            if (data.user) {
                // Wait a moment for session to be fully established
                await new Promise(resolve => setTimeout(resolve, 500))

                // Try to insert user profile into 'users' table using UPSERT
                console.log('Attempting to insert user profile for:', data.user.id)
                const { error: dbError } = await supabase
                    .from('users')
                    .upsert([
                        {
                            id: data.user.id,
                            name: name,
                            email: email,
                            role: 'member',
                            join_date: new Date().toISOString(),
                            donated_books: 0,
                            programs_joined: []
                        }
                    ], { onConflict: 'id' })

                if (dbError) {
                    console.error('DB Insert Error Details:', JSON.stringify(dbError, null, 2))
                    // Don't throw, auth was successful. Profile can be created later.
                    // But return a warning
                    return { success: true, warning: `Auth OK, Profil gagal tersimpan: ${dbError.message}` }
                }
                console.log('User profile inserted successfully!')
            }

            return { success: true }
        } catch (error) {
            console.error('Register error:', error)
            return { success: false, error: error.message }
        }
    }

    const login = async (email, password) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) {
                if (error.message.includes('Invalid login')) {
                    return { success: false, error: 'Email atau password salah' }
                }
                throw error
            }

            return { success: true }
        } catch (error) {
            console.error('Login error:', error)
            return { success: false, error: error.message }
        }
    }

    const logout = async () => {
        try {
            await supabase.auth.signOut()
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const updateUserProfile = async (updates) => {
        if (!user) return

        try {
            // Map camelCase to snake_case if needed, assuming simple update for now
            const { error } = await supabase
                .from('users')
                .update(updates)
                .eq('id', user.id)

            if (!error) {
                setUser(prev => ({ ...prev, ...updates }))
            }
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
