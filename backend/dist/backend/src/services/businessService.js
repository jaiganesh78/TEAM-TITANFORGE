"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessService = exports.BusinessService = void 0;
const businessRepository_1 = require("../repositories/businessRepository");
const twinValidators_1 = require("../validators/twinValidators");
const errorMiddleware_1 = require("../middleware/errorMiddleware");
const client_1 = require("@prisma/client");
class BusinessService {
    async createInvestigation(organizationId, name) {
        if (!name || name.trim().length < 2) {
            throw new errorMiddleware_1.AppError('Investigation name must be at least 2 characters', 400, 'VALIDATION_ERROR');
        }
        return businessRepository_1.businessRepository.create(organizationId, name.trim());
    }
    async listInvestigations(organizationId) {
        return businessRepository_1.businessRepository.findByOrganization(organizationId);
    }
    async getBasicBusiness(id) {
        return businessRepository_1.businessRepository.findBasicById(id);
    }
    async getTwinSummary(id) {
        const business = await businessRepository_1.businessRepository.findById(id);
        if (!business) {
            throw new errorMiddleware_1.AppError('Business Digital Twin not found', 404, 'NOT_FOUND');
        }
        const auditLogs = await businessRepository_1.businessRepository.findAuditLogs(id);
        return {
            business,
            auditLogs,
        };
    }
    async deleteInvestigation(id) {
        const business = await businessRepository_1.businessRepository.findBasicById(id);
        if (!business) {
            throw new errorMiddleware_1.AppError('Business Digital Twin not found', 404, 'NOT_FOUND');
        }
        return businessRepository_1.businessRepository.softDelete(id);
    }
    async getSectionData(businessId, sectionName) {
        const business = await businessRepository_1.businessRepository.findById(businessId);
        if (!business) {
            throw new errorMiddleware_1.AppError('Business Digital Twin not found', 404, 'NOT_FOUND');
        }
        switch (sectionName) {
            case 'identity':
                return business.identity || {};
            case 'model':
                return business.model || {};
            case 'products-services':
                return { products: business.products || [], services: business.services || [] };
            case 'customers':
                return { segments: business.customerSegments || [], personas: business.customerPersonas || [] };
            case 'marketing':
                return business.marketingProfile || {};
            case 'sales':
                return business.salesProfile || {};
            case 'operations':
                return business.operationsProfile || {};
            case 'finance':
                return {
                    cashOnHand: business.finance?.cashOnHand ?? null,
                    burnRate: business.finance?.burnRate ?? null,
                    runwayMonths: business.finance?.runwayMonths ?? null,
                    revenues: business.revenueProfiles || []
                };
            case 'technology':
                return business.technologyProfile || {};
            case 'organization':
                return {
                    headcount: business.organizationStructure?.headcount ?? null,
                    orgChartLink: business.organizationStructure?.orgChartLink ?? null,
                    employees: business.employees || []
                };
            case 'partners-vendors':
                return { partners: business.partners || [], vendors: business.vendors || [] };
            case 'competitors':
                return { competitors: business.competitors || [] };
            case 'goals':
                return { goals: business.goals || [] };
            case 'constraints':
                return { constraints: business.constraints || [] };
            case 'risks':
                return { risks: business.risks || [] };
            case 'kpis':
                return { kpis: business.kpis || [] };
            case 'documents':
                return { documents: business.documents || [] };
            case 'website':
                return { websites: business.websites || [] };
            default:
                throw new errorMiddleware_1.AppError(`Unknown section: ${sectionName}`, 400, 'INVALID_SECTION');
        }
    }
    async updateSectionData(businessId, userId, sectionName, rawData) {
        const business = await businessRepository_1.businessRepository.findById(businessId);
        if (!business) {
            throw new errorMiddleware_1.AppError('Business Digital Twin not found', 404, 'NOT_FOUND');
        }
        // 1. Get Validator
        const validator = twinValidators_1.sectionValidators[sectionName];
        if (!validator) {
            throw new errorMiddleware_1.AppError(`Unknown section: ${sectionName}`, 400, 'INVALID_SECTION');
        }
        // 2. Validate using Zod
        const validatedData = validator.parse(rawData);
        // 3. Get Previous Data (for Auditing)
        const previousData = await this.getSectionData(businessId, sectionName);
        // 4. Update specific section in DB
        switch (sectionName) {
            case 'identity':
                await businessRepository_1.businessRepository.upsertIdentity(businessId, validatedData);
                break;
            case 'model':
                await businessRepository_1.businessRepository.upsertModel(businessId, validatedData);
                break;
            case 'products-services':
                await businessRepository_1.businessRepository.updateProducts(businessId, validatedData.products || []);
                await businessRepository_1.businessRepository.updateServices(businessId, validatedData.services || []);
                break;
            case 'customers':
                await businessRepository_1.businessRepository.updateCustomerSegments(businessId, validatedData.segments || []);
                await businessRepository_1.businessRepository.updateCustomerPersonas(businessId, validatedData.personas || []);
                break;
            case 'marketing':
                await businessRepository_1.businessRepository.upsertMarketing(businessId, validatedData);
                break;
            case 'sales':
                await businessRepository_1.businessRepository.upsertSales(businessId, validatedData);
                break;
            case 'operations':
                await businessRepository_1.businessRepository.upsertOperations(businessId, validatedData);
                break;
            case 'finance':
                // Finance has 1-to-1 operational details and 1-to-many revenues
                const { revenues, ...financeInfo } = validatedData;
                // In this architecture, let's store operational variables in operationsProfile or custom model if desired, 
                // or update operationsProfile properties directly.
                await businessRepository_1.businessRepository.upsertOperations(businessId, financeInfo);
                await businessRepository_1.businessRepository.updateRevenueProfiles(businessId, revenues || []);
                break;
            case 'technology':
                await businessRepository_1.businessRepository.upsertTechnology(businessId, validatedData);
                break;
            case 'organization':
                const { employees, ...orgDetails } = validatedData;
                await businessRepository_1.businessRepository.upsertOrganizationStructure(businessId, orgDetails);
                await businessRepository_1.businessRepository.updateEmployees(businessId, employees || []);
                break;
            case 'partners-vendors':
                await businessRepository_1.businessRepository.updatePartners(businessId, validatedData.partners || []);
                await businessRepository_1.businessRepository.updateVendors(businessId, validatedData.vendors || []);
                break;
            case 'competitors':
                await businessRepository_1.businessRepository.updateCompetitors(businessId, validatedData.competitors || []);
                break;
            case 'goals':
                await businessRepository_1.businessRepository.updateGoals(businessId, validatedData.goals || []);
                break;
            case 'constraints':
                await businessRepository_1.businessRepository.updateConstraints(businessId, validatedData.constraints || []);
                break;
            case 'risks':
                await businessRepository_1.businessRepository.updateRisks(businessId, validatedData.risks || []);
                break;
            case 'kpis':
                await businessRepository_1.businessRepository.updateKPIs(businessId, validatedData.kpis || []);
                break;
            case 'documents':
                await businessRepository_1.businessRepository.updateDocuments(businessId, validatedData.documents || []);
                break;
            case 'website':
                await businessRepository_1.businessRepository.updateWebsites(businessId, validatedData.websites || []);
                break;
        }
        // 5. Audit Log Entry
        await businessRepository_1.businessRepository.writeAuditLog({
            userId,
            businessId,
            section: sectionName,
            operation: 'UPDATE',
            previousValue: JSON.stringify(previousData),
            newValue: JSON.stringify(validatedData),
        });
        // 6. Recalculate Discovery Progress & overall coverage
        await this.recalculateProgress(businessId);
        // Update basic Business lastUpdated timestamp
        await businessRepository_1.businessRepository.update(businessId, { lastUpdated: new Date() });
        return this.getSectionData(businessId, sectionName);
    }
    async recalculateProgress(businessId) {
        const business = await businessRepository_1.businessRepository.findById(businessId);
        if (!business)
            return;
        // Evaluate completion state for each of the 18 sections
        const getStatus = (val, isEmptyArrayOrNull) => {
            if (isEmptyArrayOrNull)
                return 'DRAFT';
            // For general objects, check if all properties are null or empty
            if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
                const keys = Object.keys(val).filter(k => k !== 'id' && k !== 'businessId');
                const hasData = keys.some(k => val[k] !== null && val[k] !== undefined && val[k] !== '');
                return hasData ? 'COMPLETED' : 'DRAFT';
            }
            return 'COMPLETED';
        };
        const progressData = {
            identityStatus: getStatus(business.identity, !business.identity || !business.identity.legalName),
            modelStatus: getStatus(business.model, !business.model || !business.model.type),
            productsStatus: getStatus(null, (!business.products || business.products.length === 0) && (!business.services || business.services.length === 0)),
            customersStatus: getStatus(null, (!business.customerSegments || business.customerSegments.length === 0) && (!business.customerPersonas || business.customerPersonas.length === 0)),
            marketingStatus: getStatus(business.marketingProfile, !business.marketingProfile),
            salesStatus: getStatus(business.salesProfile, !business.salesProfile),
            operationsStatus: getStatus(business.operationsProfile, !business.operationsProfile),
            financeStatus: getStatus(null, !business.revenueProfiles || business.revenueProfiles.length === 0),
            technologyStatus: getStatus(business.technologyProfile, !business.technologyProfile),
            organizationStatus: getStatus(null, (!business.employees || business.employees.length === 0) && !business.organizationStructure),
            partnersStatus: getStatus(null, (!business.partners || business.partners.length === 0) && (!business.vendors || business.vendors.length === 0)),
            competitorsStatus: getStatus(null, !business.competitors || business.competitors.length === 0),
            goalsStatus: getStatus(null, !business.goals || business.goals.length === 0),
            constraintsStatus: getStatus(null, !business.constraints || business.constraints.length === 0),
            risksStatus: getStatus(null, !business.risks || business.risks.length === 0),
            kpisStatus: getStatus(null, !business.kpis || business.kpis.length === 0),
            documentsStatus: getStatus(null, !business.documents || business.documents.length === 0),
            websiteStatus: getStatus(null, !business.websites || business.websites.length === 0),
        };
        // Calculate score
        const statusArray = Object.values(progressData);
        const completedCount = statusArray.filter(s => s === 'COMPLETED').length;
        const inProgressCount = statusArray.filter(s => s === 'IN_PROGRESS').length;
        // Contributes 100/18 per completed, 50/18 per in progress
        const score = ((completedCount * 1) + (inProgressCount * 0.5)) * (100 / 18);
        const overallCoverage = Math.min(100, Math.round(score));
        // Upsert DiscoveryProgress
        await businessRepository_1.businessRepository.updateDiscoveryProgress(businessId, {
            overallCoverage,
            ...progressData,
        });
        // Automatically promote general status to IN_PROGRESS if coverage > 0
        if (business.status === client_1.BusinessStatus.DRAFT && overallCoverage > 0) {
            await businessRepository_1.businessRepository.update(businessId, { status: client_1.BusinessStatus.IN_PROGRESS });
        }
    }
}
exports.BusinessService = BusinessService;
exports.businessService = new BusinessService();
