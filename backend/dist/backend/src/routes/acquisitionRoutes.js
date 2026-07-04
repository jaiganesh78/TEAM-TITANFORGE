"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const WebsiteAnalysisService_1 = require("../services/acquisition/WebsiteAnalysisService");
const DocumentUploadService_1 = require("../services/acquisition/DocumentUploadService");
const ReviewService_1 = require("../services/acquisition/ReviewService");
const EvidenceService_1 = require("../services/acquisition/EvidenceService");
const prisma_1 = require("../database/prisma");
const errorMiddleware_1 = require("../middleware/errorMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.requireAuth);
// POST /api/acquisition/website - Queue website analysis
router.post('/website', async (req, res, next) => {
    try {
        const { businessId, url } = req.body;
        if (!businessId || !url) {
            throw new errorMiddleware_1.AppError('Business ID and URL are required.', 400, 'VALIDATION_ERROR');
        }
        // Initialize or retrieve Website, then queue a run
        let website = await prisma_1.prisma.website.findFirst({
            where: { businessId, url }
        });
        if (!website) {
            website = await prisma_1.prisma.website.create({
                data: { businessId, url }
            });
        }
        const run = await WebsiteAnalysisService_1.WebsiteAnalysisService.queueAnalysis(businessId, url);
        res.status(202).json({
            success: true,
            data: run,
            correlationId: req.correlationId
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/acquisition/website/:businessId - List crawl analysis history
router.get('/website/:businessId', async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const history = await prisma_1.prisma.website.findMany({
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
    }
    catch (error) {
        next(error);
    }
});
// POST /api/acquisition/document/upload - Upload file & categorise
router.post('/document/upload', async (req, res, next) => {
    try {
        const { businessId, fileName, fileContent, category, uploadedBy } = req.body;
        if (!businessId || !fileName || !fileContent || !category) {
            throw new errorMiddleware_1.AppError('Missing required document metadata.', 400, 'VALIDATION_ERROR');
        }
        // Cast category string to Enum
        const enumCategory = category;
        const doc = await DocumentUploadService_1.DocumentUploadService.uploadDocument(businessId, fileName, fileContent, enumCategory, uploadedBy || 'Jai Ganesh');
        res.status(202).json({
            success: true,
            data: doc,
            correlationId: req.correlationId
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/acquisition/document/:businessId - List documents uploaded
router.get('/document/:businessId', async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const docs = await prisma_1.prisma.uploadedDocument.findMany({
            where: { businessId },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({
            success: true,
            data: docs,
            correlationId: req.correlationId
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/acquisition/review/:businessId - Fetch candidates queue
router.get('/review/:businessId', async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const list = await ReviewService_1.ReviewService.getPendingCandidates(businessId);
        res.status(200).json({
            success: true,
            data: list,
            correlationId: req.correlationId
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/acquisition/review/action - Accept/Reject suggestion
router.post('/review/action', async (req, res, next) => {
    try {
        const { candidateId, action, editedValue } = req.body;
        if (!candidateId || !action) {
            throw new errorMiddleware_1.AppError('Candidate ID and action are required.', 400, 'VALIDATION_ERROR');
        }
        const userId = req.user?.userId || 'SYSTEM';
        if (action === 'ACCEPT') {
            const state = await ReviewService_1.ReviewService.acceptCandidate(candidateId, userId, editedValue);
            res.status(200).json({ success: true, data: state, correlationId: req.correlationId });
        }
        else {
            await ReviewService_1.ReviewService.rejectCandidate(candidateId, userId);
            res.status(200).json({ success: true, correlationId: req.correlationId });
        }
    }
    catch (error) {
        next(error);
    }
});
// GET /api/acquisition/evidence/:businessId/:fieldPath - Trace history
router.get('/evidence/:businessId/:fieldPath', async (req, res, next) => {
    try {
        const { businessId, fieldPath } = req.params;
        const list = await EvidenceService_1.EvidenceService.getEvidences(businessId, fieldPath);
        res.status(200).json({
            success: true,
            data: list,
            correlationId: req.correlationId
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
