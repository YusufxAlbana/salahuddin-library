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

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden'
            document.documentElement.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
            document.documentElement.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
            document.documentElement.style.overflow = 'unset'
        }
    }, [isMenuOpen])

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
        <>
            {/* Overlay for mobile menu */}
            <div
                className={`mobile-menu-overlay ${isMenuOpen ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
            />

            <nav className={`navbar ${isVisible ? 'navbar-visible' : 'navbar-hidden'}`}>
                <div className="nav-container">
                    <Link to="/" className="nav-logo">
                        <img src="/images/logo.svg" alt="Salahuddin Library Logo" className="logo-image" />
                        <span className="logo-text">Salahuddin Library</span>
                    </Link>

                    {/* Hamburger Menu Button */}
                    <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
                        {isMenuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        )}
                    </button>

                    {/* Navigation Links */}
                    <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
                        <li><Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link></li>
                        <li><Link to="/books" onClick={() => setIsMenuOpen(false)}>Buku</Link></li>
                        <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection('about'); }}>About</a></li>
                        <li><a href="#donasi" onClick={(e) => { e.preventDefault(); scrollToSection('donasi'); }}>Donasi</a></li>
                        <li><Link to="/informasi" onClick={() => setIsMenuOpen(false)}>Informasi</Link></li>

                        {/* Mobile Auth Section - Always visible in mobile menu */}
                        <li className="nav-auth mobile-auth">
                            {user ? (
                                <Link to="/profile" className="nav-profile-btn" onClick={() => setIsMenuOpen(false)}>
                                    <svg viewBox="0 0 212 212" width="40" height="40">
                                        <circle cx="106" cy="106" r="106" fill="#DFE5E7" />
                                        <path fill="#FFF" d="M106,57 C90.5,57 78,69.5 78,85 C78,100.5 90.5,113 106,113 C121.5,113 134,100.5 134,85 C134,69.5 121.5,57 106,57 Z" />
                                        <path fill="#FFF" d="M173,171 C173,140 143.1,115 106,115 C68.9,115 39,140 39,171 L39,171 Z" />
                                    </svg>
                                    <span className="mobile-profile-text">Profil Saya</span>
                                </Link>
                            ) : (
                                <div className="nav-auth-buttons-mobile">
                                    <Link to="/login" className="nav-login-btn-mobile" onClick={() => setIsMenuOpen(false)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                                            <polyline points="10 17 15 12 10 7"></polyline>
                                            <line x1="15" y1="12" x2="3" y2="12"></line>
                                        </svg>
                                        Masuk
                                    </Link>
                                    <Link to="/register" className="nav-register-btn-mobile" onClick={() => setIsMenuOpen(false)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="8.5" cy="7" r="4"></circle>
                                            <line x1="20" y1="8" x2="20" y2="14"></line>
                                            <line x1="23" y1="11" x2="17" y2="11"></line>
                                        </svg>
                                        Daftar Sekarang
                                    </Link>
                                </div>
                            )}
                        </li>

                        {/* Desktop Auth Section */}
                        <li className="nav-auth desktop-auth">
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
        </>
    )
}

export default Navbar
