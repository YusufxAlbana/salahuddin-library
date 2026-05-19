const admin = require('firebase-admin');
const path = require('path');

// Inisialisasi Firebase Admin SDK menggunakan Service Account
// File JSON ini TIDAK boleh di-commit ke Git (sudah ada di .gitignore)
if (!admin.apps.length) {
    const serviceAccountPath = path.join(__dirname, '../../firebase-adminsdk.json');
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

module.exports = admin;
