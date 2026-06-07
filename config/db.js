const mongoose = require('mongoose');

function connectToDB() {
    const mongoUri = process.env.MONGO_URI || process.env.MONGOURI;

    if (!mongoUri) {
        console.warn('MONGO_URI is missing. MongoDB features will not work until it is configured.');
        return Promise.resolve();
    }

    return mongoose.connect(mongoUri).then(() => {
        console.log('connected to DB');
    }).catch((err) => {
        console.error('MongoDB connection failed:', err.message);
    });
}

module.exports = connectToDB;
