// import express from "express";
// import "dotenv/config";

// const app = express();

// app.use(express.json());

// app.get("/", (req, res) => {
//     res.send("Hello World");
// });

// app.listen(process.env.PORT, () => {
//     console.log(`Server is Running On The PORT ${process.env.PORT}`);
// })

import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js';
import connectdb from './database/connection.js';
// import ticketRoutes from './routes/ticketRoutes.js';
// import subscriptionRoutes from './routes/subscriptionRoutes.js';
// import faqRoutes from './routes/faqRoutes.js';
// import conversationRoutes from './routes/conversationRoutes.js';

dotenv.config();

const app = express();

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/tickets', ticketRoutes);
// app.use('/api/subscriptions', subscriptionRoutes);
// app.use('/api/faqs', faqRoutes);
// app.use('/api/conversations', conversationRoutes);

const PORT = process.env.PORT || 8000;

connectdb().then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
    .catch(err => console.error(err));
