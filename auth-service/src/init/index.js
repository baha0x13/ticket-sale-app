const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

const { User, db } = require('../models');
const config = require('../config');

const SALT_ROUNDS = 10;

createAdmin();

async function createAdmin() {
    try {
        await db.sync();

        const existing = await User.findOne({ where: { email: { [Op.eq]: config.admin.email } } });
        if (existing) {
            console.log(`> Admin account already exists (${config.admin.email})`);
            return;
        }

        const passwordHash = await bcrypt.hash(config.admin.password, SALT_ROUNDS);
        await User.create({
            email: config.admin.email,
            passwordHash,
            name: config.admin.name,
            role: 'admin'
        });

        console.log(`> Admin account created: ${config.admin.email} / ${config.admin.password}`);
    } catch (e) {
        console.error(e);
    }
}
