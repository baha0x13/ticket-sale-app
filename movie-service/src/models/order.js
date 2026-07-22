const Sequelize = require('sequelize');

/**
 *
 * @param db
 * @returns {Model}
 */
module.exports = function (db) {
    return db.define('order', {
        total: {type: Sequelize.DECIMAL(10,2), defaultValue: 50.0},
        userId: {type: Sequelize.INTEGER, allowNull: true},
        userEmail: {type: Sequelize.STRING, allowNull: true},
        userName: {type: Sequelize.STRING, allowNull: true},
        paymentStatus: {type: Sequelize.ENUM('pending', 'confirmed', 'rejected'), defaultValue: 'pending'},
        bankReference: {type: Sequelize.STRING, allowNull: true},
    });
};
