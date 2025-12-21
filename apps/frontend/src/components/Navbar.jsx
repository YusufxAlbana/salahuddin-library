import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { user } = useAuth()
    const location = useLocation()

    // Check if we're on the home page
    const isHomePage = location.pathname === '/'

    const scrollToSection = (sectionId) => {
        if (!isHomePage) {
            // If not on home page, navigate to home first
            window.location.href = `/#${sectionId}`
            return
        }
        const element = document.getElementById(sectionId)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
            setIsMenuOpen(false)
        }
    }

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    <span className="logo-icon">📚</span>
                    <span className="logo-text">Salahuddin Library</span>
                </Link>
                <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
                <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                    <li><a onClick={() => scrollToSection('welcome')}>Beranda</a></li>
                    <li><a onClick={() => scrollToSection('filosofi')}>Filosofi</a></li>
                    <li><a onClick={() => scrollToSection('program')}>Program</a></li>
                    <li><Link to="/books">Buku</Link></li>
                    <li><a onClick={() => scrollToSection('donasi')}>Donasi</a></li>
                    <li><a onClick={() => scrollToSection('contact')}>Kontak</a></li>
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