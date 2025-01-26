import express from 'express';
import cors from 'cors';
import 'dotenv/config'; // Automatically loads .env variables
import openai from './utils/openai.js';
import { setupSwagger } from './swagger.js';

const app = express();

// Middleware
// add console log to show cors configuration
app.use(
  cors({
    origin: `http://localhost:${process.env?.CLIENT_PORT || 5173}`,
    credentials: true,
  })
);

// add console log to show CORS configuration "Allowed to accept connections from url"
console.log(
  `Allowed to accept connections from http://localhost:${process.env?.CLIENT_PORT || 5173}`
);
app.use(express.json());

// Setup Swagger
setupSwagger(app);

// In-memory storage for worksheets
const worksheets = [];

const parseAndFormatResponse = (response) => {
  try {
    // Parse JSON response
    const data = JSON.parse(response);

    // Format into a single-line string with headers
    return [
      'Learning Objectives:',
      ...data.learningObjectives,
      'Warm-Up Questions:',
      ...data.warmUpQuestions,
      'Main Exercises:',
      ...data.mainExercises,
      'Challenge Question:',
      data.challengeQuestion,
    ]
      .map((line) => line.trim()) // Remove extra spaces
      .join('\n'); // Join into a single string separated by \n
  } catch (error) {
    console.error('Error parsing or formatting response:', error);
    return 'Invalid response format.';
  }
};

// Routes
app.post('/api/worksheets/generate', async (req, res) => {
  try {
    const { subject, topic, grade } = req.body;

    const worksheetSchema = {
      type: 'json_schema',
      json_schema: {
        name: 'worksheet_response',
        schema: {
          type: 'object',
          properties: {
            learningObjectives: {
              type: 'array',
              items: {
                type: 'string',
              },
              minItems: 3,
              maxItems: 3,
              description: 'List of three specific learning objectives.',
            },
            warmUpQuestions: {
              type: 'array',
              items: {
                type: 'string',
              },
              minItems: 3,
              maxItems: 3,
              description:
                'List of three warm-up questions to activate prior knowledge.',
            },
            mainExercises: {
              type: 'array',
              items: {
                type: 'string',
              },
              minItems: 4,
              maxItems: 4,
              description: 'List of four main exercises or problems.',
            },
            challengeQuestion: {
              type: 'string',
              description:
                'A single critical-thinking question to deepen understanding.',
            },
          },
          required: [
            'learningObjectives',
            'warmUpQuestions',
            'mainExercises',
            'challengeQuestion',
          ],
        },
      },
    };

    const systemPrompt = `
You are an AI assistant specializing in generating educational worksheets for teachers across the USA. Your task is to create high-quality, grade-appropriate worksheets that include detailed, in-depth content for student understanding. Follow these strict guidelines:

1. **Response Structure**:
   - The response must be a valid JSON object with the following keys:
     - "learningObjectives": An array of 3 detailed objectives, each at least 2-3 sentences long, explaining the specific skills or knowledge students will acquire.
     - "warmUpQuestions": An array of 3 detailed questions. Each question should include additional context or examples to help students engage with the topic.
     - "mainExercises": An array of 4 detailed and multi-step exercises, each providing instructions, examples, or scenarios for practice.
     - "challengeQuestion": A single thought-provoking question with sufficient detail and context to deepen understanding.

2. **Formatting Requirements**:
   - The response must be valid JSON and follow this schema:
     {
       "learningObjectives": ["Objective 1", "Objective 2", "Objective 3"],
       "warmUpQuestions": ["Question 1", "Question 2", "Question 3"],
       "mainExercises": ["Exercise 1", "Exercise 2", "Exercise 3", "Exercise 4"],
       "challengeQuestion": "Detailed challenge question with context."
     }
   - Each entry must include enough detail for students to understand and complete the tasks independently.

3. **Content Depth**:
   - Provide detailed explanations, examples, and instructions in each section.
   - Ensure that all sections are rich in content and appropriate for the specified grade level.

4. **Safety and Appropriateness**:
   - Ensure all content is age-appropriate, factual, and suitable for classroom use.
   - If the topic is inappropriate, return:
     { "error": "This topic is not suitable for an educational worksheet. Please select a different topic." }

By adhering to these guidelines, you will create detailed, engaging, and ready-to-use worksheets for students.
`;

    const userPrompt = `
Create an in-depth educational worksheet for grade ${grade} on the subject: ${subject} about the topic: ${topic}.
The worksheet must include the following sections:

{
  "learningObjectives": [
    "Objective 1: Detailed description of the skill or knowledge students will acquire (2-3 sentences).",
    "Objective 2: Another detailed description of the skill or knowledge students will acquire (2-3 sentences).",
    "Objective 3: A third detailed description of the skill or knowledge students will acquire (2-3 sentences)."
  ],
  "warmUpQuestions": [
    "Question 1: A detailed, engaging question that includes examples or scenarios to help students think critically.",
    "Question 2: Another question with sufficient detail to activate prior knowledge.",
    "Question 3: A third question designed to prepare students for the main exercises."
  ],
  "mainExercises": [
    "Exercise 1: A detailed task with clear instructions, examples, or scenarios for practice.",
    "Exercise 2: Another task with multiple steps or requirements for students to complete.",
    "Exercise 3: A third task, providing sufficient context and examples for practice.",
    "Exercise 4: A final exercise that reinforces the topic with clear instructions and examples."
  ],
  "challengeQuestion": "A detailed and thought-provoking question with context, encouraging critical thinking and deeper understanding."
}

Each section must include detailed, actionable content designed for classroom or homework use. Ensure the response is valid JSON with no extraneous text or formatting.
`;

    // Generate ideas using OpenAI
    const completion = await openai.chat.completions.create({
      model: process.env?.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: worksheetSchema,
      temperature: 0.8,
      top_p: 0.8,
    });

    const worksheetContent = parseAndFormatResponse(
      completion.choices[0].message.content
    );
    // const worksheetContent = completion.choices[0].message.content;

    const worksheet = {
      _id: Date.now().toString(),
      title: `${subject} - ${topic}`,
      subject,
      topic,
      grade,
      createdAt: new Date(),
      content: worksheetContent,
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

const PORT = process.env?.API_PORT || 5172;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
});
