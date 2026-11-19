import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from local or root .env
dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export interface Config {
  port: number;
  nodeEnv: string;
  mongoUri: string;
  jwtSecret: string;
  jwtExpire: string;
  jwtResetExpire: string;
  clientUrl: string;
  adminEmail: string;
  adminPassword: string;
  adminName: string;
  aiProvider: string;
  geminiApiKey: string;
  openaiApiKey: string;
  rateLimitWindowMs: number;
  rateLimitMax: number;
}

export const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/lifelink-ai',
  jwtSecret: process.env.JWT_SECRET || 'lifelink-ai-secret-key-change-in-production',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  jwtResetExpire: process.env.JWT_RESET_EXPIRE || '1h',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@lifelink.ai',
  adminPassword: process.env.ADMIN_PASSWORD || 'AdminPass123!',
  adminName: process.env.ADMIN_NAME || 'System Administrator',
  aiProvider: process.env.AI_PROVIDER || 'gemini',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
};

export default config;
