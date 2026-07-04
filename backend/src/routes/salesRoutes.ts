import { Router, Request, Response, NextFunction } from 'express';
import { SalesEngineService } from '../services/growth/SalesEngineService';
import { RevenueIntelligenceService } from '../services/growth/RevenueIntelligenceService';
import { prisma } from '../database/prisma';

export const salesRouter = Router();

const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * POST /api/sales/run/:id
 * Runs the Master Sales Graph workflow for a business.
 */
salesRouter.post('/run/:id', asyncHandler(async (req: Request, res: Response) => {
  const businessId = req.params.id;
  const sessionId = await SalesEngineService.runSalesEngine(businessId);
  return res.json({ success: true, sessionId });
}));

/**
 * GET /api/sales/sessions/:id
 * Retrieves Sales Session details by sessionId.
 */
salesRouter.get('/sessions/:id', asyncHandler(async (req: Request, res: Response) => {
  const sessionId = req.params.id;
  const session = await prisma.salesSession.findUnique({
    where: { id: sessionId },
    include: {
      opportunities: {
        include: {
          dealHealths: true
        }
      },
      forecasts: true,
      playbooks: true,
      feedbacks: true,
      executionPlans: true,
      revenueIntelligenceSnapshots: true,
      revenueAssets: true
    }
  });

  if (!session) {
    return res.status(404).json({ error: 'Sales session not found.' });
  }

  return res.json({ success: true, session });
}));

/**
 * GET /api/sales/health/:id
 * Fetch deal health evaluations for a session.
 */
salesRouter.get('/health/:id', asyncHandler(async (req: Request, res: Response) => {
  const sessionId = req.params.id;
  const healths = await prisma.dealHealth.findMany({
    where: { sessionId }
  });
  return res.json({ success: true, healths });
}));

/**
 * GET /api/sales/opportunities/:id
 * Fetch opportunity analysis for a session.
 */
salesRouter.get('/opportunities/:id', asyncHandler(async (req: Request, res: Response) => {
  const sessionId = req.params.id;
  const opportunities = await prisma.salesOpportunity.findMany({
    where: { sessionId },
    include: {
      dealHealths: true
    }
  });
  return res.json({ success: true, opportunities });
}));

/**
 * POST /api/sales/feedback/:id
 * Submit human feedback reviews for a session.
 */
salesRouter.post('/feedback/:id', asyncHandler(async (req: Request, res: Response) => {
  const sessionId = req.params.id;
  const { businessId, action, feedbackText } = req.body;
  if (!businessId || !action) {
    return res.status(400).json({ error: 'Missing businessId or action in body.' });
  }

  const feedback = await SalesEngineService.handleFeedback(businessId, sessionId, action, feedbackText || '');
  return res.json({ success: true, feedback });
}));

/**
 * GET /api/sales/forecast/:id
 * Retrieve sales forecasts for a session.
 */
salesRouter.get('/forecast/:id', asyncHandler(async (req: Request, res: Response) => {
  const sessionId = req.params.id;
  const forecasts = await prisma.salesForecast.findMany({
    where: { sessionId }
  });
  return res.json({ success: true, forecasts });
}));

/**
 * GET /api/sales/insights/:id
 * Retrieve pipeline revenue optimization opportunities for a session.
 */
salesRouter.get('/insights/:id', asyncHandler(async (req: Request, res: Response) => {
  const sessionId = req.params.id;
  const session = await prisma.salesSession.findUnique({
    where: { id: sessionId }
  });

  if (!session) {
    return res.status(404).json({ error: 'Sales session not found.' });
  }

  let insights = {};
  if (session.revenueOptimization) {
    try {
      insights = JSON.parse(session.revenueOptimization);
    } catch {
      insights = {};
    }
  }

  return res.json({ success: true, insights });
}));

/**
 * GET /api/sales/revenue-intelligence/:id
 * Fetch aggregated revenue intelligence benchmarks, snapshots, and scores for a business.
 */
salesRouter.get('/revenue-intelligence/:id', asyncHandler(async (req: Request, res: Response) => {
  const businessId = req.params.id;
  const benchmarks = await RevenueIntelligenceService.calculateBenchmarks(businessId);
  const scores = await RevenueIntelligenceService.calculateExecutiveScores(businessId);
  const snapshots = await prisma.revenueIntelligenceSnapshot.findMany({
    where: { businessId },
    orderBy: { createdAt: 'desc' }
  });
  const assets = await prisma.revenueAsset.findMany({
    where: { businessId },
    orderBy: { createdAt: 'desc' }
  });

  return res.json({
    success: true,
    benchmarks,
    scores,
    snapshots,
    assets
  });
}));
