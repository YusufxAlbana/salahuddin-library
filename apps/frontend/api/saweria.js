export default async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const payload = req.body;
        console.log('Saweria Webhook JSON:', payload);

        // Get data whether it's wrapped in `data` object or not
        const amount = payload.data?.amount_raw || payload.amount_raw || payload.amount || 0;
        const message = payload.data?.message || payload.message || '';
        const donatorEmail = payload.data?.donator_email || payload.donator_email || '';
        
        if (amount < 50000) {
           return res.status(200).json({ success: true, message: 'Donation less than 50k, ignored for membership' });
        }

        const dbUrl = 'https://salahuddin-library-default-rtdb.asia-southeast1.firebasedatabase.app';
        const usersRes = await fetch(`${dbUrl}/users.json`);
        const users = await usersRes.json();

        let foundUserId = null;

        // Find user by matching donator_email exactly
        for (const [userId, userData] of Object.entries(users || {})) {
            if (userData.email && donatorEmail && userData.email.toLowerCase() === donatorEmail.toLowerCase()) {
                foundUserId = userId;
                break;
            }
        }

        // Fallback: If donator_email doesn't match or is empty, check the message
        if (!foundUserId) {
            for (const [userId, userData] of Object.entries(users || {})) {
                if (userData.email && message && message.toLowerCase().includes(userData.email.toLowerCase())) {
                    foundUserId = userId;
                    break;
                }
            }
        }

        if (!foundUserId) {
            console.log('User not found by email in message:', message);
            return res.status(200).json({ success: true, message: 'User not found in message, wait for manual verification' });
        }

        // Automatically upgrade membership
        await fetch(`${dbUrl}/users/${foundUserId}.json`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                member_status: 'verified',
                payment_status: 'paid',
                payment_date: new Date().toISOString()
            })
        });

        // [Teruskan data ke Google Spreadsheet]
        // Nanti setelah Anda dapat URL dari Google Script, paste di dalam tanda kutip di bawah ini:
        const googleScriptUrl = "https://script.google.com/macros/s/AKfycby8jXz_gTP9V2n4f6CDR8rLv-cbg3qwuWhW3kUGL573zyEL-YYfA4WKiZKJZrYd_WOr/exec"; // <-- PASTE URL DISINI NANTI

        if (googleScriptUrl) {
            try {
                await fetch(googleScriptUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                console.log('✅ Data berhasil diteruskan ke Google Spreadsheet');
            } catch (err) {
                console.error('❌ Gagal meneruskan ke Spreadsheet:', err);
            }
        }

        console.log(`[SUCCESS] Webhook activated user: ${foundUserId}`);
        return res.status(200).json({ success: true, message: 'Membership activated via webhook' });

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
