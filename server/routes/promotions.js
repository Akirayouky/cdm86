/**
 * Promotion Routes
 * Gestisce visualizzazione, ricerca e riscatto promozioni
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// GET /api/promotions - Lista promozioni (public)
router.get('/', async (req, res) => {
    res.json({ 
        message: 'Promotions list endpoint',
        promotions: []
    });
});

// GET /api/promotions/:id - Dettaglio promozione
router.get('/:id', async (req, res) => {
    res.json({ 
        message: 'Promotion detail endpoint',
        id: req.params.id
    });
});

// GET /api/promotions/category/:category - Per categoria
router.get('/category/:category', async (req, res) => {
    res.json({ 
        message: 'Promotions by category',
        category: req.params.category
    });
});

// POST /api/promotions/search - Ricerca
router.post('/search', async (req, res) => {
    res.json({ message: 'Search promotions endpoint - da implementare' });
});

// GET /api/promotions/favorites - Preferite (auth required)
router.get('/user/favorites', authenticate, async (req, res) => {
    res.json({ message: 'User favorites endpoint - da implementare' });
});

// POST /api/promotions/:id/favorite - Aggiungi/rimuovi preferita
router.post('/:id/favorite', authenticate, async (req, res) => {
    res.json({ message: 'Toggle favorite endpoint - da implementare' });
});

// POST /api/promotions/:id/redeem - Riscatta promozione (auth required)
router.post('/:id/redeem', authenticate, async (req, res) => {
    res.json({ message: 'Redeem promotion endpoint - da implementare' });
});

module.exports = router;