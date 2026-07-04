import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { DiscoveryEngine } from '../services/discovery/DiscoveryEngine';
import { DiscoveryChatService } from '../services/discovery/DiscoveryChatService';
import { KnowledgePackManager } from '../services/discovery/KnowledgePackManager';
import { QUESTION_LIBRARY } from '../services/discovery/QuestionLibrary';
import { businessRepository } from '../repositories/businessRepository';
import { prisma } from '../database/prisma';
import { AppError } from '../middleware/errorMiddleware';
import { jobQueue } from '../services/jobs/JobQueue';
import { eventBroker } from '../services/events/EventBroker';

const router = Router();

router.use(requireAuth);

// GET /api/discovery/chat/session - Retrieve onboarding chat session for the active user's business
router.get('/chat/session', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    // Find organization and its business
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: { include: { businesses: true } } }
    });

    if (!user || user.organization.businesses.length === 0) {
      throw new AppError('No business associated with this user', 404, 'NOT_FOUND');
    }

    const businessId = user.organization.businesses[0].id;
    const session = await DiscoveryChatService.getOrCreateSession(businessId);

    res.status(200).json({
      success: true,
      data: {
        session,
        businessId,
        onboardingCompleted: user.onboardingCompleted
      },
      correlationId: req.correlationId
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/discovery/chat/respond - Post user answer, update Growth Twin, select next question
router.post('/chat/respond', async (req, res, next) => {
  try {
    const { businessId, content } = req.body;
    if (!businessId || !content) {
      throw new AppError('Business ID and response content are required.', 400, 'VALIDATION_ERROR');
    }

    const result = await DiscoveryChatService.respond(businessId, content);
    res.status(200).json({
      success: true,
      data: result,
      correlationId: req.correlationId
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/discovery/chat/skip - Skip onboarding, mark incomplete, return empty Growth Twin
router.post('/chat/skip', async (req, res, next) => {
  try {
    const { businessId } = req.body;
    if (!businessId) {
      throw new AppError('Business ID is required.', 400, 'VALIDATION_ERROR');
    }

    // Set user onboardingCompleted = false
    await prisma.user.updateMany({
      where: { organization: { businesses: { some: { id: businessId } } } },
      data: { onboardingCompleted: false }
    });

    // Reset DiscoveryChatSession status to IN_PROGRESS
    await prisma.discoveryChatSession.upsert({
      where: { businessId },
      create: {
        businessId,
        status: 'IN_PROGRESS',
        currentPhase: 'IDENTITY',
        overallConfidence: 0.0
      },
      update: {
        status: 'IN_PROGRESS',
        currentPhase: 'IDENTITY',
        overallConfidence: 0.0
      }
    });

    res.status(200).json({
      success: true,
      data: { message: 'Onboarding skipped. Access unlocked with empty twin.' },
      correlationId: req.correlationId
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/discovery/chat/approve - Approves Executive Summary, sets complete, runs downstream engines
router.post('/chat/approve', async (req, res, next) => {
  try {
    const { businessId } = req.body;
    if (!businessId) {
      throw new AppError('Business ID is required.', 400, 'VALIDATION_ERROR');
    }

    // 1. Mark onboardingCompleted = true for all users in the organization
    await prisma.user.updateMany({
      where: { organization: { businesses: { some: { id: businessId } } } },
      data: { onboardingCompleted: true }
    });

    // 2. Mark discovery session status as COMPLETED
    await prisma.discoveryChatSession.update({
      where: { businessId },
      data: { status: 'COMPLETED', currentPhase: 'VALIDATION' }
    });

    // 3. Mark Business Twin status as COMPLETED
    await prisma.business.update({
      where: { id: businessId },
      data: { status: 'COMPLETED', completedAt: new Date() }
    });

    // 4. Enqueue background jobs for downstream AI engines
    const strategyJob = await jobQueue.enqueue('STRATEGY_ENGINE', { businessId });
    const marketingJob = await jobQueue.enqueue('MARKETING_ENGINE', { businessId });
    const leadJob = await jobQueue.enqueue('LEAD_ENGINE', { businessId });
    const salesJob = await jobQueue.enqueue('SALES_ENGINE', { businessId });
    const analyticsJob = await jobQueue.enqueue('ANALYTICS_ENGINE', { businessId });
    const csJob = await jobQueue.enqueue('CUSTOMER_SUCCESS_ENGINE', { businessId });

    // Trigger RecommendationApproved and EngineCompleted events
    await eventBroker.publish('TwinUpdated', { businessId, status: 'COMPLETED' });

    res.status(200).json({
      success: true,
      data: {
        message: 'Onboarding approved! Downstream engines execution triggered.',
        jobs: [strategyJob.id, marketingJob.id, leadJob.id, salesJob.id, analyticsJob.id, csJob.id]
      },
      correlationId: req.correlationId
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/discovery/jobs/status - Query statuses of the generated downstream engine runs
router.post('/jobs/status', async (req, res, next) => {
  try {
    const { jobIds } = req.body;
    if (!jobIds || !Array.isArray(jobIds)) {
      throw new AppError('Job IDs array is required.', 400, 'VALIDATION_ERROR');
    }

    const jobs = await prisma.discoveryJob.findMany({
      where: { id: { in: jobIds } }
    });

    res.status(200).json({
      success: true,
      data: jobs,
      correlationId: req.correlationId
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/discovery/:id/state - Retrieve full telemetry report and active questions (Backward compatibility)
router.get('/:id/state', async (req, res, next) => {
  try {
    const { id } = req.params;
    const basic = await businessRepository.findBasicById(id);
    if (!basic) {
      throw new AppError('Business Digital Twin not found', 404, 'NOT_FOUND');
    }

    if (req.user && basic.organizationId !== req.user.organizationId) {
      throw new AppError('Forbidden access to this digital twin', 403, 'FORBIDDEN');
    }

    const stateReport = await DiscoveryEngine.evaluateState(id);
    res.status(200).json({
      success: true,
      data: stateReport,
      correlationId: req.correlationId,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/discovery/packs - Retrieve industry packs catalog configuration (Backward compatibility)
router.get('/packs', async (req, res) => {
  res.status(200).json({
    success: true,
    data: KnowledgePackManager.listPacks(),
  });
});

export default router;
