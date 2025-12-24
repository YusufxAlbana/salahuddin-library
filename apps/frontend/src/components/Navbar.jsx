import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // Smart navbar - hide on scroll down, show on scroll up
    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY

            // Always show navbar at the top of the page
            if (currentScrollY < 100) {
                setIsVisible(true)
            } else if (currentScrollY > lastScrollY) {
                // Scrolling down - hide navbar
                setIsVisible(false)
            } else {
                // Scrolling up - show navbar
                setIsVisible(true)
            }

            setLastScrollY(currentScrollY)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })

        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [lastScrollY])

    // Handle scroll to section (works from any page)
    const scrollToSection = (sectionId) => {
        setIsMenuOpen(false) // Close mobile menu

        if (location.pathname !== '/') {
            // If not on home page, navigate to home first, then scroll
            navigate('/')
            // Wait for navigation, then scroll
            setTimeout(() => {
                const element = document.getElementById(sectionId)
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
            }, 100)
        } else {
            // Already on home page, just scroll
            const element = document.getElementById(sectionId)
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
        }
    }

    return (
        <nav className={`navbar ${isVisible ? 'navbar-visible' : 'navbar-hidden'}`}>
            <div className="nav-container">
                <Link to="/" className="nav-logo">
                    <img src="/images/logo.svg" alt="Salahuddin Library Logo" className="logo-image" />
                    <span className="logo-text">Salahuddin Library</span>
                </Link>
                <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/books">Buku</Link></li>
                    <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About</a></li>
                    <li><a href="#donasi" onClick={(e) => { e.preventDefault(); scrollToSection('donasi'); }}>Donasi</a></li>
                    <li><Link to="/informasi">Informasi</Link></li>
                    <li className="nav-auth">
                        {user ? (
                            <Link to="/profile" className="nav-profile-btn">
                                <svg viewBox="0 0 212 212" width="40" height="40">
                                    <circle cx="106" cy="106" r="106" fill="#DFE5E7" />
                                    <path fill="#FFF" d="M106,57 C90.5,57 78,69.5 78,85 C78,100.5 90.5,113 106,113 C121.5,113 134,100.5 134,85 C134,69.5 121.5,57 106,57 Z" />
                                    <path fill="#FFF" d="M173,171 C173,140 143.1,115 106,115 C68.9,115 39,140 39,171 L39,171 Z" />
                                </svg>
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
