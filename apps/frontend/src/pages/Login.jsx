import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import '../App.css'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!email || !password) {
            setError('Mohon isi semua field')
            return
        }

        setLoading(true)
        const result = await login(email, password)
        setLoading(false)

        if (result.success) {
            // Check for admin role immediately after login success if possible, 
            // but relying on AuthContext to fetch profile might take a ms.
            // Best to redirect to a neutral place or check returned session? 
            // Actually, we can fetch profile here or let the effect in App/AuthContext handle it?
            // Safer to check role if attached to result or just rely on the App.jsx redirect?

            // Let's modify logic: if user is admin, go to /admin.
            // Since `login` in AuthContext doesn't return user role, we might need to fetch it or wait.
            // But wait, the App.jsx Effect will run on route change or auth state change.
            // If we navigate to '/', App.jsx catches it.
            // If we want to be explicit:

            // For now, default to profile, and let the Profile page or App page redirect if needed?
            // User requested "langsung ke dashboard admin".
            // Let's verify role here if we can.

            // Note: `login` function in AuthContext currently returns { success: true }.
            // We can't access `user` state immediately here because state updates are async.
            // However, we can check the session from supabase directly or modify `login` to return role.

            // Simplest Approach: Redirect to '/' (Home). App.jsx will catch 'admin' and redirect to '/admin'.
            // Redirect to '/profile' (Profile) -> Profile.jsx also needs to redirect admins.

            navigate('/')
        } else {
            setError(result.error)
        }
    }

    return (
        <div className="app">
            <Navbar />

            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-card">
                        <div className="auth-header">
                            <span className="auth-icon">👋</span>
                            <h1>Selamat Datang</h1>
                            <p>Masuk ke akun Anda</p>
                        </div>

                        {error && <div className="auth-error">{error}</div>}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label>📧 Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nama@email.com"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="form-group">
                                <label>🔒 Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan password"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                {loading ? '⏳ Memproses...' : 'Masuk'}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>Belum punya akun? <Link to="/register">Daftar Sekarang</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
