"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadRouter = void 0;
const express_1 = require("express");
const LeadEngineService_1 = require("../services/growth/LeadEngineService");
const RevenuePipelineService_1 = require("../services/growth/RevenuePipelineService");
const prisma_1 = require("../database/prisma");
exports.leadRouter = (0, express_1.Router)();
// Express async route wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
/**
 * POST /api/lead/generate
 * Initiates the Lead graph run for a business.
 */
exports.leadRouter.post('/generate', asyncHandler(async (req, res) => {
    const { businessId } = req.body;
    if (!businessId) {
        return res.status(400).json({ error: 'Missing businessId in request body.' });
    }
    const sessionId = await LeadEngineService_1.LeadEngineService.runLeadEngine(businessId);
    return res.json({ success: true, sessionId });
}));
/**
 * GET /api/lead/session/:sessionId
 * Retrieves the compiled session records.
 */
exports.leadRouter.get('/session/:sessionId', asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const session = await prisma_1.prisma.leadSession.findUnique({
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
exports.leadRouter.get('/history', asyncHandler(async (req, res) => {
    const { businessId } = req.query;
    if (!businessId) {
        return res.status(400).json({ error: 'Missing businessId query parameter.' });
    }
    const histories = await prisma_1.prisma.leadHistory.findMany({
        where: { businessId: String(businessId) },
        orderBy: { updatedAt: 'desc' }
    });
    return res.json({ success: true, histories });
}));
/**
 * GET /api/lead/pipeline/health
 * Calculates pipeline metrics and stuck items.
 */
exports.leadRouter.get('/pipeline/health', asyncHandler(async (req, res) => {
    const { businessId } = req.query;
    if (!businessId) {
        return res.status(400).json({ error: 'Missing businessId query parameter.' });
    }
    const health = await RevenuePipelineService_1.RevenuePipelineService.getPipelineHealth(String(businessId));
    return res.json({ success: true, health });
}));
/**
 * POST /api/lead/pipeline/transition
 * Moves opportunities between stages.
 */
exports.leadRouter.post('/pipeline/transition', asyncHandler(async (req, res) => {
    const { businessId, leadId, targetStageName, updatedBy } = req.body;
    if (!businessId || !leadId || !targetStageName) {
        return res.status(400).json({ error: 'Missing required transition fields in request body.' });
    }
    const updatedLead = await RevenuePipelineService_1.RevenuePipelineService.transitionLead(businessId, leadId, targetStageName, updatedBy || 'API');
    return res.json({ success: true, lead: updatedLead });
}));
/**
 * POST /api/lead/feedback
 * Submit human feedback (ACCEPT/REJECT/REGENERATE)
 */
exports.leadRouter.post('/feedback', asyncHandler(async (req, res) => {
    const { businessId, sessionId, action, feedbackText } = req.body;
    if (!businessId || !sessionId || !action) {
        return res.status(400).json({ error: 'Missing businessId, sessionId, or action in body.' });
    }
    const feedback = await LeadEngineService_1.LeadEngineService.handleFeedback(businessId, sessionId, action, feedbackText);
    return res.json({ success: true, feedback });
}));
