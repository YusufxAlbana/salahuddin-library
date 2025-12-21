import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
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
            navigate('/profile')
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
                            <span className="auth-icon">✨</span>
                            <h1>Buat Akun Baru</h1>
                            <p>Bergabung dengan Salahuddin Library</p>
                        </div>

                        {error && <div className="auth-error">{error}</div>}

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label>👤 Nama Lengkap</label>
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
                                    placeholder="Minimal 6 karakter"
                                    required
                                    disabled={loading}
                                />
                            </div>
                            <div className="form-group">
                                <label>🔒 Konfirmasi Password</label>
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
                                {loading ? '⏳ Memproses...' : 'Daftar Sekarang'}
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
