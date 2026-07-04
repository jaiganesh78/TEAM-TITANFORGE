"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const StrategyEngineService_1 = require("../services/growth/StrategyEngineService");
const StrategyMemoryService_1 = require("../services/growth/StrategyMemoryService");
const prisma_1 = require("../database/prisma");
const router = (0, express_1.Router)();
// POST /api/strategy/generate — Run the Master Strategy Graph
router.post('/generate', async (req, res, next) => {
    try {
        const { businessId } = req.body;
        if (!businessId) {
            return res.status(400).json({ success: false, message: 'Missing businessId' });
        }
        const session = await StrategyEngineService_1.StrategyEngineService.generateStrategy(businessId);
        res.json({ success: true, data: session });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/strategy/session/:businessId — Get latest strategy session with details
router.get('/session/:businessId', async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const session = await prisma_1.prisma.strategySession.findFirst({
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
    }
    catch (err) {
        next(err);
    }
});
// GET /api/strategy/history/:businessId — Get all historical recommendations and feedback
router.get('/history/:businessId', async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const memory = await StrategyMemoryService_1.StrategyMemoryService.getStrategyMemory(businessId);
        res.json({ success: true, data: memory });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/strategy/feedback — Record feedback and update status
router.post('/feedback', async (req, res, next) => {
    try {
        const { businessId, recommendationId, action, feedbackText, editedGoals } = req.body;
        if (!businessId || !recommendationId || !action) {
            return res.status(400).json({ success: false, message: 'Missing required parameters' });
        }
        const updated = await StrategyEngineService_1.StrategyEngineService.submitFeedback(businessId, recommendationId, action, feedbackText, editedGoals);
        res.json({ success: true, data: updated });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/strategy/approve — Helper shortcut
router.post('/approve', async (req, res, next) => {
    try {
        const { businessId, recommendationId, feedbackText } = req.body;
        const updated = await StrategyEngineService_1.StrategyEngineService.submitFeedback(businessId, recommendationId, 'ACCEPT', feedbackText);
        res.json({ success: true, data: updated });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/strategy/reject — Helper shortcut
router.post('/reject', async (req, res, next) => {
    try {
        const { businessId, recommendationId, feedbackText } = req.body;
        const updated = await StrategyEngineService_1.StrategyEngineService.submitFeedback(businessId, recommendationId, 'REJECT', feedbackText);
        res.json({ success: true, data: updated });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/strategy/regenerate — Helper shortcut
router.post('/regenerate', async (req, res, next) => {
    try {
        const { businessId, recommendationId, feedbackText } = req.body;
        const updated = await StrategyEngineService_1.StrategyEngineService.submitFeedback(businessId, recommendationId, 'REGENERATE', feedbackText);
        res.json({ success: true, data: updated });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
