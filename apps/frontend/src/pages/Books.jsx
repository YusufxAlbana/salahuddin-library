import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../config/supabase'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../components/Notification'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../App.css'

function Books() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [activeCategory, setActiveCategory] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [books, setBooks] = useState([])
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const { toast, showConfirm } = useNotification()

    useEffect(() => {
        fetchBooks()
        fetchCategories()
    }, [])

    const fetchBooks = async () => {
        try {
            // Fetch books with their associated tags via book_tags junction table
            const { data, error } = await supabase
                .from('books')
                .select(`
                    *,
                    book_tags (
                        tag_id,
                        tags (
                            id,
                            name,
                            color
                        )
                    )
                `)

            if (error) throw error

            // Transform data to include tags array on each book
            const booksWithTags = data?.map(book => ({
                ...book,
                tags: book.book_tags?.map(bt => bt.tags).filter(Boolean) || []
            })) || []

            setBooks(booksWithTags)
        } catch (error) {
            console.error("Error fetching books:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            // Using 'tags' table (categories table doesn't exist)
            const { data, error } = await supabase
                .from('tags')
                .select('*')
                .order('name')

            if (error) throw error
            setCategories(data || [])
        } catch (error) {
            console.error("Error fetching categories:", error)
        }
    }

    const handleDelete = async (e, bookId) => {
        e.preventDefault() // Prevent navigation to detail
        const confirmed = await showConfirm({
            title: 'Hapus Buku',
            message: 'Apakah Anda yakin ingin menghapus buku ini?',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
            type: 'error'
        })
        if (!confirmed) return

        try {
            const { error } = await supabase
                .from('books')
                .delete()
                .eq('id', bookId)

            if (error) throw error

            toast.success('Buku berhasil dihapus')
            fetchBooks() // Refresh list
        } catch (error) {
            console.error("Error deleting book:", error)
            toast.error('Gagal menghapus buku: ' + error.message)
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

    const [visibleCount, setVisibleCount] = useState(10)

    // Reset pagination when filter changes
    useEffect(() => {
        setVisibleCount(10)
    }, [activeCategory, searchQuery])

    const filteredBooks = books.filter(book => {
        // Check if book has the selected tag (by tag name)
        const matchesCategory = activeCategory === 'all' ||
            book.tags?.some(tag => tag.name === activeCategory)
        const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    const displayedBooks = filteredBooks.slice(0, visibleCount)

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
                            {filteredBooks.length} Judul
                        </span>
                        <span className="total-stat">
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
                        {/* Semua Button */}
                        <button
                            className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveCategory('all')}
                        >
                            Semua
                        </button>

                        {/* Categories from Database */}
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                className={`category-btn ${activeCategory === cat.name ? 'active' : ''}`}
                                onClick={() => setActiveCategory(cat.name)}
                            >
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
                                : (categories.find(c => c.id === activeCategory)?.name ||
                                    activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1))}
                        </h2>
                        <span className="books-count">Menampilkan {displayedBooks.length} dari {filteredBooks.length} judul</span>
                    </div>

                    {filteredBooks.length > 0 ? (
                        <>
                            <div className="books-grid">
                                {displayedBooks.map(book => (
                                    <Link to={`/book/${book.id}`} key={book.id} className="book-card">
                                        <div className="book-cover">
                                            {book.cover ? (
                                                <img
                                                    src={book.cover}
                                                    alt={book.title}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none'
                                                        e.target.nextSibling.style.display = 'flex'
                                                    }}
                                                />
                                            ) : null}
                                            <div className="no-cover-placeholder" style={{ display: book.cover ? 'none' : 'flex' }}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                                                </svg>
                                                <span>No Cover</span>
                                            </div>
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
                                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', margin: '4px 0 8px' }}>
                                                {book.tags && book.tags.slice(0, 3).map((tag, idx) => (
                                                    <span key={idx} style={{
                                                        fontSize: '0.65rem',
                                                        padding: '2px 6px',
                                                        borderRadius: '4px',
                                                        background: tag.color ? `${tag.color}15` : '#f3f4f6',
                                                        color: tag.color || '#6b7280',
                                                        fontWeight: '600',
                                                        border: `1px solid ${tag.color ? `${tag.color}30` : '#e5e7eb'}`
                                                    }}>
                                                        {tag.name}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="book-meta">
                                                <span className={`book-status ${book.stock > 0 ? 'available' : 'unavailable'}`}>
                                                    {book.stock > 0 ? `${book.stock} buku` : 'Habis'}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Load More Button */}
                            {filteredBooks.length > visibleCount && (
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
                                    <button
                                        onClick={() => setVisibleCount(prev => prev + 10)}
                                        className="btn btn-secondary"
                                        style={{ minWidth: '200px' }}
                                    >
                                        Muat Lebih Banyak ({filteredBooks.length - visibleCount} lagi)
                                    </button>
                                </div>
                            )}
                        </>
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

