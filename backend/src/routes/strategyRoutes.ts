import { Router, Request, Response, NextFunction } from 'express';
import { StrategyEngineService } from '../services/growth/StrategyEngineService';
import { StrategyMemoryService } from '../services/growth/StrategyMemoryService';
import { prisma } from '../database/prisma';

const router = Router();

// POST /api/strategy/generate — Run the Master Strategy Graph
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.body;
    if (!businessId) {
      return res.status(400).json({ success: false, message: 'Missing businessId' });
    }
    const session = await StrategyEngineService.generateStrategy(businessId);
    res.json({ success: true, data: session });
  } catch (err) { next(err); }
});

// GET /api/strategy/session/:businessId — Get latest strategy session with details
router.get('/session/:businessId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.params;
    const session = await prisma.strategySession.findFirst({
      where: { businessId },
      include: {
        recommendations: {
          include: {
            evidence: true,
            executionPlans: true
          }
        },
        executionLogs: true,
        nodeOutputs: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'No strategy session found' });
    }

    res.json({ success: true, data: session });
  } catch (err) { next(err); }
});

// GET /api/strategy/history/:businessId — Get all historical recommendations and feedback
router.get('/history/:businessId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.params;
    const memory = await StrategyMemoryService.getStrategyMemory(businessId);
    res.json({ success: true, data: memory });
  } catch (err) { next(err); }
});

// POST /api/strategy/feedback — Record feedback and update status
router.post('/feedback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId, recommendationId, action, feedbackText, editedGoals } = req.body;
    if (!businessId || !recommendationId || !action) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }

    const updated = await StrategyEngineService.submitFeedback(
      businessId,
      recommendationId,
      action as 'ACCEPT' | 'REJECT' | 'REGENERATE',
      feedbackText,
      editedGoals
    );

    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

// POST /api/strategy/approve — Helper shortcut
router.post('/approve', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId, recommendationId, feedbackText } = req.body;
    const updated = await StrategyEngineService.submitFeedback(
      businessId,
      recommendationId,
      'ACCEPT',
      feedbackText
    );
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

// POST /api/strategy/reject — Helper shortcut
router.post('/reject', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId, recommendationId, feedbackText } = req.body;
    const updated = await StrategyEngineService.submitFeedback(
      businessId,
      recommendationId,
      'REJECT',
      feedbackText
    );
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

// POST /api/strategy/regenerate — Helper shortcut
router.post('/regenerate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId, recommendationId, feedbackText } = req.body;
    const updated = await StrategyEngineService.submitFeedback(
      businessId,
      recommendationId,
      'REGENERATE',
      feedbackText
    );
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

export default router;
