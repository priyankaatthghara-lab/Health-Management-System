import mongoose from 'mongoose';
import { config } from './index';

// Mongoose connection event listeners for robust logging
mongoose.connection.on('connected', () => {
  console.log(`[MongoDB] Connected to database: ${mongoose.connection.name}`);
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Database disconnected');
});

export const connectDB = async (): Promise<typeof mongoose> => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`[MongoDB] Successfully connected to host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('[MongoDB] Connection failure:', error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('[MongoDB] Database connection closed');
  } catch (error) {
    console.error('[MongoDB] Error during disconnection:', error);
  }
};

export default connectDB;
