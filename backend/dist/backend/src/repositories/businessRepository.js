"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessRepository = exports.BusinessRepository = void 0;
const prisma_1 = require("../database/prisma");
const client_1 = require("@prisma/client");
class BusinessRepository {
    // Initialize a new investigation
    async create(organizationId, name) {
        return prisma_1.prisma.$transaction(async (tx) => {
            // 1. Create Business
            const business = await tx.business.create({
                data: {
                    organizationId,
                    name,
                    status: client_1.BusinessStatus.DRAFT,
                },
            });
            // 2. Initialize Discovery Progress
            await tx.discoveryProgress.create({
                data: {
                    businessId: business.id,
                },
            });
            // 3. Initialize Business Profile & Identity
            await tx.businessProfile.create({
                data: {
                    businessId: business.id,
                    summary: '',
                    vision: '',
                    mission: '',
                },
            });
            await tx.businessIdentity.create({
                data: {
                    businessId: business.id,
                    legalName: name,
                },
            });
            return business;
        });
    }
    // Find business summary (including all sub-entities)
    async findById(id) {
        return prisma_1.prisma.business.findUnique({
            where: { id, deleted: false },
            include: {
                identity: true,
                profile: true,
                model: true,
                marketingProfile: true,
                salesProfile: true,
                operationsProfile: true,
                technologyProfile: true,
                organizationStructure: true,
                revenueProfiles: true,
                products: true,
                services: true,
                customerSegments: true,
                customerPersonas: true,
                employees: true,
                vendors: true,
                partners: true,
                competitors: true,
                goals: true,
                constraints: true,
                risks: true,
                kpis: true,
                documents: true,
                websites: true,
                discoveryProgress: true,
            },
        });
    }
    // Find standard Business details
    async findBasicById(id) {
        return prisma_1.prisma.business.findFirst({
            where: { id, deleted: false },
        });
    }
    // List investigations for organization
    async findByOrganization(organizationId) {
        return prisma_1.prisma.business.findMany({
            where: { organizationId, deleted: false },
            orderBy: { lastUpdated: 'desc' },
            include: {
                discoveryProgress: true,
            }
        });
    }
    // Soft delete
    async softDelete(id) {
        return prisma_1.prisma.business.update({
            where: { id },
            data: { deleted: true, status: client_1.BusinessStatus.ARCHIVED },
        });
    }
    // Update business properties (like status, name, etc.)
    async update(id, data) {
        return prisma_1.prisma.business.update({
            where: { id },
            data,
        });
    }
    // ==========================================
    // SECTION UPSERT MUTATORS
    // ==========================================
    // 1-to-1: Identity
    async upsertIdentity(businessId, data) {
        return prisma_1.prisma.businessIdentity.upsert({
            where: { businessId },
            create: { businessId, ...data },
            update: data,
        });
    }
    // 1-to-1: Business Model
    async upsertModel(businessId, data) {
        return prisma_1.prisma.businessModel.upsert({
            where: { businessId },
            create: { businessId, ...data },
            update: data,
        });
    }
    // 1-to-1: Marketing
    async upsertMarketing(businessId, data) {
        return prisma_1.prisma.marketingProfile.upsert({
            where: { businessId },
            create: { businessId, ...data },
            update: data,
        });
    }
    // 1-to-1: Sales
    async upsertSales(businessId, data) {
        return prisma_1.prisma.salesProfile.upsert({
            where: { businessId },
            create: { businessId, ...data },
            update: data,
        });
    }
    // 1-to-1: Operations
    async upsertOperations(businessId, data) {
        return prisma_1.prisma.operationsProfile.upsert({
            where: { businessId },
            create: { businessId, ...data },
            update: data,
        });
    }
    // 1-to-1: Technology
    async upsertTechnology(businessId, data) {
        return prisma_1.prisma.technologyProfile.upsert({
            where: { businessId },
            create: { businessId, ...data },
            update: data,
        });
    }
    // 1-to-1: Organization Structure
    async upsertOrganizationStructure(businessId, data) {
        return prisma_1.prisma.organizationStructure.upsert({
            where: { businessId },
            create: { businessId, ...data },
            update: data,
        });
    }
    // 1-to-many arrays: Products & Services (Products)
    async updateProducts(businessId, products) {
        return prisma_1.prisma.$transaction(async (tx) => {
            await tx.productPortfolio.deleteMany({ where: { businessId } });
            if (products.length > 0) {
                await tx.productPortfolio.createMany({
                    data: products.map(p => ({ businessId, ...p })),
                });
            }
        });
    }
    // 1-to-many arrays: Products & Services (Services)
    async updateServices(businessId, services) {
        return prisma_1.prisma.$transaction(async (tx) => {
            await tx.servicePortfolio.deleteMany({ where: { businessId } });
            if (services.length > 0) {
                await tx.servicePortfolio.createMany({
                    data: services.map(s => ({ businessId, ...s })),
                });
            }
        });
    }
    // 1-to-many arrays: Customer Segments
    async updateCustomerSegments(businessId, segments) {
        return prisma_1.prisma.$transaction(async (tx) => {
            await tx.customerSegment.deleteMany({ where: { businessId } });
            if (segments.length > 0) {
                await tx.customerSegment.createMany({
                    data: segments.map(s => ({ businessId, ...s })),
                });
            }
        });
    }
    // 1-to-many arrays: Customer Personas
    async updateCustomerPersonas(businessId, personas) {
        return prisma_1.prisma.$transaction(async (tx) => {
            await tx.customerPersona.deleteMany({ where: { businessId } });
            if (personas.length > 0) {
                await tx.customerPersona.createMany({
                    data: personas.map(p => ({ businessId, ...p })),
                });
            }
        });
    }
    // 1-to-many arrays: Revenue profiles (Finance table items)
    async updateRevenueProfiles(businessId, revenues) {
        return prisma_1.prisma.$transaction(async (tx) => {
            await tx.revenueProfile.deleteMany({ where: { businessId } });
            if (revenues.length > 0) {
                await tx.revenueProfile.createMany({
                    data: revenues.map(r => ({ businessId, ...r })),
                });
            }
        });
    }
    // 1-to-many arrays: Employees (Organization table items)
    async updateEmployees(businessId, employees) {
        return prisma_1.prisma.$transaction(async (tx) => {
            await tx.employeeProfile.deleteMany({ where: { businessId } });
            if (employees.length > 0) {
                await tx.employeeProfile.createMany({
                    data: employees.map(e => ({ businessId, ...e })),
                });
            }
        });
    }
    // 1-to-many arrays: Vendors (Partners & Vendors table items)
    async updateVendors(businessId, vendors) {
        return prisma_1.prisma.$transaction(async (tx) => {
            await tx.vendorProfile.deleteMany({ where: { businessId } });
            if (vendors.length > 0) {
                await tx.vendorProfile.createMany({
                    data: vendors.map(v => ({
                        businessId,
                        vendorName: v.vendorName,
                        serviceCategory: v.serviceCategory,
                        contractCost: v.contractCost,
                        contractEnd: v.contractEnd ? new Date(v.contractEnd) : null,
                    })),
                });
            }
        });
    }
    // 1-to-many arrays: Partners (Partners & Vendors table items)
    async updatePartners(businessId, partners) {
        return prisma_1.prisma.$transaction(async (tx) => {
            await tx.partnerProfile.deleteMany({ where: { businessId } });
            if (partners.length > 0) {
                await tx.partnerProfile.createMany({
                    data: partners.map(p => ({ businessId, ...p })),
                });
            }
        });
    }
    // 1-to-many arrays: Competitors
    async updateCompetitors(businessId, competitors) {
        return prisma_1.prisma.$transaction(async (tx) => {
            await tx.competitorProfile.deleteMany({ where: { businessId } });
            if (competitors.length > 0) {
                await tx.competitorProfile.createMany({
                    data: competitors.map(c => ({ businessId, ...c })),
                });
            }
        });
    }
    // 1-to-many arrays: Goals
    async updateGoals(businessId, goals) {
        return prisma_1.prisma.$transaction(async (tx) => {
            await tx.businessGoal.deleteMany({ where: { businessId } });
            if (goals.length > 0) {
                await tx.businessGoal.createMany({
                    data: goals.map(g => ({
                        businessId,
                        title: g.title,
                        description: g.description,
                        targetDate: g.targetDate ? new Date(g.targetDate) : null,
                        progress: g.progress || 0,
                    })),
                });
            }
        });
    }
    // 1-to-many arrays: Constraints
    async updateConstraints(businessId, constraints) {
        return prisma_1.prisma.$transaction(async (tx) => {
            await tx.businessConstraint.deleteMany({ where: { businessId } });
            if (constraints.length > 0) {
                await tx.businessConstraint.createMany({
                    data: constraints.map(c => ({ businessId, ...c })),
                });
            }
        });
    }
    // 1-to-many arrays: Risks
    async updateRisks(businessId, risks) {
        return prisma_1.prisma.$transaction(async (tx) => {
            await tx.businessRisk.deleteMany({ where: { businessId } });
            if (risks.length > 0) {
                await tx.businessRisk.createMany({
                    data: risks.map(r => ({ businessId, ...r })),
                });
            }
        });
    }
    // 1-to-many arrays: KPIs
    async updateKPIs(businessId, kpis) {
        return prisma_1.prisma.$transaction(async (tx) => {
            await tx.businessKPI.deleteMany({ where: { businessId } });
            if (kpis.length > 0) {
                await tx.businessKPI.createMany({
                    data: kpis.map(k => ({ businessId, ...k })),
                });
            }
        });
    }
    // 1-to-many arrays: Documents Reference
    async updateDocuments(businessId, docs) {
        return prisma_1.prisma.$transaction(async (tx) => {
            await tx.businessDocumentReference.deleteMany({ where: { businessId } });
            if (docs.length > 0) {
                await tx.businessDocumentReference.createMany({
                    data: docs.map(d => ({ businessId, ...d })),
                });
            }
        });
    }
    // 1-to-many arrays: Website References
    async updateWebsites(businessId, websites) {
        return prisma_1.prisma.$transaction(async (tx) => {
            await tx.websiteReference.deleteMany({ where: { businessId } });
            if (websites.length > 0) {
                await tx.websiteReference.createMany({
                    data: websites.map(w => ({
                        businessId,
                        url: w.url,
                        title: w.title,
                        description: w.description,
                        crawledAt: w.crawledAt ? new Date(w.crawledAt) : null,
                    })),
                });
            }
        });
    }
    // Discovery Progress Mutators
    async updateDiscoveryProgress(businessId, data) {
        return prisma_1.prisma.discoveryProgress.upsert({
            where: { businessId },
            create: { businessId, ...data },
            update: data,
        });
    }
    // Twin Audit Logger Write
    async writeAuditLog(data) {
        return prisma_1.prisma.twinAuditLog.create({
            data: {
                userId: data.userId,
                businessId: data.businessId,
                section: data.section,
                operation: data.operation,
                previousValue: data.previousValue,
                newValue: data.newValue,
            },
        });
    }
    // Fetch Twin Audit Logs
    async findAuditLogs(businessId) {
        return prisma_1.prisma.twinAuditLog.findMany({
            where: { businessId },
            orderBy: { timestamp: 'desc' },
            include: {
                user: {
                    select: { name: true, email: true },
                },
            },
        });
    }
}
exports.BusinessRepository = BusinessRepository;
exports.businessRepository = new BusinessRepository();
