import { Router, Request, Response, NextFunction } from 'express';
import { LeadEngineService } from '../services/growth/LeadEngineService';
import { RevenuePipelineService } from '../services/growth/RevenuePipelineService';
import { prisma } from '../database/prisma';

export const leadRouter = Router();

// Express async route wrapper
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * POST /api/lead/generate
 * Initiates the Lead graph run for a business.
 */
leadRouter.post('/generate', asyncHandler(async (req: Request, res: Response) => {
  const { businessId } = req.body;
  if (!businessId) {
    return res.status(400).json({ error: 'Missing businessId in request body.' });
  }

  const sessionId = await LeadEngineService.runLeadEngine(businessId);
  return res.json({ success: true, sessionId });
}));

/**
 * GET /api/lead/session/:sessionId
 * Retrieves the compiled session records.
 */
leadRouter.get('/session/:sessionId', asyncHandler(async (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const session = await prisma.leadSession.findUnique({
    where: { id: sessionId },
    include: {
      leads: {
        include: {
          scores: true
        }
      },
      leadSourcesList: true,
      recommendations: true,
      forecastsList: true,
      playbooks: true,
      feedbacks: true,
      executionPlans: true
    }
  });

  if (!session) {
    return res.status(404).json({ error: 'Lead session not found.' });
  }

  return res.json({ success: true, session });
}));

/**
 * GET /api/lead/history
 * Gets the versioned history audits.
 */
leadRouter.get('/history', asyncHandler(async (req: Request, res: Response) => {
  const { businessId } = req.query;
  if (!businessId) {
    return res.status(400).json({ error: 'Missing businessId query parameter.' });
  }

  const histories = await prisma.leadHistory.findMany({
    where: { businessId: String(businessId) },
    orderBy: { updatedAt: 'desc' }
  });

  return res.json({ success: true, histories });
}));

/**
 * GET /api/lead/pipeline/health
 * Calculates pipeline metrics and stuck items.
 */
leadRouter.get('/pipeline/health', asyncHandler(async (req: Request, res: Response) => {
  const { businessId } = req.query;
  if (!businessId) {
    return res.status(400).json({ error: 'Missing businessId query parameter.' });
  }

  const health = await RevenuePipelineService.getPipelineHealth(String(businessId));
  return res.json({ success: true, health });
}));

/**
 * POST /api/lead/pipeline/transition
 * Moves opportunities between stages.
 */
leadRouter.post('/pipeline/transition', asyncHandler(async (req: Request, res: Response) => {
  const { businessId, leadId, targetStageName, updatedBy } = req.body;
  if (!businessId || !leadId || !targetStageName) {
    return res.status(400).json({ error: 'Missing required transition fields in request body.' });
  }

  const updatedLead = await RevenuePipelineService.transitionLead(
    businessId,
    leadId,
    targetStageName,
    updatedBy || 'API'
  );

  return res.json({ success: true, lead: updatedLead });
}));

/**
 * POST /api/lead/feedback
 * Submit human feedback (ACCEPT/REJECT/REGENERATE)
 */
leadRouter.post('/feedback', asyncHandler(async (req: Request, res: Response) => {
  const { businessId, sessionId, action, feedbackText } = req.body;
  if (!businessId || !sessionId || !action) {
    return res.status(400).json({ error: 'Missing businessId, sessionId, or action in body.' });
  }

  const feedback = await LeadEngineService.handleFeedback(businessId, sessionId, action, feedbackText);
  return res.json({ success: true, feedback });
}));
