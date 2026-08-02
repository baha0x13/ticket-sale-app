const useSsl = process.env.DB_SSL === 'true';

module.exports = {
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'postgres',
    dialect: 'postgres',
    port: process.env.DB_PORT || '5432',
    logging: false,
    dialectOptions: {
        ...(useSsl ? {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        } : {}),
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000
    }
};