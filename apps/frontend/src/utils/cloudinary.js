/**
 * Converts a Cloudinary URL to an optimized webp format with auto quality.
 * This significantly reduces image file sizes for faster loading (SEO boost).
 * Example:
 *   Input:  https://res.cloudinary.com/dyr6flyz3/image/upload/v123/photo.jpg
 *   Output: https://res.cloudinary.com/dyr6flyz3/image/upload/f_webp,q_auto/v123/photo.jpg
 */
export const optimizeCloudinaryUrl = (url, options = {}) => {
    if (!url || !url.includes('res.cloudinary.com')) return url;

    const { width, height, quality = 'auto', format = 'webp' } = options;

    // Build transformation string
    let transforms = [`f_${format}`, `q_${quality}`];
    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);

    const transformStr = transforms.join(',');

    // Insert transformation after /upload/
    return url.replace('/upload/', `/upload/${transformStr}/`);
};

export const uploadToCloudinary = async (file) => {
    const cloudName = 'dyr6flyz3';
    const apiKey = '738723584289923';
    const apiSecret = '6NNM_iTnggMsNiaarmolfUQJhG0';

    const timestamp = Math.round((new Date).getTime() / 1000);

    // Generate signature: SHA-1 of `timestamp=${timestamp}${apiSecret}`
    const encodeUtf8 = (str) => new TextEncoder().encode(str);
    const data = encodeUtf8(`timestamp=${timestamp}${apiSecret}`);
    
    // Use Web Crypto API
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', apiKey);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
    });

    const result = await response.json();
    if (result.secure_url) {
        // Return optimized webp URL for better performance
        return optimizeCloudinaryUrl(result.secure_url);
    } else {
        throw new Error(result.error?.message || 'Cloudinary upload failed');
    }
};

