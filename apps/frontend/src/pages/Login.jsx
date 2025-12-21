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
