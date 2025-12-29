import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../components/Notification'
import Navbar from '../components/Navbar'
import '../App.css'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { user, login } = useAuth()
    const navigate = useNavigate()
    const { toast } = useNotification()
    const hasRedirected = useRef(false)

    // Redirect if already logged in
    useEffect(() => {
        if (user && !hasRedirected.current) {
            hasRedirected.current = true
            toast.info('Anda sudah login! Mengarahkan ke halaman profil...')
            navigate('/profile', { replace: true })
        }
    }, [user, navigate, toast])

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
            navigate('/')
        } else {
            setError(result.error)
        }
    }

    const inputStyle = {
        width: '100%',
        padding: '0.875rem 1rem',
        border: '2px solid #ecfdf5',
        borderRadius: '12px',
        fontSize: '1rem',
        background: '#ecfdf5',
        outline: 'none',
        transition: 'all 0.3s ease'
    }

    // Don't render form if user is logged in
    if (user) {
        return (
            <div className="app">
                <Navbar />
                <div className="auth-page">
                    <div className="auth-container">
                        <div className="auth-card">
                            <div className="auth-header">
                                <h1>Anda Sudah Login</h1>
                                <p>Mengalihkan ke halaman profil...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="app">
            <Navbar />

            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-card">
                        <div className="auth-header">
                            <div className="auth-logo">
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                            <h1>Selamat Datang</h1>
                            <p>Masuk ke akun Anda</p>
                        </div>

                        {error && <div className="auth-error">{error}</div>}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="nama@email.com"
                                    required
                                    disabled={loading}
                                    style={inputStyle}
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan password"
                                    required
                                    disabled={loading}
                                    style={inputStyle}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ borderRadius: '12px' }}>
                                {loading ? 'Memproses...' : 'Masuk'}
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
