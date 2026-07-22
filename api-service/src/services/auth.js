const axios = require('axios');
const config = require('../config');

const client = axios.create({ baseURL: config.auth_service_url });

function forward(promise) {
    return promise.then(res => res.data).catch(err => {
        if (err.response) {
            const proxied = new Error(err.response.data?.error?.message || 'Auth error');
            proxied.status = err.response.status;
            throw proxied;
        }
        throw err;
    });
}

module.exports = {
    register(body) {
        return forward(client.post('/register', body));
    },

    login(body) {
        return forward(client.post('/login', body));
    },

    getAllUsers(token) {
        return forward(client.get('/users', { headers: { Authorization: `Bearer ${token}` } }));
    },

    updateUserRole(token, id, role) {
        return forward(client.patch(`/users/${id}/role`, { role }, { headers: { Authorization: `Bearer ${token}` } }));
    }
};
