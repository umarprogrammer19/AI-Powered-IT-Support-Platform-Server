import Conversation from '../models/conversation.js';

// Save or update user conversation
export const saveConversation = async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ message: 'Messages array is required' });
        }

        let conversation = await Conversation.findOne({ user: req.userId });

        if (!conversation) {
            conversation = new Conversation({ user: req.userId, messages });
        } else {
            conversation.messages.push(...messages);
        }

        await conversation.save();
        res.status(201).json(conversation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get user conversation history
export const getConversation = async (req, res) => {
    try {
        const conversation = await Conversation.findOne({ user: req.userId });
        if (!conversation) return res.json({ messages: [] });
        res.json(conversation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
