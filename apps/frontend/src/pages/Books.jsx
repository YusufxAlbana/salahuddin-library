import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../App.css'

// Book categories
const categories = [
    { id: 'all', name: 'Semua', icon: '📚' },
    { id: 'novel', name: 'Novel', icon: '📖' },
    { id: 'why', name: 'Buku Why?', icon: '❓' },
    { id: 'education', name: 'Konsep Pendidikan', icon: '🎓' },
    { id: 'motivation', name: 'Self Motivation', icon: '💪' },
    { id: 'islamic', name: 'Islamic Book', icon: '🕌' },
    { id: 'islamic-history', name: 'Islamic History', icon: '📜' },
    { id: 'history', name: 'Sejarah', icon: '🏛️' },
    { id: 'language', name: 'Belajar Bahasa', icon: '🗣️' },
    { id: 'life', name: 'Konsep Hidup', icon: '🌱' },
]

// Dummy books data with stock
const books = [
    { id: 1, title: 'Laskar Pelangi', author: 'Andrea Hirata', category: 'novel', cover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop', year: 2005, stock: 3 },
    { id: 2, title: 'Bumi Manusia', author: 'Pramoedya Ananta Toer', category: 'novel', cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop', year: 1980, stock: 2 },
    { id: 3, title: 'Why? Dinosaurus', author: 'YeaRimDang', category: 'why', cover: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=400&fit=crop', year: 2018, stock: 5 },
    { id: 4, title: 'Why? Antariksa', author: 'YeaRimDang', category: 'why', cover: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=400&fit=crop', year: 2019, stock: 0 },
    { id: 5, title: 'Filosofi Teras', author: 'Henry Manampiring', category: 'motivation', cover: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop', year: 2018, stock: 4 },
    { id: 6, title: 'Atomic Habits', author: 'James Clear', category: 'motivation', cover: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&h=400&fit=crop', year: 2018, stock: 2 },
    { id: 7, title: 'Sejarah Islam Lengkap', author: 'Dr. Badri Yatim', category: 'islamic-history', cover: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=300&h=400&fit=crop', year: 2015, stock: 3 },
    { id: 8, title: 'Muhammad Al-Fatih', author: 'Felix Siauw', category: 'islamic-history', cover: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&h=400&fit=crop', year: 2013, stock: 2 },
    { id: 9, title: 'Sejarah Dunia Kuno', author: 'Susan Wise Bauer', category: 'history', cover: 'https://images.unsplash.com/photo-1491841573634-28140fc7ced7?w=300&h=400&fit=crop', year: 2007, stock: 0 },
    { id: 10, title: 'Belajar Bahasa Arab', author: 'Fuad Nimr', category: 'language', cover: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=400&fit=crop', year: 2020, stock: 6 },
    { id: 11, title: 'English Grammar in Use', author: 'Raymond Murphy', category: 'language', cover: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&h=400&fit=crop', year: 2019, stock: 4 },
    { id: 12, title: 'La Tahzan', author: 'Aidh Al-Qarni', category: 'islamic', cover: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&h=400&fit=crop', year: 2005, stock: 3 },
    { id: 13, title: 'Ikigai', author: 'Héctor García', category: 'life', cover: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=400&fit=crop', year: 2017, stock: 2 },
    { id: 14, title: 'Pendidikan Karakter', author: 'Thomas Lickona', category: 'education', cover: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&h=400&fit=crop', year: 2012, stock: 1 },
    { id: 15, title: 'Sebuah Seni Bersikap', author: 'Mark Manson', category: 'life', cover: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=300&h=400&fit=crop', year: 2016, stock: 0 },
]

function Books() {
    const [activeCategory, setActiveCategory] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    const filteredBooks = books.filter(book => {
        const matchesCategory = activeCategory === 'all' || book.category === activeCategory
        const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    // Calculate total stock
    const totalBooks = books.reduce((sum, book) => sum + book.stock, 0)

    return (
        <div className="app">
            {/* Navigation */}
            <nav className="navbar navbar-detail">
                <div className="nav-container">
                    <Link to="/" className="nav-logo">
                        <span className="logo-icon">📚</span>
                        <span className="logo-text">Salahuddin Library</span>
                    </Link>
                    <Link to="/" className="back-link">
                        ← Kembali ke Beranda
                    </Link>
                </div>
            </nav>

            {/* Books Hero */}
            <section className="books-hero">
                <div className="books-hero-content">
                    <h1>📚 Katalog Buku</h1>
                    <p>Temukan berbagai koleksi buku berkualitas untuk pengembangan diri dan pengetahuan</p>
                    <div className="books-total-stats">
                        <span className="total-stat">📖 {books.length} Judul</span>
                        <span className="total-stat">📚 {totalBooks} Buku Tersedia</span>
                    </div>

                    {/* Search Bar */}
                    <div className="books-search">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Cari judul atau penulis buku..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="books-categories">
                <div className="section-container">
                    <div className="categories-scroll">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.id)}
                            >
                                <span>{cat.icon}</span>
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Books Grid */}
            <section className="books-section">
                <div className="section-container">
                    <div className="books-header">
                        <h2>
                            {activeCategory === 'all'
                                ? 'Semua Buku'
                                : categories.find(c => c.id === activeCategory)?.name}
                        </h2>
                        <span className="books-count">{filteredBooks.length} judul</span>
                    </div>

                    {filteredBooks.length > 0 ? (
                        <div className="books-grid">
                            {filteredBooks.map(book => (
                                <Link to={`/book/${book.id}`} key={book.id} className="book-card">
                                    <div className="book-cover">
                                        <img src={book.cover} alt={book.title} />
                                        {book.stock === 0 && (
                                            <div className="book-unavailable">Habis</div>
                                        )}
                                    </div>
                                    <div className="book-info">
                                        <h3 className="book-title">{book.title}</h3>
                                        <p className="book-author">{book.author}</p>
                                        <div className="book-meta">
                                            <span className="book-year">{book.year}</span>
                                            <span className={`book-status ${book.stock > 0 ? 'available' : 'unavailable'}`}>
                                                {book.stock > 0 ? `${book.stock} buku` : 'Habis'}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="books-empty">
                            <span>📭</span>
                            <h3>Buku tidak ditemukan</h3>
                            <p>Coba ubah kata kunci pencarian atau pilih kategori lain</p>
                        </div>
                    )}
                </div>
            </section>

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

export default Books
