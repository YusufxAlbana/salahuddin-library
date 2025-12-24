module.exports = async (req, res) => {
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
        const notification = req.body;
        
        console.log('Received notification:', JSON.stringify(notification, null, 2));

        const orderId = notification.order_id;
        const transactionStatus = notification.transaction_status;
        const fraudStatus = notification.fraud_status;
        const paymentType = notification.payment_type;

        let paymentStatus = 'pending';

        if (transactionStatus === 'capture') {
            if (fraudStatus === 'accept') {
                paymentStatus = 'paid';
            } else if (fraudStatus === 'challenge') {
                paymentStatus = 'challenge';
            }
        } else if (transactionStatus === 'settlement') {
            paymentStatus = 'paid';
        } else if (transactionStatus === 'pending') {
            paymentStatus = 'pending';
        } else if (transactionStatus === 'deny' || 
                   transactionStatus === 'cancel' || 
                   transactionStatus === 'expire') {
            paymentStatus = 'failed';
        }

        console.log(`Order ${orderId}: Status = ${paymentStatus}, Payment Type = ${paymentType}`);

        // TODO: Update your database here via Supabase
        // Example: await supabase.from('payments').update({ status: paymentStatus }).eq('order_id', orderId);

        res.status(200).json({
            success: true,
            message: 'Notification processed',
            order_id: orderId,
            status: paymentStatus
        });

    } catch (error) {
        console.error('Notification error:', error);
        res.status(200).json({
            success: false,
            message: 'Error processing notification',
            error: error.message
        });
    }
};
