/**
 * Authentication Middleware
 * Verifica JWT tokens e protegge le route
 */

const jwt = require('jsonwebtoken');

// Verifica token JWT
const authenticate = async (req, res, next) => {
    try {
        // Estrai token dall'header
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token non fornito'
            });
        }

        // Verifica token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Aggiungi user info alla request
        req.user = {
            id: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };
        
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token scaduto'
            });
        }
        
        return res.status(401).json({
            success: false,
            error: 'Token non valido'
        });
    }
};

// Verifica ruolo
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Non autenticato'
            });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Non autorizzato'
            });
        }
        
        next();
    };
};

module.exports = {
    authenticate,
    authorize
};