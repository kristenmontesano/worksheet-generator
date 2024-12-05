const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// In-memory storage for worksheets
const worksheets = [];

// Routes
app.post('/api/worksheets/generate', async (req, res) => {
    try {
        const { subject, topic, grade } = req.body;
        
        // Generate ideas using OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "user",
                content: `Create an educational worksheet for ${grade}th grade ${subject} about ${topic}. 
                Include: 
                1. 3 learning objectives
                2. 2-3 warm-up questions
                3. 3-4 main exercises or problems
                4. 1 challenge question
                Format with clear sections and numbering.`
            }]
        });

        const worksheetContent = completion.choices[0].message.content;
        
        const worksheet = {
            _id: Date.now().toString(),
            title: `${subject} - ${topic}`,
            subject,
            topic,
            grade,
            createdAt: new Date(),
            content: worksheetContent
        };
        
        worksheets.unshift(worksheet);
        res.status(201).json(worksheet);
    } catch (error) {
        console.error('OpenAI Error:', error);
        res.status(500).json({ message: error.message });
    }
});

app.get('/api/worksheets', (req, res) => {
    res.json(worksheets);
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 