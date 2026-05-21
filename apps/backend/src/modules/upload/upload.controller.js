const crypto = require('crypto');
const FormData = require('form-data');
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

/**
 * POST /api/upload/image
 *
 * Menerima file gambar dari frontend, lalu menguploadnya ke Cloudinary
 * menggunakan kredensial yang AMAN disimpan di environment variable server.
 *
 * Keuntungan: API Secret Cloudinary tidak pernah terekspos ke browser.
 */
exports.uploadImage = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Tidak ada file yang dikirim.' });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey    = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
        console.error('[Upload] Konfigurasi Cloudinary belum diset di .env');
        return res.status(500).json({ success: false, message: 'Konfigurasi server tidak lengkap.' });
    }

    const timestamp = Math.round(Date.now() / 1000);

    // Generate SHA-1 signature di sisi server (aman)
    const signature = crypto
        .createHash('sha1')
        .update(`timestamp=${timestamp}${apiSecret}`)
        .digest('hex');

    const formData = new FormData();
    formData.append('file', req.file.buffer, {
        filename: req.file.originalname,
        contentType: req.file.mimetype,
    });
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: 'POST', body: formData }
        );
        const result = await response.json();

        if (result.secure_url) {
            console.log(`[Upload] Berhasil upload ke Cloudinary: ${result.secure_url}`);
            return res.status(200).json({ success: true, url: result.secure_url });
        } else {
            console.error('[Upload] Cloudinary error:', result.error);
            return res.status(500).json({
                success: false,
                message: result.error?.message || 'Gagal upload ke Cloudinary.'
            });
        }
    } catch (error) {
        console.error('[Upload] Error:', error);
        return res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
};
