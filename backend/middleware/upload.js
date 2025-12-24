const multer = require('multer');

// File filter function
const fileFilter = (req, file, cb) => {
    // Allow only PDF, DOC, DOCX files
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('❌ نوع الملف غير مسموح به. يسمح فقط بـ PDF, DOC, DOCX'), false);
    }
};

// Configure multer for memory storage (files will be streamed to GridFS)
const upload = multer({
    storage: multer.memoryStorage(), // Keep files in memory for GridFS streaming
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});

module.exports = upload;
