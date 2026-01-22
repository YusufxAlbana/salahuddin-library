import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabase'
import { initialBooks } from '../data/initialBooks'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useNotification } from '../components/Notification'
import '../App.css'

function AdminDashboard() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('dashboard') // dashboard, books, users
    const [usersList, setUsersList] = useState([])
    const { toast, showConfirm } = useNotification()

    const [stats, setStats] = useState({ books: 0, users: 0, loans: 0 })
    const [loading, setLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Books Management State
    const [booksList, setBooksList] = useState([])
    const [availableTags, setAvailableTags] = useState([])
    const [showAddBook, setShowAddBook] = useState(false)
    const [editingBook, setEditingBook] = useState(null)
    const [bookForm, setBookForm] = useState({
        title: '', author: '', year: new Date().getFullYear(), stock: 1, cover: '', tags: []
    })

    const fetchStats = async () => {
        try {
            const { count: booksCount } = await supabase.from('books').select('*', { count: 'exact', head: true })
            const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true })
            // Query active loans (status = 'borrowed')
            const { count: loansCount } = await supabase.from('loans').select('*', { count: 'exact', head: true }).eq('status', 'borrowed')
            setStats({ books: booksCount || 0, users: usersCount || 0, loans: loansCount || 0 })
        } catch (e) { console.error(e) }
        finally { setLoading(false) }
    }

    const fetchBooks = async () => {
        try {
            const { data, error } = await supabase
                .from('books')
                .select('*, book_tags(tag_id, tags(id, name, color))')
                .order('created_at', { ascending: false })
            if (!error) setBooksList(data || [])
        } catch (e) { console.error(e) }
    }

    const fetchAvailableTags = async () => {
        const { data } = await supabase.from('tags').select('*').order('name')
        setAvailableTags(data || [])
    }

    const handleSubmitBook = async (e) => {
        e.preventDefault()
        try {
            if (bookForm.tags.length === 0) {
                toast.error('Setiap buku wajib memiliki minimal 1 tag/kategori!')
                return
            }

            const bookData = {
                title: bookForm.title,
                author: bookForm.author,
                // year: bookForm.year, // Removed
                stock: bookForm.stock,
                cover: bookForm.cover
                // category is deprecated, we use tags now
            }

            let bookId = editingBook?.id

            if (editingBook) {
                // Update existing book
                const { error } = await supabase.from('books').update(bookData).eq('id', bookId)
                if (error) throw error

                // Update tags: Delete all existing and re-insert
                await supabase.from('book_tags').delete().eq('book_id', bookId)
            } else {
                // Insert new book
                const { data, error } = await supabase.from('books').insert([bookData]).select()
                if (error) throw error
                bookId = data[0].id
            }

            // Insert new tags
            if (bookForm.tags && bookForm.tags.length > 0) {
                const tagInserts = bookForm.tags.map(tagId => ({
                    book_id: bookId,
                    tag_id: tagId
                }))
                const { error: tagError } = await supabase.from('book_tags').insert(tagInserts)
                if (tagError) throw tagError
            }

            toast.success(editingBook ? 'Buku berhasil diupdate!' : 'Buku berhasil ditambahkan!')

            setShowAddBook(false)
            setEditingBook(null)
            setBookForm({ title: '', author: '', year: new Date().getFullYear(), stock: 1, cover: '', tags: [] })
            fetchBooks()
            fetchStats()
        } catch (error) {
            toast.error('Error: ' + error.message)
        }
    }

    const handleEditBook = (book) => {
        setEditingBook(book)
        const currentTags = book.book_tags?.map(bt => bt.tag_id) || []
        setBookForm({
            title: book.title || '',
            author: book.author || '',
            year: book.year || new Date().getFullYear(),
            stock: book.stock || 0,
            cover: book.cover || '',
            tags: currentTags
        })
        setShowAddBook(true)
    }

    const handleDeleteBook = async (id) => {
        const confirmed = await showConfirm({
            title: 'Hapus Buku',
            message: 'Yakin ingin menghapus buku ini? Tindakan ini tidak dapat dibatalkan.',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
            type: 'error'
        })
        if (!confirmed) return

        try {
            const { error } = await supabase.from('books').delete().eq('id', id)
            if (error) throw error
            toast.success('Buku berhasil dihapus!')
            fetchBooks()
            fetchStats()
        } catch (error) {
            toast.error('Error: ' + error.message)
        }
    }

    useEffect(() => {
        fetchStats()
        if (activeTab === 'users') fetchUsers()
        if (activeTab === 'books') {
            fetchBooks()
            fetchAvailableTags()
        }
    }, [activeTab])

    // Lock body scroll when sidebar is open
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }
        return () => {
            document.body.style.overflow = 'auto'
        }
    }, [sidebarOpen])

    // Protect Admin Route - Redirect to Home if not admin
    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/', { replace: true })
        }
    }, [user, navigate])

    // If not admin, do not render anything while redirecting
    if (!user || user.role !== 'admin') {
        return null
    }

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .neq('role', 'admin') // Exclude admin users
                .order('join_date', { ascending: false })

            if (error) throw error
            setUsersList(data || [])
        } catch (error) {
            console.error("Error fetching users:", error)
        } finally {
            setLoading(false)
        }
    }

    // ... (existing functions: fetchStats, handleSeedDatabase, handleAddBook)

    return (
        <div className="admin-layout">
            {/* Mobile Menu Toggle */}
            <button
                className="mobile-menu-toggle"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle menu"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {sidebarOpen ? (
                        <><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></>
                    ) : (
                        <><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></>
                    )}
                </svg>
            </button>
            <button
                className="mobile-menu-close"
                style={{
                    display: sidebarOpen ? 'flex' : 'none',
                    position: 'fixed',
                    top: '1rem',
                    right: '1rem',
                    zIndex: 1100,
                    background: '#ef4444',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                }}
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>

            {/* Sidebar Overlay */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <img src="/images/logo.svg" alt="Logo" className="sidebar-logo" />
                    <span className="sidebar-brand">Salahuddin Lib</span>
                </div>

                <nav className="sidebar-menu">
                    <button onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }} className={`sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        Dashboard
                    </button>
                    <button onClick={() => { setActiveTab('books'); setSidebarOpen(false); }} className={`sidebar-link ${activeTab === 'books' ? 'active' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                        Buku
                    </button>
                    <button onClick={() => { setActiveTab('users'); setSidebarOpen(false); }} className={`sidebar-link ${activeTab === 'users' ? 'active' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                        Pengguna
                    </button>
                    <button onClick={() => { setActiveTab('loans'); setSidebarOpen(false); }} className={`sidebar-link ${activeTab === 'loans' ? 'active' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                        Peminjaman
                    </button>
                    <button onClick={() => { setActiveTab('tags'); setSidebarOpen(false); }} className={`sidebar-link ${activeTab === 'tags' ? 'active' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                        Tags
                    </button>
                    <button onClick={() => { setActiveTab('donations'); setSidebarOpen(false); }} className={`sidebar-link ${activeTab === 'donations' ? 'active' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        Donasi Buku
                    </button>
                    <button onClick={() => { setActiveTab('ktp'); setSidebarOpen(false); }} className={`sidebar-link ${activeTab === 'ktp' ? 'active' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        Verifikasi KTP
                    </button>
                    <button onClick={() => { setActiveTab('feedback'); setSidebarOpen(false); }} className={`sidebar-link ${activeTab === 'feedback' ? 'active' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        Feedback
                    </button>
                    <button onClick={() => { setActiveTab('info'); setSidebarOpen(false); }} className={`sidebar-link ${activeTab === 'info' ? 'active' : ''}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                        Informasi
                    </button>
                </nav>

                {/* Sidebar Footer */}
                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="user-avatar-small">
                            <svg viewBox="0 0 212 212" width="100%" height="100%">
                                <circle cx="106" cy="106" r="106" fill="#DFE5E7" />
                                <path fill="#FFF" d="M106,57 C90.5,57 78,69.5 78,85 C78,100.5 90.5,113 106,113 C121.5,113 134,100.5 134,85 C134,69.5 121.5,57 106,57 Z" />
                                <path fill="#FFF" d="M173,171 C173,140 143.1,115 106,115 C68.9,115 39,140 39,171 L39,171 Z" />
                            </svg>
                        </div>
                        <div className="user-info-small">
                            <h4>{user?.name?.split(' ')[0] || 'Admin'}</h4>
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
                                <h1>{activeTab === 'dashboard' ? 'Dashboard Admin' : activeTab === 'books' ? 'Manajemen Buku' : activeTab === 'users' ? 'Daftar Pengguna' : activeTab === 'tags' ? 'Manajemen Tags' : activeTab === 'donations' ? 'Donasi Buku' : activeTab === 'ktp' ? 'Verifikasi KTP' : activeTab === 'feedback' ? 'Feedback Pengunjung' : activeTab === 'info' ? 'Panduan Admin' : 'Peminjaman Buku'}</h1>
                                {activeTab === 'dashboard' && (
                                    <p>Selamat datang kembali, {user?.name?.split(' ')[0] || 'Admin'}! Berikut ringkasan perpustakaan hari ini.</p>
                                )}
                            </div>
                        </div>

                        {/* DASHBOARD TAB */}
                        {activeTab === 'dashboard' && (
                            <>
                                <div className="admin-stats-grid">
                                    <div className="stat-card">
                                        <div className="stat-icon-wrapper">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                            </svg>
                                        </div>
                                        <div className="stat-info">
                                            <h3>Total Buku</h3>
                                            <p className="stat-value">{stats.books}</p>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon-wrapper">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="9" cy="7" r="4"></circle>
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                            </svg>
                                        </div>
                                        <div className="stat-info">
                                            <h3>Total Anggota</h3>
                                            <p className="stat-value">{stats.users}</p>
                                        </div>
                                    </div>
                                    <div className="stat-card">
                                        <div className="stat-icon-wrapper">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                                                <polyline points="9 10 12 7 15 10"></polyline>
                                                <line x1="12" y1="7" x2="12" y2="15"></line>
                                            </svg>
                                        </div>
                                        <div className="stat-info">
                                            <h3>Peminjaman Aktif</h3>
                                            <p className="stat-value">{stats.loans}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="admin-quick-actions">
                                    <h3 className="quick-actions-title">Aksi Cepat</h3>
                                    <div className="admin-actions">
                                        <button className="btn btn-primary" onClick={() => setActiveTab('books')}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                            </svg>
                                            Kelola Buku
                                        </button>
                                        <button className="btn btn-outline" onClick={() => setActiveTab('users')}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                                <circle cx="9" cy="7" r="4"></circle>
                                            </svg>
                                            Kelola Pengguna
                                        </button>
                                        <button className="btn btn-outline" onClick={() => setActiveTab('loans')}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                                            </svg>
                                            Lihat Peminjaman
                                        </button>
                                        <button className="btn btn-outline" onClick={() => setActiveTab('ktp')}>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                <polyline points="21 15 16 10 5 21"></polyline>
                                            </svg>
                                            Verifikasi KTP
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* BOOKS TAB */}
                        {activeTab === 'books' && (
                            <>
                                <div style={{ marginBottom: '1rem', width: '100%' }}>
                                    <button className="btn btn-primary w-full-important" onClick={() => { setShowAddBook(!showAddBook); setEditingBook(null) }} style={{ width: '100% !important', maxWidth: '100% !important' }}>
                                        {showAddBook ? 'Tutup Form' : '+ Tambah Buku Baru'}
                                    </button>
                                </div>

                                {/* Add/Edit Book Form */}
                                {showAddBook && (
                                    <div className="admin-form-card" style={{ marginTop: '1rem' }}>
                                        <h3 style={{ marginBottom: '1rem' }}>{editingBook ? 'Edit Buku' : 'Tambah Buku Baru'}</h3>
                                        <form onSubmit={handleSubmitBook} className="admin-form">
                                            <div className="form-group">
                                                <label>Judul Buku</label>
                                                <input type="text" value={bookForm.title} onChange={e => setBookForm({ ...bookForm, title: e.target.value })} required placeholder="Judul buku..." />
                                            </div>
                                            <div className="form-group">
                                                <label>Penulis</label>
                                                <input type="text" value={bookForm.author} onChange={e => setBookForm({ ...bookForm, author: e.target.value })} required placeholder="Nama penulis..." />
                                            </div>
                                            <div className="form-group">
                                                <label>Tags / Kategori</label>
                                                <div style={{
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    padding: '0.5rem',
                                                    maxHeight: '150px',
                                                    overflowY: 'auto',
                                                    background: 'white'
                                                }}>
                                                    {availableTags.length === 0 ? (
                                                        <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: 0 }}>Belum ada tags tersedia.</p>
                                                    ) : (
                                                        availableTags.map(tag => (
                                                            <label key={tag.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0', cursor: 'pointer' }}>
                                                                <input
                                                                    type="checkbox"
                                                                    checked={bookForm.tags.includes(tag.id)}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            if (bookForm.tags.length >= 3) {
                                                                                toast.error('Maksimal 3 tags per buku')
                                                                                return
                                                                            }
                                                                            setBookForm({ ...bookForm, tags: [...bookForm.tags, tag.id] })
                                                                        } else {
                                                                            setBookForm({ ...bookForm, tags: bookForm.tags.filter(id => id !== tag.id) })
                                                                        }
                                                                    }}
                                                                    style={{ width: '16px', height: '16px', accentColor: tag.color }}
                                                                />
                                                                <span style={{ fontSize: '0.9rem', color: '#374151' }}>{tag.name}</span>
                                                                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: tag.color }}></span>
                                                            </label>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>Stok</label>
                                                <input type="number" value={bookForm.stock} onChange={e => setBookForm({ ...bookForm, stock: e.target.value })} min="0" />
                                            </div>
                                            <div className="form-group">
                                                <label>Cover Buku (Upload)</label>
                                                <div
                                                    onClick={() => document.getElementById('cover-upload-input').click()}
                                                    style={{
                                                        border: '2px dashed #d1d5db',
                                                        borderRadius: '12px',
                                                        padding: '1.5rem',
                                                        textAlign: 'center',
                                                        cursor: 'pointer',
                                                        background: bookForm.cover ? '#f0fdf4' : '#fafafa',
                                                        transition: 'all 0.2s',
                                                        position: 'relative'
                                                    }}
                                                    onMouseOver={(e) => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.background = '#f0fdf4' }}
                                                    onMouseOut={(e) => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = bookForm.cover ? '#f0fdf4' : '#fafafa' }}
                                                >
                                                    {bookForm.cover ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center' }}>
                                                            <img src={bookForm.cover} alt="Preview" style={{ width: '50px', height: '70px', objectFit: 'cover', borderRadius: '6px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} />
                                                            <div style={{ textAlign: 'left' }}>
                                                                <p style={{ margin: 0, fontWeight: '600', color: '#10b981', fontSize: '0.9rem' }}>Cover terupload</p>
                                                                <p style={{ margin: '0.25rem 0 0', color: '#6b7280', fontSize: '0.8rem' }}>Klik untuk ganti</p>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" style={{ margin: '0 auto 0.5rem' }}>
                                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                                <polyline points="17 8 12 3 7 8" />
                                                                <line x1="12" y1="3" x2="12" y2="15" />
                                                            </svg>
                                                            <p style={{ margin: 0, fontWeight: '500', color: '#374151', fontSize: '0.9rem' }}>Klik untuk upload cover</p>
                                                            <p style={{ margin: '0.25rem 0 0', color: '#9ca3af', fontSize: '0.8rem' }}>PNG, JPG maksimal 5MB</p>
                                                        </>
                                                    )}
                                                </div>
                                                <input
                                                    id="cover-upload-input"
                                                    type="file"
                                                    accept="image/*"
                                                    style={{ display: 'none' }}
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0]
                                                        if (!file) return

                                                        try {
                                                            const fileExt = file.name.split('.').pop()
                                                            const fileName = `${Math.random()}.${fileExt}`
                                                            const filePath = `${fileName}`

                                                            const { error: uploadError } = await supabase.storage
                                                                .from('book-covers')
                                                                .upload(filePath, file)

                                                            if (uploadError) throw uploadError

                                                            const { data: { publicUrl } } = supabase.storage
                                                                .from('book-covers')
                                                                .getPublicUrl(filePath)

                                                            setBookForm({ ...bookForm, cover: publicUrl })
                                                        } catch (error) {
                                                            toast.error('Gagal upload gambar: ' + error.message)
                                                        }
                                                    }}
                                                />
                                            </div>

                                            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                                                {editingBook ? 'Update Buku' : 'Simpan Buku'}
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {/* Books List Table */}
                                <div className="table-responsive" style={{ marginTop: '1.5rem' }}>
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Cover</th>
                                                <th>Judul</th>
                                                <th>Penulis</th>
                                                <th>Kategori</th>
                                                <th>Stok</th>
                                                <th>Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {booksList.length > 0 ? (
                                                booksList.map(book => (
                                                    <tr key={book.id}>
                                                        <td><img src={book.cover} alt="" style={{ width: '40px', height: '55px', objectFit: 'cover', borderRadius: '4px' }} /></td>
                                                        <td><strong>{book.title}</strong></td>
                                                        <td>{book.author}</td>
                                                        <td>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                                                {book.book_tags && book.book_tags.length > 0 ? (
                                                                    book.book_tags.map(bt => (
                                                                        <span key={bt.tag_id} className="role-badge" style={{
                                                                            background: bt.tags?.color ? `${bt.tags.color}20` : '#e2e8f0', // 20 opacity
                                                                            color: bt.tags?.color || '#64748b',
                                                                            fontSize: '0.75rem',
                                                                            padding: '2px 8px'
                                                                        }}>
                                                                            {bt.tags?.name || 'Unknown'}
                                                                        </span>
                                                                    ))
                                                                ) : (
                                                                    <span style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.85rem' }}>No tags</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>{book.stock}</td>
                                                        <td>
                                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                <button className="btn btn-sm" onClick={() => handleEditBook(book)}>Edit</button>
                                                                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteBook(book.id)} style={{ background: '#dc2626', color: '#fff' }}>Hapus</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr><td colSpan="6" className="text-center">Belum ada buku</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {/* USERS TAB */}
                        {activeTab === 'users' && (
                            <div className="users-list-container">
                                <div className="table-responsive">
                                    <table className="admin-table">
                                        <thead>
                                            <tr>
                                                <th>Nama</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>KTP</th>
                                                <th>Aksi</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {usersList.length > 0 ? (
                                                usersList.map(usr => (
                                                    <tr key={usr.id}>
                                                        <td>
                                                            <div className="user-cell">
                                                                <div className="user-avatar-tiny">
                                                                    <svg viewBox="0 0 212 212" width="100%" height="100%">
                                                                        <circle cx="106" cy="106" r="106" fill="#DFE5E7" />
                                                                        <path fill="#FFF" d="M106,57 C90.5,57 78,69.5 78,85 C78,100.5 90.5,113 106,113 C121.5,113 134,100.5 134,85 C134,69.5 121.5,57 106,57 Z" />
                                                                        <path fill="#FFF" d="M173,171 C173,140 143.1,115 106,115 C68.9,115 39,140 39,171 L39,171 Z" />
                                                                    </svg>
                                                                </div>
                                                                <span>{usr.name}</span>
                                                            </div>
                                                        </td>
                                                        <td>{usr.email}</td>
                                                        <td>
                                                            <span className={`role-badge ${usr.member_status === 'verified' ? 'member' : 'non-member'}`}>
                                                                {usr.member_status === 'verified' ? 'Member' : 'Non-Member'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {usr.ktp_url ? (
                                                                <img
                                                                    src={usr.ktp_url}
                                                                    alt="KTP"
                                                                    style={{
                                                                        width: '60px',
                                                                        height: '40px',
                                                                        objectFit: 'cover',
                                                                        borderRadius: '4px',
                                                                        cursor: 'pointer',
                                                                        border: '1px solid #e5e7eb'
                                                                    }}
                                                                    onClick={() => window.open(usr.ktp_url, '_blank')}
                                                                    title="Klik untuk lihat KTP"
                                                                />
                                                            ) : (
                                                                <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Belum upload</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {usr.member_status !== 'verified' ? (
                                                                <button
                                                                    className="btn btn-sm"
                                                                    style={{ background: '#10b981', color: '#fff' }}
                                                                    onClick={async () => {
                                                                        const confirmed = await showConfirm({
                                                                            title: 'Upgrade ke Member',
                                                                            message: `Yakin ingin menjadikan "${usr.name}" sebagai Member? Pembayaran COD sudah dikonfirmasi?`,
                                                                            confirmText: 'Ya, Jadikan Member',
                                                                            cancelText: 'Batal',
                                                                            type: 'success'
                                                                        })
                                                                        if (!confirmed) return

                                                                        try {
                                                                            const { error } = await supabase
                                                                                .from('users')
                                                                                .update({ member_status: 'verified' })
                                                                                .eq('id', usr.id)

                                                                            if (error) throw error
                                                                            toast.success(`${usr.name} berhasil dijadikan Member!`)
                                                                            fetchUsers()
                                                                        } catch (error) {
                                                                            toast.error('Gagal: ' + error.message)
                                                                        }
                                                                    }}
                                                                >
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                                                    </svg>
                                                                    Jadikan Member
                                                                </button>
                                                            ) : (
                                                                <span style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: '600' }}>
                                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '4px', verticalAlign: 'middle' }}>
                                                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                                                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                                                    </svg>
                                                                    Sudah Member
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center">Belum ada pengguna terdaftar</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* LOANS TAB */}
                        {activeTab === 'loans' && (
                            <LoansTable supabase={supabase} />
                        )}

                        {/* TAGS TAB */}
                        {activeTab === 'tags' && (
                            <TagsManagement supabase={supabase} />
                        )}

                        {/* DONATIONS TAB */}
                        {activeTab === 'donations' && (
                            <DonationsTable supabase={supabase} />
                        )}

                        {activeTab === 'ktp' && (
                            <KtpVerificationTable supabase={supabase} />
                        )}

                        {/* FEEDBACK TAB */}
                        {activeTab === 'feedback' && (
                            <FeedbackTable supabase={supabase} />
                        )}

                        {/* INFO TAB */}
                        {activeTab === 'info' && (
                            <AdminInfoPage />
                        )}
                    </div>
                </section>
            </main>
        </div>
    )
}

// Sub-component for Loans Table
function LoansTable({ supabase }) {
    const [loans, setLoans] = useState([])
    const [loading, setLoading] = useState(true)
    const { toast, showConfirm } = useNotification()

    useEffect(() => {
        fetchLoans()
    }, [])

    const fetchLoans = async () => {
        try {
            setLoading(true)
            // First get loans with book info
            const { data: loansData, error: loansError } = await supabase
                .from('loans')
                .select(`
                    id, 
                    user_id,
                    book_id,
                    borrow_date, 
                    due_date, 
                    status, 
                    renewal_count,
                    books(title, cover)
                `)
                .eq('status', 'borrowed')
                .order('due_date', { ascending: true })

            if (loansError) throw loansError

            // Then get user info for each loan
            const loansWithUsers = await Promise.all(
                (loansData || []).map(async (loan) => {
                    const { data: userData } = await supabase
                        .from('users')
                        .select('name, email')
                        .eq('id', loan.user_id)
                        .single()
                    return { ...loan, users: userData }
                })
            )

            setLoans(loansWithUsers)
        } catch (error) {
            console.error("Error fetching loans:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleExtendLoan = async (loan) => {
        const confirm = await showConfirm({
            title: 'Perpanjang Peminjaman',
            message: `Perpanjang buku "${loan.books?.title}" untuk user "${loan.users?.name}" selama 5 hari?`,
            confirmText: 'Ya, Perpanjang',
            type: 'info'
        })
        if (!confirm) return

        try {
            const currentCount = loan.renewal_count || 0

            // Admin can override limits, but let's warn if > 3
            if (currentCount >= 3) {
                const proceed = await showConfirm({
                    title: 'Batas Maksimal Tercapai',
                    message: `User ini sudah memperpanjang 3 kali. Tetap lanjutkan?`,
                    confirmText: 'Lanjutkan',
                    type: 'warning'
                })
                if (!proceed) return
            }

            const currentDue = new Date(loan.due_date)
            const newDue = new Date(currentDue)
            newDue.setDate(newDue.getDate() + 5)

            const { error } = await supabase
                .from('loans')
                .update({
                    due_date: newDue.toISOString(),
                    renewal_count: currentCount + 1
                })
                .eq('id', loan.id)

            if (error) throw error
            toast.success('Berhasil diperpanjang 5 hari.')
            fetchLoans()
        } catch (err) {
            toast.error('Gagal: ' + err.message)
        }
    }

    const handleReturnBook = async (loan) => {
        const confirm = await showConfirm({
            title: 'Kembalikan Buku',
            message: `Tandai buku "${loan.books?.title}" dari user "${loan.users?.name}" sebagai SUDAH DIKEMBALIKAN? Stok buku akan bertambah otomatis.`,
            confirmText: 'Ya, Kembalikan',
            type: 'success'
        })
        if (!confirm) return

        try {
            // 1. Update loan status
            const { error: loanError } = await supabase
                .from('loans')
                .update({
                    status: 'returned',
                    return_date: new Date().toISOString()
                })
                .eq('id', loan.id)

            if (loanError) throw loanError

            // 2. Increment book stock
            // We need to fetch current stock first or use an RPC if concurrency is high, but simple read-update is fine here for single admin
            const { data: bookData } = await supabase.from('books').select('stock').eq('id', loan.book_id).single()
            if (bookData) {
                await supabase.from('books').update({ stock: bookData.stock + 1 }).eq('id', loan.book_id)
            }

            toast.success('Buku berhasil dikembalikan.')
            fetchLoans()
        } catch (err) {
            toast.error('Gagal: ' + err.message)
        }
    }

    // Since we don't have a dedicated fine table yet based on previous file reads, we'll simulate validation
    // Maybe just extend the loan to today + 1 (remove overdue status) or just mark it returned.
    // The user said "Validasi kalau dendanya sudah dibayar".
    // Best approach: If overdue, show a "Bayar Denda" button that marks it paid/returned or just a visual indicator.
    // Let's implement a "Selesaikan Denda" that effectively returns the book and maybe logs it (for now just Return is enough, but I'll add a specific fine action if needed).
    // ACTUALLY, "Validasi Denda" might mean just acknowledging it so they can return it.
    // Let's make "Return" handle it. If overdue, warn about fine.

    // Helper to calculate fine
    const calculateFine = (dueDateStr) => {
        const due = new Date(dueDateStr)
        const today = new Date()
        due.setHours(0, 0, 0, 0)
        today.setHours(0, 0, 0, 0)
        const diff = today - due
        const daysOver = Math.ceil(diff / (1000 * 60 * 60 * 24))
        if (daysOver > 0) return daysOver * 5000
        return 0
    }

    return (
        <div className="loans-table-container">
            <h3 style={{ marginBottom: '1rem' }}>Peminjaman Aktif ({loans.length})</h3>
            <div className="table-responsive">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Buku</th>
                            <th>Tenggat</th>
                            <th>Status / Denda</th>
                            <th>Perpanjang</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loans.length > 0 ? (
                            loans.map(loan => {
                                const fine = calculateFine(loan.due_date)
                                const isOverdue = fine > 0
                                const renewalCount = loan.renewal_count || 0

                                return (
                                    <tr key={loan.id} style={{ background: isOverdue ? '#fff1f2' : 'white' }}>
                                        <td>
                                            <div style={{ fontWeight: 500 }}>{loan.users?.name || 'Unknown'}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>{loan.users?.email}</div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {loan.books?.cover && <img src={loan.books.cover} style={{ width: 30, height: 45, borderRadius: 4, objectFit: 'cover' }} />}
                                                <span title={loan.books?.title} style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {loan.books?.title}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            {new Date(loan.due_date).toLocaleDateString('id-ID')}
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                                {renewalCount}x Perpanjang
                                            </div>
                                        </td>
                                        <td>
                                            {isOverdue ? (
                                                <span className="role-badge" style={{ background: '#fee2e2', color: '#991b1b' }}>
                                                    Telat - Rp {fine.toLocaleString()}
                                                </span>
                                            ) : (
                                                <span className="role-badge" style={{ background: '#dcfce7', color: '#166534' }}>
                                                    Dipinjam
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm"
                                                onClick={() => handleExtendLoan(loan)}
                                                disabled={isOverdue} // Cannot extend if overdue usually, but admin might override? Let's disable to force return/fine handling first.
                                                style={{
                                                    background: isOverdue ? '#e5e7eb' : '#3b82f6',
                                                    color: isOverdue ? '#9ca3af' : 'white',
                                                    cursor: isOverdue ? 'not-allowed' : 'pointer'
                                                }}
                                            >
                                                +5 Hari
                                            </button>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className="btn btn-sm"
                                                    onClick={() => handleReturnBook(loan)}
                                                    style={{ background: '#10b981', color: 'white' }}
                                                >
                                                    {isOverdue ? 'Selesai & Lunas' : 'Kembalikan'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })
                        ) : (
                            <tr><td colSpan="6" className="text-center">Tidak ada peminjaman aktif</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// Sub-component for KTP Verification Table
function KtpVerificationTable({ supabase }) {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [previewKtp, setPreviewKtp] = useState(null)
    const { toast, showConfirm } = useNotification()

    useEffect(() => {
        fetchPendingUsers()
    }, [])

    const fetchPendingUsers = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('member_status', 'pending_approval')
                .order('join_date', { ascending: false })

            if (error) throw error
            setUsers(data || [])
        } catch (error) {
            console.error("Error fetching pending users:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (userId) => {
        const confirmed = await showConfirm({
            title: 'Setujui KTP',
            message: 'Setujui KTP user ini? User akan bisa melakukan pembayaran.',
            confirmText: 'Ya, Setujui',
            cancelText: 'Batal',
            type: 'success'
        })
        if (!confirmed) return

        try {
            const { error } = await supabase
                .from('users')
                .update({ member_status: 'approved' })
                .eq('id', userId)

            if (error) throw error
            toast.success('KTP disetujui! User sekarang bisa melakukan pembayaran.')
            fetchPendingUsers()
        } catch (error) {
            toast.error('Error: ' + error.message)
        }
    }

    const handleReject = async (userId) => {
        const reason = prompt('Alasan penolakan (opsional):')

        try {
            const { error } = await supabase
                .from('users')
                .update({ member_status: 'non-member', ktp_url: null })
                .eq('id', userId)

            if (error) throw error
            toast.warning('KTP ditolak. User harus upload ulang.')
            fetchPendingUsers()
        } catch (error) {
            toast.error('Error: ' + error.message)
        }
    }

    return (
        <div className="table-responsive">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                Daftar KTP Menunggu Verifikasi
            </h3>

            {/* KTP Preview Modal */}
            {previewKtp && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 9999,
                        cursor: 'pointer'
                    }}
                    onClick={() => setPreviewKtp(null)}
                >
                    <img
                        src={previewKtp}
                        alt="KTP Preview"
                        style={{
                            maxWidth: '90%',
                            maxHeight: '90%',
                            borderRadius: '8px',
                            boxShadow: '0 10px 50px rgba(0,0,0,0.5)'
                        }}
                    />
                </div>
            )}

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Tanggal Daftar</th>
                        <th>KTP</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="5" className="text-center">Memuat data...</td></tr>
                    ) : users.length > 0 ? (
                        users.map(usr => (
                            <tr key={usr.id}>
                                <td>
                                    <div className="user-cell">
                                        <div className="user-avatar-tiny">
                                            <svg viewBox="0 0 212 212" width="100%" height="100%">
                                                <circle cx="106" cy="106" r="106" fill="#DFE5E7" />
                                                <path fill="#FFF" d="M106,57 C90.5,57 78,69.5 78,85 C78,100.5 90.5,113 106,113 C121.5,113 134,100.5 134,85 C134,69.5 121.5,57 106,57 Z" />
                                                <path fill="#FFF" d="M173,171 C173,140 143.1,115 106,115 C68.9,115 39,140 39,171 L39,171 Z" />
                                            </svg>
                                        </div>
                                        <span>{usr.name}</span>
                                    </div>
                                </td>
                                <td>{usr.email}</td>
                                <td>{new Date(usr.join_date).toLocaleDateString('id-ID')}</td>
                                <td>
                                    {usr.ktp_url ? (
                                        <button
                                            onClick={() => setPreviewKtp(usr.ktp_url)}
                                            className="btn btn-sm"
                                            style={{ background: '#10b981', color: 'white', fontSize: '0.75rem' }}
                                        >
                                            Lihat KTP
                                        </button>
                                    ) : (
                                        <span style={{ color: '#dc2626' }}>Tidak ada</span>
                                    )}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn btn-sm"
                                            onClick={() => handleApprove(usr.id)}
                                            style={{ background: '#10b981', color: 'white', fontSize: '0.75rem' }}
                                        >
                                            Setujui
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleReject(usr.id)}
                                            style={{ background: '#dc2626', color: 'white', fontSize: '0.75rem' }}
                                        >
                                            Tolak
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="5" className="text-center">Tidak ada KTP yang menunggu verifikasi</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

// Sub-component for Tags Management
function TagsManagement({ supabase }) {
    const [tags, setTags] = useState([])
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(true)
    const [newTagName, setNewTagName] = useState('')
    const [newTagColor, setNewTagColor] = useState('#6b7280')
    const [selectedTag, setSelectedTag] = useState(null)
    const [tagBooks, setTagBooks] = useState([])
    const [showAssignModal, setShowAssignModal] = useState(false)
    const { toast, showConfirm } = useNotification()

    useEffect(() => {
        fetchTags()
        fetchAllBooks()
    }, [])

    const fetchTags = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('tags')
                .select('*')
                .order('name')
            if (error) throw error
            setTags(data || [])
        } catch (error) {
            console.error('Error fetching tags:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchAllBooks = async () => {
        const { data } = await supabase.from('books').select('id, title, cover').order('title')
        setBooks(data || [])
    }

    const fetchBooksForTag = async (tagId) => {
        const { data, error } = await supabase
            .from('book_tags')
            .select('book_id, books(id, title, cover, author)')
            .eq('tag_id', tagId)
        if (!error) {
            setTagBooks(data?.map(bt => bt.books) || [])
        }
    }

    const handleAddTag = async (e) => {
        e.preventDefault()
        if (!newTagName.trim()) return

        try {
            const { error } = await supabase.from('tags').insert([{
                name: newTagName.trim(),
                color: newTagColor
            }])
            if (error) throw error
            setNewTagName('')
            setNewTagColor('#6b7280')
            fetchTags()
        } catch (error) {
            toast.error('Error: ' + error.message)
        }
    }

    const handleDeleteTag = async (tagId) => {
        const confirmed = await showConfirm({
            title: 'Hapus Tag',
            message: 'Hapus tag ini? Buku tidak akan terhapus, hanya tag-nya saja.',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
            type: 'warning'
        })
        if (!confirmed) return
        try {
            const { error } = await supabase.from('tags').delete().eq('id', tagId)
            if (error) throw error
            if (selectedTag?.id === tagId) {
                setSelectedTag(null)
                setTagBooks([])
            }
            fetchTags()
        } catch (error) {
            toast.error('Error: ' + error.message)
        }
    }

    const handleSelectTag = (tag) => {
        setSelectedTag(tag)
        fetchBooksForTag(tag.id)
    }

    const handleAssignBook = async (bookId) => {
        try {
            const { error } = await supabase.from('book_tags').insert([{
                book_id: bookId,
                tag_id: selectedTag.id
            }])
            if (error) throw error
            fetchBooksForTag(selectedTag.id)
            setShowAssignModal(false)
        } catch (error) {
            if (error.code === '23505') {
                toast.warning('Buku sudah ada di tag ini')
            } else {
                toast.error('Error: ' + error.message)
            }
        }
    }

    const handleRemoveBook = async (bookId) => {
        const confirmed = await showConfirm({
            title: 'Keluarkan Buku',
            message: 'Keluarkan buku dari tag ini?',
            confirmText: 'Ya, Keluarkan',
            cancelText: 'Batal',
            type: 'warning'
        })
        if (!confirmed) return
        try {
            const { error } = await supabase
                .from('book_tags')
                .delete()
                .eq('book_id', bookId)
                .eq('tag_id', selectedTag.id)
            if (error) throw error
            fetchBooksForTag(selectedTag.id)
        } catch (error) {
            toast.error('Error: ' + error.message)
        }
    }

    const availableBooks = books.filter(b => !tagBooks.find(tb => tb.id === b.id))

    return (
        <div className="tags-management-container">
            {/* Left Panel - Tags List */}
            <div className="table-responsive" style={{ height: 'fit-content' }}>
                <h3>Daftar Tags</h3>

                {/* Add Tag Form */}
                <form onSubmit={handleAddTag} style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input
                            type="text"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            placeholder="Nama tag baru..."
                            style={{ flex: 1, padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '0.9rem' }}
                        />
                        <input
                            type="color"
                            value={newTagColor}
                            onChange={(e) => setNewTagColor(e.target.value)}
                            style={{ width: '40px', height: '36px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.5rem' }}>
                        Tambah Tag
                    </button>
                </form>

                {/* Tags List */}
                <div style={{ padding: '0.5rem' }}>
                    {loading ? (
                        <p style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Memuat...</p>
                    ) : tags.length === 0 ? (
                        <p style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>Belum ada tag</p>
                    ) : (
                        tags.map(tag => (
                            <div
                                key={tag.id}
                                onClick={() => handleSelectTag(tag)}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.75rem 1rem',
                                    marginBottom: '0.25rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    background: selectedTag?.id === tag.id ? 'rgba(4, 120, 87, 0.1)' : 'transparent',
                                    transition: 'background 0.15s'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: tag.color }}></span>
                                    <span style={{ fontWeight: selectedTag?.id === tag.id ? '600' : '500', color: '#1f2937' }}>{tag.name}</span>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDeleteTag(tag.id) }}
                                    style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '0.25rem' }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Right Panel - Books in Tag */}
            <div className="table-responsive">
                {selectedTag ? (
                    <>
                        <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, padding: 0, border: 'none', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: selectedTag.color }}></span>
                                Buku dalam "{selectedTag.name}"
                            </h3>
                            <button className="btn btn-primary" onClick={() => setShowAssignModal(true)} style={{ padding: '0.5rem 1rem' }}>
                                + Tambah Buku
                            </button>
                        </div>

                        {tagBooks.length === 0 ? (
                            <p style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>
                                Belum ada buku di tag ini. Klik "Tambah Buku" untuk menambahkan.
                            </p>
                        ) : (
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Cover</th>
                                        <th>Judul</th>
                                        <th>Penulis</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tagBooks.map(book => (
                                        <tr key={book.id}>
                                            <td>
                                                <img src={book.cover} alt="" style={{ width: '40px', height: '55px' }} />
                                            </td>
                                            <td><strong>{book.title}</strong></td>
                                            <td>{book.author}</td>
                                            <td>
                                                <button className="btn btn-sm btn-danger" onClick={() => handleRemoveBook(book.id)}>
                                                    Keluarkan
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </>
                ) : (
                    <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 1rem' }}>
                            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                            <line x1="7" y1="7" x2="7.01" y2="7"></line>
                        </svg>
                        <p>Pilih tag di sebelah kiri untuk melihat dan mengelola buku</p>
                    </div>
                )}
            </div>

            {/* Assign Book Modal */}
            {showAssignModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setShowAssignModal(false)}>
                    <div style={{
                        background: 'white', borderRadius: '16px', padding: '1.5rem', width: '90%', maxWidth: '500px', maxHeight: '70vh', overflow: 'hidden'
                    }} onClick={(e) => e.stopPropagation()}>
                        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Tambah Buku ke "{selectedTag.name}"</h3>
                        <div style={{ maxHeight: '50vh', overflow: 'auto' }}>
                            {availableBooks.length === 0 ? (
                                <p style={{ textAlign: 'center', color: '#6b7280', padding: '1rem' }}>Semua buku sudah ada di tag ini</p>
                            ) : (
                                availableBooks.map(book => (
                                    <div key={book.id} style={{
                                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem',
                                        borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background 0.15s'
                                    }} onClick={() => handleAssignBook(book.id)}
                                        onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                                        <img src={book.cover} alt="" style={{ width: '35px', height: '48px', borderRadius: '4px', objectFit: 'cover' }} />
                                        <span style={{ fontWeight: '500' }}>{book.title}</span>
                                    </div>
                                ))
                            )}
                        </div>
                        <button onClick={() => setShowAssignModal(false)} style={{
                            width: '100%', marginTop: '1rem', padding: '0.75rem', border: 'none',
                            background: '#f3f4f6', borderRadius: '8px', cursor: 'pointer', fontWeight: '500'
                        }}>Tutup</button>
                    </div>
                </div>
            )}
        </div>
    )
}

// Sub-component for Donations Table
function DonationsTable({ supabase }) {
    const [donations, setDonations] = useState([])
    const [loading, setLoading] = useState(true)
    const { toast } = useNotification()

    useEffect(() => {
        fetchDonations()
    }, [])

    const fetchDonations = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('donations')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setDonations(data || [])
        } catch (error) {
            console.error("Error fetching donations:", error)
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('donations')
                .update({ status: newStatus })
                .eq('id', id)

            if (error) throw error
            fetchDonations()
        } catch (error) {
            toast.error('Error: ' + error.message)
        }
    }

    const getStatusBadge = (status) => {
        const styles = {
            pending: { bg: '#fef3c7', color: '#92400e' },
            contacted: { bg: '#dbeafe', color: '#1e40af' },
            received: { bg: '#dcfce7', color: '#166534' },
            cancelled: { bg: '#fee2e2', color: '#991b1b' }
        }
        const labels = {
            pending: 'Menunggu',
            contacted: 'Dihubungi',
            received: 'Diterima',
            cancelled: 'Dibatalkan'
        }
        const s = styles[status] || styles.pending
        return (
            <span style={{
                background: s.bg,
                color: s.color,
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: '600'
            }}>
                {labels[status] || status}
            </span>
        )
    }

    return (
        <div className="table-responsive">
            <h3 style={{ marginBottom: '1rem' }}>Daftar Donasi Buku</h3>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Donatur</th>
                        <th>WhatsApp</th>
                        <th>Jumlah</th>
                        <th>Judul Buku</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="6" className="text-center">Memuat data...</td></tr>
                    ) : donations.length > 0 ? (
                        donations.map(donation => (
                            <tr key={donation.id}>
                                <td>
                                    <div style={{ fontWeight: '600', color: '#334155' }}>{donation.donor_name}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                        {new Date(donation.created_at).toLocaleDateString('id-ID')}
                                    </div>
                                </td>
                                <td>
                                    <a href={`https://wa.me/${donation.whatsapp.replace(/^0/, '62')}`}
                                        target="_blank" rel="noopener noreferrer"
                                        style={{ color: '#25D366', fontWeight: '500' }}>
                                        {donation.whatsapp}
                                    </a>
                                </td>
                                <td style={{ fontWeight: '600' }}>{donation.book_count} buku</td>
                                <td>
                                    <div style={{
                                        maxWidth: '200px',
                                        whiteSpace: 'pre-wrap',
                                        fontSize: '0.85rem',
                                        maxHeight: '80px',
                                        overflow: 'auto'
                                    }}>
                                        {donation.book_titles}
                                    </div>
                                </td>
                                <td>{getStatusBadge(donation.status)}</td>
                                <td>
                                    <select
                                        value={donation.status}
                                        onChange={(e) => updateStatus(donation.id, e.target.value)}
                                        style={{
                                            padding: '0.5rem',
                                            borderRadius: '8px',
                                            border: '1px solid #e5e7eb',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="pending">Menunggu</option>
                                        <option value="contacted">Dihubungi</option>
                                        <option value="received">Diterima</option>
                                        <option value="cancelled">Dibatalkan</option>
                                    </select>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="6" className="text-center">Belum ada donasi masuk</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

// Sub-component for Feedback Table
function FeedbackTable({ supabase }) {
    const [feedbacks, setFeedbacks] = useState([])
    const [loading, setLoading] = useState(true)
    const { toast, showConfirm } = useNotification()

    useEffect(() => {
        fetchFeedbacks()
    }, [])

    const fetchFeedbacks = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('feedback')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setFeedbacks(data || [])
        } catch (error) {
            console.error("Error fetching feedbacks:", error)
        } finally {
            setLoading(false)
        }
    }

    const handleMarkAsRead = async (id, currentStatus) => {
        try {
            const { error } = await supabase
                .from('feedback')
                .update({ is_read: !currentStatus })
                .eq('id', id)

            if (error) throw error
            fetchFeedbacks()
        } catch (error) {
            toast.error('Error: ' + error.message)
        }
    }

    const handleDelete = async (id) => {
        const confirmed = await showConfirm({
            title: 'Hapus Feedback',
            message: 'Yakin ingin menghapus feedback ini?',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
            type: 'error'
        })
        if (!confirmed) return

        try {
            const { error } = await supabase
                .from('feedback')
                .delete()
                .eq('id', id)

            if (error) throw error
            toast.success('Feedback berhasil dihapus!')
            fetchFeedbacks()
        } catch (error) {
            toast.error('Error: ' + error.message)
        }
    }

    return (
        <div className="table-responsive">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                Daftar Feedback dari Pengunjung
            </h3>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Nama</th>
                        <th>Email</th>
                        <th>Pesan</th>
                        <th>Tanggal</th>
                        <th>Status</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan="6" className="text-center">Memuat data...</td></tr>
                    ) : feedbacks.length > 0 ? (
                        feedbacks.map(fb => (
                            <tr key={fb.id} style={{ background: fb.is_read ? 'white' : '#f0fdf4' }}>
                                <td style={{ fontWeight: fb.is_read ? '400' : '600' }}>{fb.name}</td>
                                <td>{fb.email}</td>
                                <td style={{ maxWidth: '300px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{fb.message}</td>
                                <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                    {new Date(fb.created_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </td>
                                <td>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        background: fb.is_read ? '#e5e7eb' : '#dcfce7',
                                        color: fb.is_read ? '#6b7280' : '#166534'
                                    }}>
                                        {fb.is_read ? 'Dibaca' : 'Baru'}
                                    </span>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className="btn btn-sm"
                                            onClick={() => handleMarkAsRead(fb.id, fb.is_read)}
                                            style={{ background: fb.is_read ? '#fef3c7' : '#dbeafe', color: fb.is_read ? '#92400e' : '#1e40af' }}
                                        >
                                            {fb.is_read ? 'Belum Dibaca' : 'Tandai Dibaca'}
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete(fb.id)}
                                            style={{ background: '#fee2e2', color: '#dc2626' }}
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr><td colSpan="6" className="text-center">Belum ada feedback masuk</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

// Sub-component for Admin Info Page
function AdminInfoPage() {
    const features = [
        {
            title: 'Dashboard',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
            ),
            description: 'Halaman utama yang menampilkan ringkasan statistik perpustakaan.',
            capabilities: [
                'Melihat total jumlah buku yang tersedia',
                'Melihat total anggota terdaftar',
                'Melihat jumlah peminjaman aktif',
                'Akses cepat ke menu Kelola Buku dan Kelola Pengguna'
            ],
            color: '#10b981'
        },
        {
            title: 'Manajemen Buku',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
            ),
            description: 'Kelola seluruh koleksi buku yang ada di perpustakaan.',
            capabilities: [
                'Menambahkan buku baru dengan upload cover',
                'Mengedit informasi buku yang sudah ada',
                'Menghapus buku dari database',
                'Mengatur stok buku',
                'Wajib memilih minimal 1 tag per buku'
            ],
            color: '#3b82f6'
        },
        {
            title: 'Daftar Pengguna',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
            ),
            description: 'Melihat dan mengelola semua pengguna yang terdaftar.',
            capabilities: [
                'Melihat daftar semua pengguna',
                'Melihat status keanggotaan (Member/Non-Member)',
                'Melihat foto KTP pengguna yang sudah upload',
                'Memantau aktivitas pengguna'
            ],
            color: '#8b5cf6'
        },
        {
            title: 'Peminjaman Buku',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
            ),
            description: 'Mengelola semua peminjaman buku yang sedang aktif.',
            capabilities: [
                'Melihat daftar peminjaman aktif',
                'Melihat informasi peminjam dan buku yang dipinjam',
                'Memantau tanggal jatuh tempo peminjaman',
                'Menandai buku yang sudah dikembalikan'
            ],
            color: '#d4af37'
        },
        {
            title: 'Manajemen Tags',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                </svg>
            ),
            description: 'Membuat dan mengelola tag untuk mengkategorikan buku.',
            capabilities: [
                'Membuat tag baru dengan warna custom',
                'Menghapus tag yang tidak dibutuhkan',
                'Mengelompokkan buku ke dalam tag tertentu',
                'Mengeluarkan buku dari tag'
            ],
            color: '#ec4899'
        },
        {
            title: 'Donasi Buku',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
            ),
            description: 'Menerima dan mengelola donasi buku dari masyarakat.',
            capabilities: [
                'Melihat daftar donasi yang masuk',
                'Menghubungi donatur via WhatsApp',
                'Mengubah status donasi (Menunggu, Dihubungi, Diterima, Dibatalkan)',
                'Melihat jumlah dan judul buku yang akan didonasikan'
            ],
            color: '#ef4444'
        },
        {
            title: 'Verifikasi KTP',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
            ),
            description: 'Memverifikasi KTP pengguna yang ingin menjadi anggota.',
            capabilities: [
                'Melihat daftar KTP yang menunggu verifikasi',
                'Melihat preview foto KTP',
                'Menyetujui atau menolak pendaftaran anggota',
                'Pengguna yang disetujui dapat melanjutkan ke pembayaran'
            ],
            color: '#06b6d4'
        },
        {
            title: 'Feedback Pengunjung',
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            ),
            description: 'Menerima dan mengelola feedback dari pengunjung perpustakaan.',
            capabilities: [
                'Membaca pesan feedback dari pengunjung',
                'Menandai feedback sebagai sudah dibaca',
                'Menghapus feedback yang sudah ditangani',
                'Melihat email pengirim untuk tindak lanjut'
            ],
            color: '#14b8a6'
        }
    ]

    const tips = [
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
            ),
            title: 'Verifikasi KTP Segera',
            desc: 'Usahakan untuk memverifikasi KTP pengguna dalam waktu 1x24 jam agar pengguna dapat segera menjadi anggota.'
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
            ),
            title: 'Pantau Jatuh Tempo',
            desc: 'Periksa halaman Peminjaman secara berkala untuk memantau buku yang mendekati atau melewati jatuh tempo.'
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                </svg>
            ),
            title: 'Respon Feedback',
            desc: 'Tanggapi feedback dari pengunjung untuk meningkatkan kualitas layanan perpustakaan.'
        },
        {
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
            ),
            title: 'Hubungi Donatur',
            desc: 'Segera hubungi donatur buku melalui WhatsApp untuk mengatur pengambilan atau pengiriman.'
        }
    ]

    return (
        <div style={{ padding: '0.5rem 0' }}>
            {/* Welcome Section */}
            <div style={{
                background: 'linear-gradient(135deg, #047857 0%, #059669 100%)',
                borderRadius: '16px',
                padding: '2rem',
                marginBottom: '2rem',
                color: 'white'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Selamat Datang di Panel Admin</h2>
                </div>
                <p style={{ margin: 0, opacity: 0.9, lineHeight: '1.6' }}>
                    Halaman ini berisi panduan lengkap tentang fitur-fitur yang tersedia di panel admin.
                    Gunakan informasi ini untuk memaksimalkan pengelolaan perpustakaan Salahuddin.
                </p>
            </div>

            {/* Features Grid */}
            <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Fitur yang Tersedia
            </h3>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2rem'
            }}>
                {features.map((feature, index) => (
                    <div
                        key={index}
                        style={{
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            transition: 'all 0.2s',
                            cursor: 'default'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
                            e.currentTarget.style.borderColor = feature.color
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.boxShadow = 'none'
                            e.currentTarget.style.borderColor = '#e5e7eb'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: `${feature.color}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: feature.color
                            }}>
                                {feature.icon}
                            </div>
                            <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '600', color: '#1f2937' }}>
                                {feature.title}
                            </h4>
                        </div>
                        <p style={{
                            margin: '0 0 1rem',
                            fontSize: '0.9rem',
                            color: '#64748b',
                            lineHeight: '1.5'
                        }}>
                            {feature.description}
                        </p>
                        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '1rem' }}>
                            <p style={{
                                margin: '0 0 0.5rem',
                                fontSize: '0.8rem',
                                fontWeight: '600',
                                color: '#374151',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                Yang Bisa Dilakukan:
                            </p>
                            <ul style={{
                                margin: 0,
                                padding: '0 0 0 1.25rem',
                                fontSize: '0.85rem',
                                color: '#4b5563',
                                lineHeight: '1.8'
                            }}>
                                {feature.capabilities.map((cap, i) => (
                                    <li key={i}>{cap}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tips Section */}
            <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                color: '#1f2937',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d4af37" strokeWidth="2">
                    <path d="M9 18h6M12 2v1m6.36 1.64l-.71.71M21 12h-1M18.36 18.36l-.71-.71M12 21v-1M6.36 18.36l.71-.71M3 12h1M6.36 5.64l.71.71"></path>
                    <circle cx="12" cy="12" r="4"></circle>
                </svg>
                Tips untuk Admin
            </h3>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                {tips.map((tip, index) => (
                    <div
                        key={index}
                        style={{
                            background: '#fffbeb',
                            border: '1px solid #fde68a',
                            borderRadius: '10px',
                            padding: '1rem 1.25rem',
                            display: 'flex',
                            gap: '0.75rem',
                            alignItems: 'flex-start'
                        }}
                    >
                        <div style={{ color: '#d4af37', flexShrink: 0, marginTop: '2px' }}>
                            {tip.icon}
                        </div>
                        <div>
                            <h5 style={{ margin: '0 0 0.25rem', fontSize: '0.95rem', fontWeight: '600', color: '#92400e' }}>
                                {tip.title}
                            </h5>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#a16207', lineHeight: '1.5' }}>
                                {tip.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Navigation */}
            <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.5rem'
            }}>
                <h4 style={{
                    margin: '0 0 1rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    Navigasi Cepat
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6' }}>
                    Gunakan menu di sebelah kiri untuk berpindah antar halaman. Setiap menu ditandai dengan ikon yang sesuai dengan fungsinya.
                    Jika Anda mengalami kendala atau membutuhkan bantuan, hubungi tim pengembang.
                </p>
            </div>
        </div>
    )
}

export default AdminDashboard
