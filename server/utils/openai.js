import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from the root of the monorepo
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Extract environment variables
const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com';
const apiKey =
  process.env?.OPENAI_API_KEY ||
  (baseUrl !== 'https://api.openai.com' ? 'no-api-key-needed' : null);

// Validate the configuration
if (!apiKey) {
  throw new Error(
    `OPENAI_API_KEY is required for the base URL: ${baseUrl}. Set OPENAI_API_KEY in your .env file.`
  );
}

if (baseUrl !== 'https://api.openai.com' && apiKey === 'no-api-key-needed') {
  console.warn(
    "Warning: OPENAI_API_KEY is not set. Using 'no-api-key-needed' for non-OpenAI base URL."
  );
}

// Initialize OpenAI client
const openai = new OpenAI({
  baseUrl,
  apiKey,
});

export default openai;
