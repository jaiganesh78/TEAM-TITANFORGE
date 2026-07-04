"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("./authRoutes"));
const organizationRoutes_1 = __importDefault(require("./organizationRoutes"));
const businessRoutes_1 = __importDefault(require("./businessRoutes"));
const discoveryRoutes_1 = __importDefault(require("./discoveryRoutes"));
const acquisitionRoutes_1 = __importDefault(require("./acquisitionRoutes"));
const knowledgeRoutes_1 = __importDefault(require("./knowledgeRoutes"));
const growthRoutes_1 = __importDefault(require("./growthRoutes"));
const strategyRoutes_1 = __importDefault(require("./strategyRoutes"));
const marketingRoutes_1 = __importDefault(require("./marketingRoutes"));
const leadRoutes_1 = require("./leadRoutes");
const salesRoutes_1 = require("./salesRoutes");
const analyticsRoutes_1 = __importDefault(require("./analyticsRoutes"));
const customerSuccessRoutes_1 = require("./customerSuccessRoutes");
const executiveBoardRoutes_1 = require("./executiveBoardRoutes");
const router = (0, express_1.Router)();
router.use('/auth', authRoutes_1.default);
router.use('/organization', organizationRoutes_1.default);
router.use('/business', businessRoutes_1.default);
router.use('/discovery', discoveryRoutes_1.default);
router.use('/acquisition', acquisitionRoutes_1.default);
router.use('/knowledge', knowledgeRoutes_1.default);
router.use('/growth', growthRoutes_1.default);
router.use('/strategy', strategyRoutes_1.default);
router.use('/marketing', marketingRoutes_1.default);
router.use('/lead', leadRoutes_1.leadRouter);
router.use('/sales', salesRoutes_1.salesRouter);
router.use('/analytics', analyticsRoutes_1.default);
router.use('/customer-success', customerSuccessRoutes_1.customerSuccessRouter);
router.use('/executive-board', executiveBoardRoutes_1.executiveBoardRouter);
// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        correlationId: req.correlationId,
    });
});
exports.default = router;
