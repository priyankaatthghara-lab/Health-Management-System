import { Router, Request, Response } from 'express';
import { config } from '../config';
import authRoutes from './auth.routes';

const router = Router();

/**
 * Health check handler
 */
const healthCheckHandler = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    service: 'LifeLink AI Server',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
};

// Health check routes
router.get('/api/health', healthCheckHandler);
router.get('/health', healthCheckHandler);

// Mount authentication routes
router.use('/api/auth', authRoutes);
router.use('/auth', authRoutes);

// Export router
export { router as mainRouter };
export default router;
