module.exports = {
    port: process.env.PORT || 4000,

    jwt_secret: process.env.JWT_SECRET || 'dev-secret-change-me',
    jwt_expires_in: process.env.JWT_EXPIRES_IN || '7d',

    admin: {
        email: process.env.ADMIN_EMAIL || 'admin@ticketflow.local',
        password: process.env.ADMIN_PASSWORD || 'admin123',
        name: process.env.ADMIN_NAME || 'Admin'
    }
};
