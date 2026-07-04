import { Router, Request, Response } from 'express';
import { ExecutiveBoardService } from '../services/growth/ExecutiveBoardService';

export const executiveBoardRouter = Router();
const boardService = new ExecutiveBoardService();

/**
 * Trigger master executive board orchestration
 * POST /api/executive-board/run/:businessId
 */
executiveBoardRouter.post('/run/:businessId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { businessId } = req.params;
    const result = await boardService.runBoardOrchestration(businessId);
    res.status(200).json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Simulate simulated executive decision
 * POST /api/executive-board/simulate/:businessId
 */
executiveBoardRouter.post('/simulate/:businessId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { businessId } = req.params;
    const { command } = req.body;
    if (!command) {
      res.status(400).json({ success: false, error: 'Command prompt body is required.' });
      return;
    }
    const simulation = await boardService.simulateDecision(businessId, command);
    res.status(200).json({ success: true, simulation });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get nested executive KPI tree
 * GET /api/executive-board/kpi-tree/:businessId
 */
executiveBoardRouter.get('/kpi-tree/:businessId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { businessId } = req.params;
    const tree = await boardService.getKPITree(businessId);
    res.status(200).json({ success: true, tree });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get latest brief
 * GET /api/executive-board/brief/:businessId
 */
executiveBoardRouter.get('/brief/:businessId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { businessId } = req.params;
    const brief = await boardService.getLatestBrief(businessId);
    res.status(200).json({ success: true, brief });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get latest operating plan
 * GET /api/executive-board/plan/:businessId
 */
executiveBoardRouter.get('/plan/:businessId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { businessId } = req.params;
    const plan = await boardService.getLatestOperatingPlan(businessId);
    res.status(200).json({ success: true, plan });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get roadmap
 * GET /api/executive-board/roadmap/:businessId
 */
executiveBoardRouter.get('/roadmap/:businessId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { businessId } = req.params;
    const roadmap = await boardService.getLatestRoadmap(businessId);
    res.status(200).json({ success: true, roadmap });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get alerts
 * GET /api/executive-board/alerts/:businessId
 */
executiveBoardRouter.get('/alerts/:businessId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { businessId } = req.params;
    const alerts = await boardService.getAlerts(businessId);
    res.status(200).json({ success: true, alerts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get meetings
 * GET /api/executive-board/meetings/:businessId
 */
executiveBoardRouter.get('/meetings/:businessId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { businessId } = req.params;
    const meetings = await boardService.getMeetings(businessId);
    res.status(200).json({ success: true, meetings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Get decisions
 * GET /api/executive-board/decisions/:businessId
 */
executiveBoardRouter.get('/decisions/:businessId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { businessId } = req.params;
    const decisions = await boardService.getDecisions(businessId);
    res.status(200).json({ success: true, decisions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
