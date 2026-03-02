const express = require('express');
const router = express.Router();
const emailController = require('./email.controller');

// Rute untuk mengirim notifikasi verifikasi Email KTP
router.post('/send-verification-email', emailController.sendVerificationEmail);

module.exports = router;
