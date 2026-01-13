import { Link, useLocation } from 'react-router-dom'
import './App.css'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { useNotification } from './components/Notification'

// Program data fallback (Dummy)
const initialPrograms = [
  {
    id: 'children-read-out-loud',
    title: 'Children Read Out-Loud',
    shortDesc: 'Sebuah aktivitas membaca nyaring untuk anak yang melibatkan kemampuan berkomunikasi seperti membaca dengan artikulasi yang jelas, intonasi yang tepat, dan kecepatan yang benar. Program ini membantu anak-anak mengembangkan kepercayaan diri dan kemampuan berbicara di depan umum sejak usia dini.',
    fullDesc: 'Sebuah aktivitas membaca nyaring untuk anak yang melibatkan kemampuan berkomunikasi seperti membaca dengan artikulasi, intonasi dan kecepatan yang benar. Program ini membantu anak-anak mengembangkan kepercayaan diri dalam berbicara di depan umum.',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop'
  },
  {
    id: 'it-class',
    title: 'IT Class',
    shortDesc: 'Belajar menguasai Microsoft Office seperti Microsoft Excel untuk membuat laporan keuangan profesional dan PowerPoint untuk presentasi yang memukau. Kelas ini dirancang untuk membekali peserta dengan keterampilan digital yang dibutuhkan di era modern.',
    fullDesc: 'Belajar menguasai Microsoft Office seperti Microsoft Excel untuk membuat laporan keuangan dan PowerPoint untuk presentasi. Kelas ini dirancang untuk membekali peserta dengan keterampilan digital yang dibutuhkan di dunia kerja modern.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop'
  },
  {
    id: 'story-telling',
    title: 'Story Telling Class',
    shortDesc: 'Belajar berkisah dan mendongeng dengan teknik yang benar. Program ini mengajarkan cara bercerita yang menarik, penggunaan ekspresi wajah yang tepat, gerakan tubuh yang ekspresif, dan modulasi suara untuk memikat setiap pendengar.',
    fullDesc: 'Belajar berkisah dengan benar seperti mendongeng. Program ini mengajarkan teknik bercerita yang menarik, penggunaan ekspresi wajah, gerakan tubuh, dan modulasi suara untuk memikat pendengar.',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop'
  },
  {
    id: 'public-speaking',
    title: 'Public Speaking Class',
    shortDesc: 'Menjadi professional public speaker dengan memahami teknik powerful opening yang memikat, meaningful content yang berbobot, dan memorable closing yang meninggalkan kesan mendalam bagi audiens. Tingkatkan kepercayaan diri Anda!',
    fullDesc: 'Belajar menjadi professional public speaker dengan memahami powerful opening, meaningful content, dan memorable closing. Kelas ini akan mengasah kemampuan berbicara di depan umum dengan percaya diri dan impactful.',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop'
  }
]

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { supabase } from './config/supabase'

function App() {
  const [programs, setPrograms] = useState(initialPrograms)
  const [showMemberOfferModal, setShowMemberOfferModal] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useNotification()

  // Check for member offer flag in URL (after registration)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('showMemberOffer') === 'true' && user) {
      // Clear the URL param
      window.history.replaceState({}, '', '/')
      // Show the member offer modal with slight delay
      setTimeout(() => {
        setShowMemberOfferModal(true)
      }, 500)
    }
  }, [location, user])

  // Handle member offer response
  const handleMemberOfferAccept = () => {
    setShowMemberOfferModal(false)
    navigate('/profile?tab=membership')
  }

  const handleMemberOfferDecline = () => {
    setShowMemberOfferModal(false)
    toast.info('Anda bisa menjadi member kapanpun melalui halaman Profil.')
  }

  // Donation form submit handler
  const handleDonationSubmit = async (e) => {
    e.preventDefault()
    const form = e.target
    const donorName = form.donorName.value
    const whatsapp = form.whatsapp.value
    const bookCount = parseInt(form.bookCount.value)
    const bookTitles = form.bookTitles.value

    try {
      const { error } = await supabase
        .from('donations')
        .insert([{
          donor_name: donorName,
          whatsapp: whatsapp,
          book_count: bookCount,
          book_titles: bookTitles
        }])

      if (error) throw error

      toast.success('Terima kasih! Form donasi berhasil dikirim. Tim kami akan segera menghubungi Anda.')
      form.reset()
    } catch (error) {
      toast.error('Gagal mengirim form: ' + error.message)
    }
  }

  // Feedback form submit handler
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    const form = e.target
    try {
      const { error } = await supabase.from('feedback').insert([{
        name: form.feedbackName.value,
        email: form.feedbackEmail.value,
        message: form.feedbackMessage.value
      }])
      if (error) throw error
      toast.success('Terima kasih! Feedback berhasil dikirim.')
      form.reset()
    } catch (err) {
      toast.error('Gagal: ' + err.message)
    }
  }

  // Scroll to section smoothly
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin')
    }
  }, [user, navigate])



  // DEBUG: Connection Status Check
  const [connectionStatus, setConnectionStatus] = useState('Checking...')
  useEffect(() => {
    supabase.from('programs').select('count', { count: 'exact', head: true })
      .then(({ error }) => {
        if (error) setConnectionStatus(`Error Conn: ${error.message}`)
        else setConnectionStatus('Supabase Connected')
      })
      .catch(err => setConnectionStatus(`Client Error`))
  }, [])

  return (
    <div className="app">
      {/* Debug Banner */}
      <div style={{ background: '#333', color: '#fff', padding: '5px', fontSize: '10px', textAlign: 'center' }}>
        System Status: {connectionStatus} | Env: {import.meta.env.VITE_SUPABASE_URL ? 'Loaded' : 'Missing'}
      </div>

      {/* Navigation */}
      <Navbar />

      {/* Member Offer Modal - Shows after registration */}
      {showMemberOfferModal && (
        <div className="modal-overlay" onClick={handleMemberOfferDecline}>
          <div className="member-offer-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleMemberOfferDecline}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>

            <div className="member-offer-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
              </svg>
            </div>

            <h2>Selamat Bergabung!</h2>
            <p className="member-offer-subtitle">Akun Anda berhasil dibuat. Ingin menjadi member Salahuddin Library?</p>

            <div className="member-offer-benefits">
              <div className="benefit-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Pinjam buku hingga 3 buku sekaligus</span>
              </div>
              <div className="benefit-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Akses ke semua program edukatif</span>
              </div>
              <div className="benefit-item">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span>Kartu member berlaku seumur hidup</span>
              </div>
            </div>

            <div className="member-offer-price">
              <span className="price-label">Hanya</span>
              <span className="price-value">Rp 50.000</span>
              <span className="price-period">sekali bayar</span>
            </div>

            <div className="member-offer-actions">
              <button className="btn btn-primary btn-full" onClick={handleMemberOfferAccept}>
                Ya, Saya Mau Jadi Member
              </button>
              <button className="btn btn-text" onClick={handleMemberOfferDecline}>
                Nanti Saja
              </button>
            </div>
          </div>
        </div>
      )}

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
            <button className="btn btn-primary" onClick={() => scrollToSection('about')}>
              Kenali Kami
            </button>
            <button className="btn btn-secondary" onClick={() => scrollToSection('donasi')} style={{ borderRadius: '12px' }}>
              Donasi Sekarang
            </button>
          </div>
        </div>
        <div className="scroll-indicator">
          <span></span>
        </div>
      </section>

      {/* About Us - Visi Misi Section */}
      <section id="about" className="about-section">
        <div className="about-overlay"></div>
        <div className="about-content">
          <div className="about-header">
            <span className="about-badge">Tentang Kami</span>
            <h2 className="about-title">Salahuddin Library</h2>
            <p className="about-subtitle">
              Membangun generasi cerdas dan kritis melalui budaya literasi
            </p>
          </div>

          <div className="visi-misi-grid">
            {/* Visi Card */}
            <div className="visi-card">
              <div className="visi-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="6"></circle>
                  <circle cx="12" cy="12" r="2"></circle>
                </svg>
              </div>
              <h3>Visi</h3>
              <p>
                Menjadi pusat literasi yang menginspirasi masyarakat untuk gemar membaca,
                berpikir kritis, dan mengembangkan potensi diri seperti Salahuddin Al-Ayyubi
                yang berhasil merebut kembali kejayaan umat melalui kekuatan ilmu dan membaca.
              </p>
            </div>

            {/* Misi Card */}
            <div className="misi-card">
              <div className="misi-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3>Misi</h3>
              <ul className="misi-list">
                <li>Menyediakan akses buku berkualitas untuk semua kalangan</li>
                <li>Menyelenggarakan program edukasi seperti Read Out-Loud, IT Class, Story Telling, dan Public Speaking</li>
                <li>Menumbuhkan minat baca dan budaya literasi sejak dini</li>
                <li>Memfasilitasi donasi buku untuk memperluas jangkauan literasi</li>
                <li>Membangun komunitas pembaca yang aktif dan kritis</li>
              </ul>
            </div>
          </div>

          {/* Values */}
          <div className="about-values">
            <div className="value-item">
              <div className="value-number">5</div>
              <div className="value-label">Hari Peminjaman</div>
            </div>
            <div className="value-item">
              <div className="value-number">3</div>
              <div className="value-label">Buku Maksimal</div>
            </div>
            <div className="value-item">
              <div className="value-number">4</div>
              <div className="value-label">Program Unggulan</div>
            </div>
            <div className="value-item">
              <div className="value-number">∞</div>
              <div className="value-label">Kartu Seumur Hidup</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filosofi Section */}
      <section id="filosofi" className="filosofi-section">
        <div className="section-container">
          <div className="filosofi-content">
            <div className="filosofi-image">
              <div className="filosofi-images-stack">
                <div className="filosofi-image-wrapper filosofi-img-top">
                  <img
                    src="/images/download.jpeg"
                    alt="Filosofi Perpustakaan 1"
                    className="filosofi-img"
                  />
                </div>
                <div className="filosofi-badge-center">
                  <span>1453</span>
                  <small>Tahun Bersejarah</small>
                </div>
                <div className="filosofi-image-wrapper filosofi-img-bottom">
                  <img
                    src="/images/imam Ali.jpeg"
                    alt="Filosofi Perpustakaan 2"
                    className="filosofi-img"
                  />
                </div>
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
                Nama <strong>Salahuddin</strong> identik dengan satu pencapaian monumental yang menggetarkan dunia: pembebasan Yerusalem (Al-Quds) dari cengkeraman Pasukan Salib setelah 88 tahun lamanya. Ia adalah sosok ksatria Muslim yang tidak hanya piawai dalam strategi perang, tetapi juga memiliki hati seluas samudra—adil, pemaaf, dan sangat dermawan. Karakternya yang mulia inilah yang membuatnya dihormati oleh kawan dan disegani oleh lawan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Program Section */}
      <section id="program" className="program-section">
        <div className="section-container">
          <h2 className="section-title">Program Kami</h2>
          <p className="section-subtitle">Program edukatif untuk pengembangan literasi dan kemampuan komunikasi</p>
        </div>

        <div className="program-grid">
          {programs.map((program, index) => (
            <div
              key={program.id}
              className={`program-card-link program-item-${index + 1}`}
            >
              <div className="program-card">
                <div className="program-card-image-container">
                  <img src={program.image} alt={program.title} className="program-img" />
                </div>

                <div className="program-card-content">
                  <h3 className="program-title">{program.title}</h3>
                  <div className="program-desc">
                    <p>{program.shortDesc}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Membership Section */}
      <section id="membership" className="membership-section">
        <div className="section-container">
          <div className="membership-content">
            <div className="membership-info">
              <span className="membership-badge">Eksklusif</span>
              <h2>Jadilah Member Salahuddin Library</h2>
              <p className="membership-subtitle">
                Nikmati berbagai keuntungan dengan menjadi anggota perpustakaan kami
              </p>

              <div className="membership-benefits">
                <div className="membership-benefit">
                  <div className="benefit-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4>Pinjam Hingga 3 Buku</h4>
                    <p>Pinjam buku favorit Anda dengan durasi 5 hari</p>
                  </div>
                </div>

                <div className="membership-benefit">
                  <div className="benefit-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h4>Kartu Seumur Hidup</h4>
                    <p>Sekali daftar, berlaku selamanya tanpa perpanjangan</p>
                  </div>
                </div>

                <div className="membership-benefit">
                  <div className="benefit-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                  </div>
                  <div>
                    <h4>Akses Semua Program</h4>
                    <p>Ikuti program edukatif seperti Public Speaking & IT Class</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="membership-cta-card">
              <div className="cta-price-tag">
                <span className="cta-price-label">Biaya Member</span>
                <span className="cta-price-value">Rp 50.000</span>
                <span className="cta-price-note">sekali bayar, seumur hidup</span>
              </div>

              <div className="cta-features">
                <div className="cta-feature">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Kartu member fisik & digital</span>
                </div>
                <div className="cta-feature">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Pinjam buku tanpa batas waktu</span>
                </div>
                <div className="cta-feature">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span>Perpanjang pinjaman 2x</span>
                </div>
              </div>

              <button
                className="btn btn-membership"
                onClick={() => user ? navigate('/profile?tab=membership') : navigate('/register')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                {user ? 'Daftar Member Sekarang' : 'Daftar & Jadi Member'}
              </button>

              <p className="cta-note">Sudah ribuan orang bergabung dengan kami</p>
            </div>
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
                <span>Buku Anda akan dibaca oleh puluhan anak-anak</span>
              </li>
              <li>
                <span>Menumbuhkan minat baca sejak dini</span>
              </li>
              <li>
                <span>Membuka wawasan dan pengetahuan baru</span>
              </li>
              <li>
                <span>Berbagi kebahagiaan melalui literasi</span>
              </li>
            </ul>

            <div className="donasi-note-box" style={{ display: 'none' }}>
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
              Form Donasi Buku
            </h3>
            <form className="donasi-form" onSubmit={handleDonationSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>
                    Nama Lengkap
                  </label>
                  <input type="text" name="donorName" placeholder="Nama Anda" required />
                </div>
                <div className="form-group">
                  <label>
                    Nomor WhatsApp
                  </label>
                  <input type="tel" name="whatsapp" placeholder="08xxxxxxxxxx" required />
                </div>
              </div>
              <div className="form-group">
                <label>
                  Jumlah Buku
                </label>
                <input
                  type="text"
                  name="bookCount"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength="3"
                  placeholder="Jumlah buku"
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  Daftar Judul Buku
                </label>
                <textarea
                  name="bookTitles"
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
            <div className="contact-left">
              <div className="contact-info">
                <div className="contact-item">
                  <div className="contact-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </div>
                  <div>
                    <h4>Alamat</h4>
                    <p>G8M7+Q8H Belakang Mesjid As Shadaqah<br />Jl. Memori Lr. Setia, Lam Lagang<br />Kec. Banda Raya, Kota Banda Aceh<br />Aceh 23122, Indonesia</p>
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
              </div>

              {/* Footer */}
              <div className="home-footer">
                <div className="footer-separator"></div>
                <div className="footer-content">
                  <div className="footer-logo">
                    <img src="/images/logo.png" alt="Salahuddin Library" style={{ height: '32px' }} onError={(e) => { e.target.style.display = 'none' }} />
                    <span>Salahuddin Library</span>
                  </div>
                  <div className="footer-social">
                    <a href="#" className="social-link" aria-label="Facebook">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                    </a>
                    <a href="#" className="social-link" aria-label="Instagram">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    </a>
                    <a href="#" className="social-link" aria-label="Twitter">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                    </a>
                    <a href="#" className="social-link" aria-label="YouTube">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                    </a>
                  </div>
                  <p className="footer-copyright">© 2024 Salahuddin Library. Untuk literasi Indonesia.</p>
                </div>
              </div>
            </div>

            <div className="contact-right">
              {/* Google Maps Embed - Banda Aceh */}
              <div className="contact-map">
                <iframe
                  src="https://maps.google.com/maps?q=G8M7%2BQ8H%20Belakang%20Mesjid%20As%20Shadaqah%2C%20Jl.%20Memori%20Lr.%20Setia%2C%20Lam%20Lagang%2C%20Kec.%20Banda%20Raya%2C%20Kota%20Banda%20Aceh%2C%20Aceh%2023122%2C%20Indonesia&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="200"
                  style={{ border: 0, borderRadius: '12px' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Salahuddin Library - Banda Aceh"
                ></iframe>
              </div>

              <div className="feedback-form-container">
                <div className="feedback-header">
                  <div className="feedback-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      <path d="M12 7v2"></path>
                      <path d="M12 13h.01"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 className="feedback-title">Berikan Feedback</h3>
                    <p className="feedback-subtitle">Pendapat Anda sangat berarti bagi kami</p>
                  </div>
                </div>

                <form className="feedback-form" onSubmit={handleFeedbackSubmit}>
                  <div className="form-group">
                    <label className="form-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                      Nama Lengkap
                    </label>
                    <input type="text" name="feedbackName" placeholder="Masukkan nama Anda" required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                      Email
                    </label>
                    <input type="email" name="feedbackEmail" placeholder="email@contoh.com" required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                      </svg>
                      Pesan
                    </label>
                    <textarea name="feedbackMessage" placeholder="Tulis pesan, kritik, atau saran Anda..." rows="4" required></textarea>
                  </div>

                  <button type="submit" className="btn-feedback-submit">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                    Kirim Feedback
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


export default App