import { Link, useNavigate, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../config/supabase'
import { PaymentService } from '../services/payment'
import { useNotification } from '../components/Notification'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import '../App.css'

// Member Upgrade Section Component
// Flow: 1. Upload KTP → 2. Wait Admin Approval → 3. Payment
function MemberUpgradeSection({ userId, currentStatus, userEmail, userName }) {
    // Determine current step based on status
    // 'non-member' → Step 1 (KTP)
    // 'pending_approval' → Step 2 (Waiting)
    // 'approved' → Step 3 (Payment)
    const getStep = () => {
        if (currentStatus === 'approved') return 3
        if (currentStatus === 'pending_approval') return 2
        return 1
    }

    const [step, setStep] = useState(getStep())
    const [ktpFile, setKtpFile] = useState(null)
    const [ktpPreview, setKtpPreview] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [showUploadOptions, setShowUploadOptions] = useState(false)
    const { toast } = useNotification()

    const handleKtpChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError('Ukuran file maksimal 5MB')
                return
            }
            setKtpFile(file)
            const reader = new FileReader()
            reader.onloadend = () => setKtpPreview(reader.result)
            reader.readAsDataURL(file)
            setError('')
        }
    }

    const handleKtpUpload = async () => {
        if (!ktpFile) {
            setError('Silakan pilih foto KTP terlebih dahulu')
            return
        }

        setLoading(true)
        setError('')

        try {
            const fileExt = ktpFile.name.split('.').pop()
            const fileName = `${userId}/ktp.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('ktp-uploads')
                .upload(fileName, ktpFile, { upsert: true })

            if (uploadError) {
                console.error('Upload error:', uploadError)
                setError('Gagal upload KTP. Coba lagi.')
                setLoading(false)
                return
            }

            const { data: { publicUrl } } = supabase.storage
                .from('ktp-uploads')
                .getPublicUrl(fileName)

            await supabase
                .from('users')
                .update({
                    ktp_url: publicUrl,
                    member_status: 'pending_approval' // Wait for admin
                })
                .eq('id', userId)

            toast.success('KTP berhasil diupload! Mohon tunggu persetujuan dari Admin.')
            window.location.reload()
        } catch (err) {
            console.error('KTP upload error:', err)
            setError('Terjadi kesalahan. Coba lagi.')
        } finally {
            setLoading(false)
        }
    }

    // Real Midtrans Payment
    const handlePayment = async () => {
        setLoading(true)
        setError('')

        try {
            // Initiate payment with Midtrans
            await PaymentService.initiatePayment(
                {
                    userId: userId,
                    customerName: userName || 'Member',
                    customerEmail: userEmail || '',
                    customerPhone: '',
                    amount: 50000
                },
                {
                    onSuccess: async (result) => {
                        console.log('Payment success:', result)
                        // Update user status to verified
                        await supabase
                            .from('users')
                            .update({
                                member_status: 'verified',
                                payment_status: 'paid',
                                payment_date: new Date().toISOString()
                            })
                            .eq('id', userId)

                        toast.success('Pembayaran berhasil! Anda sekarang adalah Member Verified.')
                        window.location.reload()
                    },
                    onPending: (result) => {
                        console.log('Payment pending:', result)
                        toast.info('Pembayaran sedang diproses. Silakan selesaikan pembayaran Anda.')
                    },
                    onError: (result) => {
                        console.log('Payment error:', result)
                        setError('Pembayaran gagal. Silakan coba lagi.')
                    },
                    onClose: () => {
                        console.log('Payment popup closed')
                        setLoading(false)
                    }
                }
            )
        } catch (err) {
            console.error('Payment error:', err)
            setError('Pembayaran online tidak tersedia saat ini. Silakan gunakan opsi "Bayar di Tempat (COD)" di bawah.')
            setLoading(false)
        }
    }

    return (
        <div className="profile-section upgrade-section">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b8860b' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                Upgrade ke Member
            </h2>

            <p style={{ marginBottom: '1.5rem', color: '#6b7280' }}>
                Lengkapi verifikasi untuk dapat meminjam buku dari perpustakaan
            </p>

            {/* Progress Steps - 3 Steps */}
            <div className="upgrade-steps">
                <div className={`upgrade-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                    <span className="step-number">{step > 1 ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> : '1'}</span>
                    <span>Upload KTP</span>
                </div>
                <div className="step-connector"></div>
                <div className={`upgrade-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                    <span className="step-number">{step > 2 ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg> : '2'}</span>
                    <span>Verifikasi Admin</span>
                </div>
                <div className="step-connector"></div>
                <div className={`upgrade-step ${step >= 3 ? 'active' : ''}`}>
                    <span className="step-number">3</span>
                    <span>Pembayaran</span>
                </div>
            </div>

            {error && <div className="auth-error" style={{ marginTop: '1rem' }}>{error}</div>}

            {/* Step 1: KTP Upload */}
            {step === 1 && (
                <div className="upgrade-content">
                    {/* Preview Area */}
                    <div
                        className="ktp-upload-area"
                        onClick={() => !ktpPreview && document.getElementById('upgrade-ktp-file').click()}
                        style={{ cursor: ktpPreview ? 'default' : 'pointer' }}
                    >
                        {ktpPreview ? (
                            <div style={{ position: 'relative', width: '100%' }}>
                                <img src={ktpPreview} alt="KTP Preview" className="ktp-preview" />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setKtpFile(null)
                                        setKtpPreview(null)
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        background: 'rgba(220, 38, 38, 0.9)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50%',
                                        width: '32px',
                                        height: '32px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px'
                                    }}
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21 15 16 10 5 21"></polyline>
                                </svg>
                                <p style={{ fontWeight: '600', color: '#047857' }}>Klik untuk pilih foto KTP</p>
                                <small>Format: JPG, PNG (Maks. 5MB)</small>
                            </>
                        )}
                    </div>

                    {/* Hidden file input */}
                    <input
                        type="file"
                        id="upgrade-ktp-file"
                        accept="image/*"
                        onChange={handleKtpChange}
                        style={{ display: 'none' }}
                    />

                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            if (ktpFile) {
                                handleKtpUpload()
                            } else {
                                document.getElementById('upgrade-ktp-file').click()
                            }
                        }}
                        disabled={loading}
                        style={{ marginTop: '1rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    >
                        {loading ? (<><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg> Mengupload...</>) : ktpFile ? 'Kirim KTP' : (<><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg> Pilih File KTP</>)}
                    </button>
                </div>
            )}

            {/* Step 2: Waiting for Admin Approval */}
            {step === 2 && (
                <div className="upgrade-content" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#b8860b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    </div>
                    <h3 style={{ color: '#b8860b', marginBottom: '0.5rem' }}>Menunggu Verifikasi Admin</h3>
                    <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                        KTP Anda sudah diupload dan sedang diverifikasi oleh Admin.<br />
                        Anda akan mendapat notifikasi setelah disetujui.
                    </p>
                    <div style={{
                        background: '#fef3c7',
                        border: '1px solid #d4af37',
                        borderRadius: '8px',
                        padding: '1rem',
                        fontSize: '0.9rem',
                        color: '#92400e'
                    }}>
                        <strong>Tips:</strong> Proses verifikasi biasanya memakan waktu 1x24 jam.
                    </div>
                </div>
            )}

            {/* Step 3: Payment with Midtrans */}
            {step === 3 && (
                <div className="upgrade-content">
                    <div style={{
                        background: '#d1fae5',
                        border: '1px solid #10b981',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                    }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        <span style={{ color: '#047857' }}>KTP Anda telah diverifikasi! Silakan lakukan pembayaran.</span>
                    </div>

                    <div className="payment-summary">
                        <div className="payment-item">
                            <span>Biaya Membership (Seumur Hidup)</span>
                            <span className="payment-amount">Rp 50.000</span>
                        </div>
                    </div>

                    <div style={{
                        background: '#f0f9ff',
                        border: '1px solid #0ea5e9',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1rem'
                    }}>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#0369a1' }}>
                            <strong>Pembayaran via Midtrans</strong><br />
                            Anda dapat membayar menggunakan berbagai metode: Transfer Bank, E-Wallet (GoPay, OVO, DANA), Kartu Kredit, dan lainnya.
                        </p>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handlePayment}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1.1rem',
                            background: 'linear-gradient(135deg, #047857, #10b981)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.75rem'
                        }}
                    >
                        {loading ? (
                            'Memproses...'
                        ) : (
                            <>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                    <line x1="1" y1="10" x2="23" y2="10"></line>
                                </svg>
                                Bayar Online
                            </>
                        )}
                    </button>

                    <div style={{ textAlign: 'center', color: '#9ca3af', margin: '0.5rem 0', fontSize: '0.9rem' }}>atau</div>

                    <button
                        className="btn"
                        onClick={() => {
                            toast.info(
                                'Kamu bisa bayar langsung (COD) dengan mendatangi alamat ini:\n\n' +
                                'Rumah YAAI (Yayasan Alfata Aceh Indonesia)\n' +
                                'G8M7+Q8H Belakang Mesjid As Shadaqah, Jl. Memori Lr. Setia, Lam Lagang, Kec. Banda Raya, Kota Banda Aceh, Aceh 23122, Indonesia.\n\n' +
                                'Setelah bayar di tempat, Admin akan mengaktifkan kartu anggota Anda.'
                            )
                        }}
                        style={{
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1rem',
                            background: '#d4af37',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        Bayar di Tempat (COD)
                    </button>

                    <p style={{ fontSize: '0.8rem', color: '#6b7280', textAlign: 'center', marginTop: '1rem' }}>
                        Klik tombol di atas untuk melihat alamat perpustakaan
                    </p>
                </div>
            )}
        </div>
    )
}



function Profile() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const { userId } = useParams() // Optional param for admin viewing others
    const [profileUser, setProfileUser] = useState(null)
    const [myLoans, setMyLoans] = useState([])
    const [loading, setLoading] = useState(true)

    // Password management states
    const [showChangePassword, setShowChangePassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })
    const { toast } = useNotification()

    // Security Check & Data Fetching
    useEffect(() => {
        if (!user) return

        const targetId = userId || user.id

        // Strict Security Rule
        // User can only view their own profile. Admin can view anyone.
        if (user.role !== 'admin' && targetId !== user.id) {
            toast.error('Akses Ditolak: Anda hanya bisa melihat profil Anda sendiri.')
            navigate('/profile') // Redirect back to own profile
            return
        }

        // Determine if we show current logged in user or fetched user
        if (targetId === user.id) {
            setProfileUser(user)
            fetchMyLoans(user.id)
            setLoading(false)
        } else {
            // Admin viewing another user
            fetchUserProfile(targetId)
            fetchMyLoans(targetId)
        }

    }, [user, userId, navigate])

    const fetchUserProfile = async (id) => {
        try {
            const { data, error } = await supabase.from('users').select('*').eq('id', id).single()
            if (error) throw error
            setProfileUser({
                ...data,
                joinDate: data.join_date ? new Date(data.join_date).toLocaleDateString('id-ID') : '-',
                donatedBooks: data.donated_books || 0,
                programsJoined: data.programs_joined || []
            })
        } catch (error) {
            console.error("Error fetching user:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchMyLoans = async (id) => {
        try {
            const { data, error } = await supabase
                .from('loans')
                .select(`*, books(title, cover)`)
                .eq('user_id', id)
                .order('due_date', { ascending: true })
            if (error) throw error
            setMyLoans(data || [])
        } catch (error) {
            console.error("Error fetching loans:", error)
        }
    }

    const handleRenewLoan = async (loanId) => {
        try {
            const { data, error } = await supabase.rpc('renew_loan', { p_loan_id: loanId })
            if (error) throw error

            if (data.success) {
                toast.success(data.message)
                fetchMyLoans(profileUser.id) // Refresh list
            } else {
                toast.warning(data.message)
            }
        } catch (error) {
            toast.error('Gagal memperpanjang: ' + error.message)
        }
    }

    const handlePayFine = async (loan, amount) => {
        // Prevent multiple clicks
        if (loading) return

        try {
            await PaymentService.initiatePayment(
                {
                    userId: user.id,
                    customerName: user.name,
                    customerEmail: user.email,
                    amount: amount
                },
                {
                    onSuccess: async (result) => {
                        console.log('Fine payment success:', result)
                        toast.success('Pembayaran denda berhasil! Silakan kembalikan buku ke perpustakaan.')
                        // In a real app, we might want to update the loan status to 'fine_paid' here via API
                        // For now, we just refresh the list
                        fetchMyLoans(profileUser.id)
                    },
                    onPending: (result) => {
                        toast.info('Pembayaran denda sedang diproses.')
                    },
                    onError: (result) => {
                        toast.error('Pembayaran denda gagal.')
                    },
                    onClose: () => {
                        console.log('Payment closed')
                    }
                }
            )
        } catch (error) {
            console.error('Fine payment error:', error)
            toast.error('Gagal memproses pembayaran denda: ' + error.message)
        }
    }

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    // Handle password change
    const handleChangePassword = async (e) => {
        e.preventDefault()
        setPasswordMessage({ type: '', text: '' })

        if (!currentPassword) {
            setPasswordMessage({ type: 'error', text: 'Masukkan password lama!' })
            return
        }

        if (newPassword !== confirmPassword) {
            setPasswordMessage({ type: 'error', text: 'Password baru tidak cocok!' })
            return
        }

        if (newPassword.length < 6) {
            setPasswordMessage({ type: 'error', text: 'Password minimal 6 karakter!' })
            return
        }

        setPasswordLoading(true)
        try {
            // First verify old password by re-authenticating
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword
            })

            if (signInError) {
                setPasswordMessage({ type: 'error', text: 'Password lama salah!' })
                setPasswordLoading(false)
                return
            }

            // Now update to new password
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            })

            if (error) throw error

            setPasswordMessage({ type: 'success', text: 'Password berhasil diubah!' })
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setTimeout(() => setShowChangePassword(false), 2000)
        } catch (error) {
            setPasswordMessage({ type: 'error', text: error.message })
        } finally {
            setPasswordLoading(false)
        }
    }

    // Handle reset password (send email)
    const handleResetPassword = async () => {
        setPasswordLoading(true)
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                redirectTo: `${window.location.origin}/reset-password`
            })

            if (error) throw error

            toast.success(`Link reset password telah dikirim ke ${user.email}. Silakan cek inbox email Anda.`)
        } catch (error) {
            toast.error('Gagal mengirim email reset: ' + error.message)
        } finally {
            setPasswordLoading(false)
        }
    }

    if (loading) return <div className="text-center p-5">Memuat profil...</div>

    if (!user) {
        return (
            <div className="app">
                <Navbar />
                <div className="auth-page">
                    <div className="auth-container">
                        <div className="auth-card">
                            <div className="auth-header">
                                <span className="auth-icon">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                    </svg>
                                </span>
                                <h1>Belum Login</h1>
                                <p>Silakan login terlebih dahulu untuk melihat profil</p>
                            </div>
                            <div className="auth-buttons">
                                <Link to="/login" className="btn btn-primary btn-full">
                                    Masuk
                                </Link>
                                <Link to="/register" className="btn btn-secondary-outline btn-full">
                                    Daftar Baru
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="app">
            <Navbar />

            <div className="profile-page">
                <div className="profile-container">
                    {/* Profile Header */}
                    <div className="profile-header">
                        <div className="profile-avatar">
                            <svg viewBox="0 0 212 212" width="100%" height="100%">
                                <circle cx="106" cy="106" r="106" fill="#DFE5E7" />
                                <path fill="#FFF" d="M106,57 C90.5,57 78,69.5 78,85 C78,100.5 90.5,113 106,113 C121.5,113 134,100.5 134,85 C134,69.5 121.5,57 106,57 Z" />
                                <path fill="#FFF" d="M173,171 C173,140 143.1,115 106,115 C68.9,115 39,140 39,171 L39,171 Z" />
                            </svg>
                        </div>
                        <div className="profile-info">
                            <h1>
                                Halo, {profileUser?.name}!
                                {user.role === 'admin' && profileUser.id !== user.id && <span className="role-badge member" style={{ marginLeft: '10px', fontSize: '0.8rem' }}>User View</span>}
                            </h1>
                            <p className="profile-email" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                                {profileUser?.email}
                            </p>
                            <p className="profile-join" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                Bergabung sejak {profileUser?.joinDate ? new Date(profileUser.joinDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                            </p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="profile-stats" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                        <div className="profile-stat-card">
                            <span className="stat-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                                </svg>
                            </span>
                            <div>
                                <span className="stat-value">{myLoans.filter(l => l.status === 'borrowed').length}</span>
                                <span className="stat-label">Sedang Dipinjam</span>
                            </div>
                        </div>
                        <div className={`profile-stat-card status-card ${profileUser?.memberStatus === 'verified' ? 'verified' : (profileUser?.memberStatus === 'pending_approval' || profileUser?.memberStatus === 'approved') ? 'pending' : 'non-member'}`}>
                            <span className="stat-icon">
                                {profileUser?.memberStatus === 'verified' ? (
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2L3 7V12C3 17.55 6.84 22.74 12 24C17.16 22.74 21 17.55 21 12V7L12 2Z" fill="#10b981" />
                                        <path d="M10 15.17L7.41 12.59L6 14L10 18L18 10L16.59 8.59L10 15.17Z" fill="white" />
                                    </svg>
                                ) : (profileUser?.memberStatus === 'pending_approval' || profileUser?.memberStatus === 'approved') ? (
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="#d4af37" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                ) : (
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="8" x2="12" y2="12"></line>
                                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                                    </svg>
                                )}
                            </span>
                            <div>
                                <span className={`stat-value status-badge ${profileUser?.memberStatus === 'verified' ? 'verified' : (profileUser?.memberStatus === 'pending_approval' || profileUser?.memberStatus === 'approved') ? 'pending' : 'non-member'}`}>
                                    {profileUser?.role === 'admin' ? 'Admin' :
                                        profileUser?.memberStatus === 'verified' ? 'Member Verified' :
                                            profileUser?.memberStatus === 'approved' ? 'Menunggu Pembayaran' :
                                                profileUser?.memberStatus === 'pending_approval' ? 'Menunggu Verifikasi' :
                                                    'Non-Member'}
                                </span>
                                <span className="stat-label">Status Keanggotaan</span>
                            </div>
                        </div>
                    </div>

                    {/* Upgrade to Member Section - Show for non-members */}
                    {profileUser?.role !== 'admin' && profileUser?.memberStatus !== 'verified' && (
                        <MemberUpgradeSection userId={profileUser?.id} currentStatus={profileUser?.memberStatus} userEmail={profileUser?.email} userName={profileUser?.name} />
                    )}

                    {/* Active Loans Section */}
                    {myLoans.length > 0 && (
                        <div className="profile-section">
                            <h2>Buku Pinjaman Saya</h2>

                            {/* Info Box */}
                            <div style={{
                                background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)',
                                border: '1px solid #10b981',
                                borderRadius: '12px',
                                padding: '1rem 1.25rem',
                                marginBottom: '1.5rem',
                                fontSize: '0.875rem',
                                color: '#047857'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="12" y1="16" x2="12" y2="12"></line>
                                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                    </svg>
                                    <div>
                                        <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Ketentuan Peminjaman:</strong>
                                        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', lineHeight: 1.6 }}>
                                            <li>Periode peminjaman: <strong>5 hari</strong> per buku</li>
                                            <li>Perpanjangan hanya bisa dilakukan saat <strong>sisa 2 hari</strong></li>
                                            <li>Maksimal perpanjangan: <strong>2 kali</strong></li>
                                            <li>Denda keterlambatan: <strong>Rp 5.000/hari</strong></li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="activity-list">
                                {myLoans.map(loan => {
                                    const dueDate = new Date(loan.due_date);
                                    const today = new Date();
                                    today.setHours(0, 0, 0, 0);
                                    dueDate.setHours(0, 0, 0, 0);
                                    const diffTime = dueDate - today;

                                    // Original calculations
                                    // Original calculations
                                    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    const isOverdue = daysLeft < 0;
                                    const isDueToday = daysLeft === 0;
                                    const renewalCount = loan.renewal_count || 0;
                                    const canRenew = loan.status === 'borrowed' && daysLeft <= 2 && renewalCount < 2 && !isOverdue;
                                    const fineAmount = isOverdue ? Math.abs(daysLeft) * 5000 : 0;
                                    const isUrgent = daysLeft <= 2 && daysLeft > 0;



                                    return (
                                        <div
                                            key={loan.id}
                                            className="activity-item"
                                            style={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                justifyContent: 'space-between',
                                                gap: '1rem',
                                                flexWrap: 'wrap',
                                                background: loan.status === 'borrowed' && isOverdue ? '#fee2e2' :
                                                    loan.status === 'borrowed' && (isUrgent || isDueToday) ? '#fef3c7' : 'white',
                                                border: loan.status === 'borrowed' && isOverdue ? '2px solid #ef4444' :
                                                    loan.status === 'borrowed' && (isUrgent || isDueToday) ? '2px solid #d4af37' : '1px solid #e5e7eb',
                                                borderRadius: '12px'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                                {loan.books?.cover && <img src={loan.books.cover} style={{ width: 45, height: 60, objectFit: 'cover', borderRadius: 6 }} />}
                                                <div style={{ flex: 1 }}>
                                                    <h4 style={{ margin: '0 0 0.25rem' }}>{loan.books?.title}</h4>
                                                    <p style={{
                                                        margin: 0,
                                                        fontSize: '0.85rem',
                                                        color: loan.status === 'returned' ? 'green' :
                                                            isOverdue ? '#dc2626' :
                                                                (isUrgent || isDueToday) ? '#b8860b' : '#666',
                                                        fontWeight: (isUrgent || isOverdue || isDueToday) ? '600' : 'normal',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.35rem'
                                                    }}>
                                                        {loan.status === 'returned' ? (
                                                            <>
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                                Dikembalikan: {new Date(loan.return_date).toLocaleDateString()}
                                                            </>
                                                        ) : isOverdue ? (
                                                            <>
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                                                Terlambat {Math.abs(daysLeft)} hari!
                                                            </>
                                                        ) : isDueToday ? (
                                                            <>
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                                                                Hari ini jatuh tempo!
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                                                {daysLeft} hari lagi
                                                            </>
                                                        )}
                                                    </p>

                                                    {/* Renewal Count & Fine Info */}
                                                    {loan.status === 'borrowed' && (
                                                        <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                                            <span style={{
                                                                fontSize: '0.7rem',
                                                                padding: '0.2rem 0.5rem',
                                                                background: renewalCount >= 2 ? '#fee2e2' : '#f3f4f6',
                                                                color: renewalCount >= 2 ? '#dc2626' : '#6b7280',
                                                                borderRadius: '4px'
                                                            }}>
                                                                Perpanjangan: {renewalCount}/2
                                                            </span>
                                                            {isOverdue && (
                                                                <span style={{
                                                                    fontSize: '0.7rem',
                                                                    padding: '0.2rem 0.5rem',
                                                                    background: '#dc2626',
                                                                    color: 'white',
                                                                    borderRadius: '4px',
                                                                    fontWeight: '600'
                                                                }}>
                                                                    Denda: Rp {fineAmount.toLocaleString('id-ID')}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            {loan.status === 'borrowed' && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                                                    <button
                                                        className="btn btn-sm"
                                                        onClick={() => isOverdue ? handlePayFine(loan, fineAmount) : handleRenewLoan(loan.id)}
                                                        disabled={(!canRenew && !isOverdue)}
                                                        style={{
                                                            fontSize: '0.75rem',
                                                            padding: '0.35rem 0.75rem',
                                                            background: isOverdue ? '#dc2626' : (canRenew ? '#047857' : '#d1d5db'),
                                                            color: (isOverdue || canRenew) ? 'white' : '#9ca3af',
                                                            cursor: (isOverdue || canRenew) ? 'pointer' : 'not-allowed',
                                                            opacity: (isOverdue || canRenew) ? 1 : 0.7
                                                        }}
                                                    >
                                                        {renewalCount >= 2 ? 'Max Perpanjang' :
                                                            isOverdue ? 'Bayar Denda' :
                                                                canRenew ? 'Perpanjang' :
                                                                    `Sisa ${daysLeft} hari`}
                                                    </button>
                                                    {!canRenew && !isOverdue && daysLeft > 2 && (
                                                        <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>
                                                            Bisa perpanjang saat sisa 2 hari
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Account Section */}
                    <div className="profile-section account-section">
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                            Pengaturan Akun
                        </h2>
                        <div className="account-info">
                            <div className="account-row">
                                <span className="account-label">Email</span>
                                <span className="account-value">{user.email}</span>
                            </div>
                            <div className="account-row">
                                <span className="account-label">ID Member</span>
                                <span className="account-value">{user.id?.slice(0, 8)}...</span>
                            </div>
                        </div>

                        {/* Password Management */}
                        <div style={{ marginTop: '1.5rem', borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                </svg>
                                Keamanan Password
                            </h3>

                            {!showChangePassword ? (
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                    <button
                                        onClick={() => setShowChangePassword(true)}
                                        className="btn"
                                        style={{ background: '#047857', color: 'white', fontSize: '0.9rem', padding: '0.75rem 1.5rem' }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                        </svg>
                                        Ganti Password
                                    </button>
                                    <button
                                        onClick={handleResetPassword}
                                        className="btn"
                                        disabled={passwordLoading}
                                        style={{ background: '#d4af37', color: 'white', fontSize: '0.9rem', padding: '0.75rem 1.5rem' }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                                            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                        </svg>
                                        Reset via Email
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleChangePassword} style={{ maxWidth: '400px' }}>
                                    {passwordMessage.text && (
                                        <div style={{
                                            padding: '0.75rem 1rem',
                                            marginBottom: '1rem',
                                            borderRadius: '8px',
                                            background: passwordMessage.type === 'error' ? '#fee2e2' : '#d1fae5',
                                            color: passwordMessage.type === 'error' ? '#dc2626' : '#047857',
                                            fontSize: '0.9rem'
                                        }}>
                                            {passwordMessage.text}
                                        </div>
                                    )}
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                                            Password Lama
                                        </label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Masukkan password lama"
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                border: '2px solid #e5e7eb',
                                                borderRadius: '8px',
                                                fontSize: '0.95rem'
                                            }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                                            Password Baru
                                        </label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Minimal 6 karakter"
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                border: '2px solid #e5e7eb',
                                                borderRadius: '8px',
                                                fontSize: '0.95rem'
                                            }}
                                        />
                                    </div>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                                            Konfirmasi Password
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Ulangi password baru"
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                border: '2px solid #e5e7eb',
                                                borderRadius: '8px',
                                                fontSize: '0.95rem'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <button
                                            type="submit"
                                            className="btn"
                                            disabled={passwordLoading}
                                            style={{ background: '#047857', color: 'white', fontSize: '0.9rem', padding: '0.75rem 1.5rem' }}
                                        >
                                            {passwordLoading ? 'Menyimpan...' : 'Simpan Password'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowChangePassword(false)
                                                setPasswordMessage({ type: '', text: '' })
                                                setNewPassword('')
                                                setConfirmPassword('')
                                            }}
                                            className="btn"
                                            style={{ background: '#6b7280', color: 'white', fontSize: '0.9rem', padding: '0.75rem 1.5rem' }}
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        <button onClick={handleLogout} className="btn btn-logout" style={{ marginTop: '1.5rem' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '0.5rem' }}>
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            Keluar dari Akun
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div >
    )
}

export default Profile
