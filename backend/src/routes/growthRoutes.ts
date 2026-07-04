import { Router, Request, Response, NextFunction } from 'express';
import { GrowthTwinService } from '../services/growth/GrowthTwinService';
import { AIReadinessService } from '../services/growth/AIReadinessService';
import { SectorManager } from '../config/sectors';
import { KPIRegistry } from '../config/kpis';
import { ALL_ENGINE_CONTRACTS } from '../engines/contracts';
import { DiscoveryExplainer } from '../services/discovery/DiscoveryFlowEngine';
import { GrowthDomain } from '@prisma/client';

const router = Router();

// ================================================================
// GROWTH DIGITAL TWIN
// ================================================================

// GET /api/growth/twin/:businessId — Full Growth Twin Summary
router.get('/twin/:businessId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.params;
    const summary = await GrowthTwinService.getSummary(businessId);
    res.json({ success: true, data: summary });
  } catch (err) { next(err); }
});

// GET /api/growth/domains/:businessId — All 17 domain states
router.get('/domains/:businessId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.params;
    const domains = await GrowthTwinService.getDomains(businessId);
    res.json({ success: true, data: domains });
  } catch (err) { next(err); }
});

// GET /api/growth/domains/:businessId/:domain — Single domain state
router.get('/domains/:businessId/:domain', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId, domain } = req.params;
    const history = await GrowthTwinService.getHistory(businessId, domain as GrowthDomain);
    res.json({ success: true, data: history });
  } catch (err) { next(err); }
});

// POST /api/growth/sync/:businessId — Sync Growth Twin from Business Digital Twin
router.post('/sync/:businessId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.params;
    await GrowthTwinService.syncFromBusinessTwin(businessId);
    const summary = await GrowthTwinService.getSummary(businessId);
    res.json({ success: true, message: 'Growth Twin synced', data: summary });
  } catch (err) { next(err); }
});

// PATCH /api/growth/domains/:businessId/:domain — Update a domain state manually
router.patch('/domains/:businessId/:domain', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId, domain } = req.params;
    const { currentState, desiredState, confidence, evidenceIds, knowledgeSources } = req.body;
    const updated = await GrowthTwinService.syncDomain(businessId, domain as GrowthDomain, {
      currentState, desiredState, confidence, evidenceIds, knowledgeSources, changedBy: 'USER'
    });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

// GET /api/growth/context/:businessId — AI Operating Context
router.get('/context/:businessId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.params;
    const context = await GrowthTwinService.getAIOperatingContext(businessId);
    res.json({ success: true, data: context });
  } catch (err) { next(err); }
});

// ================================================================
// AI READINESS
// ================================================================

// GET /api/growth/readiness/:businessId — All 6 engine readiness reports
router.get('/readiness/:businessId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.params;
    const reports = await AIReadinessService.calculateAllReadiness(businessId);
    res.json({ success: true, data: reports });
  } catch (err) { next(err); }
});

// GET /api/growth/readiness/:businessId/:engineId — Single engine readiness
router.get('/readiness/:businessId/:engineId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId, engineId } = req.params;
    const report = await AIReadinessService.calculateReadiness(businessId, engineId);
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
});

// ================================================================
// ENGINE CONTRACTS
// ================================================================

// GET /api/growth/engines — All engine contracts
router.get('/engines', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, data: ALL_ENGINE_CONTRACTS });
  } catch (err) { next(err); }
});

// GET /api/growth/engines/:engineId — Single engine contract
router.get('/engines/:engineId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { engineId } = req.params;
    const contract = ALL_ENGINE_CONTRACTS.find(e => e.id === engineId);
    if (!contract) return res.status(404).json({ success: false, message: 'Engine not found' });
    res.json({ success: true, data: contract });
  } catch (err) { next(err); }
});

// ================================================================
// KPI REGISTRY
// ================================================================

// GET /api/growth/kpis — All KPI definitions
router.get('/kpis', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, data: KPIRegistry.getAll() });
  } catch (err) { next(err); }
});

// GET /api/growth/kpis/:slug — Single KPI definition
router.get('/kpis/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const kpi = KPIRegistry.getBySlug(req.params.slug);
    if (!kpi) return res.status(404).json({ success: false, message: 'KPI not found' });
    res.json({ success: true, data: kpi });
  } catch (err) { next(err); }
});

// ================================================================
// SECTOR CONFIGURATION
// ================================================================

// GET /api/growth/sectors — All sector configs
router.get('/sectors', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ success: true, data: SectorManager.getAllSectors() });
  } catch (err) { next(err); }
});

// GET /api/growth/sectors/:slug — Single sector config
router.get('/sectors/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sector = SectorManager.getSector(req.params.slug);
    res.json({ success: true, data: sector });
  } catch (err) { next(err); }
});

// ================================================================
// DISCOVERY EXPLANATION
// ================================================================

// GET /api/growth/explained/:businessId — Explained next questions
router.get('/explained/:businessId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { businessId } = req.params;
    const sectorSlug = (req.query.sector as string) ?? 'generic';
    const businessStage = (req.query.stage as string) ?? 'GROWTH';
    const answeredIds = ((req.query.answered as string) ?? '').split(',').filter(Boolean);
    const limit = parseInt(req.query.limit as string ?? '10', 10);

    const explained = DiscoveryExplainer.computeNextQuestions({
      businessId,
      sectorSlug,
      businessStage,
      answeredQuestionIds: answeredIds
    }, limit);

    res.json({ success: true, data: explained });
  } catch (err) { next(err); }
});

export default router;
