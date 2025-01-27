const express = require('express');
const router = express.Router();
const openai = require('../utils/openai');

// In-memory storage (move this from server.js if you want to keep data handling in one place)
const worksheets = [];

// Generate worksheet handler
router.post('/worksheets/generate', async (req, res) => {
    try {
        const { subject, topic, grade } = req.body;
        
        // Generate content using OpenAI
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
        
        // Create new worksheet in memory
        const worksheet = {
            id: Date.now().toString(),
            title: `${subject} - ${topic}`,
            content: worksheetContent,
            subject,
            grade,
            createdAt: new Date()
        };
        
        worksheets.push(worksheet);
        res.status(201).json(worksheet);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get worksheets handler
router.get('/worksheets', (req, res) => {
    res.json(worksheets);
});

module.exports = router; 