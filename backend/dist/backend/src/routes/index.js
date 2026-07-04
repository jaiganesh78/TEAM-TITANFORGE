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
const router = (0, express_1.Router)();
router.use('/auth', authRoutes_1.default);
router.use('/organization', organizationRoutes_1.default);
router.use('/business', businessRoutes_1.default);
router.use('/discovery', discoveryRoutes_1.default);
router.use('/acquisition', acquisitionRoutes_1.default);
router.use('/knowledge', knowledgeRoutes_1.default);
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
