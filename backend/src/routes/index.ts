import { Router } from 'express';
import authRoutes from './authRoutes';
import organizationRoutes from './organizationRoutes';
import businessRoutes from './businessRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/organization', organizationRoutes);
router.use('/business', businessRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    correlationId: req.correlationId,
  });
});

export default router;
