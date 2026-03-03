import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import 'react-lazy-load-image-component/src/effects/blur.css'
import { supabase } from '../config/supabase'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../components/Notification'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../App.css'

function BookDetail() {
    const { bookId } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const { toast, showConfirm } = useNotification()

    // Query for Book details
    const { data: book = null, isLoading: loading, refetch: fetchBook } = useQuery({
        queryKey: ['book', bookId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('books')
                .select('*')
                .eq('id', bookId)
                .single()

            if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
                console.error("Error fetching book:", error)
            }
            return data || null
        },
        enabled: !!bookId // Only run the query if bookId exists
    })

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
            navigate('/profile?tab=membership')
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
                            <LazyLoadImage
                                src={book.cover}
                                alt={book.title}
                                effect="blur"
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

                    {/* Right Column: Borrowing Call-to-Action Card */}
                    <div className="book-detail-action">
                        {/* Stock Info & Borrow Button */}
                        <div className="book-stock-info" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            padding: '1.5rem',
                            background: '#fff',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.06)'
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

                            {/* Cara Meminjam Buku - Step by Step Guide */}
                            {(() => {
                                const isLoggedIn = !!user
                                const isAdmin = user?.role === 'admin'
                                const memberStatus = user?.memberStatus || user?.member_status || 'non-member'
                                const isMember = !!user?.isMember
                                const showBorrowSteps = !isAdmin && !isMember

                                if (!showBorrowSteps) return null

                                const getStepStatus = (stepNum) => {
                                    if (!isLoggedIn) return stepNum === 1 ? 'current' : 'locked'
                                    if (stepNum === 1) return 'done'
                                    if (stepNum === 2) {
                                        if (memberStatus === 'non-member') return 'current'
                                        return 'done'
                                    }
                                    if (stepNum === 3) {
                                        if (memberStatus === 'pending_approval') return 'current'
                                        if (memberStatus === 'non-member') return 'locked'
                                        return 'done'
                                    }
                                    if (stepNum === 4) {
                                        if (memberStatus === 'approved') return 'current'
                                        if (isMember || memberStatus === 'verified') return 'done'
                                        return 'locked'
                                    }
                                    if (stepNum === 5) {
                                        if (isMember || memberStatus === 'verified') return 'current'
                                        return 'locked'
                                    }
                                    return 'locked'
                                }

                                const steps = [
                                    { num: 1, label: 'Buat Akun / Login', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> },
                                    { num: 2, label: 'Upload Foto KTP', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="4"></line><line x1="8" y1="2" x2="8" y2="4"></line><circle cx="12" cy="11" r="3"></circle><rect x="9" y="16" width="6" height="2" rx="1"></rect></svg> },
                                    { num: 3, label: 'Tunggu Verifikasi Admin', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> },
                                    { num: 4, label: 'Lakukan Pembayaran', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg> },
                                    { num: 5, label: 'Pinjam Buku!', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg> },
                                ]

                                return (
                                    <div style={{
                                        background: '#fff',
                                        borderRadius: '10px',
                                        border: '1px solid #e5e7eb',
                                        padding: '1.25rem',
                                    }}>
                                        <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                            Cara Meminjam Buku
                                        </h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {steps.map((step) => {
                                                const status = getStepStatus(step.num)
                                                return (
                                                    <div key={step.num} style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.75rem',
                                                        padding: '0.5rem 0.75rem',
                                                        borderRadius: '8px',
                                                        background: status === 'current' ? '#fef3c7' : status === 'done' ? '#f0fdf4' : '#f9fafb',
                                                        border: status === 'current' ? '1.5px solid #d4af37' : status === 'done' ? '1px solid #bbf7d0' : '1px solid #e5e7eb',
                                                        opacity: status === 'locked' ? 0.55 : 1,
                                                        transition: 'all 0.2s ease'
                                                    }}>
                                                        <div style={{
                                                            width: '28px',
                                                            height: '28px',
                                                            borderRadius: '50%',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontSize: '0.75rem',
                                                            fontWeight: '700',
                                                            flexShrink: 0,
                                                            background: status === 'done' ? '#10b981' : status === 'current' ? '#d4af37' : '#d1d5db',
                                                            color: '#fff'
                                                        }}>
                                                            {status === 'done' ? (
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                            ) : step.num}
                                                        </div>
                                                        <span style={{
                                                            fontSize: '0.85rem',
                                                            fontWeight: status === 'current' ? '600' : '400',
                                                            color: status === 'done' ? '#047857' : status === 'current' ? '#92400e' : '#6b7280',
                                                            flex: 1
                                                        }}>
                                                            {step.icon} {step.label}
                                                        </span>
                                                        {status === 'current' && (
                                                            <span style={{
                                                                fontSize: '0.7rem',
                                                                fontWeight: '700',
                                                                color: '#92400e',
                                                                background: '#fde68a',
                                                                padding: '2px 8px',
                                                                borderRadius: '999px',
                                                                whiteSpace: 'nowrap'
                                                            }}>
                                                                LANGKAH SAAT INI
                                                            </span>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })()}

                            {user?.role !== 'admin' && (
                                <>
                                    {/* Context-Aware Action Area */}
                                    {!user ? (
                                        /* Not Logged In */
                                        <div style={{
                                            background: '#eff6ff',
                                            border: '1px solid #93c5fd',
                                            borderRadius: '10px',
                                            padding: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem'
                                        }}>
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: 0, fontWeight: '600', color: '#1e40af', fontSize: '0.9rem' }}>Belum punya akun?</p>
                                                <p style={{ margin: '0.25rem 0 0', color: '#3b82f6', fontSize: '0.8rem' }}>Daftar atau login dulu untuk mulai meminjam buku.</p>
                                            </div>
                                        </div>
                                    ) : !user.isMember ? (
                                        /* Logged In but Not a Member */
                                        <div style={{
                                            background: '#fffbeb',
                                            border: '1px solid #fbbf24',
                                            borderRadius: '10px',
                                            padding: '1rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.5rem'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                                <span style={{ fontWeight: '600', color: '#92400e', fontSize: '0.9rem' }}>
                                                    {user.memberStatus === 'pending_approval' || user.member_status === 'pending_approval'
                                                        ? '⏳ KTP Anda sedang diverifikasi oleh Admin'
                                                        : user.memberStatus === 'approved' || user.member_status === 'approved'
                                                            ? '💳 KTP disetujui! Silakan lakukan pembayaran untuk mengaktifkan membership.'
                                                            : '🪪 Anda perlu menjadi Member Verified untuk meminjam buku.'}
                                                </span>
                                            </div>
                                            <Link to="/profile" style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.4rem',
                                                marginTop: '0.25rem',
                                                color: '#b45309',
                                                fontWeight: '600',
                                                textDecoration: 'none',
                                                fontSize: '0.85rem',
                                                background: '#fde68a',
                                                padding: '0.4rem 0.75rem',
                                                borderRadius: '8px',
                                                width: 'fit-content'
                                            }}>
                                                {user.memberStatus === 'pending_approval' || user.member_status === 'pending_approval'
                                                    ? 'Lihat Status di Profil'
                                                    : user.memberStatus === 'approved' || user.member_status === 'approved'
                                                        ? 'Bayar Sekarang di Profil'
                                                        : 'Upload KTP di Halaman Profil'}
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                            </Link>
                                        </div>
                                    ) : null}

                                    {/* Main Borrow Button */}
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => {
                                            if (book.stock <= 0) return
                                            if (user?.role === 'admin') return
                                            if (!user) {
                                                navigate('/login')
                                                return
                                            }
                                            if (!user.isMember) {
                                                navigate('/profile?tab=membership')
                                                return
                                            }
                                            handleBorrow()
                                        }}
                                        disabled={book.stock <= 0 || user?.role === 'admin'}
                                        style={{
                                            opacity: (book.stock <= 0 || user?.role === 'admin') ? 0.5 : 1,
                                            cursor: (book.stock <= 0 || user?.role === 'admin') ? 'not-allowed' : 'pointer',
                                            width: '100%',
                                            padding: '0.875rem 1.5rem',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        {book.stock <= 0 ? (
                                            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg> Stok Habis</>
                                        ) : user?.role === 'admin' ? (
                                            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Admin tidak dapat meminjam</>
                                        ) : !user ? (
                                            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg> Login untuk Meminjam</>
                                        ) : !user.isMember ? (
                                            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> Selesaikan Verifikasi Member</>
                                        ) : (
                                            <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg> Pinjam Buku Ini (5 Hari)</>
                                        )}
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
