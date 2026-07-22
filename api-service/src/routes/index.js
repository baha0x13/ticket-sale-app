const express = require('express');

const movieController = require('../controllers/movie');
const orderController = require('../controllers/order');
const authController = require('../controllers/auth');
const { requireAuth, requireRole } = require('../middleware/auth');


let router = express.Router();


// -- auth (proxied to auth-service) --

router.post('/auth/register', (req, res, next) => {
    authController.register(req.body).then(result => {
        res.status(201).json(result);
    }).catch(next);
});

router.post('/auth/login', (req, res, next) => {
    authController.login(req.body).then(result => {
        res.status(200).json(result);
    }).catch(next);
});


// -- movies --

router.post('/movies', requireAuth, requireRole('admin', 'editor'), (req, res, next) => {
    movieController.create(req.body).then(result => {
        res.status(201).json(result);
    }).catch(next);
});

router.delete('/movies/:id', requireAuth, requireRole('admin', 'editor'), (req, res, next) => {
    movieController.delete(req.params.id).then(() => {
        res.sendStatus(204);
    }).catch(next);
});

router.get('/movies', (req, res, next) => {
    movieController.getAll().then(result => {
        res.status(200).json(result);
    }).catch(next);
});

router.get('/movies/:id', (req, res, next) => {
    movieController.getById(req.params.id).then(result => {
        res.status(200).json(result);
    }).catch(next);
});

router.get('/movies/:id/trailer', (req, res, next) => {
    movieController.getTrailer(req.query.title, req.query.year).then(result => {
        res.status(200).json(result);
    }).catch(next);
});


// -- orders --

router.post('/movies/:id/orders', requireAuth, (req, res, next) => {
    orderController.create({
        movieId: parseInt(req.params.id),
        seatIds: req.body.seatIds,
        userId: req.user.id,
        userEmail: req.user.email,
        userName: req.user.name
    }).then(result => {
        res.status(201).json(result);
    }).catch(next);
});

router.get('/orders', requireAuth, (req, res, next) => {
    orderController.getAllForUser(req.user.id).then(result => {
        res.status(200).json(result);
    }).catch(next);
});


// -- admin --

router.get('/admin/orders', requireAuth, requireRole('admin'), (req, res, next) => {
    orderController.getAllForAdmin().then(result => {
        res.status(200).json(result);
    }).catch(next);
});

router.post('/admin/orders/:id/approve', requireAuth, requireRole('admin'), (req, res, next) => {
    orderController.approve(req.params.id).then(result => {
        res.status(200).json(result);
    }).catch(next);
});

router.post('/admin/orders/:id/reject', requireAuth, requireRole('admin'), (req, res, next) => {
    orderController.reject(req.params.id).then(result => {
        res.status(200).json(result);
    }).catch(next);
});

router.get('/admin/users', requireAuth, requireRole('admin'), (req, res, next) => {
    const token = req.headers.authorization.slice(7);
    authController.getAllUsers(token).then(result => {
        res.status(200).json(result);
    }).catch(next);
});

router.patch('/admin/users/:id/role', requireAuth, requireRole('admin'), (req, res, next) => {
    const token = req.headers.authorization.slice(7);
    authController.updateUserRole(token, req.params.id, req.body.role).then(result => {
        res.status(200).json(result);
    }).catch(next);
});

router.get('/admin/movies/deleted', requireAuth, requireRole('admin', 'editor'), (req, res, next) => {
    movieController.getAllDeleted().then(result => {
        res.status(200).json(result);
    }).catch(next);
});

router.post('/admin/movies/:id/restore', requireAuth, requireRole('admin', 'editor'), (req, res, next) => {
    movieController.restore(req.params.id).then(() => {
        res.sendStatus(204);
    }).catch(next);
});


router.get('/healthz', (req, res) => {
    res.status(200).json({ text: 'OK' });
});

module.exports = router;
