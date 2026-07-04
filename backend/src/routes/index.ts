import { Router } from 'express';
import authRoutes from './authRoutes';
import organizationRoutes from './organizationRoutes';
import businessRoutes from './businessRoutes';
import discoveryRoutes from './discoveryRoutes';
import acquisitionRoutes from './acquisitionRoutes';
import knowledgeRoutes from './knowledgeRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/organization', organizationRoutes);
router.use('/business', businessRoutes);
router.use('/discovery', discoveryRoutes);
router.use('/acquisition', acquisitionRoutes);
router.use('/knowledge', knowledgeRoutes);



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
