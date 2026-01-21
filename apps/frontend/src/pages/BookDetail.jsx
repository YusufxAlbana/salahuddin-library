import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../config/supabase'
import { useAuth } from '../context/AuthContext'
import { categories } from '../data/initialBooks'
import { useNotification } from '../components/Notification'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../App.css'

function BookDetail() {
    const { bookId } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [book, setBook] = useState(null)
    const [loading, setLoading] = useState(true)
    const { toast, showConfirm } = useNotification()

    useEffect(() => {
        const fetchBook = async () => {
            try {
                const { data, error } = await supabase
                    .from('books')
                    .select('*')
                    .eq('id', bookId)
                    .single()

                if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
                    console.error("Error fetching book:", error)
                }

                if (data) {
                    setBook(data)
                } else {
                    setBook(null)
                }
            } catch (error) {
                console.error("Error fetching book:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchBook()
    }, [bookId])

    const handleBorrow = async () => {
        if (!user) {
            toast.warning('Silakan login terlebih dahulu untuk meminjam buku.')
            navigate('/login')
            return
        }

        if (user.role === 'admin') {
            toast.warning('Admin tidak dapat meminjam buku.')
            return
        }

        // Check member status
        if (!user.isMember) {
            toast.warning('Maaf, hanya Member Verified yang dapat meminjam buku. Silakan lengkapi verifikasi KTP dan pembayaran di halaman profil Anda.')
            navigate('/profile')
            return
        }

        if (book.stock <= 0) {
            toast.error('Maaf, stok buku ini sedang habis.')
            return
        }

        const confirmed = await showConfirm({
            title: 'Konfirmasi Peminjaman',
            message: `Apakah Anda yakin ingin meminjam buku "${book.title}" durasi 5 hari?`,
            confirmText: 'Ya, Pinjam',
            cancelText: 'Batal',
            type: 'info'
        })
        if (!confirmed) return

        try {
            const { data, error } = await supabase.rpc('borrow_book', {
                p_book_id: parseInt(bookId),
                p_user_id: user.id
            })

            if (error) throw error

            if (data.success) {
                toast.success(data.message)
                // Refresh book data to update stock
                const { data: updatedBook } = await supabase
                    .from('books')
                    .select('*')
                    .eq('id', bookId)
                    .single()
                if (updatedBook) setBook(updatedBook)
                navigate('/profile')
            } else {
                toast.warning(data.message)
            }
        } catch (error) {
            console.error('Error borrowing book:', error)
            toast.error('Gagal meminjam buku: ' + error.message)
        }
    }

    const categoryNames = categories.reduce((acc, cat) => {
        acc[cat.id] = cat.name
        return acc
    }, {})

    if (loading) {
        return (
            <div className="app">
                <Navbar />
                <div className="book-not-found">
                    <h1>Loading...</h1>
                </div>
            </div>
        )
    }

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
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                            </svg>
                            <span>No Cover</span>
                        </div>
                    </div>

                    {/* Book Info */}
                    <div className="book-detail-info">
                        <span className="book-detail-category">
                            {categoryNames[book.category] || book.category}
                        </span>
                        <h1>{book.title}</h1>
                        <p className="book-detail-author">oleh <strong>{book.author}</strong></p>

                        <div className="book-detail-meta">
                            {/* Meta items removed */}
                        </div>

                        {/* Stock Info & Borrow Button */}
                        <div className="book-stock-info" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            padding: '1.5rem',
                            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                            borderRadius: '12px',
                            border: '1px solid #d1fae5',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '0.5rem'
                            }}>
                                <span className="stock-label" style={{ fontWeight: '500', color: '#374151' }}>Stok Tersedia:</span>
                                <span className={`stock-value ${book.stock > 0 ? 'in-stock' : 'out-of-stock'}`} style={{
                                    fontWeight: '700',
                                    fontSize: '1.1rem',
                                    color: book.stock > 0 ? '#059669' : '#dc2626',
                                    background: book.stock > 0 ? '#d1fae5' : '#fee2e2',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '6px'
                                }}>
                                    {book.stock > 0 ? `${book.stock} buku` : 'Habis'}
                                </span>
                            </div>

                            {user?.role !== 'admin' && (
                                <>
                                    {/* Non-member warning */}
                                    {user && !user.isMember && (
                                        <div className="member-warning">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                            <span>Anda harus menjadi <strong>Member Verified</strong> untuk meminjam buku</span>
                                        </div>
                                    )}

                                    <button
                                        className="btn btn-primary"
                                        onClick={handleBorrow}
                                        disabled={book.stock <= 0 || (user && !user.isMember)}
                                        style={{
                                            opacity: (book.stock <= 0 || (user && !user.isMember)) ? 0.6 : 1,
                                            cursor: (book.stock <= 0 || (user && !user.isMember)) ? 'not-allowed' : 'pointer',
                                            width: '100%',
                                            padding: '0.875rem 1.5rem',
                                            fontSize: '1rem',
                                            fontWeight: '600'
                                        }}
                                    >
                                        {book.stock <= 0 ? 'Stok Habis' : (user && !user.isMember ? 'Perlu Verifikasi Member' : 'Pinjam Buku Ini')}
                                    </button>
                                </>
                            )}
                        </div>


                    </div>
                </div>
            </div>


            {/* Footer */}
            <Footer />
        </div>
    )
}

export default BookDetail
