"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerSuccessRouter = void 0;
const express_1 = require("express");
const prisma_1 = require("../database/prisma");
const CustomerSuccessService_1 = require("../services/growth/CustomerSuccessService");
exports.customerSuccessRouter = (0, express_1.Router)();
/**
 * Triggers the Master Customer Success Engine for a given business ID.
 * POST /api/customer-success/run/:businessId
 */
exports.customerSuccessRouter.post('/run/:businessId', async (req, res) => {
    try {
        const { businessId } = req.params;
        const sessionId = await CustomerSuccessService_1.CustomerSuccessService.runCustomerSuccessEngine(businessId);
        res.status(200).json({ success: true, sessionId });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
/**
 * Retrieves the Customer Success session details.
 * GET /api/customer-success/sessions/:sessionId
 */
exports.customerSuccessRouter.get('/sessions/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await prisma_1.prisma.customerSuccessSession.findUnique({
            where: { id: sessionId },
            include: {
                snapshots: true,
                logs: true,
                recommendations: true
            }
        });
        if (!session) {
            res.status(404).json({ success: false, error: 'Session not found' });
            return;
        }
        res.status(200).json({ success: true, session });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
/**
 * Fetches the Customer Digital Twin including health scores, sentiments, value realization and recommendations.
 * GET /api/customer-success/twin/:businessId
 */
exports.customerSuccessRouter.get('/twin/:businessId', async (req, res) => {
    try {
        const { businessId } = req.params;
        const twin = await prisma_1.prisma.customerDigitalTwin.findFirst({
            where: { businessId },
            include: {
                healths: { orderBy: { createdAt: 'desc' }, take: 1 },
                journeys: { orderBy: { createdAt: 'desc' }, take: 1 },
                sentiments: { orderBy: { createdAt: 'desc' }, take: 1 },
                valueRealizations: { orderBy: { createdAt: 'desc' }, take: 1 },
                advocacies: { orderBy: { createdAt: 'desc' }, take: 1 },
                recommendations: { orderBy: { createdAt: 'desc' }, take: 5 }
            }
        });
        if (!twin) {
            res.status(404).json({ success: false, error: 'Customer digital twin not found' });
            return;
        }
        res.status(200).json({ success: true, twin });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
/**
 * Submits ACCEPT/REJECT feedback audits for a CCO recommendation.
 * POST /api/customer-success/feedback/:businessId
 */
exports.customerSuccessRouter.post('/feedback/:businessId', async (req, res) => {
    try {
        const { businessId } = req.params;
        const { sessionId, recommendationId, action, feedbackText } = req.body;
        if (!sessionId || !recommendationId || !action) {
            res.status(400).json({ success: false, error: 'Missing sessionId, recommendationId, or action parameters' });
            return;
        }
        const audit = await CustomerSuccessService_1.CustomerSuccessService.handleFeedback(businessId, sessionId, recommendationId, action, feedbackText);
        res.status(200).json({ success: true, audit });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
/**
 * Retrieves portfolio level benchmarks and account segments.
 * GET /api/customer-success/portfolio/:businessId
 */
exports.customerSuccessRouter.get('/portfolio/:businessId', async (req, res) => {
    try {
        const { businessId } = req.params;
        // Fetch benchmarks
        const benchmarks = await prisma_1.prisma.customerBenchmark.findMany({
            where: { businessId },
            orderBy: { createdAt: 'desc' },
            take: 10
        });
        // Mock high-level dashboard parameters matching CustomerPortfolioIntelligenceSchema
        const portfolioInfo = {
            highestRiskAccounts: [
                { customerId: 'biz-risk-1', companyName: 'Legacy Logistics Inc', riskProb: 45.0 }
            ],
            highestValueAccounts: [
                { customerId: 'biz-val-1', companyName: 'Global Logistics Ltd', arr: 120000.0 }
            ],
            fastestGrowingAccounts: [
                { customerId: 'biz-grow-1', companyName: 'ColdChain Express', growthRate: 24.5 }
            ],
            accountsRequiringAttention: [
                { customerId: 'biz-attn-1', companyName: 'Legacy Logistics Inc', reason: 'High unresolved bug ticket ratio' }
            ],
            expansionPipelineValue: 35000.0,
            renewalPipelineValue: 240000.0,
            overallPortfolioHealth: 86.0,
            benchmarks
        };
        res.status(200).json({ success: true, portfolio: portfolioInfo });
    }
    catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});
