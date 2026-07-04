import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { WebsiteAnalysisService } from '../services/acquisition/WebsiteAnalysisService';
import { DocumentUploadService } from '../services/acquisition/DocumentUploadService';
import { ReviewService } from '../services/acquisition/ReviewService';
import { EvidenceService } from '../services/acquisition/EvidenceService';
import { prisma } from '../database/prisma';
import { DocumentCategory } from '@prisma/client';
import { AppError } from '../middleware/errorMiddleware';

const router = Router();

router.use(requireAuth);

// POST /api/acquisition/website - Queue website analysis
router.post('/website', async (req, res, next) => {
  try {
    const { businessId, url } = req.body;
    if (!businessId || !url) {
      throw new AppError('Business ID and URL are required.', 400, 'VALIDATION_ERROR');
    }

    // Initialize or retrieve Website, then queue a run
    let website = await prisma.website.findFirst({
      where: { businessId, url }
    });

    if (!website) {
      website = await prisma.website.create({
        data: { businessId, url }
      });
    }

    const run = await WebsiteAnalysisService.queueAnalysis(businessId, url);
    res.status(202).json({
      success: true,
      data: run,
      correlationId: req.correlationId
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/acquisition/website/:businessId - List crawl analysis history
router.get('/website/:businessId', async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const history = await prisma.website.findMany({
      where: { businessId },
      include: {
        analysisRuns: {
          orderBy: { startedAt: 'desc' },
          include: { pages: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: history,
      correlationId: req.correlationId
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/acquisition/document/upload - Upload file & categorise
router.post('/document/upload', async (req, res, next) => {
  try {
    const { businessId, fileName, fileContent, category, uploadedBy } = req.body;
    if (!businessId || !fileName || !fileContent || !category) {
      throw new AppError('Missing required document metadata.', 400, 'VALIDATION_ERROR');
    }

    // Cast category string to Enum
    const enumCategory = category as DocumentCategory;

    const doc = await DocumentUploadService.uploadDocument(
      businessId,
      fileName,
      fileContent,
      enumCategory,
      uploadedBy || 'Jai Ganesh'
    );

    res.status(202).json({
      success: true,
      data: doc,
      correlationId: req.correlationId
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/acquisition/document/:businessId - List documents uploaded
router.get('/document/:businessId', async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const docs = await prisma.uploadedDocument.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: docs,
      correlationId: req.correlationId
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/acquisition/review/:businessId - Fetch candidates queue
router.get('/review/:businessId', async (req, res, next) => {
  try {
    const { businessId } = req.params;
    const list = await ReviewService.getPendingCandidates(businessId);
    res.status(200).json({
      success: true,
      data: list,
      correlationId: req.correlationId
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/acquisition/review/action - Accept/Reject suggestion
router.post('/review/action', async (req, res, next) => {
  try {
    const { candidateId, action, editedValue } = req.body;
    if (!candidateId || !action) {
      throw new AppError('Candidate ID and action are required.', 400, 'VALIDATION_ERROR');
    }

    const userId = req.user?.userId || 'SYSTEM';

    if (action === 'ACCEPT') {
      const state = await ReviewService.acceptCandidate(candidateId, userId, editedValue);
      res.status(200).json({ success: true, data: state, correlationId: req.correlationId });
    } else {
      await ReviewService.rejectCandidate(candidateId, userId);
      res.status(200).json({ success: true, correlationId: req.correlationId });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/acquisition/evidence/:businessId/:fieldPath - Trace history
router.get('/evidence/:businessId/:fieldPath', async (req, res, next) => {
  try {
    const { businessId, fieldPath } = req.params;
    const list = await EvidenceService.getEvidences(businessId, fieldPath);
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
