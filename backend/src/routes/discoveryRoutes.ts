import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { DiscoveryEngine } from '../services/discovery/DiscoveryEngine';
import { KnowledgePackManager } from '../services/discovery/KnowledgePackManager';
import { QUESTION_LIBRARY } from '../services/discovery/QuestionLibrary';
import { businessRepository } from '../repositories/businessRepository';
import { AppError } from '../middleware/errorMiddleware';

const router = Router();

router.use(requireAuth);

// GET /api/discovery/:id/state - Retrieve full telemetry report and active questions
router.get('/:id/state', async (req, res, next) => {
  try {
    const { id } = req.params;
    const basic = await businessRepository.findBasicById(id);
    if (!basic) {
      throw new AppError('Business Digital Twin not found', 404, 'NOT_FOUND');
    }

    // Verify tenancy access
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

// PUT /api/discovery/:id/answer - Save answer metadata and value
router.put('/:id/answer', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { questionId, value, status, source } = req.body;

    const basic = await businessRepository.findBasicById(id);
    if (!basic) {
      throw new AppError('Business Digital Twin not found', 404, 'NOT_FOUND');
    }

    // Verify tenancy access
    if (req.user && basic.organizationId !== req.user.organizationId) {
      throw new AppError('Forbidden access to this digital twin', 403, 'FORBIDDEN');
    }

    const updatedState = await DiscoveryEngine.saveAnswer(id, questionId, value, status || 'KNOWN', source || 'USER');
    
    // Log audit entry
    await businessRepository.writeAuditLog({
      userId: req.user!.userId,
      businessId: id,
      section: 'discovery',
      operation: 'ANSWER_UPDATE',
      newValue: JSON.stringify({ questionId, value, status })
    });

    res.status(200).json({
      success: true,
      data: updatedState,
      correlationId: req.correlationId,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/discovery/packs - Retrieve industry packs catalog configuration
router.get('/packs', async (req, res) => {
  res.status(200).json({
    success: true,
    data: KnowledgePackManager.listPacks(),
  });
});

// GET /api/discovery/library - Retrieve full library of questions
router.get('/library', async (req, res) => {
  res.status(200).json({
    success: true,
    data: QUESTION_LIBRARY,
  });
});

export default router;
