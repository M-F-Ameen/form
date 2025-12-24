const multer = require('multer');
<<<<<<< HEAD
=======
const path = require('path');
const fs = require('fs');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
>>>>>>> 13f013ec2173f51d8cf7d4998d37bd7ced1e5eb1

// File filter function
const fileFilter = (req, file, cb) => {
    // Allow only PDF, DOC, DOCX files
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
<<<<<<< HEAD

=======
    
>>>>>>> 13f013ec2173f51d8cf7d4998d37bd7ced1e5eb1
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('❌ نوع الملف غير مسموح به. يسمح فقط بـ PDF, DOC, DOCX'), false);
    }
};

<<<<<<< HEAD
// Configure multer for memory storage (files will be streamed to GridFS)
const upload = multer({
    storage: multer.memoryStorage(), // Keep files in memory for GridFS streaming
=======
// Configure multer
const upload = multer({
    storage: storage,
>>>>>>> 13f013ec2173f51d8cf7d4998d37bd7ced1e5eb1
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});

<<<<<<< HEAD
module.exports = upload;
=======
module.exports = upload; 
>>>>>>> 13f013ec2173f51d8cf7d4998d37bd7ced1e5eb1
