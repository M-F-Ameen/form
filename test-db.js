const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

async function testConnection() {
    try {
        console.log('🔗 Testing MongoDB connection...');
        console.log('Connection string:', process.env.MONGODB_URI ? 'Found' : 'Missing');
        
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected successfully!');
        
        // Test creating a simple document
        const TestSchema = new mongoose.Schema({ name: String, date: { type: Date, default: Date.now } });
        const Test = mongoose.model('Test', TestSchema);
        
        const testDoc = new Test({ name: 'Connection Test' });
        await testDoc.save();
        console.log('✅ Database write test successful!');
        
        await mongoose.disconnect();
        console.log('✅ Connection closed successfully!');
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
}

testConnection(); 