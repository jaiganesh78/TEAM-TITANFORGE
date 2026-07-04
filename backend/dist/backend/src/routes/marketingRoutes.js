"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MarketingEngineService_1 = require("../services/growth/MarketingEngineService");
const MarketingMemoryService_1 = require("../services/growth/MarketingMemoryService");
const prisma_1 = require("../database/prisma");
const router = (0, express_1.Router)();
// POST /api/marketing/generate — Run Master Marketing Graph workflow
router.post('/generate', async (req, res, next) => {
    try {
        const { businessId } = req.body;
        if (!businessId) {
            return res.status(400).json({ success: false, message: 'Missing businessId' });
        }
        const session = await MarketingEngineService_1.MarketingEngineService.generateMarketingPlan(businessId);
        res.json({ success: true, data: session });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/marketing/session/:businessId — Retrieve latest session details
router.get('/session/:businessId', async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const session = await prisma_1.prisma.marketingSession.findFirst({
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
    }
    catch (err) {
        next(err);
    }
});
// GET /api/marketing/history/:businessId — Retrieve historical campaigns list
router.get('/history/:businessId', async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const memory = await MarketingMemoryService_1.MarketingMemoryService.getCampaignHistory(businessId);
        res.json({ success: true, data: memory });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/marketing/feedback — Record human review feedback on campaigns
router.post('/feedback', async (req, res, next) => {
    try {
        const { businessId, campaignId, action, feedbackText } = req.body;
        if (!businessId || !campaignId || !action) {
            return res.status(400).json({ success: false, message: 'Missing required parameters' });
        }
        const campaign = await MarketingEngineService_1.MarketingEngineService.submitFeedback(businessId, campaignId, action, feedbackText);
        res.json({ success: true, data: campaign });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
