import { Router, Request, Response, NextFunction } from 'express';
import { MarketingEngineService } from '../services/growth/MarketingEngineService';
import { MarketingMemoryService } from '../services/growth/MarketingMemoryService';
import { prisma } from '../database/prisma';

const router = Router();

// POST /api/marketing/generate — Run Master Marketing Graph workflow
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.body;
    if (!businessId) {
      return res.status(400).json({ success: false, message: 'Missing businessId' });
    }
    const session = await MarketingEngineService.generateMarketingPlan(businessId);
    res.json({ success: true, data: session });
  } catch (err) { next(err); }
});

// GET /api/marketing/session/:businessId — Retrieve latest session details
router.get('/session/:businessId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.params;
    const session = await prisma.marketingSession.findFirst({
      where: { businessId },
      include: {
        campaigns: {
          include: {
            evidence: true,
            executionPlans: true
          }
        },
        recommendations: true,
        budgets: true,
        calendars: true,
        contentPlans: true
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'No marketing session found' });
    }

    res.json({ success: true, data: session });
  } catch (err) { next(err); }
});

// GET /api/marketing/history/:businessId — Retrieve historical campaigns list
router.get('/history/:businessId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.params;
    const memory = await MarketingMemoryService.getCampaignHistory(businessId);
    res.json({ success: true, data: memory });
  } catch (err) { next(err); }
});

// POST /api/marketing/feedback — Record human review feedback on campaigns
router.post('/feedback', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId, campaignId, action, feedbackText } = req.body;
    if (!businessId || !campaignId || !action) {
      return res.status(400).json({ success: false, message: 'Missing required parameters' });
    }

    const campaign = await MarketingEngineService.submitFeedback(
      businessId,
      campaignId,
      action as 'ACCEPT' | 'REJECT' | 'REGENERATE',
      feedbackText
    );

    res.json({ success: true, data: campaign });
  } catch (err) { next(err); }
});

export default router;
