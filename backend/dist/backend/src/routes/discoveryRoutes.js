"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const DiscoveryEngine_1 = require("../services/discovery/DiscoveryEngine");
const KnowledgePackManager_1 = require("../services/discovery/KnowledgePackManager");
const QuestionLibrary_1 = require("../services/discovery/QuestionLibrary");
const businessRepository_1 = require("../repositories/businessRepository");
const errorMiddleware_1 = require("../middleware/errorMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.requireAuth);
// GET /api/discovery/:id/state - Retrieve full telemetry report and active questions
router.get('/:id/state', async (req, res, next) => {
    try {
        const { id } = req.params;
        const basic = await businessRepository_1.businessRepository.findBasicById(id);
        if (!basic) {
            throw new errorMiddleware_1.AppError('Business Digital Twin not found', 404, 'NOT_FOUND');
        }
        // Verify tenancy access
        if (req.user && basic.organizationId !== req.user.organizationId) {
            throw new errorMiddleware_1.AppError('Forbidden access to this digital twin', 403, 'FORBIDDEN');
        }
        const stateReport = await DiscoveryEngine_1.DiscoveryEngine.evaluateState(id);
        res.status(200).json({
            success: true,
            data: stateReport,
            correlationId: req.correlationId,
        });
    }
    catch (error) {
        next(error);
    }
});
// PUT /api/discovery/:id/answer - Save answer metadata and value
router.put('/:id/answer', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { questionId, value, status, source } = req.body;
        const basic = await businessRepository_1.businessRepository.findBasicById(id);
        if (!basic) {
            throw new errorMiddleware_1.AppError('Business Digital Twin not found', 404, 'NOT_FOUND');
        }
        // Verify tenancy access
        if (req.user && basic.organizationId !== req.user.organizationId) {
            throw new errorMiddleware_1.AppError('Forbidden access to this digital twin', 403, 'FORBIDDEN');
        }
        const updatedState = await DiscoveryEngine_1.DiscoveryEngine.saveAnswer(id, questionId, value, status || 'KNOWN', source || 'USER');
        // Log audit entry
        await businessRepository_1.businessRepository.writeAuditLog({
            userId: req.user.userId,
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
    }
    catch (error) {
        next(error);
    }
});
// GET /api/discovery/packs - Retrieve industry packs catalog configuration
router.get('/packs', async (req, res) => {
    res.status(200).json({
        success: true,
        data: KnowledgePackManager_1.KnowledgePackManager.listPacks(),
    });
});
// GET /api/discovery/library - Retrieve full library of questions
router.get('/library', async (req, res) => {
    res.status(200).json({
        success: true,
        data: QuestionLibrary_1.QUESTION_LIBRARY,
    });
});
exports.default = router;
