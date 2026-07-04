"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const DiscoveryEngine_1 = require("../services/discovery/DiscoveryEngine");
const DiscoveryChatService_1 = require("../services/discovery/DiscoveryChatService");
const KnowledgePackManager_1 = require("../services/discovery/KnowledgePackManager");
const businessRepository_1 = require("../repositories/businessRepository");
const prisma_1 = require("../database/prisma");
const errorMiddleware_1 = require("../middleware/errorMiddleware");
const JobQueue_1 = require("../services/jobs/JobQueue");
const EventBroker_1 = require("../services/events/EventBroker");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.requireAuth);
// GET /api/discovery/chat/session - Retrieve onboarding chat session for the active user's business
router.get('/chat/session', async (req, res, next) => {
    try {
        const userId = req.user.userId;
        // Find organization and its business
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            include: { organization: { include: { businesses: true } } }
        });
        if (!user || user.organization.businesses.length === 0) {
            throw new errorMiddleware_1.AppError('No business associated with this user', 404, 'NOT_FOUND');
        }
        const businessId = user.organization.businesses[0].id;
        const session = await DiscoveryChatService_1.DiscoveryChatService.getOrCreateSession(businessId);
        res.status(200).json({
            success: true,
            data: {
                session,
                businessId,
                onboardingCompleted: user.onboardingCompleted
            },
            correlationId: req.correlationId
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/discovery/chat/respond - Post user answer, update Growth Twin, select next question
router.post('/chat/respond', async (req, res, next) => {
    try {
        const { businessId, content } = req.body;
        if (!businessId || !content) {
            throw new errorMiddleware_1.AppError('Business ID and response content are required.', 400, 'VALIDATION_ERROR');
        }
        const result = await DiscoveryChatService_1.DiscoveryChatService.respond(businessId, content);
        res.status(200).json({
            success: true,
            data: result,
            correlationId: req.correlationId
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/discovery/chat/skip - Skip onboarding, mark incomplete, return empty Growth Twin
router.post('/chat/skip', async (req, res, next) => {
    try {
        const { businessId } = req.body;
        if (!businessId) {
            throw new errorMiddleware_1.AppError('Business ID is required.', 400, 'VALIDATION_ERROR');
        }
        // Set user onboardingCompleted = false
        await prisma_1.prisma.user.updateMany({
            where: { organization: { businesses: { some: { id: businessId } } } },
            data: { onboardingCompleted: false }
        });
        // Reset DiscoveryChatSession status to IN_PROGRESS
        await prisma_1.prisma.discoveryChatSession.upsert({
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
    }
    catch (error) {
        next(error);
    }
});
// POST /api/discovery/chat/approve - Approves Executive Summary, sets complete, runs downstream engines
router.post('/chat/approve', async (req, res, next) => {
    try {
        const { businessId } = req.body;
        if (!businessId) {
            throw new errorMiddleware_1.AppError('Business ID is required.', 400, 'VALIDATION_ERROR');
        }
        // 1. Mark onboardingCompleted = true for all users in the organization
        await prisma_1.prisma.user.updateMany({
            where: { organization: { businesses: { some: { id: businessId } } } },
            data: { onboardingCompleted: true }
        });
        // 2. Mark discovery session status as COMPLETED
        await prisma_1.prisma.discoveryChatSession.update({
            where: { businessId },
            data: { status: 'COMPLETED', currentPhase: 'VALIDATION' }
        });
        // 3. Mark Business Twin status as COMPLETED
        await prisma_1.prisma.business.update({
            where: { id: businessId },
            data: { status: 'COMPLETED', completedAt: new Date() }
        });
        // 4. Enqueue background jobs for downstream AI engines
        const strategyJob = await JobQueue_1.jobQueue.enqueue('STRATEGY_ENGINE', { businessId });
        const marketingJob = await JobQueue_1.jobQueue.enqueue('MARKETING_ENGINE', { businessId });
        const leadJob = await JobQueue_1.jobQueue.enqueue('LEAD_ENGINE', { businessId });
        const salesJob = await JobQueue_1.jobQueue.enqueue('SALES_ENGINE', { businessId });
        const analyticsJob = await JobQueue_1.jobQueue.enqueue('ANALYTICS_ENGINE', { businessId });
        const csJob = await JobQueue_1.jobQueue.enqueue('CUSTOMER_SUCCESS_ENGINE', { businessId });
        // Trigger RecommendationApproved and EngineCompleted events
        await EventBroker_1.eventBroker.publish('TwinUpdated', { businessId, status: 'COMPLETED' });
        res.status(200).json({
            success: true,
            data: {
                message: 'Onboarding approved! Downstream engines execution triggered.',
                jobs: [strategyJob.id, marketingJob.id, leadJob.id, salesJob.id, analyticsJob.id, csJob.id]
            },
            correlationId: req.correlationId
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/discovery/jobs/status - Query statuses of the generated downstream engine runs
router.post('/jobs/status', async (req, res, next) => {
    try {
        const { jobIds } = req.body;
        if (!jobIds || !Array.isArray(jobIds)) {
            throw new errorMiddleware_1.AppError('Job IDs array is required.', 400, 'VALIDATION_ERROR');
        }
        const jobs = await prisma_1.prisma.discoveryJob.findMany({
            where: { id: { in: jobIds } }
        });
        res.status(200).json({
            success: true,
            data: jobs,
            correlationId: req.correlationId
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/discovery/:id/state - Retrieve full telemetry report and active questions (Backward compatibility)
router.get('/:id/state', async (req, res, next) => {
    try {
        const { id } = req.params;
        const basic = await businessRepository_1.businessRepository.findBasicById(id);
        if (!basic) {
            throw new errorMiddleware_1.AppError('Business Digital Twin not found', 404, 'NOT_FOUND');
        }
        if (req.user && basic.organizationId !== req.user.organizationId) {
            throw new errorMiddleware_1.AppError('Forbidden access to this digital twin', 403, 'FORBIDDEN');
        }
        const stateReport = await DiscoveryEngine_1.DiscoveryEngine.evaluateState(id);
        res.status(200).json({
            success: true,
            data: stateReport,
            correlationId: req.correlationId,
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/discovery/packs - Retrieve industry packs catalog configuration (Backward compatibility)
router.get('/packs', async (req, res) => {
    res.status(200).json({
        success: true,
        data: KnowledgePackManager_1.KnowledgePackManager.listPacks(),
    });
});
exports.default = router;
