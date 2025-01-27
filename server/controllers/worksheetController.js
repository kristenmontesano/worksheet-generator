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
                Include: 4-6 main exercises, questions, or problems (short response, matching, or multiple choice), 1-2 long answer questions (1 paragraph response), 1 challenge question (short response or multiple choice).
                Label each question with it's question type (short answer, multiple choice, matching, long answer, challenge question, etc.)
                Multiple choice question options should be labeled as a., b., c., d., etc.
                Matching question options should be labeled as a., b., c., d., and the answer should be labeled as AA., BB., CC., DD., etc.
                Format with clear sections and numbering.
                Do not include a title, that will be added later.
                Ensure the worksheet is appropriate for the grade level and subject. Consider the Common Core State Standards for each grade level.
                
                Here is an example of a worksheet:

                {content:\n' +
                    '\n' +
                    '1. Multiple Choice\n' +
                    'What is the main job of the Receiver of Memory in the community?\n' +
                    'a. Delivering babies\n' +
                    'b. Distributing food\n' +
                    "c. Keeping the community's memories\n" +
                    'd. Teaching children\n' +
                    '\n' +
                    '2. Matching\n' +
                    'Match each character from The Giver with their role in the story:\n' +
                    'a. Jonas\n' +
                    'b. The Giver\n' +
                    'c. Fiona\n' +
                    'd. Asher\n' +
                    'AA. Receiver of Memory\n' +
                    "BB. Jonas's best friend\n" +
                    'CC. Chief Elder\n' +
                    'DD. Mentor to Jonas\n' +
                    '\n' +
                    '3. Short Answer\n' +
                    'Describe one rule or aspect of the community in The Giver that you find most interesting or unsettling. Why does this stand out to you?\n' +
                    '\n' +
                    '4. Short Answer\n' +
                    "The Giver gives Jonas memories of the past to help him understand the world outside the community. How does this knowledge change Jonas's perspective on his own society?\n" +
                    '\n' +
                    '5. Long Answer\n' +
                    'Explain how the concept of "sameness" plays a role in The Giver. How does it affect the characters and the overall plot of the story?\n' +
                    '\n' +
                    '6. Challenge Question\n' +
                    'What does the color red symbolize in The Giver? Why is this color significant to the themes of the book?'
                }
                `
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