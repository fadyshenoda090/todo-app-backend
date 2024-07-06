const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, 'media');
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = 'image-' + Date.now();
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});

const checkFileType = (file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);
    if (extName && mimeType) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Images only. Please upload a JPEG, JPG, or PNG file.'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, // 1mb = 1000000 bytes
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
});

module.exports = upload;
