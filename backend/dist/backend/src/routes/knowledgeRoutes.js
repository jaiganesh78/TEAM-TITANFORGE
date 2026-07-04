"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const RetrievalService_1 = require("../services/knowledge/RetrievalService");
const KnowledgeHealthService_1 = require("../services/knowledge/KnowledgeHealthService");
const BusinessContextService_1 = require("../services/knowledge/BusinessContextService");
const KnowledgeIngestionService_1 = require("../services/knowledge/KnowledgeIngestionService");
const prisma_1 = require("../database/prisma");
const errorMiddleware_1 = require("../middleware/errorMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.requireAuth);
// GET /api/knowledge/search/:businessId - Search query testing
router.get('/search/:businessId', async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const { q, sourceType } = req.query;
        if (!q) {
            throw new errorMiddleware_1.AppError('Search query parameter "q" is required.', 400, 'VALIDATION_ERROR');
        }
        const results = await RetrievalService_1.RetrievalService.retrieve({
            businessId,
            query: String(q),
            sourceType: sourceType ? sourceType : undefined
        });
        res.status(200).json({
            success: true,
            data: results,
            correlationId: req.correlationId
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/knowledge/health/:businessId - Health metrics
router.get('/health/:businessId', async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const report = await KnowledgeHealthService_1.KnowledgeHealthService.getHealth(businessId);
        res.status(200).json({
            success: true,
            data: report,
            correlationId: req.correlationId
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/knowledge/chunks/:businessId - Chunks viewer list
router.get('/chunks/:businessId', async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const list = await prisma_1.prisma.knowledgeChunk.findMany({
            where: { businessId },
            include: { metadata: true },
            orderBy: { createdAt: 'desc' }
        });
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
// POST /api/knowledge/refresh/:businessId - Manual trigger pipeline
router.post('/refresh/:businessId', async (req, res, next) => {
    try {
        const { businessId } = req.params;
        // Retrieve documents and website pages to run ingestion
        const docs = await prisma_1.prisma.uploadedDocument.findMany({ where: { businessId } });
        const pages = await prisma_1.prisma.websitePage.findMany({
            where: { analysisRun: { website: { businessId } } }
        });
        for (const d of docs) {
            await KnowledgeIngestionService_1.KnowledgeIngestionService.ingestDocument(businessId, d.id);
        }
        for (const p of pages) {
            await KnowledgeIngestionService_1.KnowledgeIngestionService.ingestWebsitePage(businessId, p.id);
        }
        res.status(200).json({
            success: true,
            message: 'Incremental indexing run complete.',
            correlationId: req.correlationId
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/knowledge/context/:businessId - Business Context Package
router.get('/context/:businessId', async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const { topic } = req.query;
        if (!topic) {
            throw new errorMiddleware_1.AppError('Topic query parameter is required.', 400, 'VALIDATION_ERROR');
        }
        const pkg = await BusinessContextService_1.BusinessContextService.assembleContext(businessId, String(topic));
        res.status(200).json({
            success: true,
            data: pkg,
            correlationId: req.correlationId
        });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/knowledge/snapshot/:businessId - Create context snapshot
router.post('/snapshot/:businessId', async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const { topic, version } = req.body;
        if (!topic || !version) {
            throw new errorMiddleware_1.AppError('Missing topic or version payload.', 400, 'VALIDATION_ERROR');
        }
        const snap = await BusinessContextService_1.BusinessContextService.createSnapshot(businessId, topic, Number(version));
        res.status(201).json({
            success: true,
            data: snap,
            correlationId: req.correlationId
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/knowledge/snapshots/:businessId - List historical snapshots
router.get('/snapshots/:businessId', async (req, res, next) => {
    try {
        const { businessId } = req.params;
        const list = await BusinessContextService_1.BusinessContextService.getSnapshots(businessId);
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
