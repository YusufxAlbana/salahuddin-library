const nodemailer = require('nodemailer');

// Konfigurasi transporter email
// Menggunakan akun email dari Environment Variables
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com', // Ganti dengan host SMTP Anda, default Gmail 
    port: process.env.EMAIL_PORT || 465,
    secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, // Alamat email pengirim (misal admin@perpus.com)
        pass: process.env.EMAIL_PASS, // Password email pengirim / App Password
    },
});

exports.sendVerificationEmail = async (req, res) => {
    const { email, name } = req.body;

    if (!email || !name) {
        return res.status(400).json({ success: false, message: 'Email dan Nama User dibutuhkan.' });
    }

    try {
        const mailOptions = {
            from: `"Admin Perpustakaan Salahuddin" <${process.env.EMAIL_USER}>`, 
            to: email, 
            subject: 'Notifikasi Verifikasi KTP - Perpustakaan Salahuddin', 
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #047857; color: white; padding: 20px; text-align: center;">
                        <h2 style="margin: 0;">Verifikasi KTP Berhasil!</h2>
                    </div>
                    <div style="padding: 20px; color: #374151; line-height: 1.6;">
                        <p>Halo <strong>${name}</strong>,</p>
                        <p>Selamat! KTP Anda telah berhasil diverifikasi oleh Admin Perpustakaan Salahuddin.</p>
                        <p>Langkah selanjutnya, silakan selesaikan proses <strong>Pembayaran COD (Bertemu Admin)</strong> untuk mengaktifkan status keanggotaan Anda sepenuhnya.</p>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/profile" style="background-color: #047857; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Lanjutkan ke Profil</a>
                        </div>
                    </div>
                    <div style="background-color: #f3f4f6; color: #6b7280; padding: 15px; text-align: center; font-size: 0.85em;">
                        <p style="margin: 0;">Ini adalah email otomatis, mohon tidak membalas email ini.</p>
                        <p style="margin: 5px 0 0;">© 2024 Perpustakaan Salahuddin</p>
                    </div>
                </div>
            `
        };

        // Kirim email
        await transporter.sendMail(mailOptions);
        
        console.log(`[Email] Berhasil mengirim email verifikasi ke ${email}`);
        res.status(200).json({ success: true, message: 'Email notifikasi berhasil dikirim.' });

    } catch (error) {
        console.error('[Email Error] Gagal mengirim email:', error);
        res.status(500).json({ success: false, message: 'Gagal mengirim email.', error: error.message });
    }
};
