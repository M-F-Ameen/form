const mongoose = require('mongoose');

const jobApplicationSchema = new mongoose.Schema({
    // Personal Information
    fullName: {
        type: String,
        required: [true, 'الاسم الكامل مطلوب'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'البريد الإلكتروني مطلوب'],
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'يرجى إدخال بريد إلكتروني صحيح']
    },
    phone: {
        type: String,
        required: [true, 'رقم الهاتف مطلوب'],
        trim: true
    },
    governorate: {
        type: String,
        required: [true, 'المحافظة مطلوبة'],
        enum: [
            'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر',
            'البحيرة', 'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية',
            'المنيا', 'القليوبية', 'الوادي الجديد', 'شمال سيناء', 'جنوب سيناء',
            'الشرقية', 'أسوان', 'أسيوط', 'بني سويف', 'بورسعيد',
            'دمياط', 'كفر الشيخ', 'الأقصر', 'مطروح', 'قنا', 'سوهاج', 'السويس'
        ]
    },

    // Academic Information
    major: {
        type: String,
        required: [true, 'التخصص الدراسي مطلوب'],
        trim: true
    },
    graduationYear: {
        type: String,
        required: [true, 'سنة التخرج مطلوبة'],
        enum: ['2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', 'أخرى']
    },

    // Application Type
    applicationType: {
        type: String,
        required: [true, 'نوع التقديم مطلوب'],
        enum: ['وظيفة', 'تدريب']
    },

    // Job-specific fields (optional for internships)
    expectedSalary: {
        type: Number,
        min: 0,
        required: function() {
            return this.applicationType === 'وظيفة';
        }
    },
    availabilityDate: {
        type: Date,
        required: function() {
            return this.applicationType === 'وظيفة';
        }
    },

    // Skills and Experience
    skills: {
        type: String,
        required: [true, 'المهارات الأساسية مطلوبة'],
        trim: true
    },

    // Resume file
    resumeFileName: {
        type: String,
        required: [true, 'السيرة الذاتية مطلوبة']
    },
    resumeFilePath: {
        type: String,
        required: [true, 'مسار السيرة الذاتية مطلوب']
    },

    // Application status
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
        default: 'pending'
    },

    // Timestamps
    submittedAt: {
        type: Date,
        default: Date.now
    },
    reviewedAt: {
        type: Date
    },
    reviewedBy: {
        type: String
    }
}, {
    timestamps: true
});

// Index for better query performance
jobApplicationSchema.index({ email: 1, submittedAt: -1 });
jobApplicationSchema.index({ status: 1, submittedAt: -1 });
jobApplicationSchema.index({ applicationType: 1, submittedAt: -1 });

module.exports = mongoose.model('JobApplication', jobApplicationSchema); 