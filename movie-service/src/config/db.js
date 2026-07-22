module.exports = {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'KSR',
    dialect: 'mysql',
    port: process.env.DB_PORT || '3306',
    logging: false
};