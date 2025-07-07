const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  upi: {
    type: String,
    required: [true, 'UPI ID is required'],
    trim: true,
    unique: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9.\-_]{2,49}@[a-zA-Z]{2,}$/.test(v);
      },
      message: props => `${props.value} is not a valid UPI ID!`
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: String,
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Indexes for faster queries
userSchema.index({ upi: 1 }, { unique: true });
userSchema.index({ createdAt: -1 });
userSchema.index({ ipAddress: 1 });

module.exports = mongoose.model('User', userSchema);
