import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../context/AuthContext'
import { categories } from '../data/initialBooks'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../App.css'

function Books() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [activeCategory, setActiveCategory] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchBooks()
    }, [])

    const fetchBooks = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'books'))
            const booksData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setBooks(booksData)
        } catch (error) {
            console.error("Error fetching books:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (e, bookId) => {
        e.preventDefault() // Prevent navigation to detail
        if (!confirm('Apakah Anda yakin ingin menghapus buku ini?')) return

        try {
            await deleteDoc(doc(db, 'books', bookId))
            alert('Buku berhasil dihapus')
            fetchBooks() // Refresh list
        } catch (error) {
            console.error("Error deleting book:", error)
            alert('Gagal menghapus buku: ' + error.message)
        }
    }

    const getCategoryIcon = (catId) => {
        switch (catId) {
            case 'all': return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            case 'novel': return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
            case 'education': return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
            case 'history': return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            case 'islamic': return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
            default: return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        }
    }

    const filteredBooks = books.filter(book => {
        const matchesCategory = activeCategory === 'all' || book.category === activeCategory
        const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    // Calculate total stock
    const totalBooks = books.reduce((sum, book) => sum + (book.stock || 0), 0)

    return (
        <div className="app">
            {/* Navigation */}
            <Navbar />

            {/* Books Hero */}
            <section className="books-hero">
                <div className="books-hero-content">
                    <h1>Katalog Buku</h1>
                    <p>Temukan berbagai koleksi buku berkualitas untuk pengembangan diri dan pengetahuan</p>
                    <div className="books-total-stats">
                        <span className="total-stat">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                            {books.length} Judul
                        </span>
                        <span className="total-stat">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                            {totalBooks} Buku Tersedia
                        </span>
                    </div>

                    {/* Search Bar */}
                    <div className="books-search">
                        <span className="search-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </span>
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
                        {/* Dynamic Category List */}
                        {(() => {
                            // Extract unique categories from books
                            const uniqueCategories = ['all', ...new Set(books.map(b => b.category))]

                            // Map to objects with icons (using defaults if not found)
                            const dynamicCategories = uniqueCategories.map(catId => {
                                const existing = categories.find(c => c.id === catId)
                                if (existing) return existing

                                // Default for new custom categories
                                return {
                                    id: catId,
                                    name: catId.charAt(0).toUpperCase() + catId.slice(1)
                                }
                            })

                            return dynamicCategories.map(cat => (
                                <button
                                    key={cat.id}
                                    className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat.id)}
                                >
                                    <span>{getCategoryIcon(cat.id)}</span>
                                    {cat.name}
                                </button>
                            ))
                        })()}
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
                                : (categories.find(c => c.id === activeCategory)?.name ||
                                    activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1))}
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

                                        {/* Admin Actions Overlay */}
                                        {user && user.role === 'admin' && (
                                            <div className="admin-book-overlay">
                                                <button
                                                    className="btn-admin-action"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        navigate('/admin', { state: { editBook: book } })
                                                    }}
                                                    title="Edit Buku"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                </button>
                                                <button
                                                    className="btn-admin-action delete"
                                                    onClick={(e) => handleDelete(e, book.id)}
                                                    title="Hapus Buku"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                </button>
                                            </div>
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
            <Footer />
        </div>
    )
}


export default Books
