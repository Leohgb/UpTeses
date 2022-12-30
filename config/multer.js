const multer = require('multer');
const path = require('path');

module.exports = {
    storage: multer.diskStorage({
        filename: (req, file, cb) => {
                cb(null, file.originalname + Date.now());
        },
    }),
    limits: {
        fileSize: 2 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'application/pdf',
        ];

        if(file.mimetype !== 'application/pdf') {
            cb(null,false)
        } else {
            cb(null, true);
        }
    },
};