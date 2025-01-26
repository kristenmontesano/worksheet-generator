import express from 'express';
import {
  generateWorksheet,
  getWorksheets,
} from '../controllers/worksheetController.js';

const router = express.Router();

/**
 * @swagger
 * /api/worksheets/generate:
 *   post:
 *     summary: Generate a worksheet based on subject, topic, and grade.
 *     description: Creates an educational worksheet using OpenAI's language model and stores it in memory.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *                 description: The subject of the worksheet (e.g., Math, Science, English).
 *                 example: "Math"
 *               topic:
 *                 type: string
 *                 description: The topic of the worksheet (e.g., Fractions, Photosynthesis).
 *                 example: "Fractions"
 *               grade:
 *                 type: integer
 *                 description: The grade level for the worksheet (e.g., 5, 8, 10).
 *                 example: 5
 *             required:
 *               - subject
 *               - topic
 *               - grade
 *     responses:
 *       201:
 *         description: Worksheet created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: Unique identifier of the worksheet.
 *                   example: "1737859085667"
 *                 title:
 *                   type: string
 *                   description: Title of the worksheet.
 *                   example: "Math - Fractions"
 *                 subject:
 *                   type: string
 *                   description: Subject of the worksheet.
 *                   example: "Math"
 *                 topic:
 *                   type: string
 *                   description: Topic of the worksheet.
 *                   example: "Fractions"
 *                 grade:
 *                   type: integer
 *                   description: Grade level of the worksheet.
 *                   example: 10
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                   description: Creation timestamp of the worksheet.
 *                   example: "2025-01-26T02:38:05.667Z"
 *                 content:
 *                   type: string
 *                   description: Generated content of the worksheet.
 *                   example: |
 *                     Learning Objectives:
 *                     Objective 1: Students will be able to identify binomials and understand their applications.
 *                     Objective 2: Students will learn how to expand binomials using the formula for expansion.
 *                     Objective 3: Students will practice applying binomial expansion concepts in different scenarios.
 *                     Warm-Up Questions:
 *                     Question 1: What are some common types of polynomials? How do they differ from binomials?
 *                     Question 2: Can you provide an example of a real-life situation where the concept of binomials is used? How does it benefit the problem solver?
 *                     Question 3: If someone were to ask for your help with calculating the area or volume using geometric shapes, how would you explain and solve the problems?
 *                     Main Exercises:
 *                     Exercise 1: Solve the expansion of (x+y)^2.
 *                     Exercise 2: Calculate the area of a rectangle where one side is x+3 units long and another side is 2(x+5) units long.
 *                     Exercise 3: Find the volume of a cube with sides that are 2x^3 units long.
 *                     Exercise 4: Determine the perimeter of a sector when the radius is (4x-1) units and the central angle is x radians.
 *                     Challenge Question:
 *                     What's the significance of binomials in algebra? Can you provide an example of how understanding binomials can be useful in everyday life?
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *                   example: "An error occurred while generating the worksheet."
 */
router.post('/worksheets/generate', generateWorksheet);

/**
 * @swagger
 * /api/worksheets:
 *   get:
 *     summary: Retrieve all worksheets.
 *     description: Returns a list of all worksheets stored in memory.
 *     responses:
 *       200:
 *         description: Successfully retrieved all worksheets.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Unique identifier of the worksheet.
 *                   title:
 *                     type: string
 *                     description: Title of the worksheet.
 *                   subject:
 *                     type: string
 *                     description: Subject of the worksheet.
 *                   topic:
 *                     type: string
 *                     description: Topic of the worksheet.
 *                   grade:
 *                     type: integer
 *                     description: Grade level of the worksheet.
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     description: Creation timestamp of the worksheet.
 *                   content:
 *                     type: string
 *                     description: Generated content of the worksheet.
 */
router.get('/worksheets', getWorksheets);

export default router;
