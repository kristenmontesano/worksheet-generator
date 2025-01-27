const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes
const apiRouter = require('./routes/api');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Use API routes
app.use('/api', apiRouter);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 