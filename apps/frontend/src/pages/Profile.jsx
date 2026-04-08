import { Link, useNavigate, useParams, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { db, storage, auth } from '../config/firebase'
import { ref, get, update } from 'firebase/database'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { updatePassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { PaymentService } from '../services/payment'
import { useNotification } from '../components/Notification'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import imageCompression from 'browser-image-compression'

import '../App.css'

// Member Upgrade Section Component
// Flow: 1. Upload KTP → 2. Wait Admin Approval → 3. Payment
function MemberUpgradeSection({ userId, currentStatus, userEmail, userName }) {
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
            // Compress Image Before Upload
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            }
            const compressedFile = await imageCompression(ktpFile, options)

            // Upload to Cloudinary
            const { uploadToCloudinary } = await import('../utils/cloudinary');
            const publicUrl = await uploadToCloudinary(compressedFile)

            // Update user in RTDB
            const userRef = ref(db, `users/${userId}`)
            await update(userRef, {
                ktp_url: publicUrl,
                member_status: 'pending_approval'
            })

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
                        const userRef = ref(db, `users/${userId}`)
                        await update(userRef, {
                            member_status: 'verified',
                            payment_status: 'paid',
                            payment_date: new Date().toISOString()
                        })

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
            setError('Pembayaran online tidak tersedia saat ini. Silakan gunakan opsi "Bayar di Tempat" di bawah.')
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
                                        position: 'absolute', top: '10px', right: '10px',
                                        background: 'rgba(220, 38, 38, 0.9)', color: 'white', border: 'none',
                                        borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
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
                                <small>Format: JPG, PNG (Semua Ukuran)</small>
                            </>
                        )}
                    </div>

                    <input type="file" id="upgrade-ktp-file" accept="image/*" onChange={handleKtpChange} style={{ display: 'none' }} />

                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            if (ktpFile) { handleKtpUpload() } else { document.getElementById('upgrade-ktp-file').click() }
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
                        background: '#fef3c7', border: '1px solid #d4af37', borderRadius: '8px',
                        padding: '1rem', fontSize: '0.9rem', color: '#92400e'
                    }}>
                        <strong>Tips:</strong> Proses verifikasi biasanya memakan waktu 1x24 jam.
                    </div>
                </div>
            )}

            {/* Step 3: Payment with QRIS */}
            {step === 3 && (
                <div className="upgrade-content">
                    <div style={{
                        background: '#d1fae5', border: '1px solid #10b981', borderRadius: '12px',
                        padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem'
                    }}>
                        <div style={{
                            background: '#10b981', borderRadius: '50%', width: '32px', height: '32px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <span style={{ color: '#065f46', fontWeight: '500', fontSize: '0.95rem' }}>Pendaftaran Anda telah disetujui! Silakan lakukan pembayaran membership.</span>
                    </div>

                    <div className="payment-summary" style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                        <div className="payment-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Biaya Membership (Seumur Hidup)</span>
                            <span className="payment-amount" style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.2rem' }}>Rp 50.000</span>
                        </div>
                    </div>

                    <div className="qris-container" style={{
                        textAlign: 'center', background: 'white', borderRadius: '16px',
                        padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                    }}>
                        <p style={{ fontWeight: '600', color: '#334155', marginBottom: '1rem' }}>Scan QRIS di bawah ini:</p>
                        <div style={{
                            margin: '0 auto', maxWidth: '250px', padding: '1rem',
                            border: '1px solid #f1f5f9', borderRadius: '12px', background: '#fff'
                        }}>
                            <img src="/images/saweria.png" alt="QRIS Saweria Salahuddin Library" style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </div>
                        <p style={{ fontSize: '0.85rem', color: '#dc2626', marginTop: '1rem', lineHeight: '1.5', fontWeight: '600' }}>
                            PENTING: Pastikan Anda mengisi form EMAIL di Saweria dengan ({userEmail}) agar pembayaran otomatis terkonfirmasi!
                        </p>
                        <a href="https://saweria.co/widgets/qr?streamKey=6c5634eda91b9384f50c04399a75db00" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '0.75rem', padding: '0.5rem 1rem', background: '#f8fafc', color: '#3b82f6', textDecoration: 'none', borderRadius: '8px', fontSize: '0.9rem', fontWeight: '500', border: '1px solid #e2e8f0', width: '100%', boxSizing: 'border-box' }}>
                            🔗 Klik di sini jika tidak bisa scan QR
                        </a>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.75rem', lineHeight: '1.5' }}>
                            Anda tidak perlu mengisi kolom pesan. Jika gagal otomatis, simpan bukti dan klik konfirmasi WhatsApp di bawah.
                        </p>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={() => {
                            const message = `Halo Admin Salahuddin Library! Saya ${userName || 'Member'} (${userEmail || ''}) ingin konfirmasi pembayaran membership via QRIS sebesar Rp 50.000. Berikut bukti transfernya.`
                            window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(message)}`, '_blank')
                        }}
                        style={{
                            width: '100%', padding: '1.1rem', fontSize: '1.05rem', fontWeight: '600',
                            background: '#25D366', color: 'white', border: 'none', borderRadius: '14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                            marginBottom: '1rem', cursor: 'pointer', transition: 'transform 0.2s',
                            boxShadow: '0 4px 10px rgba(37, 211, 102, 0.2)'
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        Konfirmasi via WhatsApp
                    </button>

                    <button
                        className="btn"
                        onClick={() => {
                            toast.info(
                                'Kamu bisa bayar langsung di tempat dengan mendatangi alamat ini:\n\n' +
                                'Rumah YAAI (Yayasan Alfata Aceh Indonesia)\n' +
                                'G8M7+Q8H Belakang Mesjid As Shadaqah, Jl. Memori Lr. Setia, Lam Lagang, Kec. Banda Raya, Kota Banda Aceh, Aceh 23122, Indonesia.\n\n' +
                                'Setelah bayar di tempat, Admin akan mengaktifkan kartu anggota Anda.'
                            )
                        }}
                        style={{
                            width: '100%', padding: '1rem', fontSize: '0.95rem', background: '#f1f5f9',
                            color: '#475569', border: 'none', borderRadius: '14px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                            cursor: 'pointer', transition: 'background 0.2s'
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        Lihat Alamat (Bayar di Tempat)
                    </button>
                </div>
            )}
        </div>
    )
}



function Profile() {
    const { user, logout, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const { userId } = useParams()

    if (authLoading) {
        return <div className="text-center p-5">Memuat data pengguna...</div>
    }

    if (!user) {
        return <Navigate to="/" replace />
    }

    const [profileUser, setProfileUser] = useState(null)
    const [myLoans, setMyLoans] = useState([])
    const [loading, setLoading] = useState(true)

    const [showChangePassword, setShowChangePassword] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })
    const { toast } = useNotification()

    useEffect(() => {
        if (!user) return

        const targetId = userId || user.id

        if (user.role !== 'admin' && targetId !== user.id) {
            toast.error('Akses Ditolak: Anda hanya bisa melihat profil Anda sendiri.')
            navigate('/profile')
            return
        }

        if (targetId === user.id) {
            setProfileUser(user)
            fetchMyLoans(user.id)
            setLoading(false)
        } else {
            fetchUserProfile(targetId)
            fetchMyLoans(targetId)
        }

    }, [user, userId, navigate])

    const fetchUserProfile = async (id) => {
        try {
            const userRef = ref(db, `users/${id}`)
            const snapshot = await get(userRef)
            if (!snapshot.exists()) throw new Error('User not found')
            const data = snapshot.val()
            setProfileUser({
                ...data,
                id,
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
            const loansRef = ref(db, 'loans')
            const snapshot = await get(loansRef)
            if (!snapshot.exists()) {
                setMyLoans([])
                return
            }

            const allLoans = snapshot.val()
            const userLoans = Object.entries(allLoans)
                .filter(([_, loan]) => loan.user_id === id)
                .map(([loanId, loan]) => ({ id: loanId, ...loan }))

            // Fetch book info for each loan
            const loansWithBooks = await Promise.all(
                userLoans.map(async (loan) => {
                    const bookRef = ref(db, `books/${loan.book_id}`)
                    const bookSnap = await get(bookRef)
                    const bookData = bookSnap.exists() ? bookSnap.val() : null
                    return {
                        ...loan,
                        books: bookData ? { title: bookData.title, cover: bookData.cover } : null
                    }
                })
            )

            // Sort by due_date ascending
            loansWithBooks.sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
            setMyLoans(loansWithBooks)
        } catch (error) {
            console.error("Error fetching loans:", error)
        }
    }

    const handleRenewLoan = async (loanId) => {
        console.log("Attempting to renew loan:", loanId)
        try {
            const loanRef = ref(db, `loans/${loanId}`)
            const snapshot = await get(loanRef)
            if (!snapshot.exists()) throw new Error('Loan not found')

            const loan = snapshot.val()

            if (loan.status !== 'borrowed') {
                toast.error('Gagal: Buku tidak sedang dipinjam.')
                return
            }

            const currentRenewalCount = loan.renewal_count || 0
            if (currentRenewalCount >= 3) {
                toast.error('Gagal: Batas maksimal perpanjangan (3 kali) sudah habis.')
                return
            }

            const dueDate = new Date(loan.due_date)
            const newDueDate = new Date(dueDate)
            newDueDate.setDate(newDueDate.getDate() + 5)

            await update(loanRef, {
                due_date: newDueDate.toISOString(),
                renewal_count: currentRenewalCount + 1
            })

            toast.success(`Berhasil diperpanjang! Batas baru: ${newDueDate.toLocaleDateString('id-ID')}`)
            fetchMyLoans(profileUser.id)
        } catch (error) {
            console.error(error)
            toast.error('Gagal memperpanjang: ' + error.message)
        }
    }

    const handlePayFine = async (loan, amount) => {
        const message = `Halo Admin Salahuddin Library! Saya ${user.name} ingin konfirmasi pembayaran denda keterlambatan buku "${loan.books?.title || 'Buku'}" sebesar Rp ${amount.toLocaleString('id-ID')} via QRIS.`
        window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(message)}`, '_blank')
        toast.info('Lakukan pembayaran via QRIS (cek di tab Membership) dan kirim bukti ke WhatsApp Admin.')
    }

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

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
            // Verify old password by re-authenticating
            await signInWithEmailAndPassword(auth, user.email, currentPassword)

            // Update to new password
            await updatePassword(auth.currentUser, newPassword)

            setPasswordMessage({ type: 'success', text: 'Password berhasil diubah!' })
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setTimeout(() => setShowChangePassword(false), 2000)
        } catch (error) {
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                setPasswordMessage({ type: 'error', text: 'Password lama salah!' })
            } else {
                setPasswordMessage({ type: 'error', text: error.message })
            }
        } finally {
            setPasswordLoading(false)
        }
    }

    const handleResetPassword = async () => {
        setPasswordLoading(true)
        try {
            await sendPasswordResetEmail(auth, user.email)
            toast.success(`Link reset password telah dikirim ke ${user.email}. Silakan cek inbox email Anda.`)
        } catch (error) {
            toast.error('Gagal mengirim email reset: ' + error.message)
        } finally {
            setPasswordLoading(false)
        }
    }

    if (loading) return <div className="text-center p-5">Memuat profil...</div>

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
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                {profileUser?.email}
                            </p>
                            <p className="profile-join" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                Bergabung sejak {profileUser?.joinDate ? new Date(profileUser.joinDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                            </p>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="profile-stats" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                        <div className="profile-stat-card">
                            <span className="stat-icon">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#047857" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                            </span>
                            <div>
                                <span className="stat-value">{myLoans.filter(l => l.status === 'borrowed').length}</span>
                                <span className="stat-label">Sedang Dipinjam</span>
                            </div>
                        </div>
                        <div className={`profile-stat-card status-card ${profileUser?.memberStatus === 'verified' ? 'verified' : (profileUser?.memberStatus === 'pending_approval' || profileUser?.memberStatus === 'approved') ? 'pending' : 'non-member'}`}>
                            <span className="stat-icon">
                                {profileUser?.memberStatus === 'verified' ? (
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2L3 7V12C3 17.55 6.84 22.74 12 24C17.16 22.74 21 17.55 21 12V7L12 2Z" fill="#10b981" /><path d="M10 15.17L7.41 12.59L6 14L10 18L18 10L16.59 8.59L10 15.17Z" fill="white" /></svg>
                                ) : (profileUser?.memberStatus === 'pending_approval' || profileUser?.memberStatus === 'approved') ? (
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="#d4af37" stroke="#d4af37" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                ) : (
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
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

                    {/* Upgrade to Member Section */}
                    {profileUser?.role !== 'admin' && profileUser?.memberStatus !== 'verified' && (
                        <MemberUpgradeSection userId={profileUser?.id} currentStatus={profileUser?.memberStatus} userEmail={profileUser?.email} userName={profileUser?.name} />
                    )}

                    {/* Active Loans Section */}
                    {myLoans.length > 0 && (
                        <div className="profile-section">
                            <h2>Buku Pinjaman Saya</h2>

                            <div style={{
                                background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '1px solid #10b981',
                                borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.5rem', fontSize: '0.875rem', color: '#047857'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                    <div>
                                        <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Ketentuan Peminjaman:</strong>
                                        <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', lineHeight: 1.6 }}>
                                            <li>Periode peminjaman: <strong>5 hari</strong> per buku</li>
                                            <li>Perpanjangan hanya bisa dilakukan saat <strong>sisa 2 hari</strong></li>
                                            <li>Maksimal perpanjangan: <strong>3 kali</strong></li>
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
                                    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    const isOverdue = daysLeft < 0;
                                    const canRenew = daysLeft <= 2 && daysLeft >= 0 && loan.status === 'borrowed' && (loan.renewal_count || 0) < 3;
                                    const finePerDay = 5000;
                                    const fineAmount = isOverdue ? Math.abs(daysLeft) * finePerDay : 0;

                                    return (
                                        <div key={loan.id} className={`activity-item ${isOverdue ? 'overdue' : ''}`} style={{
                                            border: isOverdue ? '2px solid #dc2626' : '1px solid #e5e7eb',
                                            background: isOverdue ? '#fef2f2' : loan.status === 'returned' ? '#f0fdf4' : 'white',
                                            borderRadius: '12px', padding: '1rem', marginBottom: '0.75rem'
                                        }}>
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                {loan.books?.cover && (
                                                    <img src={loan.books.cover} alt={`Cover buku ${loan.books?.title || 'pinjaman'} - Salahuddin Library`} style={{ width: '45px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
                                                )}
                                                <div style={{ flex: 1 }}>
                                                    <strong>{loan.books?.title || 'Unknown Book'}</strong>
                                                    <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                                        {loan.status === 'returned' ? (
                                                            <span style={{ color: '#10b981' }}>✓ Dikembalikan</span>
                                                        ) : isOverdue ? (
                                                            <span style={{ color: '#dc2626', fontWeight: '600' }}>⚠ Terlambat {Math.abs(daysLeft)} hari (Denda: Rp {fineAmount.toLocaleString('id-ID')})</span>
                                                        ) : (
                                                            <span>Batas: {new Date(loan.due_date).toLocaleDateString('id-ID')} ({daysLeft} hari lagi)</span>
                                                        )}
                                                    </div>
                                                    {loan.status === 'borrowed' && (
                                                        <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                                                            Perpanjangan: {loan.renewal_count || 0}/3
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                    {canRenew && (
                                                        <button onClick={() => handleRenewLoan(loan.id)} className="btn btn-sm" style={{ background: '#047857', color: '#fff', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                                            Perpanjang
                                                        </button>
                                                    )}
                                                    {isOverdue && loan.status === 'borrowed' && (
                                                        <button onClick={() => handlePayFine(loan, fineAmount)} className="btn btn-sm" style={{ background: '#dc2626', color: '#fff', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                                                            Bayar Denda
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Password Management */}
                    <div className="profile-section">
                        <h2>Keamanan Akun</h2>
                        {!showChangePassword ? (
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                <button onClick={() => setShowChangePassword(true)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                    Ubah Password
                                </button>
                                <button onClick={handleResetPassword} className="btn btn-outline" disabled={passwordLoading} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                    Reset via Email
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleChangePassword} style={{ maxWidth: '400px', width: '100%' }}>
                                {passwordMessage.text && (
                                    <div style={{ padding: '0.75rem', marginBottom: '1rem', borderRadius: '8px', background: passwordMessage.type === 'error' ? '#fee2e2' : '#d1fae5', color: passwordMessage.type === 'error' ? '#dc2626' : '#047857', fontSize: '0.9rem' }}>
                                        {passwordMessage.text}
                                    </div>
                                )}
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ fontWeight: '600', color: '#334155', display: 'block', marginBottom: '0.25rem' }}>Password Lama</label>
                                    <input type="password" style={{ width: '100%', padding: '0.875rem 1rem', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Masukkan password lama" />
                                </div>
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <label style={{ fontWeight: '600', color: '#334155', display: 'block', marginBottom: '0.25rem' }}>Password Baru</label>
                                    <input type="password" style={{ width: '100%', padding: '0.875rem 1rem', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimal 6 karakter" />
                                </div>
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ fontWeight: '600', color: '#334155', display: 'block', marginBottom: '0.25rem' }}>Konfirmasi Password Baru</label>
                                    <input type="password" style={{ width: '100%', padding: '0.875rem 1rem', border: '2px solid #e2e8f0', borderRadius: '12px', fontSize: '1rem', outline: 'none', boxSizing: 'border-box' }} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Ulangi password baru" />
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button type="submit" className="btn btn-primary" disabled={passwordLoading} style={{ flex: 1 }}>{passwordLoading ? 'Memproses...' : 'Simpan Password'}</button>
                                    <button type="button" className="btn btn-outline" onClick={() => { setShowChangePassword(false); setPasswordMessage({ type: '', text: '' }) }}>Batal</button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Logout Button */}
                    <div className="profile-section" style={{ textAlign: 'center' }}>
                        <button onClick={handleLogout} className="btn btn-outline" style={{ color: '#dc2626', borderColor: '#dc2626', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                            Keluar dari Akun
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile
