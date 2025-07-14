const mongoose = require('mongoose');

mongoose.set('debug', true);

mongoose.connect(process.env.DB_URL);

const db = mongoose.connection;

db.on('error', (err) => {
    console.error('[DB] Connection error:', err);
});

db.on('connected', () => {
    console.log('[DB] Connected to MongoDB at', process.env.DB_URL);
});

db.once('open', () => {
    console.log('[DB] Connection is now open and ready');
});

db.on('disconnected', () => {
    console.warn('[DB] Disconnected from MongoDB');
});

process.on('SIGINT', () => {
    db.close(() => {
        console.log('[DB] Connection closed due to app termination');
        process.exit(0);
    });
});

module.exports = db;
