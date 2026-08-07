import dotenv from 'dotenv';

dotenv.config();

export const env = {
    PORT: process.env.PORT || 5000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGODB_URI: process.env.MONGODB_URI || '',
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || '',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '',
    CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
}