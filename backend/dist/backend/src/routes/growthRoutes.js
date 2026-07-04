"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GrowthTwinService_1 = require("../services/growth/GrowthTwinService");
const AIReadinessService_1 = require("../services/growth/AIReadinessService");
const sectors_1 = require("../config/sectors");
const kpis_1 = require("../config/kpis");
const contracts_1 = require("../engines/contracts");
const DiscoveryFlowEngine_1 = require("../services/discovery/DiscoveryFlowEngine");
const router = (0, express_1.Router)();
// ================================================================
// GROWTH DIGITAL TWIN
// ================================================================
// GET /api/growth/twin/:businessId — Full Growth Twin Summary
router.get('/twin/:businessId', async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const summary = await GrowthTwinService_1.GrowthTwinService.getSummary(businessId);
        res.json({ success: true, data: summary });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/growth/domains/:businessId — All 17 domain states
router.get('/domains/:businessId', async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const domains = await GrowthTwinService_1.GrowthTwinService.getDomains(businessId);
        res.json({ success: true, data: domains });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/growth/domains/:businessId/:domain — Single domain state
router.get('/domains/:businessId/:domain', async (req, res, next) => {
    try {
        const { businessId, domain } = req.params;
        const history = await GrowthTwinService_1.GrowthTwinService.getHistory(businessId, domain);
        res.json({ success: true, data: history });
    }
    catch (err) {
        next(err);
    }
});
// POST /api/growth/sync/:businessId — Sync Growth Twin from Business Digital Twin
router.post('/sync/:businessId', async (req, res, next) => {
    try {
        const { businessId } = req.params;
        await GrowthTwinService_1.GrowthTwinService.syncFromBusinessTwin(businessId);
        const summary = await GrowthTwinService_1.GrowthTwinService.getSummary(businessId);
        res.json({ success: true, message: 'Growth Twin synced', data: summary });
    }
    catch (err) {
        next(err);
    }
});
// PATCH /api/growth/domains/:businessId/:domain — Update a domain state manually
router.patch('/domains/:businessId/:domain', async (req, res, next) => {
    try {
        const { businessId, domain } = req.params;
        const { currentState, desiredState, confidence, evidenceIds, knowledgeSources } = req.body;
        const updated = await GrowthTwinService_1.GrowthTwinService.syncDomain(businessId, domain, {
            currentState, desiredState, confidence, evidenceIds, knowledgeSources, changedBy: 'USER'
        });
        res.json({ success: true, data: updated });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/growth/context/:businessId — AI Operating Context
router.get('/context/:businessId', async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const context = await GrowthTwinService_1.GrowthTwinService.getAIOperatingContext(businessId);
        res.json({ success: true, data: context });
    }
    catch (err) {
        next(err);
    }
});
// ================================================================
// AI READINESS
// ================================================================
// GET /api/growth/readiness/:businessId — All 6 engine readiness reports
router.get('/readiness/:businessId', async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const reports = await AIReadinessService_1.AIReadinessService.calculateAllReadiness(businessId);
        res.json({ success: true, data: reports });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/growth/readiness/:businessId/:engineId — Single engine readiness
router.get('/readiness/:businessId/:engineId', async (req, res, next) => {
    try {
        const { businessId, engineId } = req.params;
        const report = await AIReadinessService_1.AIReadinessService.calculateReadiness(businessId, engineId);
        res.json({ success: true, data: report });
    }
    catch (err) {
        next(err);
    }
});
// ================================================================
// ENGINE CONTRACTS
// ================================================================
// GET /api/growth/engines — All engine contracts
router.get('/engines', async (_req, res, next) => {
    try {
        res.json({ success: true, data: contracts_1.ALL_ENGINE_CONTRACTS });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/growth/engines/:engineId — Single engine contract
router.get('/engines/:engineId', async (req, res, next) => {
    try {
        const { engineId } = req.params;
        const contract = contracts_1.ALL_ENGINE_CONTRACTS.find(e => e.id === engineId);
        if (!contract)
            return res.status(404).json({ success: false, message: 'Engine not found' });
        res.json({ success: true, data: contract });
    }
    catch (err) {
        next(err);
    }
});
// ================================================================
// KPI REGISTRY
// ================================================================
// GET /api/growth/kpis — All KPI definitions
router.get('/kpis', async (_req, res, next) => {
    try {
        res.json({ success: true, data: kpis_1.KPIRegistry.getAll() });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/growth/kpis/:slug — Single KPI definition
router.get('/kpis/:slug', async (req, res, next) => {
    try {
        const kpi = kpis_1.KPIRegistry.getBySlug(req.params.slug);
        if (!kpi)
            return res.status(404).json({ success: false, message: 'KPI not found' });
        res.json({ success: true, data: kpi });
    }
    catch (err) {
        next(err);
    }
});
// ================================================================
// SECTOR CONFIGURATION
// ================================================================
// GET /api/growth/sectors — All sector configs
router.get('/sectors', async (_req, res, next) => {
    try {
        res.json({ success: true, data: sectors_1.SectorManager.getAllSectors() });
    }
    catch (err) {
        next(err);
    }
});
// GET /api/growth/sectors/:slug — Single sector config
router.get('/sectors/:slug', async (req, res, next) => {
    try {
        const sector = sectors_1.SectorManager.getSector(req.params.slug);
        res.json({ success: true, data: sector });
    }
    catch (err) {
        next(err);
    }
});
// ================================================================
// DISCOVERY EXPLANATION
// ================================================================
// GET /api/growth/explained/:businessId — Explained next questions
router.get('/explained/:businessId', async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const sectorSlug = req.query.sector ?? 'generic';
        const businessStage = req.query.stage ?? 'GROWTH';
        const answeredIds = (req.query.answered ?? '').split(',').filter(Boolean);
        const limit = parseInt(req.query.limit ?? '10', 10);
        const explained = DiscoveryFlowEngine_1.DiscoveryExplainer.computeNextQuestions({
            businessId,
            sectorSlug,
            businessStage,
            answeredQuestionIds: answeredIds
        }, limit);
        res.json({ success: true, data: explained });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
