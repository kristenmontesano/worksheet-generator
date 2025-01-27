const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Modify the existing worksheets array declaration to be more visible
let worksheets = []; // Changed from const to let for easier testing

exports.generateWorksheet = async (req, res) => {
    try {
        const { subject, topic, grade } = req.body;
        
        // Generate content using OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "user",
                content: `Create an educational worksheet for ${grade}th grade ${subject} about ${topic}. 
                Include: 
                1. 2-3 warm-up questions
                2. 3-4 main exercises or problems (short response, matching, or multiple choice)
                3. 1-2 long answer questions (1 paragraph response)
                4. 1 challenge question (short response or multiple choice)
                Include only the content in your response, no formatting or question types.
                Format with clear sections and numbering.
                Ensure the worksheet is appropriate for the grade level and subject. Consider the Common Core State Standards for each grade level.`
            }]
        });

        const worksheetContent = completion.choices[0].message.content;
        
        // Create a new worksheet with a unique ID
        const worksheet = {
            _id: Date.now().toString(),
            title: `${subject} - ${topic}`,
            subject,
            grade,
            topic,
            createdAt: new Date(),
            content: worksheetContent
        };
        
        // Add to beginning of array
        worksheets.unshift(worksheet);
        
        // Send both the new worksheet and updated list
        res.status(201).json({
            worksheet,
            worksheets // Send full list for immediate update
        });
    } catch (error) {
        console.error('OpenAI Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Modify the getWorksheets endpoint to include more information
exports.getWorksheets = (req, res) => {
    console.log('Current worksheets:', worksheets); // Add logging
    res.json(worksheets);
}; 