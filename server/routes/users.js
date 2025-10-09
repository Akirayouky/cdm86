/**
 * User Routes
 * Gestisce profilo utente, statistiche, transazioni
 */

const express = require('express');
const router = express.Router();

// GET /api/users/profile - Profilo utente
router.get('/profile', async (req, res) => {
    res.json({ 
        message: 'User profile endpoint',
        user: req.user 
    });
});

// PUT /api/users/profile - Aggiorna profilo
router.put('/profile', async (req, res) => {
    res.json({ message: 'Update profile endpoint - da implementare' });
});

// GET /api/users/stats - Statistiche utente
router.get('/stats', async (req, res) => {
    res.json({ message: 'User stats endpoint - da implementare' });
});

// GET /api/users/points - Saldo punti
router.get('/points', async (req, res) => {
    res.json({ message: 'User points endpoint - da implementare' });
});

// GET /api/users/transactions - Storico transazioni
router.get('/transactions', async (req, res) => {
    res.json({ message: 'User transactions endpoint - da implementare' });
});

module.exports = router;