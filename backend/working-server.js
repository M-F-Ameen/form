const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Import multer upload middleware
const upload = require('./middleware/upload');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;

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

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
try {
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('✅ Uploads directory created:', uploadsDir);
    } else {
        console.log('✅ Uploads directory already exists:', uploadsDir);
    }
} catch (error) {
    console.error('❌ Error creating uploads directory:', error);
}

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://weallinsurgent:g5Q2IXBhoSgDLcv3@cluster0.nybvzhe.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB connected successfully!');
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

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Job Application API is working!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Test uploads directory
app.get('/api/test-uploads', (req, res) => {
    const uploadsDir = path.join(__dirname, 'uploads');
    const exists = fs.existsSync(uploadsDir);
    const files = exists ? fs.readdirSync(uploadsDir) : [];
    
    res.json({
        uploadsDir: uploadsDir,
        exists: exists,
        files: files,
        currentDir: __dirname
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
    cvFilename: { type: String, default: '' }, // Store CV filename
    status: { type: String, default: 'pending' },
    reviewedBy: { type: String, default: '' },
    reviewedAt: { type: Date },
    submittedAt: { type: Date, default: Date.now }
});

const JobApplication = mongoose.model('JobApplication', jobApplicationSchema);

// API Routes
app.post('/api/applications/submit', upload.single('resume'), async (req, res) => {
    try {
        console.log('📝 Received application submission');
        console.log('📄 File info:', req.file ? req.file.filename : 'No file uploaded');
        console.log('📋 Form data:', req.body);
        
        const applicationData = req.body;
        
        // Add CV filename if file was uploaded
        if (req.file) {
            applicationData.cvFilename = req.file.filename;
            console.log('📎 CV uploaded:', req.file.filename);
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
            cvFilename: savedApplication.cvFilename
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
            return res.status(400).json({
                success: false,
                error: '❌ حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت'
            });
        }
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

// Get all applications
app.get('/api/applications', async (req, res) => {
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

// Get application by ID
app.get('/api/applications/:id', async (req, res) => {
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

// Update application status
app.put('/api/applications/:id/status', async (req, res) => {
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

// Delete application
app.delete('/api/applications/:id', async (req, res) => {
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

// Download CV endpoint
app.get('/api/applications/:id/cv', async (req, res) => {
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
        
        if (!application.cvFilename) {
            console.log('❌ No CV filename for application:', application._id);
            return res.status(404).json({ 
                success: false, 
                error: 'CV not found for this application' 
            });
        }
        
        console.log('📄 CV filename from database:', application.cvFilename);
        
        const cvPath = path.join(__dirname, 'uploads', application.cvFilename);
        console.log('📄 Full CV path:', cvPath);
        
        // Check if file exists
        const fileExists = fs.existsSync(cvPath);
        console.log('📄 File exists:', fileExists);
        
        if (!fileExists) {
            // List files in uploads directory for debugging
            const uploadsDir = path.join(__dirname, 'uploads');
            let filesInDir = [];
            try {
                if (fs.existsSync(uploadsDir)) {
                    filesInDir = fs.readdirSync(uploadsDir);
                }
            } catch (err) {
                console.error('❌ Error reading uploads directory:', err);
            }
            
            console.log('📄 Files in uploads directory:', filesInDir);
            console.log('❌ CV file not found on server');
            
            return res.status(404).json({ 
                success: false, 
                error: 'CV file not found on server. This may happen if the server was restarted, as Railway uses ephemeral storage.',
                debug: {
                    requestedFile: application.cvFilename,
                    availableFiles: filesInDir,
                    uploadsDir: uploadsDir
                }
            });
        }
        
        // Set filename for download
        const originalName = application.cvFilename.split('-').slice(2).join('-'); // Remove timestamp prefix
        const downloadFilename = `CV_${application.fullName}_${originalName}`;
        
        console.log('📄 Setting download filename:', downloadFilename);
        
        res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
        
        // Send the file
        res.sendFile(cvPath);
        console.log('✅ CV file sent successfully');
        
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

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'API endpoint not found'
    });
});

app.listen(PORT, () => {
    console.log('🚀 Server running on port', PORT);
    console.log('📝 Job Form: http://localhost:' + PORT);
    console.log('🔗 Admin Panel: http://localhost:' + PORT + '/admin');
    console.log('🔗 API Test: http://localhost:' + PORT + '/api/test');
}); 