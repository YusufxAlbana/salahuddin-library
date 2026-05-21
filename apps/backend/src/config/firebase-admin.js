const admin = require('firebase-admin');

/**
 * Inisialisasi Firebase Admin SDK
 *
 * Di local: baca dari file firebase-adminsdk.json
 * Di Vercel (production): baca dari environment variable FIREBASE_SERVICE_ACCOUNT_JSON
 *
 * Cara set di Vercel:
 *   Settings → Environment Variables → FIREBASE_SERVICE_ACCOUNT_JSON
 *   Value: isi seluruh isi file firebase-adminsdk.json (copy paste as-is)
 */
if (!admin.apps.length) {
    let credential;

    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        // Production (Vercel): baca dari env var
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        credential = admin.credential.cert(serviceAccount);
    } else {
        // Local development: baca dari file JSON
        const path = require('path');
        const serviceAccountPath = path.join(__dirname, '../../firebase-adminsdk.json');
        const serviceAccount = require(serviceAccountPath);
        credential = admin.credential.cert(serviceAccount);
    }

    admin.initializeApp({ credential });
}

module.exports = admin;
