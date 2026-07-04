"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AnalyticsEngineService_1 = require("../services/growth/AnalyticsEngineService");
const BusinessEvolutionService_1 = require("../services/growth/BusinessEvolutionService");
const prisma_1 = require("../database/prisma");
const router = (0, express_1.Router)();
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
/**
 * POST /api/analytics/run/:businessId
 * Runs the complete Analytics graph.
 */
router.post('/run/:id', asyncHandler(async (req, res) => {
    const businessId = req.params.id;
    const sessionId = await AnalyticsEngineService_1.AnalyticsEngineService.runAnalyticsEngine(businessId);
    res.status(200).json({ success: true, sessionId });
}));
/**
 * GET /api/analytics/sessions/:sessionId
 * Retrieves the compiled analytics session data.
 */
router.get('/sessions/:id', asyncHandler(async (req, res) => {
    const sessionId = req.params.id;
    const session = await prisma_1.prisma.analyticsSession.findUnique({
        where: { id: sessionId },
        include: {
            healthScores: true,
            growthScores: true,
            revenueHealths: true,
            readinesss: true,
            competitivePositions: true,
            forecastSnapshots: true,
            risks: true,
            opportunities: true,
            recommendationItems: true,
            benchmarks: true,
            trendAnalyses: true,
            executiveInsights: true,
            predictionHistories: true
        }
    });
    if (!session) {
        return res.status(404).json({ error: `Analytics Session not found: ${sessionId}` });
    }
    res.status(200).json(session);
}));
/**
 * POST /api/analytics/feedback/:sessionId
 * Submits feedback for recommendations.
 */
router.post('/feedback/:id', asyncHandler(async (req, res) => {
    const sessionId = req.params.id;
    const { businessId, action, feedbackText } = req.body;
    if (!businessId || !action) {
        return res.status(400).json({ error: 'Missing businessId or action parameters' });
    }
    const feedback = await AnalyticsEngineService_1.AnalyticsEngineService.handleFeedback(businessId, sessionId, action, feedbackText);
    res.status(200).json({ success: true, feedback });
}));
/**
 * GET /api/analytics/evolution/:businessId
 * Retrieves the timeline of business performance snapshots.
 */
router.get('/evolution/:id', asyncHandler(async (req, res) => {
    const businessId = req.params.id;
    const timeline = await prisma_1.prisma.businessEvolutionSnapshot.findMany({
        where: { businessId },
        orderBy: { version: 'desc' }
    });
    res.status(200).json(timeline);
}));
/**
 * POST /api/analytics/compare
 * Conducts side-by-side comparative analysis of two snapshots.
 */
router.post('/compare', asyncHandler(async (req, res) => {
    const { businessId, sessionId, sourceSnapshotId, targetSnapshotId } = req.body;
    if (!businessId || !sessionId || !sourceSnapshotId || !targetSnapshotId) {
        return res.status(400).json({ error: 'Missing required parameters businessId, sessionId, sourceSnapshotId, or targetSnapshotId' });
    }
    const comparison = await BusinessEvolutionService_1.BusinessEvolutionService.compareSnapshots(businessId, sessionId, sourceSnapshotId, targetSnapshotId);
    res.status(200).json(comparison);
}));
/**
 * GET /api/analytics/decisions/:businessId
 * Retrieves the decision timeline audit trail.
 */
router.get('/decisions/:id', asyncHandler(async (req, res) => {
    const businessId = req.params.id;
    const decisions = await prisma_1.prisma.decisionIntelligence.findMany({
        where: { businessId },
        orderBy: { createdAt: 'desc' }
    });
    res.status(200).json(decisions);
}));
/**
 * GET /api/analytics/story/:businessId
 * Retrieves the quarterly natural language narrative quarterly report.
 */
router.get('/story/:id', asyncHandler(async (req, res) => {
    const businessId = req.params.id;
    const storyText = await BusinessEvolutionService_1.BusinessEvolutionService.generateQuarterlyStory(businessId);
    res.status(200).json({ story: storyText });
}));
exports.default = router;
