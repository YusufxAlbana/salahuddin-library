import { auth } from '../config/firebase';

/**
 * Mengoptimalkan URL Cloudinary ke format WebP dengan kualitas otomatis.
 * Tidak perlu credentials — hanya transformasi string URL.
 *
 * Contoh:
 *   Input:  https://res.cloudinary.com/dyr6flyz3/image/upload/v123/photo.jpg
 *   Output: https://res.cloudinary.com/dyr6flyz3/image/upload/f_webp,q_auto/v123/photo.jpg
 */
export const optimizeCloudinaryUrl = (url, options = {}) => {
    if (!url || !url.includes('res.cloudinary.com')) return url;

    const { width, height, quality = 'auto', format = 'webp' } = options;

    let transforms = [`f_${format}`, `q_${quality}`];
    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);

    const transformStr = transforms.join(',');
    return url.replace('/upload/', `/upload/${transformStr}/`);
};

/**
 * Upload gambar ke Cloudinary melalui Backend API (AMAN).
 *
 * Credentials Cloudinary TIDAK ada di frontend — semua disimpan di server.
 * Frontend hanya mengirim file + Firebase Auth token ke backend,
 * lalu backend yang mengurus upload ke Cloudinary.
 */
export const uploadToCloudinary = async (file) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    // Ambil Firebase ID token agar endpoint backend terlindungi
    const idToken = await auth.currentUser?.getIdToken();
    if (!idToken) {
        throw new Error('Harus login terlebih dahulu untuk mengupload gambar.');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${apiUrl}/upload/image`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${idToken}`,
            // Jangan set Content-Type — biarkan browser set boundary multipart/form-data
        },
        body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || 'Gagal mengupload gambar.');
    }

    // Kembalikan URL yang sudah dioptimasi ke WebP
    return optimizeCloudinaryUrl(result.url);
};
