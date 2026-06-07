const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        minlength: [3, 'username must be at least 3 character long']
        
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        minlength: [5, 'email must be at least 5 character long']
    },
    password: {
        type: String,
        required() {
            return !this.googleId;
        },
        trim: true,
        minlength: [5, 'Password must be at least 3 character long']
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    avatar: String,
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
    }
}, {
    timestamps: true
});

const user = mongoose.model('user', userSchema);

module.exports = user;
