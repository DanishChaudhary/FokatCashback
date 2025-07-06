const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    upi: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^[a-zA-Z0-9.\-_]{2,49}@[a-zA-Z]{2,}$/.test(v);
            },
            message: props => `${props.value} is not a valid UPI ID!`
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    ipAddress: String,
    userAgent: String
});

const User = mongoose.model('User', userSchema);

module.exports = User;