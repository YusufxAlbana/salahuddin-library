import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../App.css'

// Program data (same as in App.jsx - in a real app this would be in a shared file)
const programs = [
    {
        id: 'children-read-out-loud',
        title: 'Children Read Out-Loud',
        icon: 'megaphone',
        shortDesc: 'Aktivitas membaca nyaring untuk anak dengan artikulasi, intonasi, dan kecepatan yang benar',
        fullDesc: 'Sebuah aktivitas membaca nyaring untuk anak yang melibatkan kemampuan berkomunikasi seperti membaca dengan artikulasi, intonasi dan kecepatan yang benar. Program ini membantu anak-anak mengembangkan kepercayaan diri dalam berbicara di depan umum.',
        image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop',
        gallery: [
            'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?w=600&h=400&fit=crop'
        ],
        benefits: [
            'Meningkatkan kepercayaan diri anak',
            'Memperbaiki artikulasi dan pelafalan',
            'Mengembangkan kemampuan berekspresi',
            'Melatih konsentrasi dan fokus'
        ],
        schedule: 'Setiap Sabtu, 09:00 - 11:00 WIB',
        ageGroup: '6 - 12 tahun'
    },
    {
        id: 'it-class',
        title: 'IT Class',
        icon: 'laptop',
        shortDesc: 'Belajar menguasai Microsoft Office untuk kebutuhan profesional',
        fullDesc: 'Belajar menguasai Microsoft Office seperti Microsoft Excel untuk membuat laporan keuangan dan PowerPoint untuk presentasi. Kelas ini dirancang untuk membekali peserta dengan keterampilan digital yang dibutuhkan di dunia kerja modern.',
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop',
        gallery: [
            'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop'
        ],
        benefits: [
            'Menguasai Microsoft Excel dasar hingga menengah',
            'Membuat presentasi PowerPoint yang menarik',
            'Memahami dasar-dasar pengolahan data',
            'Siap menghadapi kebutuhan digital di dunia kerja'
        ],
        schedule: 'Setiap Minggu, 13:00 - 15:00 WIB',
        ageGroup: '13 tahun ke atas'
    },
    {
        id: 'story-telling',
        title: 'Story Telling Class',
        icon: 'book-open',
        shortDesc: 'Belajar berkisah dan mendongeng dengan benar',
        fullDesc: 'Belajar berkisah dengan benar seperti mendongeng. Program ini mengajarkan teknik bercerita yang menarik, penggunaan ekspresi wajah, gerakan tubuh, dan modulasi suara untuk memikat pendengar.',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop',
        gallery: [
            'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=400&fit=crop'
        ],
        benefits: [
            'Mengembangkan kreativitas berimajinasi',
            'Melatih ekspresi wajah dan gestur tubuh',
            'Memperkaya kosakata dan gaya bahasa',
            'Membangun koneksi emosional dengan pendengar'
        ],
        schedule: 'Setiap Sabtu, 13:00 - 15:00 WIB',
        ageGroup: '8 - 15 tahun'
    },
    {
        id: 'public-speaking',
        title: 'Public Speaking Class',
        icon: 'mic',
        shortDesc: 'Menjadi professional public speaker dengan powerful opening dan memorable closing',
        fullDesc: 'Belajar menjadi professional public speaker dengan memahami powerful opening, meaningful content, dan memorable closing. Kelas ini akan mengasah kemampuan berbicara di depan umum dengan percaya diri dan impactful.',
        image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&h=600&fit=crop',
        gallery: [
            'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1560439514-4e9645039924?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1559223607-a43c990c692c?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&h=400&fit=crop',
            'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=600&h=400&fit=crop'
        ],
        benefits: [
            'Menguasai teknik powerful opening',
            'Menyusun meaningful content yang terstruktur',
            'Membuat memorable closing yang berkesan',
            'Mengatasi demam panggung dan grogi'
        ],
        schedule: 'Setiap Minggu, 09:00 - 12:00 WIB',
        ageGroup: '15 tahun ke atas'
    }
]

// Helper function to render program icon
const ProgramIcon = ({ icon, size = 32 }) => {
    const icons = {
        megaphone: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l18-5v12L3 13v-2z"></path><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path></svg>,
        laptop: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="20" x2="22" y2="20"></line></svg>,
        'book-open': <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>,
        mic: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
    }
    return icons[icon] || null
}

function ProgramDetail() {
    const { programId } = useParams()
    const program = programs.find(p => p.id === programId)

    if (!program) {
        return (
            <div className="app">
                <Navbar />
                <div className="detail-page">
                    <div className="section-container">
                        <div className="not-found">
                            <h1>Program Tidak Ditemukan</h1>
                            <p>Maaf, program yang Anda cari tidak tersedia.</p>
                            <Link to="/" className="btn btn-primary">Kembali ke Beranda</Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="app">
            {/* Navigation */}
            <Navbar />

            {/* Back Button */}
            <div className="back-button-container">
                <Link to="/#program" className="back-button">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5"></path>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Kembali
                </Link>
            </div>

            {/* Hero Section */}
            <section className="detail-hero">
                <div className="detail-hero-image">
                    <img src={program.image} alt={program.title} />
                    <div className="detail-hero-overlay"></div>
                </div>
                <div className="detail-hero-content">
                    <span className="detail-icon"><ProgramIcon icon={program.icon} size={48} /></span>
                    <h1>{program.title}</h1>
                    <p>{program.shortDesc}</p>
                </div>
            </section>

            {/* Content Section */}
            <section className="detail-content">
                <div className="section-container">
                    <div className="detail-grid">
                        {/* Main Content */}
                        <div className="detail-main">
                            <div className="detail-section">
                                <h2>Tentang Program</h2>
                                <p className="detail-description">{program.fullDesc}</p>
                            </div>

                            <div className="detail-section">
                                <h2>Manfaat Program</h2>
                                <ul className="benefit-list">
                                    {program.benefits.map((benefit, index) => (
                                        <li key={index}>
                                            <span className="benefit-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg></span>
                                            {benefit}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="detail-section">
                                <h2>Dokumentasi Kegiatan</h2>
                                <div className="gallery-grid">
                                    {program.gallery.map((img, index) => (
                                        <div key={index} className="gallery-item">
                                            <img src={img} alt={`${program.title} - Foto ${index + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="detail-sidebar">
                            <div className="sidebar-card">
                                <h3>Informasi Program</h3>
                                <div className="info-item">
                                    <span className="info-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg></span>
                                    <div>
                                        <strong>Jadwal</strong>
                                        <p>{program.schedule}</p>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <span className="info-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></span>
                                    <div>
                                        <strong>Usia Peserta</strong>
                                        <p>{program.ageGroup}</p>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <span className="info-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg></span>
                                    <div>
                                        <strong>Biaya</strong>
                                        <p>GRATIS</p>
                                    </div>
                                </div>
                                <button className="btn btn-primary btn-full">Daftar Sekarang</button>
                            </div>

                            <div className="sidebar-card">
                                <h3>Program Lainnya</h3>
                                <div className="other-programs">
                                    {programs.filter(p => p.id !== programId).map(p => (
                                        <Link to={`/program/${p.id}`} key={p.id} className="other-program-item">
                                            <span><ProgramIcon icon={p.icon} size={20} /></span>
                                            <span>{p.title}</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* Footer */}
            <Footer />
        </div>
    )
}


export default ProgramDetail
