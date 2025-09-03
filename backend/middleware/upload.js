const multer = require('multer');
const path = require('path');
const ErrorResponse = require('../utils/errorResponse');

// Configure storage for different file types
const createStorage = (subfolder) => {
    return multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, `uploads/${subfolder}/`);
        },
        filename: function (req, file, cb) {
            // Generate unique filename
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const ext = path.extname(file.originalname);
            const name = file.fieldname + '-' + uniqueSuffix + ext;
            cb(null, name);
        }
    });
};

// File filter for images
const imageFilter = (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new ErrorResponse('Only image files are allowed', 400), false);
    }
};

// File filter for documents
const documentFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/zip',
        'application/x-zip-compressed'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ErrorResponse('Only PDF, DOC, DOCX, TXT, and ZIP files are allowed', 400), false);
    }
};

// File filter for code files
const codeFilter = (req, file, cb) => {
    const allowedExtensions = ['.js', '.ts', '.py', '.java', '.cpp', '.c', '.cs', '.go', '.rs', '.php', '.rb', '.kt', '.swift', '.html', '.css', '.json', '.xml', '.sql', '.md'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedExtensions.includes(ext) || file.mimetype === 'text/plain') {
        cb(null, true);
    } else {
        cb(new ErrorResponse('Only code files are allowed', 400), false);
    }
};

// Avatar upload configuration
const avatarUpload = multer({
    storage: createStorage('avatars'),
    fileFilter: imageFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB
        files: 1
    }
});

// Project files upload configuration
const projectUpload = multer({
    storage: createStorage('projects'),
    fileFilter: (req, file, cb) => {
        // Allow images, documents, and code files for projects
        if (file.mimetype.startsWith('image/') || 
            documentFilter(req, file, () => {}) || 
            codeFilter(req, file, () => {})) {
            cb(null, true);
        } else {
            cb(new ErrorResponse('File type not allowed for projects', 400), false);
        }
    },
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
        files: 10 // Maximum 10 files
    }
});

// Certificate upload configuration
const certificateUpload = multer({
    storage: createStorage('certificates'),
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new ErrorResponse('Only PDF, JPEG, and PNG files are allowed for certificates', 400), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 1
    }
});

// Community branding upload configuration
const brandingUpload = multer({
    storage: createStorage('branding'),
    fileFilter: imageFilter,
    limits: {
        fileSize: 3 * 1024 * 1024, // 3MB
        files: 2 // Logo and banner
    }
});

// General file upload middleware with error handling
const handleUploadError = (upload) => {
    return (req, res, next) => {
        upload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return next(new ErrorResponse(`File too large. Maximum size is ${Math.round(upload.options.limits.fileSize / 1024 / 1024)}MB`, 400));
                } else if (err.code === 'LIMIT_FILE_COUNT') {
                    return next(new ErrorResponse(`Too many files. Maximum is ${upload.options.limits.files}`, 400));
                } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
                    return next(new ErrorResponse('Unexpected file field', 400));
                } else {
                    return next(new ErrorResponse(err.message, 400));
                }
            } else if (err) {
                return next(err);
            }
            next();
        });
    };
};

// Middleware to add file URL to request
const addFileUrl = (req, res, next) => {
    if (req.file) {
        req.file.url = `/uploads/${req.file.filename}`;
    }
    
    if (req.files) {
        if (Array.isArray(req.files)) {
            req.files.forEach(file => {
                file.url = `/uploads/${file.filename}`;
            });
        } else {
            // Handle multiple fields
            Object.keys(req.files).forEach(fieldname => {
                req.files[fieldname].forEach(file => {
                    file.url = `/uploads/${file.filename}`;
                });
            });
        }
    }
    
    next();
};

// Export configured upload middlewares
module.exports = {
    // Avatar upload (single file)
    uploadAvatar: [
        handleUploadError(avatarUpload.single('avatar')),
        addFileUrl
    ],
    
    // Project files upload (multiple files)
    uploadProjectFiles: [
        handleUploadError(projectUpload.array('files', 10)),
        addFileUrl
    ],
    
    // Project images upload (multiple images)
    uploadProjectImages: [
        handleUploadError(projectUpload.array('images', 5)),
        addFileUrl
    ],
    
    // Certificate upload (single file)
    uploadCertificate: [
        handleUploadError(certificateUpload.single('certificate')),
        addFileUrl
    ],
    
    // Community branding upload (logo and banner)
    uploadBranding: [
        handleUploadError(brandingUpload.fields([
            { name: 'logo', maxCount: 1 },
            { name: 'banner', maxCount: 1 }
        ])),
        addFileUrl
    ],
    
    // Generic single file upload
    uploadSingle: (fieldName, subfolder = 'general', maxSize = 5 * 1024 * 1024) => {
        const upload = multer({
            storage: createStorage(subfolder),
            limits: { fileSize: maxSize, files: 1 }
        });
        
        return [
            handleUploadError(upload.single(fieldName)),
            addFileUrl
        ];
    },
    
    // Generic multiple files upload
    uploadMultiple: (fieldName, maxCount = 5, subfolder = 'general', maxSize = 5 * 1024 * 1024) => {
        const upload = multer({
            storage: createStorage(subfolder),
            limits: { fileSize: maxSize, files: maxCount }
        });
        
        return [
            handleUploadError(upload.array(fieldName, maxCount)),
            addFileUrl
        ];
    }
};

// Utility functions
module.exports.utils = {
    // Get file extension
    getFileExtension: (filename) => {
        return path.extname(filename).toLowerCase();
    },
    
    // Check if file is image
    isImage: (mimetype) => {
        return mimetype.startsWith('image/');
    },
    
    // Check if file is document
    isDocument: (mimetype) => {
        const documentTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain'
        ];
        return documentTypes.includes(mimetype);
    },
    
    // Generate unique filename
    generateUniqueFilename: (originalname) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(originalname);
        const name = path.basename(originalname, ext);
        return `${name}-${uniqueSuffix}${ext}`;
    },
    
    // Get file size in MB
    getFileSizeInMB: (size) => {
        return Math.round((size / 1024 / 1024) * 100) / 100;
    }
};
