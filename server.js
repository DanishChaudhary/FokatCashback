require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const User = require('./models/user');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
  }
}));

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Form submission endpoint
app.post('/submit', async (req, res) => {
  try {
    const { name, upi } = req.body;

    if (!name || !upi) {
      return res.status(400).json({ success: false, message: 'Name and UPI ID are required' });
    }

    const newUser = new User({
      name,
      upi,
      ipAddress: req.headers['x-forwarded-for'] || req.ip,
      userAgent: req.headers['user-agent']
    });

    await newUser.save();

    res.json({
      success: true,
      message: 'Data saved successfully',
      redirectUrl: process.env.REDIRECT_URL
    });
  } catch (error) {
    console.error('Error saving user data:', error);
    let message = 'Server error';
    if (error.name === 'ValidationError') {
      message = Object.values(error.errors).map(err => err.message).join('. ');
    } else if (error.code === 11000) {
      message = 'This UPI ID has already been used';
    }
    res.status(500).json({ success: false, message });
  }
});

// Serve root HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
