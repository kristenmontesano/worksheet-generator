import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import 'dotenv/config'; // To access environment variables

// Swagger definition
const url = `http://localhost:${process.env.API_PORT || 5172}`;
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API endpoints for my Express app',
    },
    servers: [
      {
        url,
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to your route files for documentation
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Function to setup Swagger UI
export const setupSwagger = (app) => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
  console.log(`Swagger UI available at ${url}/docs`);
};
