import { Link } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Program data
const programs = [
  {
    id: 'children-read-out-loud',
    title: 'Children Read Out-Loud',
    icon: '📢',
    shortDesc: 'Aktivitas membaca nyaring untuk anak dengan artikulasi, intonasi, dan kecepatan yang benar',
    fullDesc: 'Sebuah aktivitas membaca nyaring untuk anak yang melibatkan kemampuan berkomunikasi seperti membaca dengan artikulasi, intonasi dan kecepatan yang benar. Program ini membantu anak-anak mengembangkan kepercayaan diri dalam berbicara di depan umum.',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop'
  },
  {
    id: 'it-class',
    title: 'IT Class',
    icon: '💻',
    shortDesc: 'Belajar menguasai Microsoft Office untuk kebutuhan profesional',
    fullDesc: 'Belajar menguasai Microsoft Office seperti Microsoft Excel untuk membuat laporan keuangan dan PowerPoint untuk presentasi. Kelas ini dirancang untuk membekali peserta dengan keterampilan digital yang dibutuhkan di dunia kerja modern.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop'
  },
  {
    id: 'story-telling',
    title: 'Story Telling Class',
    icon: '📖',
    shortDesc: 'Belajar berkisah dan mendongeng dengan benar',
    fullDesc: 'Belajar berkisah dengan benar seperti mendongeng. Program ini mengajarkan teknik bercerita yang menarik, penggunaan ekspresi wajah, gerakan tubuh, dan modulasi suara untuk memikat pendengar.',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop'
  },
  {
    id: 'public-speaking',
    title: 'Public Speaking Class',
    icon: '🎤',
    shortDesc: 'Menjadi professional public speaker dengan powerful opening dan memorable closing',
    fullDesc: 'Belajar menjadi professional public speaker dengan memahami powerful opening, meaningful content, dan memorable closing. Kelas ini akan mengasah kemampuan berbicara di depan umum dengan percaya diri dan impactful.',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop'
  }
]

function App() {
  return (
    <div className="app">
      {/* Navigation */}
      <Navbar />

      {/* Welcome Section */}
      <section id="welcome" className="welcome-section">
        <div className="welcome-overlay"></div>
        <div className="welcome-content">
          <h1 className="welcome-title">
            Selamat Datang di <span className="highlight">Salahuddin Library</span>
          </h1>
          <p className="welcome-subtitle">
            Tempat belajar, berbagi ilmu, dan menumbuhkan cinta membaca untuk generasi masa depan
          </p>
          <div className="welcome-buttons">
            <button className="btn btn-primary" onClick={() => scrollToSection('filosofi')}>
              Kenali Kami
            </button>
            <button className="btn btn-secondary" onClick={() => scrollToSection('donasi')}>
              Donasi Sekarang
            </button>
          </div>
        </div>
        <div className="scroll-indicator">
          <span></span>
        </div>
      </section>

      {/* Filosofi Section */}
      <section id="filosofi" className="filosofi-section">
        <div className="section-container">
          <div className="filosofi-content">
            <div className="filosofi-image">
              <div className="filosofi-image-wrapper">
                <img
                  src="/images/download.jpeg"
                  alt="Filosofi Perpustakaan"
                  className="filosofi-img"
                />
              </div>
              <div className="filosofi-badge">
                <span>1453</span>
                <small>Tahun Bersejarah</small>
              </div>
            </div>

            <div className="filosofi-text">
              <h2>Filosofi <span>Nama Pustaka</span></h2>

              <blockquote className="filosofi-quote">
                "Membaca adalah jendela dunia, dan ilmu adalah senjata terkuat umat."
              </blockquote>

              <p className="filosofi-story">
                Nama <strong>Salahuddin Library</strong> diambil dari nama ayah pendiri perpustakaan ini. Beliau adalah sosok yang sangat gemar membaca, bahkan kerap membacakan buku untuk anak-anaknya. Kecintaan beliau terhadap literasi menjadi inspirasi utama berdirinya perpustakaan ini.
              </p>

              <p className="filosofi-story">
                Namun, jauh sebelum masa itu, ada seorang pemuda Islam bernama <strong>Muhammad Al-Fatih</strong> yang sangat senang membaca. Dari kegemaran membacanya, ia berhasil menajamkan kemampuan analisa dan berpikir kritis. Berkat ilmu yang ia peroleh dari membaca, ia kemudian berhasil mewujudkan impian umat Islam selama 800 tahun — merebut kembali Konstantinopel pada tahun 1453.
              </p>

              <div className="filosofi-highlight">
                <div className="filosofi-highlight-icon logo-box">LOGO</div>
                <div>
                  <h4>Warisan Sultan Muhammad Al-Fatih</h4>
                  <p>
                    Semangat cinta ilmu dan membaca dari Sultan Al-Fatih menjadi fondasi filosofi perpustakaan kami — bahwa membaca bukan sekadar hobi, melainkan kunci untuk membuka pintu kemenangan dan kemajuan peradaban.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Program Section */}
      <section id="program" className="program-section">
        <div className="section-container">
          <h2 className="section-title">Program Kami</h2>
          <p className="section-subtitle">Program edukatif untuk pengembangan literasi dan kemampuan komunikasi</p>

          <div className="program-grid">
            {programs.map((program) => (
              <Link to={`/program/${program.id}`} key={program.id} className="program-card-link">
                <div className="program-card">
                  <div className="program-card-image">
                    <img src={program.image} alt={program.title} />
                    <div className="program-card-overlay">
                      <span className="view-details">Lihat Detail →</span>
                    </div>
                  </div>
                  <div className="program-card-content">
                    <div className="program-icon">{program.icon}</div>
                    <h3>{program.title}</h3>
                    <p>{program.shortDesc}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Donasi Buku Section */}
      <section id="donasi" className="donasi-section">
        <div className="donasi-content">
          <div className="donasi-info">
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>Donasi Buku</h2>
            <p className="section-subtitle" style={{ textAlign: 'left', marginBottom: '2rem', maxWidth: '100%', margin: '0 0 2rem 0' }}>Berbagi ilmu melalui buku untuk generasi penerus bangsa</p>


            <ul className="donasi-benefits">
              <li>
                <div className="benefit-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                </div>
                <span>Buku Anda akan dibaca oleh puluhan anak-anak</span>
              </li>
              <li>
                <div className="benefit-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22h20"></path><path d="M12 2v6"></path><path d="M12 18v4"></path><path d="M4.93 19.07l4.24-7.35a6.002 6.002 0 0 1 5.66 0l4.24 7.35"></path></svg>
                </div>
                <span>Menumbuhkan minat baca sejak dini</span>
              </li>
              <li>
                <div className="benefit-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2A7 7 0 0 0 5 9c0 4.155 3 7 7 7s7-2.845 7-7a7 7 0 0 0-7-7z"></path></svg>
                </div>
                <span>Membuka wawasan dan pengetahuan baru</span>
              </li>
              <li>
                <div className="benefit-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path></svg>
                </div>
                <span>Berbagi kebahagiaan melalui literasi</span>
              </li>
            </ul>

            <div className="donasi-note-box">
              <h4>📋 Jenis Buku yang Diterima:</h4>
              <ul>
                <li>Buku cerita anak</li>
                <li>Buku pelajaran (SD - SMA)</li>
                <li>Buku pengetahuan umum</li>
                <li>Novel & fiksi (layak baca)</li>
                <li>Buku keterampilan</li>
              </ul>
            </div>
          </div>

          <div className="donasi-card">
            <h3>
              <span className="section-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
              </span>
              Form Donasi Buku
            </h3>
            <form className="donasi-form">
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <span className="label-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </span>
                    Nama Lengkap
                  </label>
                  <input type="text" placeholder="Nama Anda" required />
                </div>
                <div className="form-group">
                  <label>
                    <span className="label-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </span>
                    Nomor WhatsApp
                  </label>
                  <input type="tel" placeholder="08xxxxxxxxxx" required />
                </div>
              </div>
              <div className="form-group">
                <label>
                  <span className="label-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                  </span>
                  Jumlah Buku
                </label>
                <input type="number" placeholder="Jumlah buku yang didonasikan" min="1" required />
              </div>
              <div className="form-group">
                <label>
                  <span className="label-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  </span>
                  Daftar Judul Buku
                </label>
                <textarea
                  placeholder="Tulis judul buku (pisahkan dengan enter):&#10;1. Laskar Pelangi&#10;2. Matematika Kelas 5&#10;3. Ensiklopedia Anak"
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-donate">
                <span className="btn-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </span>
                Kirim Form Donasi
              </button>
              <p className="donasi-note">*Tim kami akan menghubungi via WhatsApp untuk koordinasi</p>
            </form>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="section-container">
          <h2 className="section-title">Hubungi Kami</h2>
          <p className="section-subtitle">Punya pertanyaan atau ingin berkolaborasi? Jangan ragu untuk menghubungi kami</p>

          <div className="contact-content">
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div>
                  <h4>Alamat</h4>
                  <p>Jl. Pendidikan No. 123<br />Kota, Provinsi 12345</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                </div>
                <div>
                  <h4>Telepon</h4>
                  <p>+62 812 3456 7890</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div>
                  <h4>Email</h4>
                  <p>info@salahuddinlibrary.org</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                </div>
                <div>
                  <h4>Jam Operasional</h4>
                  <p>Senin - Sabtu: 09:00 - 17:00</p>
                </div>
              </div>
            </div>

            <form className="contact-form">
              <div className="form-group">
                <input type="text" placeholder="Nama Lengkap" required />
              </div>
              <div className="form-group">
                <input type="email" placeholder="Alamat Email" required />
              </div>
              <div className="form-group">
                <input type="text" placeholder="Subjek" required />
              </div>
              <div className="form-group">
                <textarea placeholder="Pesan Anda" rows="5" required></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Kirim Pesan</button>
            </form>
          </div>


          <Footer />
        </div>
      </section>
    </div>
  )
}


export default App