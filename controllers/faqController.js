import FAQ from '../models/faq.js';

// Get all FAQs
export const getFAQs = async (req, res) => {
    try {
        const faqs = await FAQ.find().sort({ createdAt: -1 });
        res.json(faqs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Add new FAQ (Admin only)
export const addFAQ = async (req, res) => {
    try {
        const { question, answer, tags } = req.body;
        const faq = new FAQ({ question, answer, tags });
        await faq.save();
        res.status(201).json(faq);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update FAQ (Admin only)
export const updateFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) return res.status(404).json({ message: 'FAQ not found' });

        const { question, answer, tags } = req.body;
        faq.question = question || faq.question;
        faq.answer = answer || faq.answer;
        faq.tags = tags || faq.tags;

        await faq.save();
        res.json(faq);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete FAQ (Admin only)
export const deleteFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) return res.status(404).json({ message: 'FAQ not found' });

        await faq.remove();
        res.json({ message: 'FAQ deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
