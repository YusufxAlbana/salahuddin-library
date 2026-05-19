const admin = require('../config/firebase-admin');

/**
 * Middleware: Verifikasi Firebase ID Token
 * 
 * Frontend harus mengirim token di header:
 *   Authorization: Bearer <firebase_id_token>
 * 
 * Jika token valid, request akan dilanjutkan dan req.user akan berisi
 * data user dari Firebase (uid, email, dll).
 * Jika token tidak valid atau tidak ada, akan mengembalikan 401.
 */
const verifyFirebaseToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Token tidak ditemukan. Silakan login terlebih dahulu.'
        });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken; // { uid, email, ... }
        next();
    } catch (error) {
        console.error('[Auth Middleware] Token tidak valid:', error.code);
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Token tidak valid atau sudah kadaluarsa.'
        });
    }
};

/**
 * Middleware: Pastikan user adalah Admin
 * 
 * Harus digunakan SETELAH verifyFirebaseToken.
 * 
 * Cara cek admin: 
 *   - Menggunakan Firebase Custom Claims (field 'role' = 'admin') 
 *   - Atau fallback ke email whitelist untuk admin yang sudah ada
 * 
 * Custom claims bisa di-set via Firebase Admin SDK atau Firebase Console.
 */
const requireAdmin = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: Tidak terautentikasi.'
        });
    }

    // Cek custom claims dulu (cara paling aman & scalable)
    const isAdminByClaim = req.user.role === 'admin';

    // Fallback: cek email whitelist (sama dengan logika di AuthContext.jsx)
    const ADMIN_EMAILS = ['nana@gmail.com'];
    const isAdminByEmail = ADMIN_EMAILS.includes(req.user.email);

    if (!isAdminByClaim && !isAdminByEmail) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: Hanya admin yang bisa mengakses endpoint ini.'
        });
    }

    next();
};

module.exports = { verifyFirebaseToken, requireAdmin };
