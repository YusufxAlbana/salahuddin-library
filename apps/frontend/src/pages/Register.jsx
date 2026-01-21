import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../components/Notification'
import Navbar from '../components/Navbar'
import '../App.css'

function Register() {
    const [emailSent, setEmailSent] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const { user, register } = useAuth()
    const navigate = useNavigate()
    const { toast } = useNotification()
    const hasRedirected = useRef(false)

    // Redirect if already logged in
    useEffect(() => {
        if (user && !hasRedirected.current && !emailSent) {
            hasRedirected.current = true
            toast.info('Anda sudah memiliki akun! Mengarahkan ke halaman profil...')
            navigate('/profile', { replace: true })
        }
    }, [user, navigate, toast, emailSent])

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!name || !email || !password || !confirmPassword) {
            toast.error('Mohon lengkapi semua data pendaftaran')
            return
        }

        if (name.trim().split(' ').length < 2) {
            toast.error('Nama Lengkap harus terdiri dari minimal 2 kata (Nama Depan dan Belakang)')
            return
        }

        if (password !== confirmPassword) {
            toast.error('Password dan Konfirmasi Password tidak cocok')
            return
        }

        if (password.length < 6) {
            toast.error('Password harus memiliki minimal 6 karakter')
            return
        }

        setLoading(true)
        const result = await register(name, email, password)
        setLoading(false)

        if (result.success) {
            if (result.session) {
                // User logged in immediately (email verification disabled or auto-confirmed)
                toast.success('Registrasi berhasil! Selamat datang di Salahuddin Library.')
                navigate('/?showMemberOffer=true')
            } else {
                // User registered but session is null -> Email verification required
                setEmailSent(true)
                toast.success('Registrasi berhasil! Silakan cek email Anda untuk verifikasi.')
            }
        } else {
            // Translate common Supabase errors to Indonesian
            let errorMessage = result.error || 'Terjadi kesalahan pada server'

            if (errorMessage.toLowerCase().includes('invalid email') || errorMessage.toLowerCase().includes('is invalid')) {
                errorMessage = 'Format email tidak valid. Pastikan email Anda benar.'
            } else if (errorMessage.toLowerCase().includes('already registered')) {
                errorMessage = 'Email sudah terdaftar. Silakan gunakan email lain atau login.'
            } else if (errorMessage.toLowerCase().includes('password should be')) {
                errorMessage = 'Password minimal 6 karakter.'
            } else if (errorMessage.toLowerCase().includes('rate limit')) {
                errorMessage = 'Terlalu banyak percobaan. Silakan coba beberapa saat lagi.'
            }

            toast.error(`Gagal Mendaftar: ${errorMessage}`)
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

    // Success Email Sent State
    if (emailSent) {
        return (
            <div className="app">
                <Navbar />
                <div className="auth-page">
                    <div className="auth-container">
                        <div className="auth-card" style={{ textAlign: 'center' }}>
                            <div className="auth-header">
                                <div className="auth-logo" style={{ marginBottom: '1.5rem' }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                </div>
                                <h1>Verifikasi Email Anda</h1>
                                <p style={{ fontSize: '1.125rem', color: '#4b5563', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                                    Kami telah mengirimkan link verifikasi ke <strong>{email}</strong>.
                                    <br />
                                    Silakan cek kotak masuk atau folder spam Anda.
                                </p>
                                <div style={{ background: '#ecfdf5', padding: '1rem', borderRadius: '8px', border: '1px solid #d1fae5', marginBottom: '1.5rem' }}>
                                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#047857' }}>
                                        <strong>Penting:</strong> Anda perlu memverifikasi email sebelum dapat masuk.
                                    </p>
                                </div>
                                <Link to="/login" className="btn btn-primary btn-full" style={{ borderRadius: '12px', textDecoration: 'none', display: 'inline-block' }}>
                                    Kembali ke Halaman Login
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Don't render form if user is logged in
    if (user && !emailSent) {
        return (
            <div className="app">
                <Navbar />
                <div className="auth-page">
                    <div className="auth-container">
                        <div className="auth-card">
                            <div className="auth-header">
                                <h1>Anda Sudah Memiliki Akun</h1>
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
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="8.5" cy="7" r="4"></circle>
                                    <line x1="20" y1="8" x2="20" y2="14"></line>
                                    <line x1="23" y1="11" x2="17" y2="11"></line>
                                </svg>
                            </div>
                            <h1>Buat Akun Baru</h1>
                            <p>Bergabung dengan Salahuddin Library</p>
                        </div>



                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label>Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Nama lengkap Anda"
                                    required
                                    disabled={loading}
                                    style={inputStyle}
                                />
                            </div>
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
                                    placeholder="Minimal 6 karakter"
                                    required
                                    disabled={loading}
                                    style={inputStyle}
                                />
                            </div>
                            <div className="form-group">
                                <label>Konfirmasi Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Ulangi password"
                                    required
                                    disabled={loading}
                                    style={inputStyle}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ borderRadius: '12px' }}>
                                {loading ? 'Memproses...' : 'Daftar Sekarang'}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>Sudah punya akun? <Link to="/login">Masuk</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register
