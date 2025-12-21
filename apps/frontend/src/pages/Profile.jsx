import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import '../App.css'

function Profile() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    if (!user) {
        return (
            <div className="app">
                <Navbar />
                <div className="auth-page">
                    <div className="auth-container">
                        <div className="auth-card">
                            <div className="auth-header">
                                <span className="auth-icon">🔐</span>
                                <h1>Belum Login</h1>
                                <p>Silakan login terlebih dahulu untuk melihat profil</p>
                            </div>
                            <div className="auth-buttons">
                                <Link to="/login" className="btn btn-primary btn-full">
                                    Masuk
                                </Link>
                                <Link to="/register" className="btn btn-secondary-outline btn-full">
                                    Daftar Baru
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    return (
        <div className="app">
            <Navbar />

            <div className="profile-page">
                <div className="profile-container">
                    {/* Profile Header */}
                    <div className="profile-header">
                        <div className="profile-avatar">
                            <span>{user.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="profile-info">
                            <h1>👋 Halo, {user.name}!</h1>
                            <p className="profile-email">📧 {user.email}</p>
                            <p className="profile-join">📅 Bergabung sejak {user.joinDate}</p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="profile-stats">
                        <div className="profile-stat-card">
                            <span className="stat-icon">📚</span>
                            <div>
                                <span className="stat-value">{user.donatedBooks || 0}</span>
                                <span className="stat-label">Buku Didonasikan</span>
                            </div>
                        </div>
                        <div className="profile-stat-card">
                            <span className="stat-icon">📖</span>
                            <div>
                                <span className="stat-value">{user.programsJoined?.length || 0}</span>
                                <span className="stat-label">Program Diikuti</span>
                            </div>
                        </div>
                        <div className="profile-stat-card status-card">
                            <span className="stat-icon">⭐</span>
                            <div>
                                <span className="stat-value status-badge">Member Aktif</span>
                                <span className="stat-label">Status Keanggotaan</span>
                            </div>
                        </div>
                    </div>

                    {/* Activity Section */}
                    <div className="profile-section">
                        <h2>📋 Aktivitas Terbaru</h2>
                        <div className="activity-list">
                            <div className="activity-item success">
                                <span className="activity-icon">✅</span>
                                <div className="activity-content">
                                    <p>Akun berhasil dibuat</p>
                                    <span className="activity-time">{user.joinDate}</span>
                                </div>
                            </div>
                            <div className="activity-item info">
                                <span className="activity-icon">💡</span>
                                <div className="activity-content">
                                    <p>Mulai donasikan buku pertamamu!</p>
                                    <span className="activity-time">Tunggu apa lagi?</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="profile-section">
                        <h2>⚡ Aksi Cepat</h2>
                        <div className="quick-actions">
                            <Link to="/#donasi" className="action-card">
                                <span>📦</span>
                                <p>Donasi Buku</p>
                            </Link>
                            <Link to="/#program" className="action-card">
                                <span>🎓</span>
                                <p>Lihat Program</p>
                            </Link>
                            <Link to="/#contact" className="action-card">
                                <span>💬</span>
                                <p>Hubungi Kami</p>
                            </Link>
                        </div>
                    </div>

                    {/* Account Section */}
                    <div className="profile-section account-section">
                        <h2>⚙️ Pengaturan Akun</h2>
                        <div className="account-info">
                            <div className="account-row">
                                <span className="account-label">Email</span>
                                <span className="account-value">{user.email}</span>
                            </div>
                            <div className="account-row">
                                <span className="account-label">ID Member</span>
                                <span className="account-value">{user.id?.slice(0, 8)}...</span>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="btn btn-logout">
                            🚪 Keluar dari Akun
                        </button>
                    </div>
                </div>
            </div>

            <footer className="footer">
                <div className="footer-content">
                    <p className="footer-copyright">
                        © 2024 Salahuddin Library. Dibuat dengan ❤️ untuk literasi Indonesia.
                    </p>
                </div>
            </footer>
        </div>
    )
}

export default Profile
