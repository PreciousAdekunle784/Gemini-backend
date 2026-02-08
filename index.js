require("dotenv").config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post('/api/gemini', async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Valid prompt string is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            console.error('Missing GEMINI_API_KEY environment variable');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ output: text });
    } catch (error) {
        console.error('Gemini API Error:', error);

        // Handle specific API error types if necessary
        const statusCode = error.status || 500;
        const message = error.message || 'Internal Server Error';

        res.status(statusCode).json({ error: message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});