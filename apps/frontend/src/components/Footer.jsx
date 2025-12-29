import { Link, useNavigate, useLocation } from 'react-router-dom'
import '../App.css'

function Footer() {
    const whatsappNumber = '081269667566'
    const whatsappLink = `https://wa.me/62${whatsappNumber.slice(1)}`
    const navigate = useNavigate()
    const location = useLocation()

    const scrollToFeedback = (e) => {
        e.preventDefault()
        if (location.pathname !== '/') {
            navigate('/')
            setTimeout(() => {
                const el = document.getElementById('feedback')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
            }, 100)
        } else {
            const el = document.getElementById('feedback')
            if (el) el.scrollIntoView({ behavior: 'smooth' })
        }
    }

    return (
        <footer className="footer-section">
            <div className="footer-container">
                {/* Logo & About */}
                <div className="footer-col">
                    <div className="footer-logo">
                        <img src="/images/logo.svg" alt="Salahuddin Library Logo" className="logo-image" />
                        <span>Salahuddin Library</span>
                    </div>
                    <p className="footer-about">
                        Pusat literasi untuk membangun generasi cerdas dan kritis melalui budaya membaca.
                    </p>
                </div>

                {/* Kontak */}
                <div className="footer-col">
                    <h4 className="footer-heading">Kontak Kami</h4>
                    <ul className="footer-links">
                        <li>
                            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="footer-contact-link">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                <span>{whatsappNumber}</span>
                            </a>
                        </li>
                        <li>
                            <a href="mailto:shalahuddinlibrary@gmail.com" className="footer-contact-link">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                <span>shalahuddinlibrary@gmail.com</span>
                            </a>
                        </li>
                        <li>
                            <a href="#feedback" onClick={scrollToFeedback} className="footer-contact-link">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                <span>Kirim Feedback</span>
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Alamat */}
                <div className="footer-col">
                    <h4 className="footer-heading">Alamat</h4>
                    <div className="footer-address">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <div>
                            <p><strong>Rumah YAAI</strong></p>
                            <p>(Yayasan Alfata Aceh Indonesia)</p>
                            <p>Belakang Mesjid As Shadaqah</p>
                            <p>Jl. Memori Lr. Setia, Lam Lagang</p>
                            <p>Kec. Banda Raya, Kota Banda Aceh</p>
                            <p>Aceh 23122, Indonesia</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="footer-bottom">
                <div className="footer-bottom-content">
                    <h3 className="footer-brand">Salahuddin Library</h3>
                    <p className="footer-copyright">
                        © 2024 Salahuddin Library. Untuk literasi Indonesia.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
