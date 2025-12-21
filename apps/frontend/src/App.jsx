import './App.css'
import Navbar from './components/Navbar'

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
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop"
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
                <div className="filosofi-highlight-icon">🏰</div>
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
        <div className="section-container">
          <h2 className="section-title">Donasi Buku</h2>
          <p className="section-subtitle">Berbagi ilmu melalui buku untuk generasi penerus bangsa</p>

          <div className="donasi-content">
            <div className="donasi-info">
              <h3>Mengapa Donasi Buku?</h3>
              <ul className="donasi-benefits">
                <li><span>📚</span> Buku Anda akan dibaca oleh puluhan anak-anak</li>
                <li><span>🌱</span> Menumbuhkan minat baca sejak dini</li>
                <li><span>💡</span> Membuka wawasan dan pengetahuan baru</li>
                <li><span>❤️</span> Berbagi kebahagiaan melalui literasi</li>
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
              <h3>📖 Form Donasi Buku</h3>
              <form className="donasi-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>👤 Nama Lengkap</label>
                    <input type="text" placeholder="Nama Anda" required />
                  </div>
                  <div className="form-group">
                    <label>📱 Nomor WhatsApp</label>
                    <input type="tel" placeholder="08xxxxxxxxxx" required />
                  </div>
                </div>
                <div className="form-group">
                  <label>📚 Jumlah Buku</label>
                  <input type="number" placeholder="Jumlah buku yang didonasikan" min="1" required />
                </div>
                <div className="form-group">
                  <label>📝 Daftar Judul Buku</label>
                  <textarea
                    placeholder="Tulis judul buku (pisahkan dengan enter):&#10;1. Laskar Pelangi&#10;2. Matematika Kelas 5&#10;3. Ensiklopedia Anak"
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-donate">
                  📦 Kirim Form Donasi
                </button>
                <p className="donasi-note">*Tim kami akan menghubungi via WhatsApp untuk koordinasi</p>
              </form>
            </div>
          </div>

          <div className="donasi-stats">
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Buku Terkumpul</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">150+</span>
              <span className="stat-label">Anak Terbantu</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">Donatur</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">3</span>
              <span className="stat-label">Tahun Berjalan</span>
            </div>
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
                <div className="contact-icon">📍</div>
                <div>
                  <h4>Alamat</h4>
                  <p>Jl. Pendidikan No. 123<br />Kota, Provinsi 12345</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">📞</div>
                <div>
                  <h4>Telepon</h4>
                  <p>+62 812 3456 7890</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">✉️</div>
                <div>
                  <h4>Email</h4>
                  <p>info@salahuddinlibrary.org</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">🕐</div>
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
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <span className="logo-icon">📚</span>
            <span>Salahuddin Library</span>
          </div>
          <div className="footer-social">
            <a href="#" className="social-link">📘</a>
            <a href="#" className="social-link">📷</a>
            <a href="#" className="social-link">🐦</a>
            <a href="#" className="social-link">📺</a>
          </div>
          <p className="footer-copyright">
            © 2024 Salahuddin Library. Dibuat dengan ❤️ untuk literasi Indonesia.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App