import midtransClient from 'midtrans-client';

// Initialize Midtrans Core API
const serverKey = process.env.MIDTRANS_SERVER_KEY;
const clientKey = process.env.MIDTRANS_CLIENT_KEY;
const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true' || (serverKey && !serverKey.startsWith('SB-'));

const coreApi = new midtransClient.CoreApi({
    isProduction: isProduction,
    serverKey: serverKey,
    clientKey: clientKey
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

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        const { orderId } = req.query;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Missing orderId parameter'
            });
        }

        const status = await coreApi.transaction.status(orderId);

        res.json({
            success: true,
            data: {
                order_id: status.order_id,
                transaction_status: status.transaction_status,
                fraud_status: status.fraud_status,
                payment_type: status.payment_type,
                gross_amount: status.gross_amount,
                transaction_time: status.transaction_time,
                settlement_time: status.settlement_time
            }
        });

    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check payment status',
            error: error.message
        });
    }
};
