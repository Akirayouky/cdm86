/**
 * Authentication Routes
 * Gestisce registrazione, login, logout
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// Placeholder per i controller (li creeremo dopo)
// const authController = require('../controllers/authController');

// Validation rules
const registerValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Email non valida'),
    body('password').isLength({ min: 6 }).withMessage('Password min 6 caratteri'),
    body('firstName').trim().notEmpty().withMessage('Nome richiesto'),
    body('lastName').trim().notEmpty().withMessage('Cognome richiesto')
];

const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Email non valida'),
    body('password').notEmpty().withMessage('Password richiesta')
];

// Routes (placeholder - implementeremo i controller dopo)
router.post('/register', registerValidation, async (req, res) => {
    res.json({ message: 'Register endpoint - da implementare' });
});

router.post('/login', loginValidation, async (req, res) => {
    res.json({ message: 'Login endpoint - da implementare' });
});

router.post('/logout', async (req, res) => {
    res.json({ message: 'Logout endpoint - da implementare' });
});

router.post('/refresh', async (req, res) => {
    res.json({ message: 'Refresh token endpoint - da implementare' });
});

router.post('/forgot-password', async (req, res) => {
    res.json({ message: 'Forgot password endpoint - da implementare' });
});

router.post('/reset-password', async (req, res) => {
    res.json({ message: 'Reset password endpoint - da implementare' });
});

router.post('/verify-email', async (req, res) => {
    res.json({ message: 'Verify email endpoint - da implementare' });
});

module.exports = router;