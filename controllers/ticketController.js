import Ticket from '../models/Ticket.js';
import { uploadImageToCloudinary } from '../utils/cloudinary.js';

// Create new ticket
export const createTicketWithImage = async (req, res) => {
    try {
        const { subject, description } = req.body;
        if (!subject || !description)
            return res.status(400).json({ message: 'Subject and description required' });

        let screenshots = [];

        if (req.file) {
            const imageData = await uploadImageToCloudinary(req.file.path);
            screenshots.push(imageData);
        }

        const ticket = new Ticket({
            user: req.userId,
            subject,
            description,
            status: 'open',
            screenshots,
        });

        await ticket.save();

        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Upload screenshot image and add to ticket
export const uploadScreenshotToTicket = async (req, res) => {
    try {
        const ticketId = req.params.id;
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        // Upload image file to Cloudinary using helper function
        const { url, public_id } = await uploadImageToCloudinary(req.file.path);

        // Find ticket and add screenshot info
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        ticket.screenshots.push({ url, public_id });
        ticket.updatedAt = Date.now();
        await ticket.save();

        res.status(201).json({ message: 'Screenshot uploaded', screenshot: { url, public_id } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user's tickets
export const getUserTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find({ user: req.userId }).sort({ createdAt: -1 });
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single ticket by ID
export const getTicketById = async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id).populate('user', 'email name');
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        if (ticket.user._id.toString() !== req.userId) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add reply to ticket
export const addReplyToTicket = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ message: 'Message required' });

        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        ticket.replies.push({ sender: req.userId, message });
        ticket.updatedAt = Date.now();
        await ticket.save();

        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update ticket status (admin)
export const updateTicketStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        ticket.status = status;
        ticket.updatedAt = Date.now();
        await ticket.save();

        res.json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
