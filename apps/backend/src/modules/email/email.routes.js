const express = require('express');
const router = express.Router();
const emailController = require('./email.controller');
const { verifyFirebaseToken, requireAdmin } = require('../../middlewares/auth.middleware');

// Rute untuk mengirim notifikasi verifikasi Email KTP
// Diproteksi: hanya admin yang sudah login yang bisa memanggil endpoint ini
router.post(
    '/send-verification-email',
    verifyFirebaseToken,  // Step 1: pastikan token valid
    requireAdmin,         // Step 2: pastikan user adalah admin
    emailController.sendVerificationEmail
);

module.exports = router;
