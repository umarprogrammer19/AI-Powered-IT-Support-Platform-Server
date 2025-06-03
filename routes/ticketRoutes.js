import express from 'express';
import {
    addReplyToTicket,
    createTicket,
    getTicketById,
    getUserTickets,
    updateTicketStatus,
    uploadScreenshotToTicket
} from '../controllers/ticketController.js';
import { upload } from '../middleware/multerMiddleware.js';
import { protect } from '../controllers/authController.js';
import adminMiddleware from '../middleware/adminMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getUserTickets);
router.post('/', upload.single("image"), createTicket);
router.get('/:id', getTicketById);
router.post('/:id/upload', upload.single('image'), uploadScreenshotToTicket);
router.post('/:id/reply', upload.single("image"), addReplyToTicket);
router.patch('/:id/status', adminMiddleware, updateTicketStatus);

export default router;
