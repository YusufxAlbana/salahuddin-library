const express = require('express');
const router = express.Router();
const { snap, coreApi } = require('../config/midtrans');

// Create transaction token for Snap
router.post('/create-transaction', async (req, res) => {
    try {
        const { 
            orderId, 
            amount, 
            customerName, 
            customerEmail, 
            customerPhone,
            itemName = 'Keanggotaan Perpustakaan Salahuddin',
            userId
        } = req.body;

        // Validate required fields
        if (!orderId || !amount || !customerName || !customerEmail) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: orderId, amount, customerName, customerEmail'
            });
        }

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
                finish: `${process.env.FRONTEND_URL}/profile?payment=success`,
                error: `${process.env.FRONTEND_URL}/profile?payment=error`,
                pending: `${process.env.FRONTEND_URL}/profile?payment=pending`
            },
            custom_field1: userId || '', // Store user ID for webhook
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
});

// Check payment status
router.get('/payment-status', async (req, res) => {
    try {
        const { orderId } = req.query;

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
});

// Webhook notification handler from Midtrans
router.post('/notification', async (req, res) => {
    try {
        const notification = req.body;
        
        console.log('Received notification:', JSON.stringify(notification, null, 2));

        const orderId = notification.order_id;
        const transactionStatus = notification.transaction_status;
        const fraudStatus = notification.fraud_status;
        const paymentType = notification.payment_type;

        let paymentStatus = 'pending';

        // Determine payment status based on Midtrans notification
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

        // In a real app, update your database here
        // Example: await updatePaymentStatus(orderId, paymentStatus);

        // Always respond with 200 OK to Midtrans
        res.status(200).json({
            success: true,
            message: 'Notification processed',
            order_id: orderId,
            status: paymentStatus
        });

    } catch (error) {
        console.error('Notification error:', error);
        // Still respond 200 to prevent Midtrans from retrying
        res.status(200).json({
            success: false,
            message: 'Error processing notification',
            error: error.message
        });
    }
});

// Cancel transaction
router.post('/cancel/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        const response = await coreApi.transaction.cancel(orderId);

        res.json({
            success: true,
            message: 'Transaction cancelled',
            data: response
        });

    } catch (error) {
        console.error('Cancel error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel payment',
            error: error.message
        });
    }
});

module.exports = router;
