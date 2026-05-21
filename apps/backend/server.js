const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('compression');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(compression()); // Compress all HTTP responses

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const emailRoutes  = require('./src/modules/email/email.routes');
const uploadRoutes = require('./src/modules/upload/upload.routes');

app.use('/api/email',  emailRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
        error: err.message 
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
