const express = require('express');
const router = express.Router();
const JobApplication = require('../models/JobApplication');
const upload = require('../middleware/upload');

// POST - Submit new job application
router.post('/submit', upload.single('resume'), async (req, res) => {
    try {
        // Check if resume file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: '❌ السيرة الذاتية مطلوبة'
            });
        }

        // Create application data
        const applicationData = {
            fullName: req.body.fullName,
            email: req.body.email,
            phone: req.body.phone,
            governorate: req.body.governorate,
            major: req.body.major,
            graduationYear: req.body.graduationYear,
            applicationType: req.body.applicationType,
            skills: req.body.skills,
            resumeFileName: req.file.originalname,
            resumeFilePath: req.file.path
        };

        // Add job-specific fields if application type is job
        if (req.body.applicationType === 'وظيفة') {
            applicationData.expectedSalary = req.body.expectedSalary;
            applicationData.availabilityDate = req.body.availabilityDate;
        }

        // Create new application
        const application = new JobApplication(applicationData);
        await application.save();

        res.status(201).json({
            success: true,
            message: '✅ تم إرسال طلبك بنجاح! سيتم التواصل معك قريباً من فريق بى بى اس سوفت.',
            applicationId: application._id
        });

    } catch (error) {
        console.error('Application submission error:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                error: errors.join(', ')
            });
        }

        res.status(500).json({
            success: false,
            error: '❌ حدث خطأ في الإرسال. يرجى المحاولة مرة أخرى.'
        });
    }
});

// GET - Get all applications (for admin panel)
router.get('/all', async (req, res) => {
    try {
        const applications = await JobApplication.find()
            .sort({ submittedAt: -1 })
            .select('-__v');

        res.json({
            success: true,
            count: applications.length,
            applications
        });
    } catch (error) {
        console.error('Get applications error:', error);
        res.status(500).json({
            success: false,
            error: '❌ حدث خطأ في جلب البيانات'
        });
    }
});

// GET - Get applications by status
router.get('/status/:status', async (req, res) => {
    try {
        const applications = await JobApplication.find({ status: req.params.status })
            .sort({ submittedAt: -1 })
            .select('-__v');

        res.json({
            success: true,
            count: applications.length,
            applications
        });
    } catch (error) {
        console.error('Get applications by status error:', error);
        res.status(500).json({
            success: false,
            error: '❌ حدث خطأ في جلب البيانات'
        });
    }
});

// GET - Get application by ID
router.get('/:id', async (req, res) => {
    try {
        const application = await JobApplication.findById(req.params.id);
        
        if (!application) {
            return res.status(404).json({
                success: false,
                error: '❌ لم يتم العثور على الطلب'
            });
        }

        res.json({
            success: true,
            application
        });
    } catch (error) {
        console.error('Get application error:', error);
        res.status(500).json({
            success: false,
            error: '❌ حدث خطأ في جلب البيانات'
        });
    }
});

// PUT - Update application status (for admin panel)
router.put('/:id/status', async (req, res) => {
    try {
        const { status, reviewedBy } = req.body;
        
        const application = await JobApplication.findByIdAndUpdate(
            req.params.id,
            {
                status,
                reviewedBy,
                reviewedAt: Date.now()
            },
            { new: true }
        );

        if (!application) {
            return res.status(404).json({
                success: false,
                error: '❌ لم يتم العثور على الطلب'
            });
        }

        res.json({
            success: true,
            message: '✅ تم تحديث حالة الطلب بنجاح',
            application
        });
    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({
            success: false,
            error: '❌ حدث خطأ في تحديث الحالة'
        });
    }
});

module.exports = router; 