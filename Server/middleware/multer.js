import multer from 'multer';

// Creating multer middleware for passing form data
const storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, `${Date.now()}_${file.originalname}`); // ✅ Fixed template literal
    }
});

const upload = multer({ storage });

export default upload;
