import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabase'
import { initialBooks } from '../data/initialBooks'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../App.css'

function AdminDashboard() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [stats, setStats] = useState({ books: 0, users: 0, loans: 0 })
    const [loading, setLoading] = useState(true)
    const [isSeeding, setIsSeeding] = useState(false)
    const [showAddBook, setShowAddBook] = useState(false)
    const [existingCategories, setExistingCategories] = useState([])
    const [imageFile, setImageFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const fileInputRef = useRef(null)

    // Form State
    const [newBook, setNewBook] = useState({
        title: '',
        author: '',
        category: 'novel',
        year: new Date().getFullYear(),
        stock: 1,
        cover: 'https://placehold.co/300x400?text=No+Cover'
    })

    useEffect(() => {
        // Redirect if not admin
        if (user && user.role !== 'admin') {
            navigate('/')
            return
        }

        fetchStats()
        // Check for edit mode
        const locationState = window.history.state?.usr
        // React Router v6 state access via useLocation is cleaner but direct access works too
        // Actually, let's use useLocation hook properly
    }, [user, navigate])

    // Handle Edit Mode from navigation
    const { state } = useLocation()
    useEffect(() => {
        if (state?.editBook) {
            const book = state.editBook
            setNewBook({
                title: book.title,
                author: book.author,
                category: book.category,
                year: book.year,
                stock: book.stock,
                cover: book.cover
            })
            setEditingId(book.id)
            setShowAddBook(true)
            // Clear state so refresh doesn't keep edit mode ?? Maybe not needed
        }
    }, [state])

    const fetchStats = async () => {
        try {
            const { count: booksCount } = await supabase.from('books').select('*', { count: 'exact', head: true })
            const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true })

            // Extract unique categories from books
            const { data: booksData } = await supabase.from('books').select('category')
            const categories = new Set(booksData?.map(b => b.category).filter(Boolean))
            setExistingCategories(Array.from(categories).sort())

            setStats({
                books: booksCount || 0,
                users: usersCount || 0,
                loans: 0
            })
        } catch (error) {
            console.error("Error fetching stats:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSeedDatabase = async () => {
        if (!confirm('Apakah Anda yakin ingin mengisi database dengan data buku awal?')) return

        setIsSeeding(true)
        try {
            // Prepare data for Supabase (remove IDs if any, let DB handle it)
            const booksToInsert = initialBooks.map(book => ({
                ...book,
                created_at: new Date()
            }))

            const { error } = await supabase.from('books').insert(booksToInsert)

            if (error) throw error

            alert('Database berhasil diisi dengan ' + initialBooks.length + ' buku!')
            fetchStats()
        } catch (error) {
            console.error("Error seeding:", error)
            alert('Gagal mengisi database: ' + error.message)
        } finally {
            setIsSeeding(false)
        }
    }

    const handleAddBook = async (e) => {
        e.preventDefault()
        setLoading(true)
        setUploading(true)

        try {
            let coverUrl = newBook.cover

            // 1. Upload Image if exists
            if (imageFile) {
                try {
                    const fileExt = imageFile.name.split('.').pop()
                    const fileName = `${Date.now()}_${Math.random()}.${fileExt}`
                    const filePath = `covers/${fileName}`

                    const { error: uploadError } = await supabase.storage
                        .from('book_covers')
                        .upload(filePath, imageFile)

                    if (uploadError) throw uploadError

                    // Get Public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from('book_covers')
                        .getPublicUrl(filePath)

                    coverUrl = publicUrl
                } catch (uploadError) {
                    console.error("Upload failed:", uploadError)
                    throw new Error(`Gagal upload gambar: ${uploadError.message}`)
                }
            }

            if (editingId) {
                // Update Existing Document
                const { error } = await supabase
                    .from('books')
                    .update({
                        ...newBook,
                        cover: coverUrl
                    })
                    .eq('id', editingId)

                if (error) throw error
                alert('Buku berhasil diperbarui!')
            } else {
                // Add Document
                const { error } = await supabase
                    .from('books')
                    .insert([{
                        ...newBook,
                        cover: coverUrl,
                        created_at: new Date()
                    }])

                if (error) throw error
                alert('Buku berhasil ditambahkan!')
            }

            setShowAddBook(false)
            setImageFile(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
            setEditingId(null)
            setNewBook({
                title: '',
                author: '',
                category: 'novel',
                year: new Date().getFullYear(),
                stock: 1,
                cover: 'https://placehold.co/300x400?text=No+Cover'
            })
            fetchStats()
        } catch (error) {
            console.error("Error submitting book:", error)
            alert(error.message)
        } finally {
            setLoading(false)
            setUploading(false)
        }
    }

    if (!user || user.role !== 'admin') {
        return <div className="loading-screen">Loading Admin Access...</div>
    }

    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <img src="/images/logo.svg" alt="Logo" className="sidebar-logo" />
                    <span className="sidebar-brand">Salahuddin Lib</span>
                </div>

                <nav className="sidebar-menu">
                    <Link to="/admin" className="sidebar-link active">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        Dashboard
                    </Link>
                    <Link to="/books" className="sidebar-link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                        Buku
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="user-avatar-small">
                            {user.name.charAt(0)}
                        </div>
                        <div className="user-info-small">
                            <h4>{user.name.split(' ')[0]}</h4>
                            <p>Administrator</p>
                        </div>
                    </div>
                    <button onClick={logout} className="btn-logout-sidebar">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        Keluar
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="admin-main-content">
                <section className="admin-section">
                    <div className="section-container">
                        <div className="admin-header">
                            <div>
                                <h1>Dashboard Admin</h1>
                                <p>Selamat datang, <strong>{user.name}</strong></p>
                            </div>
                            <div className="admin-badge">
                                <span className="badge-dot"></span> Admin Access
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="admin-stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon-wrapper">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                                </div>
                                <div className="stat-info">
                                    <h3>Total Buku</h3>
                                    <p className="stat-value">{stats.books}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon-wrapper">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                </div>
                                <div className="stat-info">
                                    <h3>Total Anggota</h3>
                                    <p className="stat-value">{stats.users}</p>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon-wrapper">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                </div>
                                <div className="stat-info">
                                    <h3>Peminjaman Aktif</h3>
                                    <p className="stat-value">{stats.loans}</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="admin-actions">
                            <button className="btn btn-primary" onClick={() => setShowAddBook(!showAddBook)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                {showAddBook ? 'Tutup Form' : 'Tambah Buku Baru'}
                            </button>

                            <button className="btn btn-outline" onClick={handleSeedDatabase} disabled={isSeeding}>
                                {isSeeding ? (
                                    <>
                                        <span className="spinner-small"></span> Memproses...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                        Reset / Isi Database Buku
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Add Book Form */}
                        {showAddBook && (
                            <div className="admin-form-card">
                                <h3>{editingId ? 'Edit Buku' : 'Detail Buku Baru'}</h3>
                                <form onSubmit={handleAddBook} className="admin-form">
                                    <div className="form-group">
                                        <label>Judul Buku</label>
                                        <input
                                            type="text"
                                            value={newBook.title}
                                            onChange={e => setNewBook({ ...newBook, title: e.target.value })}
                                            required
                                            placeholder="Contoh: Laskar Pelangi"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Penulis</label>
                                        <input
                                            type="text"
                                            value={newBook.author}
                                            onChange={e => setNewBook({ ...newBook, author: e.target.value })}
                                            required
                                            placeholder="Nama Penulis"
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Kategori</label>
                                            <input
                                                type="text"
                                                list="category-options"
                                                value={newBook.category}
                                                onChange={e => setNewBook({ ...newBook, category: e.target.value })}
                                                placeholder="Pilih atau ketik kategori baru..."
                                                required
                                            />
                                            <datalist id="category-options">
                                                {/* Default Categories */}
                                                <option value="novel">Novel</option>
                                                <option value="education">Pendidikan</option>
                                                <option value="history">Sejarah</option>
                                                <option value="islamic">Islam</option>

                                                {/* Dynamic Categories from DB */}
                                                {existingCategories.map(cat => (
                                                    <option key={cat} value={cat} />
                                                ))}
                                            </datalist>
                                        </div>
                                        <div className="form-group">
                                            <label>Tahun Terbit</label>
                                            <input
                                                type="number"
                                                value={newBook.year}
                                                onChange={e => setNewBook({ ...newBook, year: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Stok Awal</label>
                                        <input
                                            type="number"
                                            value={newBook.stock}
                                            onChange={e => setNewBook({ ...newBook, stock: e.target.value })}
                                            min="0"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Cover Buku (Gambar)</label>
                                        <div className="file-input-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={fileInputRef}
                                                onChange={(e) => {
                                                    if (e.target.files[0]) setImageFile(e.target.files[0])
                                                }}
                                                className="form-control"
                                            />
                                            {imageFile && (
                                                <small style={{ color: 'green' }}>File terpilih: {imageFile.name}</small>
                                            )}
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-secondary" style={{ width: '100%' }} disabled={uploading}>
                                        {uploading ? (
                                            <>
                                                <span className="spinner-small"></span> Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                                                {editingId ? 'Update Buku' : 'Simpan ke Database'}
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    )
}

export default AdminDashboard
