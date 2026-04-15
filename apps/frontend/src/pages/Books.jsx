import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { db } from '../config/firebase'
import { ref, get } from 'firebase/database'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../components/Notification'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../App.css'
import { optimizeCloudinaryUrl } from '../utils/cloudinary'

function Books() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [activeCategory, setActiveCategory] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const { toast, showConfirm } = useNotification()

    // Query for Books
    const { data: books = [], isLoading: loadingBooks, refetch: refetchBooks } = useQuery({
        queryKey: ['books'],
        queryFn: async () => {
            const booksRef = ref(db, 'books')
            const snapshot = await get(booksRef)

            if (!snapshot.exists()) return []

            const booksData = snapshot.val()
            const bookTagsRef = ref(db, 'book_tags')
            const bookTagsSnap = await get(bookTagsRef)
            const bookTagsData = bookTagsSnap.exists() ? bookTagsSnap.val() : {}

            const tagsRef = ref(db, 'tags')
            const tagsSnap = await get(tagsRef)
            const tagsData = tagsSnap.exists() ? tagsSnap.val() : {}

            return Object.entries(booksData).map(([id, book]) => {
                // Get tags for this book
                const bookTagIds = bookTagsData[id] ? Object.keys(bookTagsData[id]) : []
                const tags = bookTagIds
                    .map(tagId => tagsData[tagId] ? { id: tagId, ...tagsData[tagId] } : null)
                    .filter(Boolean)

                return {
                    ...book,
                    id,
                    tags,
                    book_tags: bookTagIds.map(tagId => ({
                        tag_id: tagId,
                        tags: tagsData[tagId] ? { id: tagId, ...tagsData[tagId] } : null
                    }))
                }
            })
        }
    })

    // Query for Categories (Tags)
    const { data: categories = [], isLoading: loadingCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const tagsRef = ref(db, 'tags')
            const snapshot = await get(tagsRef)

            if (!snapshot.exists()) return []

            const data = snapshot.val()
            return Object.entries(data)
                .map(([id, tag]) => ({ id, ...tag }))
                .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        }
    })

    const loading = loadingBooks || loadingCategories;

    const handleDelete = async (e, bookId) => {
        e.preventDefault()
        const confirmed = await showConfirm({
            title: 'Hapus Buku',
            message: 'Apakah Anda yakin ingin menghapus buku ini?',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
            type: 'error'
        })
        if (!confirmed) return

        try {
            const { ref: dbRef, remove } = await import('firebase/database')
            await remove(dbRef(db, `books/${bookId}`))
            // Also remove book_tags for this book
            await remove(dbRef(db, `book_tags/${bookId}`))

            toast.success('Buku berhasil dihapus')
            refetchBooks()
        } catch (error) {
            console.error("Error deleting book:", error)
            toast.error('Gagal menghapus buku: ' + error.message)
        }
    }

    const [visibleCount, setVisibleCount] = useState(10)

    // Reset pagination when filter changes
    useEffect(() => {
        setVisibleCount(10)
    }, [activeCategory, searchQuery])

    const filteredBooks = books.filter(book => {
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
                    <div className="categories-wrapper">
                        <div className="categories-scroll">
                            {/* Semua Button */}
                            <button
                                className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
                                onClick={() => setActiveCategory('all')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                                Semua Buku
                            </button>

                            {/* Categories from Database */}
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    className={`category-btn ${activeCategory === cat.name ? 'active' : ''}`}
                                    onClick={() => setActiveCategory(cat.name)}
                                >
                                    <span 
                                        className="category-dot" 
                                        style={{ background: cat.color || 'var(--secondary)' }}
                                    ></span>
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                        {/* Reset Filter Button - Only show if not 'all' */}
                        {activeCategory !== 'all' && (
                            <button 
                                className="reset-filter-btn"
                                onClick={() => setActiveCategory('all')}
                                title="Kembali ke Semua Buku"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                Reset
                            </button>
                        )}
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

                    {loading ? (
                        <div className="books-empty">
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '20px 0' }}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                                    <line x1="12" y1="2" x2="12" y2="6"></line>
                                    <line x1="12" y1="18" x2="12" y2="22"></line>
                                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                                    <line x1="2" y1="12" x2="6" y2="12"></line>
                                    <line x1="18" y1="12" x2="22" y2="12"></line>
                                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
                                </svg>
                                <style>{"@keyframes spin { 100% { transform: rotate(360deg); } }"}</style>
                            </div>
                            <h3>Memuat katalog buku...</h3>
                        </div>
                    ) : filteredBooks.length > 0 ? (
                        <>
                            <div className="books-grid">
                                {displayedBooks.map(book => (
                                    <Link to={`/book/${book.id}`} key={book.id} className="book-card">
                                        <div className="book-cover">
                                            {book.cover ? (
                                                <img
                                                    src={optimizeCloudinaryUrl(book.cover, { width: 400 })}
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
                            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                                    <line x1="10" y1="10" x2="14" y2="14"></line>
                                    <line x1="14" y1="10" x2="10" y2="14"></line>
                                </svg>
                            </div>
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


