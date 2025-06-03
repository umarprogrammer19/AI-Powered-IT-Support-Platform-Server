import express from 'express';
import {
    getAllFAQs,
    addFAQ,
    updateFAQ,
    deleteFAQ
} from '../controllers/faqController.js';
import { protect } from '../controllers/authController.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

router.get('/', getAllFAQs);

// Protected Route Only For Admins
router.use(protect);
router.post('/', adminMiddleware, addFAQ);
router.patch('/:id', adminMiddleware, updateFAQ);
router.delete('/:id', adminMiddleware, deleteFAQ);

export default router;
