import FAQ from '../models/faq.js';

// Get all FAQs (optionally filter by tag)
export const getAllFAQs = async (req, res) => {
    try {
        const { tag } = req.query;
        let filter = {};
        if (tag) filter.tags = tag;

        const faqs = await FAQ.find(filter).sort({ createdAt: -1 });
        res.json(faqs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin add FAQ
export const addFAQ = async (req, res) => {
    try {
        const { question, answer, tags } = req.body;
        if (!question || !answer) return res.status(400).json({ message: 'Question and answer required' });

        const faq = new FAQ({ question, answer, tags });
        await faq.save();
        res.status(201).json(faq);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin update FAQ
export const updateFAQ = async (req, res) => {
    try {
        const { question, answer, tags } = req.body;
        const faq = await FAQ.findById(req.params.id);
        if (!faq) return res.status(404).json({ message: 'FAQ not found' });

        if (question) faq.question = question;
        if (answer) faq.answer = answer;
        if (tags) faq.tags = tags;

        await faq.save();
        res.json(faq);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin delete FAQ
export const deleteFAQ = async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) return res.status(404).json({ message: 'FAQ not found' });

        await faq.remove();
        res.json({ message: 'FAQ deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
