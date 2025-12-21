import { Link } from 'react-router-dom'
import '../App.css'

function Footer() {
    return (
        <section className="contact-section" style={{ borderTop: 'none', padding: '0', background: 'var(--dark)' }}>
            <div className="section-container" style={{ paddingTop: '0' }}>
                {/* Only the footer content part */}
                <div className="footer-separator"></div>
                <div className="footer-content">
                    <div className="footer-logo">
                        <img src="/images/logo.svg" alt="Salahuddin Library Logo" className="logo-image" />
                        <span>Salahuddin Library</span>
                    </div>
                    <div className="footer-social">
                        <a href="#" className="social-link" aria-label="Facebook">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                        </a>
                        <a href="#" className="social-link" aria-label="Instagram">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        </a>
                        <a href="#" className="social-link" aria-label="Twitter">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-12.7 12.5S.2 11 .7 9c3.8-4 6-4 6-4.4C6.2 3.4 5 2 5 2c4.3.4 5.5 1.4 6 2l1.5-1.5-.5-1 4.5 1.5L22 4z"></path></svg>
                        </a>
                        <a href="#" className="social-link" aria-label="YouTube">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>
                        </a>
                    </div>
                    <p className="footer-copyright">
                        © 2024 Salahuddin Library. Dibuat dengan ❤️ untuk literasi Indonesia.
                    </p>
                </div>
            </div>
        </section>
    )
}

export default Footer
