import Ticket from '../models/Ticket.js';
import { uploadImageToCloudinary } from '../utils/cloudinary.js';
import { ElevenLabsClient } from 'elevenlabs';
import { chatWithGemini } from './conversationController.js';

// Configure ElevenLabs API
const elevenLabs = new ElevenLabsClient({
    apiKey: process.env.ELEVENLABS_API_KEY,
});

// Create new ticket
export const createTicket = async (req, res) => {
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
        const imageData = await uploadImageToCloudinary(req.file.path);

        // Find ticket and add screenshot info
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        ticket.screenshots.push(imageData);
        ticket.updatedAt = Date.now();
        await ticket.save();

        res.status(201).json({ message: 'Screenshot uploaded', screenshot: imageData });
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

        let screenshots = [];

        if (req.file) {
            const imageData = await uploadImageToCloudinary(req.file.path);
            screenshots.push(imageData);
        }

        ticket.replies.push({ sender: req.userId, message, screenshots });
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

// Function to convert text to speech
export const generateVoiceResponse = async (text) => {
    try {
        const voiceData = await elevenLabs.textToSpeech(text);
        return voiceData.audioUrl; // Returns URL to audio
    } catch (error) {
        throw new Error('Voice generation failed: ' + error.message);
    }
};

// Usage in adding AI response to ticket
export const addReplyToTicketWithVoice = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ message: 'Message required' });

        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        // Generate AI response (for example)
        const aiResponse = await chatWithGemini(message);
        const audioUrl = await generateVoiceResponse(aiResponse);

        // Add reply to ticket with voice URL
        ticket.replies.push({ sender: req.userId, message: aiResponse, audioUrl });
        ticket.updatedAt = Date.now();
        await ticket.save();

        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
