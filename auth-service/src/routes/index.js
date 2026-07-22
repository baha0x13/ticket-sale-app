const express = require('express');

const authController = require('../controllers/auth');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/healthz', (req, res) => {
    res.status(200).json({ text: 'OK' });
});

router.post('/register', (req, res, next) => {
    authController.register(req.body).then(result => {
        res.status(201).json(result);
    }).catch(next);
});

router.post('/login', (req, res, next) => {
    authController.login(req.body).then(result => {
        res.status(200).json(result);
    }).catch(next);
});

router.get('/me', requireAuth, (req, res, next) => {
    authController.getById(req.user.id).then(user => {
        res.status(200).json(user);
    }).catch(next);
});

router.get('/users', requireAuth, requireAdmin, (req, res, next) => {
    authController.getAll().then(users => {
        res.status(200).json(users);
    }).catch(next);
});

router.patch('/users/:id/role', requireAuth, requireAdmin, (req, res, next) => {
    if (Number(req.params.id) === req.user.id) {
        return res.status(400).json({ error: { message: 'You cannot change your own role' } });
    }

    authController.updateRole(req.params.id, req.body.role).then(user => {
        res.status(200).json(user);
    }).catch(next);
});

module.exports = router;
