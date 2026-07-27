const Sequelize = require('sequelize');
const config = require('../config/db');

const db = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
});

const User = require('./user')(db);

module.exports = {
    db,
    User
};
