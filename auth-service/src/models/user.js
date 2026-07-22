const Sequelize = require('sequelize');

/**
 *
 * @param db
 * @returns {Model}
 */
module.exports = function (db) {
    return db.define('user', {
        email: {type: Sequelize.STRING, unique: true, allowNull: false},
        passwordHash: {type: Sequelize.STRING, allowNull: false},
        name: {type: Sequelize.STRING, allowNull: false},
        role: {type: Sequelize.ENUM('user', 'editor', 'admin'), defaultValue: 'user'},
    });
};
