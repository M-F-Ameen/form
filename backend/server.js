const express = require('express');
<<<<<<< HEAD
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { Readable } = require('stream');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import multer upload middleware
const upload = require('./middleware/upload');
const multer = require('multer');

// Import authentication middleware
const { authenticateAdmin, JWT_SECRET } = require('./middleware/auth');

const app = express();
const bcrypt = require('bcryptjs');
const PORT = process.env.PORT || 3000;

// GridFS variables
let gfs;
let gridfsBucket;

// CORS configuration for production
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
        ? [process.env.FRONTEND_URL || '*'] 
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://weallinsurgent:g5Q2IXBhoSgDLcv3@cluster0.nybvzhe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB connected successfully!');

        // Initialize GridFS bucket
        const db = mongoose.connection.db;
        gridfsBucket = new mongoose.mongo.GridFSBucket(db, {
            bucketName: 'uploads'
        });
        console.log('✅ GridFS bucket initialized');
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
    });

// Basic routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../login.html'));
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        message: 'Job Application API is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Job Application Schema
const jobApplicationSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    governorate: { type: String, required: true },
    major: { type: String, required: true },
    graduationYear: { type: String, required: true },
    applicationType: { type: String, required: true },
    skills: { type: String, required: true },
    expectedSalary: { type: String, default: '' },
    availabilityDate: { type: String, default: '' },
    cvFileId: { type: mongoose.Schema.Types.ObjectId, ref: 'uploads.files' }, // GridFS file ID
    cvFileName: { type: String, default: '' }, // Original uploaded filename
    cvMimeType: { type: String, default: '' }, // MIME type
    status: { type: String, default: 'pending' },
    reviewedBy: { type: String, default: '' },
    reviewedAt: { type: Date },
    submittedAt: { type: Date, default: Date.now }
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

// Admin settings schema for storing admin password hash
const adminSettingsSchema = new mongoose.Schema({
    _id: { type: String, default: 'admin' },
    passwordHash: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now }
});

const AdminSettings = mongoose.model('AdminSettings', adminSettingsSchema);

// API Routes
app.post('/api/applications/submit', upload.single('resume'), async (req, res) => {
    try {
        console.log('📝 Received application submission');
        console.log('📄 File info:', req.file ? 'File uploaded' : 'No file uploaded');
        console.log('📋 Form data:', req.body);

        const applicationData = req.body;

        // Upload CV to GridFS if file was provided
        if (req.file) {
            try {
                // Create readable stream from file buffer
                const readableStream = new Readable();
                readableStream.push(req.file.buffer);
                readableStream.push(null);

                // Create GridFS upload stream
                const uploadStream = gridfsBucket.openUploadStream(req.file.originalname, {
                    contentType: req.file.mimetype,
                    metadata: {
                        originalName: req.file.originalname,
                        uploadedBy: req.body.fullName || 'Unknown',
                        uploadedAt: new Date()
                    }
                });

                // Pipe file buffer to GridFS
                readableStream.pipe(uploadStream);

                // Wait for upload to complete
                await new Promise((resolve, reject) => {
                    uploadStream.on('finish', () => {
                        console.log('📎 CV uploaded to GridFS:', uploadStream.id, 'bytes:', req.file.size);
                        applicationData.cvFileId = uploadStream.id;
                        applicationData.cvFileName = req.file.originalname;
                        applicationData.cvMimeType = req.file.mimetype;
                        resolve();
                    });
                    uploadStream.on('error', reject);
                });

            } catch (uploadErr) {
                console.error('❌ Error uploading file to GridFS:', uploadErr);
                return res.status(500).json({
                    success: false,
                    error: 'Failed to upload CV file'
                });
            }
        }

        // Create new application
        const newApplication = new JobApplication({
            ...applicationData,
            submittedAt: new Date()
        });

        const savedApplication = await newApplication.save();

        console.log('✅ Application saved to database:', {
            id: savedApplication._id,
            fullName: savedApplication.fullName,
            email: savedApplication.email,
            phone: savedApplication.phone,
            governorate: savedApplication.governorate,
            major: savedApplication.major,
            graduationYear: savedApplication.graduationYear,
            applicationType: savedApplication.applicationType,
            skills: savedApplication.skills,
            cvFileId: savedApplication.cvFileId
        });

        res.json({
            success: true,
            message: 'Application submitted successfully',
            applicationId: savedApplication._id
        });
    } catch (error) {
        console.error('❌ Error saving application:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to save application'
        });
    }
});

// Error handling middleware for multer
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        console.error('❌ Multer error:', error);
        if (error.code === 'LIMIT_FILE_SIZE') {
=======
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config();

const connectDB = require('./config/database');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from parent directory (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '..')));

// Simple test route
app.get('/api/test', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Serve admin panel
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'admin.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
>>>>>>> 13f013ec2173f51d8cf7d4998d37bd7ced1e5eb1
            return res.status(400).json({
                success: false,
                error: '❌ حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت'
            });
        }
<<<<<<< HEAD
        return res.status(400).json({
            success: false,
            error: '❌ خطأ في رفع الملف: ' + error.message
        });
    }
    
    if (error) {
        console.error('❌ General error:', error);
        return res.status(500).json({
            success: false,
            error: '❌ حدث خطأ في الخادم: ' + error.message
        });
    }
    
    next();
});

// Get all applications (PROTECTED)
app.get('/api/applications', authenticateAdmin, async (req, res) => {
    try {
        const applications = await JobApplication.find().sort({ submittedAt: -1 });
        res.json({ 
            success: true, 
            applications: applications 
        });
    } catch (error) {
        console.error('❌ Error fetching applications:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch applications' 
        });
    }
});

// Get application by ID (PROTECTED)
app.get('/api/applications/:id', authenticateAdmin, async (req, res) => {
    try {
        const application = await JobApplication.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ 
                success: false, 
                error: 'Application not found' 
            });
        }
        res.json({ 
            success: true, 
            application: application 
        });
    } catch (error) {
        console.error('❌ Error fetching application:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch application' 
        });
    }
});

// Update application status (PROTECTED)
app.put('/api/applications/:id/status', authenticateAdmin, async (req, res) => {
    try {
        const { status, reviewedBy } = req.body;
        const application = await JobApplication.findByIdAndUpdate(
            req.params.id,
            { 
                status, 
                reviewedBy, 
                reviewedAt: new Date() 
            },
            { new: true }
        );
        
        if (!application) {
            return res.status(404).json({ 
                success: false, 
                error: 'Application not found' 
            });
        }
        
        res.json({ 
            success: true, 
            application: application 
        });
    } catch (error) {
        console.error('❌ Error updating application:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to update application' 
        });
    }
});

// Delete application (PROTECTED)
app.delete('/api/applications/:id', authenticateAdmin, async (req, res) => {
    try {
        console.log('🗑️ DELETE request received for ID:', req.params.id);
        
        const application = await JobApplication.findByIdAndDelete(req.params.id);
        
        if (!application) {
            return res.status(404).json({ 
                success: false, 
                error: 'Application not found' 
            });
        }
        
        console.log('🗑️ Application deleted:', application._id);
        
        res.json({ 
            success: true, 
            message: 'Application deleted successfully' 
        });
    } catch (error) {
        console.error('❌ Error deleting application:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to delete application' 
        });
    }
});

// Download CV endpoint - streams from GridFS (PROTECTED)
app.get('/api/applications/:id/cv', authenticateAdmin, async (req, res) => {
    try {
        console.log('📄 Download CV request for ID:', req.params.id);

        const application = await JobApplication.findById(req.params.id);

        if (!application) {
            console.log('❌ Application not found for ID:', req.params.id);
            return res.status(404).json({
                success: false,
                error: 'Application not found'
            });
        }

        if (!application.cvFileId) {
            console.log('❌ No CV file ID for application:', application._id);
            return res.status(404).json({
                success: false,
                error: 'CV not found for this application'
            });
        }

        console.log('📄 CV file ID from database:', application.cvFileId);

        // Set download headers
        const downloadFilename = `CV_${application.fullName}_${application.cvFileName}`;
        res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
        res.setHeader('Content-Type', application.cvMimeType || 'application/octet-stream');

        // Create GridFS download stream
        const downloadStream = gridfsBucket.openDownloadStream(application.cvFileId);

        downloadStream.on('error', (error) => {
            console.error('❌ Error streaming file from GridFS:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    error: 'Failed to download CV file'
                });
            }
        });

        downloadStream.on('end', () => {
            console.log('✅ CV file streamed successfully from GridFS');
        });

        // Pipe the file stream to response
        downloadStream.pipe(res);

    } catch (error) {
        console.error('❌ Error downloading CV:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to download CV: ' + error.message
        });
    }
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// ---------------- Admin Password Endpoints ----------------
// Update admin password (stores hash in DB) (PROTECTED)
app.put('/api/admin/password', authenticateAdmin, async (req, res) => {
    try {
        const { newPassword } = req.body || {};
        if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 3) {
            return res.status(400).json({ success: false, error: 'New password is invalid' });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        const updated = await AdminSettings.findByIdAndUpdate(
            'admin',
            { passwordHash, updatedAt: new Date() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        return res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('❌ Error updating admin password:', error);
        return res.status(500).json({ success: false, error: 'Failed to update password' });
    }
});

// Verify admin password (login) - returns JWT token
app.post('/api/admin/login', async (req, res) => {
    try {
        const { password } = req.body || {};
        if (!password || typeof password !== 'string') {
            return res.status(400).json({ success: false, error: 'Password is required' });
        }

        const settings = await AdminSettings.findById('admin');
        if (!settings || !settings.passwordHash) {
            // If no password set yet, default-deny
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const match = await bcrypt.compare(password, settings.passwordHash);
        if (!match) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { admin: true, loginTime: new Date().toISOString() },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.json({ success: true, token });
    } catch (error) {
        console.error('❌ Error verifying admin password:', error);
        return res.status(500).json({ success: false, error: 'Failed to verify password' });
    }
});

// 404 handler for API routes (keep LAST so all API routes above are reachable)
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'API endpoint not found'
    });
});

app.listen(PORT, () => {
    console.log('🚀 Server running on port', PORT);
    console.log('📝 Job Form: http://localhost:' + PORT);
    console.log('🔐 Admin Login: http://localhost:' + PORT + '/login');
    console.log('🔗 Admin Panel: http://localhost:' + PORT + '/admin');
    console.log('🔗 API Test: http://localhost:' + PORT + '/api/test');
});
=======
    }
    
    res.status(500).json({
        success: false,
        error: '❌ حدث خطأ في الخادم'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: '❌ الصفحة غير موجودة'
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Job Application Form: http://localhost:${PORT}`);
    console.log(`🔗 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`🔗 API Test: http://localhost:${PORT}/api/test`);
}); 
>>>>>>> 13f013ec2173f51d8cf7d4998d37bd7ced1e5eb1
