import Worksheet from '../models/worksheet.js';
import openai from '../utils/openai.js';

export const generateWorksheet = async (req, res) => {
  try {
    const { subject, topic, grade, templateId } = req.body;

    // Generate content using OpenAI
    const prompt = `Create educational worksheet content for ${subject} on the topic of ${topic} for grade ${grade}`;
    const completion = await openai.createCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const worksheetContent = completion.data.choices[0].message.content;

    const worksheet = new Worksheet({
      title: `${subject} - ${topic}`,
      content: {
        generated: worksheetContent,
        template: templateId,
      },
      subject,
      grade,
      creator: req.user._id,
    });

    await worksheet.save();
    res.status(201).json(worksheet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getWorksheets = async (req, res) => {
  try {
    const worksheets = await Worksheet.find({ creator: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(worksheets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
