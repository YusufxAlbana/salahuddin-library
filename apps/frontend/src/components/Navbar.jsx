import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { user } = useAuth()

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    <img src="/images/logo.svg" alt="Salahuddin Library Logo" className="logo-image" />
                    <span className="logo-text">Salahuddin Library</span>
                </Link>
                <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                    <li><Link to="/">Beranda</Link></li>
                    <li><Link to="/books">Buku</Link></li>
                    <li className="nav-auth">
                        {user ? (
                            <Link to="/profile" className="nav-profile-btn">
                                <span className="nav-avatar">{user.name.charAt(0)}</span>
                                {user.name.split(' ')[0]}
                            </Link>
                        ) : (
                            <div className="nav-auth-buttons">
                                <Link to="/login" className="nav-login-btn">Masuk</Link>
                                <Link to="/register" className="nav-register-btn">Daftar</Link>
                            </div>
                        )}
                    </li>
                </ul>
            </div>
        </nav>
    )
}

export default Navbar