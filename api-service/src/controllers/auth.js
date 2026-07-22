const authService = require('../services/auth');

module.exports = {
    register(body) {
        return authService.register(body);
    },

    login(body) {
        return authService.login(body);
    },

    getAllUsers(token) {
        return authService.getAllUsers(token);
    },

    updateUserRole(token, id, role) {
        return authService.updateUserRole(token, id, role);
    }
};
