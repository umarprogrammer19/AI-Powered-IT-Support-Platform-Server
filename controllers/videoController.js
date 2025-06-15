import axios from 'axios';
import Ticket from "../models/ticket.js";

// Tavus API setup
const tavusApiUrl = 'https://api.tavus.com/generate-video';
const tavusApiKey = process.env.TAVUS_API_KEY;

// Function to generate video using Tavus API
export const generateVideoResponse = async (message) => {
    try {
        const response = await axios.post(tavusApiUrl, {
            api_key: tavusApiKey,
            text: message,
        });
        return response.data.videoUrl;  
    } catch (error) {
        throw new Error('Video generation failed: ' + error.message);
    }
};

// Usage in ticket response
export const addReplyWithVideoToTicket = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ message: 'Message required' });

        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

        // Generate video response from Tavus
        const videoUrl = await generateVideoResponse(message);

        // Add video to ticket replies
        ticket.replies.push({ sender: req.userId, message, videoUrl });
        ticket.updatedAt = Date.now();
        await ticket.save();

        res.status(201).json(ticket);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
