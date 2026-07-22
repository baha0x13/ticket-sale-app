const jwt = require('jsonwebtoken');
const config = require('../config');

function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) return res.status(401).json({ error: { message: 'Missing token' } });

    try {
        req.user = jwt.verify(token, config.jwt_secret);
        next();
    } catch {
        res.status(401).json({ error: { message: 'Invalid or expired token' } });
    }
}

function requireAdmin(req, res, next) {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: { message: 'Admin access required' } });
    next();
}

module.exports = { requireAuth, requireAdmin };
