// Midtrans Client Configuration
// Client Key is safe to expose in frontend

export const MIDTRANS_CLIENT_KEY = 'Mid-client-J7_9eGvHGuKWlmiT';

// Midtrans Snap script URL (Sandbox)
export const MIDTRANS_SNAP_URL = 'https://app.sandbox.midtrans.com/snap/snap.js';

// Backend API URL - uses Vercel serverless functions in production
const isDevelopment = import.meta.env.DEV;
export const PAYMENT_API_URL = isDevelopment 
    ? 'http://localhost:5000/api/payment' 
    : '/api';

// Load Midtrans Snap script dynamically
export const loadMidtransScript = () => {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.snap) {
            resolve(window.snap);
            return;
        }

        // Check if script is already in DOM
        const existingScript = document.querySelector(`script[src="${MIDTRANS_SNAP_URL}"]`);
        if (existingScript) {
            existingScript.addEventListener('load', () => resolve(window.snap));
            return;
        }

        // Create and load script
        const script = document.createElement('script');
        script.src = MIDTRANS_SNAP_URL;
        script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
        script.async = true;

        script.onload = () => {
            console.log('Midtrans Snap loaded successfully');
            resolve(window.snap);
        };

        script.onerror = () => {
            reject(new Error('Failed to load Midtrans Snap script'));
        };

        document.head.appendChild(script);
    });
};

// Payment Service
export const PaymentService = {
    // Create payment transaction
    createTransaction: async ({ userId, customerName, customerEmail, customerPhone, amount = 50000 }) => {
        try {
            // Generate unique order ID
            const orderId = `MEMBER-${userId.substring(0, 8)}-${Date.now()}`;

            const response = await fetch(`${PAYMENT_API_URL}/create-transaction`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId,
                    amount,
                    customerName,
                    customerEmail,
                    customerPhone,
                    userId,
                    itemName: 'Keanggotaan Perpustakaan Salahuddin (Seumur Hidup)'
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to create transaction');
            }

            return data;
        } catch (error) {
            console.error('Create transaction error:', error);
            throw error;
        }
    },

    // Check payment status
    checkStatus: async (orderId) => {
        try {
            const response = await fetch(`${PAYMENT_API_URL}/payment-status?orderId=${orderId}`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to check status');
            }

            return data;
        } catch (error) {
            console.error('Check status error:', error);
            throw error;
        }
    },

    // Open Midtrans Snap popup
    openSnapPopup: async (token, callbacks = {}) => {
        try {
            // Load script first
            await loadMidtransScript();

            // Default callbacks
            const defaultCallbacks = {
                onSuccess: (result) => {
                    console.log('Payment success:', result);
                    callbacks.onSuccess?.(result);
                },
                onPending: (result) => {
                    console.log('Payment pending:', result);
                    callbacks.onPending?.(result);
                },
                onError: (result) => {
                    console.log('Payment error:', result);
                    callbacks.onError?.(result);
                },
                onClose: () => {
                    console.log('Payment popup closed');
                    callbacks.onClose?.();
                }
            };

            // Open Snap popup
            window.snap.pay(token, defaultCallbacks);

        } catch (error) {
            console.error('Open snap popup error:', error);
            throw error;
        }
    },

    // Full payment flow - Create transaction and open popup
    initiatePayment: async ({ userId, customerName, customerEmail, customerPhone, amount = 50000 }, callbacks = {}) => {
        try {
            // Create transaction
            const transaction = await PaymentService.createTransaction({
                userId,
                customerName,
                customerEmail,
                customerPhone,
                amount
            });

            if (!transaction.success || !transaction.token) {
                throw new Error('Invalid transaction response');
            }

            // Open popup
            await PaymentService.openSnapPopup(transaction.token, {
                ...callbacks,
                orderId: transaction.order_id
            });

            return transaction;

        } catch (error) {
            console.error('Initiate payment error:', error);
            throw error;
        }
    }
};

export default PaymentService;
