import handler from './api/saweria.js';

// Mengambil email dari pengetikan command line (Jika kosong, ingatkan user)
const targetEmail = process.argv[2];

if (!targetEmail) {
    console.log("❌ EROR: Anda harus memasukkan email!");
    console.log("▶ Cara pakai: node test-webhook.mjs email_akun_anda@contoh.com");
    process.exit(1);
}

const mockReq = {
    method: 'POST',
    body: {
        type: 'donation',
        version: 'v1.1',
        data: {
            amount_raw: 50000,
            donator_email: targetEmail, 
            message: "", 
            donator_name: "Mock Tester Boongan"
        }
    }
};

const mockRes = {
    setHeader: () => {},
    status: function(code) {
        this.statusCode = code;
        return this;
    },
    json: function(data) {
        console.log(`[Response ${this.statusCode}]`, data);
    },
    end: () => {}
};

async function runTest() {
    console.log("==========================================");
    console.log("▶ SIMULATOR SAWERIA AKTIF");
    console.log(`▶ Mengirim uang boongan 50k dari: ${targetEmail}`);
    console.log("==========================================");
    await handler(mockReq, mockRes);
    console.log("▶ Silakan REFRESH halaman website Anda!");
}

runTest();
