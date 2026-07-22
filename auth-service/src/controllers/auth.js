const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const { User } = require('../models');
const config = require('../config');

const SALT_ROUNDS = 10;
const ROLES = ['user', 'editor', 'admin'];

function toPublicUser(user) {
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
    };
}

function signToken(user) {
    return jwt.sign(toPublicUser(user), config.jwt_secret, { expiresIn: config.jwt_expires_in });
}

module.exports = {
    signToken,
    toPublicUser,

    async register({ email, password, name }) {
        if (!email || !password || !name) {
            const err = new Error('email, password and name are required');
            err.status = 400;
            throw err;
        }

        const existing = await User.findOne({ where: { email: { [Op.eq]: email } } });
        if (existing) {
            const err = new Error('An account with this email already exists');
            err.status = 409;
            throw err;
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await User.create({ email, passwordHash, name });

        return { token: signToken(user), user: toPublicUser(user) };
    },

    async login({ email, password }) {
        const user = await User.findOne({ where: { email: { [Op.eq]: email } } });
        if (!user) {
            const err = new Error('Invalid email or password');
            err.status = 401;
            throw err;
        }

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            const err = new Error('Invalid email or password');
            err.status = 401;
            throw err;
        }

        return { token: signToken(user), user: toPublicUser(user) };
    },

    async getById(id) {
        const user = await User.findByPk(id);
        if (!user) {
            const err = new Error('User not found');
            err.status = 404;
            throw err;
        }
        return toPublicUser(user);
    },

    async getAll() {
        const users = await User.findAll({ order: [['createdAt', 'DESC']] });
        return users.map(toPublicUser);
    },

    async updateRole(id, role) {
        if (!ROLES.includes(role)) {
            const err = new Error(`role must be one of: ${ROLES.join(', ')}`);
            err.status = 400;
            throw err;
        }

        const user = await User.findByPk(id);
        if (!user) {
            const err = new Error('User not found');
            err.status = 404;
            throw err;
        }

        await user.update({ role });
        return toPublicUser(user);
    }
};
