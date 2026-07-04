"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscoveryEngine = void 0;
const QuestionLibrary_1 = require("./QuestionLibrary");
const DiscoveryFlowEngine_1 = require("./DiscoveryFlowEngine");
const CoverageEngine_1 = require("./CoverageEngine");
const BusinessUnderstandingEngine_1 = require("./BusinessUnderstandingEngine");
const MissingInformationEngine_1 = require("./MissingInformationEngine");
const businessRepository_1 = require("../../repositories/businessRepository");
const prisma_1 = require("../../database/prisma");
const errorMiddleware_1 = require("../../middleware/errorMiddleware");
class DiscoveryEngine {
    /**
     * Evaluates the current state of a business Twin profile, calculating
     * coverage, understanding, active questions, and missing knowledge.
     */
    static async evaluateState(businessId) {
        const business = await businessRepository_1.businessRepository.findBasicById(businessId);
        if (!business) {
            throw new errorMiddleware_1.AppError('Business Digital Twin not found', 404, 'NOT_FOUND');
        }
        // 1. Load active answers from DB to evaluate flows
        const fullBiz = await prisma_1.prisma.business.findUnique({
            where: { id: businessId },
            include: {
                identity: true,
                model: true,
                marketingProfile: true,
                salesProfile: true,
                operationsProfile: true,
                technologyProfile: true,
                organizationStructure: true
            }
        });
        const answersMap = {};
        for (const q of QuestionLibrary_1.QUESTION_LIBRARY) {
            const val = this.extractPathValue(fullBiz, q.dbPath);
            if (val !== null && val !== undefined && val !== '') {
                answersMap[q.id] = val;
            }
        }
        // 2. Fetch the corresponding Knowledge Pack
        const industry = fullBiz?.model?.type || 'SaaS';
        const stage = 'GROWTH'; // Mock standard business growth phase
        // 3. Compute active questions based on flow rules
        const activeQuestions = DiscoveryFlowEngine_1.DiscoveryFlowEngine.getActiveQuestions(industry, stage, answersMap);
        // 4. Calculate Coverage Engine Metrics
        const covReport = await CoverageEngine_1.CoverageEngine.calculateCoverage(businessId, activeQuestions);
        // 5. Calculate Business Understanding Engine Metrics
        const undReport = BusinessUnderstandingEngine_1.BusinessUnderstandingEngine.calculateUnderstanding(industry, covReport.categoryCoverage);
        // 6. Detect missing items
        const missingAlerts = await MissingInformationEngine_1.MissingInformationEngine.detectMissing(businessId, activeQuestions);
        // 7. Calculate next section to prompt
        const completedCategories = Object.keys(covReport.categoryCoverage).filter((cat) => covReport.categoryCoverage[cat] === 100);
        const nextSection = DiscoveryFlowEngine_1.DiscoveryFlowEngine.getNextSection(industry, completedCategories);
        // 8. Update database tables with new progress scores
        await businessRepository_1.businessRepository.updateDiscoveryProgress(businessId, {
            overallCoverage: covReport.overallCoverage,
            identityStatus: covReport.categoryCoverage['identity'] === 100 ? 'COMPLETED' : 'DRAFT',
            modelStatus: covReport.categoryCoverage['model'] === 100 ? 'COMPLETED' : 'DRAFT',
            productsStatus: covReport.categoryCoverage['products-services'] === 100 ? 'COMPLETED' : 'DRAFT',
            customersStatus: covReport.categoryCoverage['customers'] === 100 ? 'COMPLETED' : 'DRAFT',
            marketingStatus: covReport.categoryCoverage['marketing'] === 100 ? 'COMPLETED' : 'DRAFT',
            salesStatus: covReport.categoryCoverage['sales'] === 100 ? 'COMPLETED' : 'DRAFT',
            operationsStatus: covReport.categoryCoverage['operations'] === 100 ? 'COMPLETED' : 'DRAFT',
            financeStatus: covReport.categoryCoverage['finance'] === 100 ? 'COMPLETED' : 'DRAFT',
            technologyStatus: covReport.categoryCoverage['technology'] === 100 ? 'COMPLETED' : 'DRAFT'
        });
        return {
            overallCoverage: covReport.overallCoverage,
            overallUnderstanding: undReport.overallUnderstanding,
            categoryCoverage: covReport.categoryCoverage,
            categoryUnderstanding: undReport.categoryUnderstanding,
            activeQuestions,
            missingAlerts,
            nextSection
        };
    }
    /**
     * Save user answer, write metadata, and run telemetry updates.
     */
    static async saveAnswer(businessId, questionId, value, status = 'KNOWN', source = 'USER') {
        const q = QuestionLibrary_1.QUESTION_LIBRARY.find((item) => item.id === questionId);
        if (!q) {
            throw new errorMiddleware_1.AppError(`Unknown question ID: ${questionId}`, 400, 'INVALID_QUESTION');
        }
        // 1. Update the mapped Prisma database table
        const parts = q.dbPath.split('.');
        const profileKey = parts[0]; // e.g. "identity", "marketingProfile"
        const fieldName = parts[1]; // e.g. "legalName", "adSpend"
        if (profileKey === 'identity') {
            await businessRepository_1.businessRepository.upsertIdentity(businessId, { [fieldName]: value });
        }
        else if (profileKey === 'model') {
            await businessRepository_1.businessRepository.upsertModel(businessId, { [fieldName]: value });
        }
        else if (profileKey === 'marketingProfile') {
            await businessRepository_1.businessRepository.upsertMarketing(businessId, { [fieldName]: value });
        }
        else if (profileKey === 'salesProfile') {
            await businessRepository_1.businessRepository.upsertSales(businessId, { [fieldName]: value });
        }
        else if (profileKey === 'operationsProfile') {
            await businessRepository_1.businessRepository.upsertOperations(businessId, { [fieldName]: value });
        }
        else if (profileKey === 'technologyProfile') {
            await businessRepository_1.businessRepository.upsertTechnology(businessId, { [fieldName]: value });
        }
        else if (profileKey === 'organizationStructure') {
            await businessRepository_1.businessRepository.upsertOrganizationStructure(businessId, { [fieldName]: value });
        }
        // 2. Save/Update AnswerMetadata
        await prisma_1.prisma.answerMetadata.upsert({
            where: {
                businessId_fieldPath: {
                    businessId,
                    fieldPath: q.dbPath
                }
            },
            create: {
                businessId,
                fieldPath: q.dbPath,
                status,
                source
            },
            update: {
                status,
                source
            }
        });
        // 3. Re-evaluate overall twin coverage and telemetry scores
        return this.evaluateState(businessId);
    }
    static extractPathValue(obj, path) {
        if (!obj || !path)
            return null;
        const parts = path.split('.');
        let current = obj;
        for (const part of parts) {
            if (current === null || current === undefined)
                return null;
            current = current[part];
        }
        return current ?? null;
    }
}
exports.DiscoveryEngine = DiscoveryEngine;
