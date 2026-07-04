import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { RetrievalService } from '../services/knowledge/RetrievalService';
import { KnowledgeHealthService } from '../services/knowledge/KnowledgeHealthService';
import { BusinessContextService } from '../services/knowledge/BusinessContextService';
import { KnowledgeIngestionService } from '../services/knowledge/KnowledgeIngestionService';
import { prisma } from '../database/prisma';
import { SourceType } from '@prisma/client';
import { AppError } from '../middleware/errorMiddleware';

const router = Router();

router.use(requireAuth);

// GET /api/knowledge/search/:businessId - Search query testing
router.get('/search/:businessId', async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { q, sourceType } = req.query;

    if (!q) {
      throw new AppError('Search query parameter "q" is required.', 400, 'VALIDATION_ERROR');
    }

    const results = await RetrievalService.retrieve({
      businessId,
      query: String(q),
      sourceType: sourceType ? (sourceType as SourceType) : undefined
    });

    res.status(200).json({
      success: true,
      data: results,
      correlationId: req.correlationId
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/knowledge/health/:businessId - Health metrics
router.get('/health/:businessId', async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const report = await KnowledgeHealthService.getHealth(businessId);
    res.status(200).json({
      success: true,
      data: report,
      correlationId: req.correlationId
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/knowledge/chunks/:businessId - Chunks viewer list
router.get('/chunks/:businessId', async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const list = await prisma.knowledgeChunk.findMany({
      where: { businessId },
      include: { metadata: true },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: list,
      correlationId: req.correlationId
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/knowledge/refresh/:businessId - Manual trigger pipeline
router.post('/refresh/:businessId', async (req, res, next) => {
  try {
    const { businessId } = req.params;

    // Retrieve documents and website pages to run ingestion
    const docs = await prisma.uploadedDocument.findMany({ where: { businessId } });
    const pages = await prisma.websitePage.findMany({
      where: { analysisRun: { website: { businessId } } }
    });

    for (const d of docs) {
      await KnowledgeIngestionService.ingestDocument(businessId, d.id);
    }
    for (const p of pages) {
      await KnowledgeIngestionService.ingestWebsitePage(businessId, p.id);
    }

    res.status(200).json({
      success: true,
      message: 'Incremental indexing run complete.',
      correlationId: req.correlationId
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/knowledge/context/:businessId - Business Context Package
router.get('/context/:businessId', async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { topic } = req.query;

    if (!topic) {
      throw new AppError('Topic query parameter is required.', 400, 'VALIDATION_ERROR');
    }

    const pkg = await BusinessContextService.assembleContext(businessId, String(topic));
    res.status(200).json({
      success: true,
      data: pkg,
      correlationId: req.correlationId
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/knowledge/snapshot/:businessId - Create context snapshot
router.post('/snapshot/:businessId', async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const { topic, version } = req.body;

    if (!topic || !version) {
      throw new AppError('Missing topic or version payload.', 400, 'VALIDATION_ERROR');
    }

    const snap = await BusinessContextService.createSnapshot(businessId, topic, Number(version));
    res.status(201).json({
      success: true,
      data: snap,
      correlationId: req.correlationId
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/knowledge/snapshots/:businessId - List historical snapshots
router.get('/snapshots/:businessId', async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const list = await BusinessContextService.getSnapshots(businessId);
    res.status(200).json({
      success: true,
      data: list,
      correlationId: req.correlationId
    });
  } catch (error) {
    next(error);
  }
});

export default router;
