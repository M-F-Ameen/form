const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

// Test MongoDB connection
app.get('/test-db', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        await mongoose.connect(process.env.MONGODB_URI);
        res.json({ message: 'Database connected successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Test server running on port ${PORT}`);
    console.log(`📝 Test URL: http://localhost:${PORT}/test`);
    console.log(`🔗 Database test: http://localhost:${PORT}/test-db`);
}); 