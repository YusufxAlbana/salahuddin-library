import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../components/Notification'
import Navbar from '../components/Navbar'
import '../App.css'

function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { register } = useAuth()
    const navigate = useNavigate()
    const { toast } = useNotification()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!name || !email || !password || !confirmPassword) {
            setError('Mohon isi semua field')
            return
        }

        if (password !== confirmPassword) {
            setError('Password tidak cocok')
            return
        }

        if (password.length < 6) {
            setError('Password minimal 6 karakter')
            return
        }

        setLoading(true)
        const result = await register(name, email, password)
        setLoading(false)

        if (result.success) {
            toast.success('Registrasi berhasil! Selamat datang di Salahuddin Library.')
            // Navigate to home with member offer flag
            navigate('/?showMemberOffer=true')
        } else {
            setError(`Gagal Mendaftar: ${result.error || 'Server tidak merespon'}`)
        }
    }

    return (
        <div className="app">
            <Navbar />

            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-card">
                        <div className="auth-header">
                            <div style={{ width: '64px', height: '64px', margin: '0 auto 1rem', background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="8.5" cy="7" r="4"></circle>
                                    <line x1="20" y1="8" x2="20" y2="14"></line>
                                    <line x1="23" y1="11" x2="17" y2="11"></line>
                                </svg>
                            </div>
                            <h1>Buat Akun Baru</h1>
                            <p>Bergabung dengan Salahuddin Library</p>
                        </div>

                        {error && <div className="auth-error">{error}</div>}

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
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
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
