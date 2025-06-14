import axios from 'axios';
import Conversation from '../models/conversation.js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Helper to base64-encode a file in base64
function base64Encode(filePath) {
    return fs.readFileSync(filePath, 'base64');
}

export const chatWithGemini = async (userMessage, imagePath = '') => {
    try {
        // Prepare data for Gemini API
        const data = {
            contents: [
                {
                    parts: []
                }
            ]
        };

        // Add user message to the parts
        data.contents[0].parts.push({ text: userMessage });

        // If image is provided, add it to the request as well
        if (imagePath) {
            const base64Image = base64Encode(imagePath);
            data.contents[0].parts.push({
                inline_data: {
                    mime_type: "image/jpeg",
                    data: base64Image
                }
            });
        }

        // Make the POST request to the Gemini API
        const response = await axios.post(
            `${GEMINI_API_URL}key=${GEMINI_API_KEY}`,
            data,
            {
                headers: {
                    "Content-Type": "application/json"
                },
            }
        );

        // Check if the response is valid and has the expected structure
        if (response.data && response.data.candidates && response.data.candidates[0].content) {
            return response.data.candidates[0].content.parts[0].text.trim();
        } else {
            throw new Error('Invalid response structure from Gemini API');
        }

    } catch (error) {
        console.error('Error chatting with Gemini!', error.message);
        throw new Error('Failed to get response from Gemini');
    }
};

export const handleChat = async (req, res) => {
    try {
        const { message } = req.body;

        // Ensure user message is provided
        if (!message || message.trim() === '') {
            return res.status(400).json({ message: 'User message is required' });
        }

        const userId = req.userId;
        const imagePath = req.file ? req.file.path : '';

        // Get response from Gemini
        const geminiResponse = await chatWithGemini(message, imagePath);

        // Ensure Gemini response is valid
        if (!geminiResponse || geminiResponse.trim() === '') {
            return res.status(500).json({ message: 'AI response is empty or invalid' });
        }

        // Check if conversation exists in the database
        let conversation = await Conversation.findOne({ userId });

        // If conversation does not exist, create a new one
        if (!conversation) {
            conversation = new Conversation({
                user: userId,
                messages: [
                    { sender: 'user', text: message },
                    { sender: 'ai', text: geminiResponse }
                ]
            });
        } else {
            // If conversation exists, push the new messages
            conversation.messages.push({ sender: 'user', text: message });
            conversation.messages.push({ sender: 'ai', text: geminiResponse });
        }

        // Save the conversation in the database
        await conversation.save();

        // Respond with the AI message
        res.status(200).json({ message: geminiResponse });

    } catch (error) {
        console.error('Error handling chat!', error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getConversationHistory = async (req, res) => {
    try {
        const userId = req.userId;

        // Find the conversation for the given user
        const conversation = await Conversation.findOne({ user: userId });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Respond with the conversation history
        res.status(200).json(conversation);

    } catch (error) {
        console.error('Error fetching conversation!', error.message);
        res.status(500).json({ message: error.message });
    }
};
