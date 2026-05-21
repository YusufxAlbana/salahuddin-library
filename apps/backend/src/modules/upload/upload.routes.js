const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('./upload.controller');
const { verifyFirebaseToken } = require('../../middlewares/auth.middleware');

// Multer: simpan file di memory (buffer), bukan di disk
// Limit 10MB per file, hanya terima image/*
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Hanya file gambar yang diperbolehkan.'), false);
        }
    }
});

// POST /api/upload/image
// Diproteksi: hanya user yang sudah login (punya Firebase token) yang bisa upload
router.post(
    '/image',
    verifyFirebaseToken,
    upload.single('file'),
    uploadController.uploadImage
);

module.exports = router;
