import { Router } from 'express';
import authRoutes from './authRoutes';
import organizationRoutes from './organizationRoutes';
import businessRoutes from './businessRoutes';
import discoveryRoutes from './discoveryRoutes';
import acquisitionRoutes from './acquisitionRoutes';
import knowledgeRoutes from './knowledgeRoutes';
import growthRoutes from './growthRoutes';
import strategyRoutes from './strategyRoutes';
import marketingRoutes from './marketingRoutes';
import { leadRouter } from './leadRoutes';
import { salesRouter } from './salesRoutes';
import analyticsRouter from './analyticsRoutes';
import { customerSuccessRouter } from './customerSuccessRoutes';
import { executiveBoardRouter } from './executiveBoardRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/organization', organizationRoutes);
router.use('/business', businessRoutes);
router.use('/discovery', discoveryRoutes);
router.use('/acquisition', acquisitionRoutes);
router.use('/knowledge', knowledgeRoutes);
router.use('/growth', growthRoutes);
router.use('/strategy', strategyRoutes);
router.use('/marketing', marketingRoutes);
router.use('/lead', leadRouter);
router.use('/sales', salesRouter);
router.use('/analytics', analyticsRouter);
router.use('/customer-success', customerSuccessRouter);
router.use('/executive-board', executiveBoardRouter);



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
