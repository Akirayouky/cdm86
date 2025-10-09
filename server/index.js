/**
 * CDM86 Platform - Main Server
 * Node.js + Express backend for promotions platform
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const promotionRoutes = require('./routes/promotions');
const referralRoutes = require('./routes/referrals');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { authenticate } = require('./middleware/auth');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable for PWA
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Troppi tentativi, riprova più tardi'
});
app.use('/api/', limiter);

// Compression
app.use(compression());

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// Static files
app.use(express.static(path.join(__dirname, '..'), {
    maxAge: '1y',
    etag: true
}));

// Service Worker
app.get('/service-worker.js', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'service-worker.js'));
});

// Manifest
app.get('/manifest.json', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'manifest.json'));
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/promotions', promotionRoutes);
app.use('/api/referrals', authenticate, referralRoutes);

// Catch-all route - serve index.html for SPA
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '..', 'index.html'));
    } else {
        res.status(404).json({ error: 'Endpoint non trovato' });
    }
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════════╗
    ║                                               ║
    ║    🚀 CDM86 Platform Server                  ║
    ║                                               ║
    ║    📡 Server: http://localhost:${PORT}       ║
    ║    🌐 Environment: ${process.env.NODE_ENV || 'development'}            ║
    ║    📅 Started: ${new Date().toLocaleString('it-IT')}  ║
    ║                                               ║
    ╚═══════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

module.exports = app;