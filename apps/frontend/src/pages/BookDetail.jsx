import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../config/supabase'
import { categories } from '../data/initialBooks'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../App.css'

function BookDetail() {
    const { bookId } = useParams()
    const [book, setBook] = useState(null)
    const [loading, setLoading] = useState(true)

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
                                <span className="meta-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                </span>
                                <span>Tahun {book.year}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                </span>
                                <span>{book.pages || '-'} halaman</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"></path><path d="M5 21V7"></path><path d="M19 21V7"></path><path d="M9 2V1"></path><path d="M15 2V1"></path><path d="M5 7h14"></path></svg>
                                </span>
                                <span>{book.publisher || '-'}</span>
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
                            <h3>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'text-bottom' }}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                                Sinopsis
                            </h3>
                            <p>{book.description}</p>
                        </div>

                        <div className="book-detail-isbn">
                            <span>ISBN:</span> {book.isbn}
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
