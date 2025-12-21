import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import '../App.css'

// Dummy books data (same as Books.jsx - in production this would be fetched)
const books = [
    {
        id: 1,
        title: 'Laskar Pelangi',
        author: 'Andrea Hirata',
        category: 'novel',
        cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&h=900&fit=crop',
        year: 2005,
        stock: 3,
        description: 'Sebuah novel yang menceritakan tentang perjuangan anak-anak di Belitung untuk mendapatkan pendidikan yang layak. Kisah inspiratif tentang persahabatan, cita-cita, dan semangat pantang menyerah.',
        pages: 529,
        isbn: '978-602-8519-10-9',
        publisher: 'Bentang Pustaka'
    },
    {
        id: 2,
        title: 'Bumi Manusia',
        author: 'Pramoedya Ananta Toer',
        category: 'novel',
        cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&h=900&fit=crop',
        year: 1980,
        stock: 2,
        description: 'Novel pertama dari Tetralogi Buru karya Pramoedya Ananta Toer. Berlatar belakang masa kolonial Belanda, mengisahkan perjuangan Minke melawan ketidakadilan.',
        pages: 535,
        isbn: '978-979-3062-07-0',
        publisher: 'Hasta Mitra'
    },
    {
        id: 3,
        title: 'Why? Dinosaurus',
        author: 'YeaRimDang',
        category: 'why',
        cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=900&fit=crop',
        year: 2018,
        stock: 5,
        description: 'Buku komik sains yang menjelaskan tentang kehidupan dinosaurus dengan cara yang menyenangkan dan mudah dipahami oleh anak-anak.',
        pages: 168,
        isbn: '978-602-250-123-4',
        publisher: 'Elex Media'
    },
    {
        id: 4,
        title: 'Why? Antariksa',
        author: 'YeaRimDang',
        category: 'why',
        cover: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=600&h=900&fit=crop',
        year: 2019,
        stock: 0,
        description: 'Petualangan seru menjelajahi antariksa! Buku ini menjelaskan tentang planet, bintang, dan galaksi dengan ilustrasi menarik.',
        pages: 172,
        isbn: '978-602-250-456-7',
        publisher: 'Elex Media'
    },
    {
        id: 5,
        title: 'Filosofi Teras',
        author: 'Henry Manampiring',
        category: 'motivation',
        cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=900&fit=crop',
        year: 2018,
        stock: 4,
        description: 'Buku tentang filosofi Stoa yang ditulis dengan gaya bahasa Indonesia modern. Membantu pembaca menghadapi kecemasan dan hidup lebih tenang.',
        pages: 346,
        isbn: '978-602-291-123-8',
        publisher: 'Kompas Gramedia'
    },
    {
        id: 6,
        title: 'Atomic Habits',
        author: 'James Clear',
        category: 'motivation',
        cover: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=900&fit=crop',
        year: 2018,
        stock: 2,
        description: 'Cara mudah membangun kebiasaan baik dan menghilangkan kebiasaan buruk. Strategi praktis untuk transformasi diri.',
        pages: 320,
        isbn: '978-0-7352-1131-3',
        publisher: 'Penguin Random House'
    },
    {
        id: 7,
        title: 'Sejarah Islam Lengkap',
        author: 'Dr. Badri Yatim',
        category: 'islamic-history',
        cover: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&h=900&fit=crop',
        year: 2015,
        stock: 3,
        description: 'Buku referensi lengkap tentang sejarah peradaban Islam dari masa Nabi Muhammad SAW hingga era modern.',
        pages: 412,
        isbn: '978-979-421-123-4',
        publisher: 'Rajawali Pers'
    },
    {
        id: 8,
        title: 'Muhammad Al-Fatih',
        author: 'Felix Siauw',
        category: 'islamic-history',
        cover: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&h=900&fit=crop',
        year: 2013,
        stock: 2,
        description: 'Kisah inspiratif Sultan Muhammad Al-Fatih yang menaklukkan Konstantinopel di usia 21 tahun.',
        pages: 280,
        isbn: '978-602-7696-01-5',
        publisher: 'Al-Fatih Press'
    },
    {
        id: 9,
        title: 'Sejarah Dunia Kuno',
        author: 'Susan Wise Bauer',
        category: 'history',
        cover: 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?w=600&h=900&fit=crop',
        year: 2007,
        stock: 0,
        description: 'Menjelajahi sejarah peradaban kuno dari Mesopotamia, Mesir, hingga Romawi dalam satu buku komprehensif.',
        pages: 896,
        isbn: '978-0-393-05974-8',
        publisher: 'W.W. Norton'
    },
    {
        id: 10,
        title: 'Belajar Bahasa Arab',
        author: 'Fuad Nimr',
        category: 'language',
        cover: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=900&fit=crop',
        year: 2020,
        stock: 6,
        description: 'Panduan praktis belajar Bahasa Arab untuk pemula. Dilengkapi dengan latihan dan kosa kata sehari-hari.',
        pages: 256,
        isbn: '978-602-8847-12-3',
        publisher: 'Pustaka Al-Kautsar'
    },
    {
        id: 11,
        title: 'English Grammar in Use',
        author: 'Raymond Murphy',
        category: 'language',
        cover: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=900&fit=crop',
        year: 2019,
        stock: 4,
        description: 'Buku grammar Bahasa Inggris paling populer di dunia. Cocok untuk level intermediate.',
        pages: 380,
        isbn: '978-1-108-45765-1',
        publisher: 'Cambridge University Press'
    },
    {
        id: 12,
        title: 'La Tahzan',
        author: 'Aidh Al-Qarni',
        category: 'islamic',
        cover: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=900&fit=crop',
        year: 2005,
        stock: 3,
        description: 'Buku motivasi Islami yang mengajarkan cara menghadapi kesedihan dan tetap optimis dalam hidup.',
        pages: 488,
        isbn: '978-979-592-123-4',
        publisher: 'Qisthi Press'
    },
    {
        id: 13,
        title: 'Ikigai',
        author: 'Héctor García',
        category: 'life',
        cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=900&fit=crop',
        year: 2017,
        stock: 2,
        description: 'Rahasia hidup bahagia dan panjang umur ala Jepang. Temukan alasan untuk bangun setiap pagi.',
        pages: 208,
        isbn: '978-0-14-313029-3',
        publisher: 'Penguin Books'
    },
    {
        id: 14,
        title: 'Pendidikan Karakter',
        author: 'Thomas Lickona',
        category: 'education',
        cover: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=900&fit=crop',
        year: 2012,
        stock: 1,
        description: 'Panduan mendidik anak agar memiliki karakter yang baik. Wajib dibaca oleh orang tua dan guru.',
        pages: 568,
        isbn: '978-979-033-123-4',
        publisher: 'Bumi Aksara'
    },
    {
        id: 15,
        title: 'Sebuah Seni Bersikap',
        author: 'Mark Manson',
        category: 'life',
        cover: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=900&fit=crop',
        year: 2016,
        stock: 0,
        description: 'Pendekatan yang jujur dan to the point tentang cara hidup yang lebih baik dan bermakna.',
        pages: 224,
        isbn: '978-0-06-245771-4',
        publisher: 'HarperOne'
    },
]

const categoryNames = {
    'novel': 'Novel',
    'why': 'Buku Why?',
    'education': 'Konsep Pendidikan',
    'motivation': 'Self Motivation',
    'islamic': 'Islamic Book',
    'islamic-history': 'Islamic History',
    'history': 'Sejarah',
    'language': 'Belajar Bahasa',
    'life': 'Konsep Hidup',
}

function BookDetail() {
    const { bookId } = useParams()

    const book = books.find(b => b.id === parseInt(bookId))

    if (!book) {
        return (
            <div className="app">
                <Navbar />
                <div className="book-not-found">
                    <span>📭</span>
                    <h1>Buku tidak ditemukan</h1>
                    <Link to="/books" className="btn btn-primary">Kembali ke Katalog</Link>
                </div>
            </div>
        )
    }

    return (
        <div className="app">
            {/* Navigation */}
            <Navbar />

            {/* Book Detail Content */}
            <div className="book-detail-page">
                <div className="book-detail-container">
                    {/* Book Cover */}
                    <div className="book-detail-cover">
                        <img src={book.cover} alt={book.title} />
                    </div>

                    {/* Book Info */}
                    <div className="book-detail-info">
                        <span className="book-detail-category">
                            {categoryNames[book.category] || book.category}
                        </span>
                        <h1>{book.title}</h1>
                        <p className="book-detail-author">oleh <strong>{book.author}</strong></p>

                        <div className="book-detail-meta">
                            <div className="meta-item">
                                <span className="meta-icon">📅</span>
                                <span>Tahun {book.year}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-icon">📄</span>
                                <span>{book.pages} halaman</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-icon">🏢</span>
                                <span>{book.publisher}</span>
                            </div>
                        </div>

                        {/* Stock Info */}
                        <div className="book-stock-info">
                            <span className="stock-label">Stok Tersedia:</span>
                            <span className={`stock-value ${book.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                {book.stock > 0 ? `${book.stock} buku` : 'Habis'}
                            </span>
                        </div>

                        <div className="book-detail-description">
                            <h3>📖 Sinopsis</h3>
                            <p>{book.description}</p>
                        </div>

                        <div className="book-detail-isbn">
                            <span>ISBN:</span> {book.isbn}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <p className="footer-copyright">
                        © 2024 Salahuddin Library. Dibuat dengan ❤️ untuk literasi Indonesia.
                    </p>
                </div>
            </footer>
        </div>
    )
}

export default BookDetail
