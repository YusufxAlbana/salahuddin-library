import midtransClient from 'midtrans-client';

// Initialize Midtrans Snap
const snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});

export default async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const { 
            orderId, 
            amount, 
            customerName, 
            customerEmail, 
            customerPhone,
            itemName = 'Keanggotaan Perpustakaan Salahuddin (Seumur Hidup)',
            userId
        } = req.body;

        // Validate required fields
        if (!orderId || !amount || !customerName || !customerEmail) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: orderId, amount, customerName, customerEmail'
            });
        }

        const frontendUrl = process.env.FRONTEND_URL || 'https://salahuddin-library.vercel.app';

        // Transaction parameters for Midtrans Snap
        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: parseInt(amount)
            },
            credit_card: {
                secure: true
            },
            item_details: [{
                id: 'MEMBERSHIP-001',
                price: parseInt(amount),
                quantity: 1,
                name: itemName
            }],
            customer_details: {
                first_name: customerName.split(' ')[0],
                last_name: customerName.split(' ').slice(1).join(' ') || '',
                email: customerEmail,
                phone: customerPhone || ''
            },
            callbacks: {
                finish: `${frontendUrl}/profile?payment=success`,
                error: `${frontendUrl}/profile?payment=error`,
                pending: `${frontendUrl}/profile?payment=pending`
            },
            custom_field1: userId || '',
            expiry: {
                start_time: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' +0700',
                unit: 'hour',
                duration: 24
            }
        };

        console.log('Creating transaction with params:', JSON.stringify(parameter, null, 2));

        // Create transaction
        const transaction = await snap.createTransaction(parameter);

        console.log('Transaction created:', transaction);

        res.json({
            success: true,
            token: transaction.token,
            redirect_url: transaction.redirect_url,
            order_id: orderId
        });

    } catch (error) {
        console.error('Midtrans Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment',
            error: error.message
        });
    }
};
