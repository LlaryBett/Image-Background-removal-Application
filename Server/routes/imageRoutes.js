import express from 'express';
import removeBgImage from '../controllers/imageController.js';

import upload from '../middleware/multer.js';
import authUser from '../middleware/auth.js';

const imageRouter = express.Router();

// Corrected middleware order: authUser should be before upload
imageRouter.post('/remove-bg', authUser, upload.single('image'), removeBgImage);

export default imageRouter;
