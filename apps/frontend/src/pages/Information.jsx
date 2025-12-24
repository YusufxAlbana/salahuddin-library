import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../App.css'

function Information() {
    return (
        <div className="app">
            <Navbar />

            {/* Hero Section */}
            <section className="info-hero">
                <div className="info-hero-content">
                    <h1>Informasi & Peraturan</h1>
                    <p>Panduan lengkap untuk menjadi anggota dan menggunakan layanan Salahuddin Library</p>
                </div>
            </section>

            {/* Main Content */}
            <section className="info-section">
                <div className="section-container">

                    {/* Cara Kerja */}
                    <div className="info-card">
                        <div className="info-card-header">
                            <span className="info-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                            </span>
                            <h2>Cara Kerja Perpustakaan</h2>
                        </div>
                        <div className="info-steps">
                            <div className="info-step">
                                <div className="step-number">1</div>
                                <div className="step-content">
                                    <h3>Daftar Menjadi Anggota</h3>
                                    <p>Daftarkan diri Anda secara <strong>online</strong> melalui website atau <strong>offline</strong> dengan datang langsung ke perpustakaan. Isi formulir pendaftaran dengan data diri yang lengkap.</p>
                                </div>
                            </div>
                            <div className="info-step">
                                <div className="step-number">2</div>
                                <div className="step-content">
                                    <h3>Upload KTP & Verifikasi</h3>
                                    <p>Unggah foto KTP Anda untuk verifikasi. Admin akan memeriksa data Anda dalam waktu 1x24 jam.</p>
                                </div>
                            </div>
                            <div className="info-step">
                                <div className="step-number">3</div>
                                <div className="step-content">
                                    <h3>Pembayaran Kartu Anggota</h3>
                                    <p>Setelah diverifikasi, lakukan pembayaran untuk kartu anggota. Kartu ini <strong>berlaku seumur hidup</strong>!</p>
                                </div>
                            </div>
                            <div className="info-step">
                                <div className="step-number">4</div>
                                <div className="step-content">
                                    <h3>Mulai Meminjam Buku</h3>
                                    <p>Dengan kartu anggota, Anda bisa meminjam buku dari koleksi kami. Kunjungi perpustakaan, pilih buku, dan ajukan peminjaman.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Peraturan */}
                    <div className="info-card rules-card">
                        <div className="info-card-header">
                            <span className="info-icon rules">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                            </span>
                            <h2>Peraturan Perpustakaan</h2>
                        </div>
                        <div className="rules-list">
                            <div className="rule-item">
                                <span className="rule-number">1</span>
                                <div className="rule-content">
                                    <h4>Keanggotaan</h4>
                                    <p>Mendaftarkan diri menjadi anggota Salahuddin Library dengan mengisi form dan melakukan pembayaran untuk kartu anggota <strong>(berlaku seumur hidup)</strong>.</p>
                                </div>
                            </div>
                            <div className="rule-item">
                                <span className="rule-number">2</span>
                                <div className="rule-content">
                                    <h4>Baca di Tempat</h4>
                                    <p>Bagi yang tidak memiliki kartu anggota, diperbolehkan untuk <strong>membaca di tempat</strong> namun <strong>tidak bisa meminjam buku</strong>.</p>
                                </div>
                            </div>
                            <div className="rule-item">
                                <span className="rule-number">3</span>
                                <div className="rule-content">
                                    <h4>Pendaftaran Fleksibel</h4>
                                    <p>Pendaftaran bisa dilakukan secara <strong>online</strong> melalui website atau <strong>offline</strong> dengan datang langsung ke perpustakaan.</p>
                                </div>
                            </div>
                            <div className="rule-item highlight">
                                <span className="rule-number">4</span>
                                <div className="rule-content">
                                    <h4>Periode Peminjaman</h4>
                                    <p>Periode peminjaman buku adalah <strong>5 hari per buku</strong>.</p>
                                </div>
                            </div>
                            <div className="rule-item highlight">
                                <span className="rule-number">5</span>
                                <div className="rule-content">
                                    <h4>Jumlah Buku</h4>
                                    <p>Anggota boleh meminjam lebih dari 1 buku dalam 1 periode peminjaman, <strong>maksimal 3 buku</strong>.</p>
                                </div>
                            </div>
                            <div className="rule-item">
                                <span className="rule-number">6</span>
                                <div className="rule-content">
                                    <h4>Perpanjangan</h4>
                                    <p>Anggota dapat memperpanjang periode peminjaman buku sebanyak <strong>2 kali perpanjangan</strong> (baik secara online maupun offline).</p>
                                </div>
                            </div>
                            <div className="rule-item warning">
                                <span className="rule-number">7</span>
                                <div className="rule-content">
                                    <h4>Denda Keterlambatan</h4>
                                    <p>Apabila terjadi keterlambatan pengembalian buku, anggota dikenakan denda <strong>Rp 5.000 per hari</strong>.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Summary */}
                    <div className="info-summary">
                        <h3>Ringkasan Penting</h3>
                        <div className="summary-grid">
                            <div className="summary-item">
                                <span className="summary-icon">📅</span>
                                <span className="summary-label">Lama Pinjam</span>
                                <span className="summary-value">5 Hari</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-icon">📚</span>
                                <span className="summary-label">Max Buku</span>
                                <span className="summary-value">3 Buku</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-icon">🔄</span>
                                <span className="summary-label">Perpanjangan</span>
                                <span className="summary-value">2 Kali</span>
                            </div>
                            <div className="summary-item warning">
                                <span className="summary-icon">💰</span>
                                <span className="summary-label">Denda</span>
                                <span className="summary-value">Rp 5.000/hari</span>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            <Footer />
        </div>
    )
}

export default Information
