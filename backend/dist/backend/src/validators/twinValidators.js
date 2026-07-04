"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sectionValidators = exports.websiteSchema = exports.websiteItemSchema = exports.documentsSchema = exports.documentItemSchema = exports.kpisSchema = exports.kpiItemSchema = exports.risksSchema = exports.riskItemSchema = exports.constraintsSchema = exports.constraintItemSchema = exports.goalsSchema = exports.goalItemSchema = exports.competitorsSchema = exports.competitorProfileItemSchema = exports.partnersVendorsSchema = exports.partnerProfileItemSchema = exports.vendorProfileItemSchema = exports.organizationSchema = exports.employeeProfileItemSchema = exports.technologySchema = exports.financeSchema = exports.revenueProfileItemSchema = exports.operationsSchema = exports.salesSchema = exports.marketingSchema = exports.customersSchema = exports.customerPersonaItemSchema = exports.customerSegmentItemSchema = exports.productsServicesSchema = exports.serviceSchema = exports.productSchema = exports.modelSchema = exports.identitySchema = void 0;
const zod_1 = require("zod");
exports.identitySchema = zod_1.z.object({
    legalName: zod_1.z.string().min(2, 'Legal name must be at least 2 characters'),
    tradeName: zod_1.z.string().optional().nullable(),
    foundedYear: zod_1.z.number().int().min(1700).max(new Date().getFullYear()).optional().nullable(),
    headquarters: zod_1.z.string().optional().nullable(),
    description: zod_1.z.string().optional().nullable(),
    industry: zod_1.z.string().optional().nullable(),
    websiteUrl: zod_1.z.string().url().or(zod_1.z.literal('')).optional().nullable(),
});
exports.modelSchema = zod_1.z.object({
    type: zod_1.z.enum(['B2B', 'B2C', 'SaaS', 'MARKETPLACE', 'E_COMMERCE', 'HYBRID', '']).default(''),
    valueProposition: zod_1.z.string().optional().nullable(),
    keyPartners: zod_1.z.string().optional().nullable(),
    keyActivities: zod_1.z.string().optional().nullable(),
    keyResources: zod_1.z.string().optional().nullable(),
    costStructure: zod_1.z.string().optional().nullable(),
    revenueStreams: zod_1.z.string().optional().nullable(),
});
exports.productSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Product name is required'),
    description: zod_1.z.string().optional().nullable(),
    price: zod_1.z.number().min(0),
    unitCost: zod_1.z.number().min(0).optional().nullable(),
    salesVolume: zod_1.z.number().int().min(0).optional().nullable(),
});
exports.serviceSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Service name is required'),
    description: zod_1.z.string().optional().nullable(),
    rate: zod_1.z.number().min(0),
    capacity: zod_1.z.number().int().min(0).optional().nullable(),
});
exports.productsServicesSchema = zod_1.z.object({
    products: zod_1.z.array(exports.productSchema).default([]),
    services: zod_1.z.array(exports.serviceSchema).default([]),
});
exports.customerSegmentItemSchema = zod_1.z.object({
    segmentName: zod_1.z.string().min(2, 'Segment name is required'),
    cac: zod_1.z.number().min(0).optional().nullable(),
    ltv: zod_1.z.number().min(0).optional().nullable(),
    churnRate: zod_1.z.number().min(0).max(100).optional().nullable(),
    description: zod_1.z.string().optional().nullable(),
});
exports.customerPersonaItemSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Persona name is required'),
    demographics: zod_1.z.string().optional().nullable(),
    painPoints: zod_1.z.string().optional().nullable(),
    coreBehaviors: zod_1.z.string().optional().nullable(),
});
exports.customersSchema = zod_1.z.object({
    segments: zod_1.z.array(exports.customerSegmentItemSchema).default([]),
    personas: zod_1.z.array(exports.customerPersonaItemSchema).default([]),
});
exports.marketingSchema = zod_1.z.object({
    adSpend: zod_1.z.number().min(0).optional().nullable(),
    roi: zod_1.z.number().optional().nullable(),
    channelsUsed: zod_1.z.string().optional().nullable(),
    conversions: zod_1.z.string().optional().nullable(),
});
exports.salesSchema = zod_1.z.object({
    leadsCount: zod_1.z.number().int().min(0).optional().nullable(),
    conversionRate: zod_1.z.number().min(0).max(100).optional().nullable(),
    pipelineValue: zod_1.z.number().min(0).optional().nullable(),
    salesCycleDays: zod_1.z.number().int().min(0).optional().nullable(),
});
exports.operationsSchema = zod_1.z.object({
    infraCost: zod_1.z.number().min(0).optional().nullable(),
    supportTicketsCount: zod_1.z.number().int().min(0).optional().nullable(),
    avgResolutionTimeMs: zod_1.z.number().int().min(0).optional().nullable(),
    bottlenecks: zod_1.z.string().optional().nullable(),
});
exports.revenueProfileItemSchema = zod_1.z.object({
    period: zod_1.z.string().min(2, 'Period name is required'),
    totalRevenue: zod_1.z.number().min(0),
    mrr: zod_1.z.number().min(0).optional().nullable(),
    arr: zod_1.z.number().min(0).optional().nullable(),
    grossMargin: zod_1.z.number().min(0).max(100).optional().nullable(),
    growthRate: zod_1.z.number().optional().nullable(),
});
exports.financeSchema = zod_1.z.object({
    cashOnHand: zod_1.z.number().min(0).optional().nullable(),
    burnRate: zod_1.z.number().min(0).optional().nullable(),
    runwayMonths: zod_1.z.number().min(0).optional().nullable(),
    revenues: zod_1.z.array(exports.revenueProfileItemSchema).default([]),
});
exports.technologySchema = zod_1.z.object({
    infraProvider: zod_1.z.string().optional().nullable(),
    coreFrameworks: zod_1.z.string().optional().nullable(),
    databases: zod_1.z.string().optional().nullable(),
    integrations: zod_1.z.string().optional().nullable(),
    securityCertification: zod_1.z.string().optional().nullable(),
});
exports.employeeProfileItemSchema = zod_1.z.object({
    departmentName: zod_1.z.string().min(2, 'Department name is required'),
    count: zod_1.z.number().int().min(1),
    avgSalary: zod_1.z.number().min(0).optional().nullable(),
    turnoverRate: zod_1.z.number().min(0).max(100).optional().nullable(),
});
exports.organizationSchema = zod_1.z.object({
    headcount: zod_1.z.number().int().min(0).optional().nullable(),
    orgChartLink: zod_1.z.string().url().or(zod_1.z.literal('')).optional().nullable(),
    employees: zod_1.z.array(exports.employeeProfileItemSchema).default([]),
});
exports.vendorProfileItemSchema = zod_1.z.object({
    vendorName: zod_1.z.string().min(2, 'Vendor name is required'),
    serviceCategory: zod_1.z.string().optional().nullable(),
    contractCost: zod_1.z.number().min(0).optional().nullable(),
    contractEnd: zod_1.z.string().or(zod_1.z.date()).optional().nullable(),
});
exports.partnerProfileItemSchema = zod_1.z.object({
    partnerName: zod_1.z.string().min(2, 'Partner name is required'),
    partnershipType: zod_1.z.string().optional().nullable(),
    dependencyLevel: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', '']).default(''),
});
exports.partnersVendorsSchema = zod_1.z.object({
    partners: zod_1.z.array(exports.partnerProfileItemSchema).default([]),
    vendors: zod_1.z.array(exports.vendorProfileItemSchema).default([]),
});
exports.competitorProfileItemSchema = zod_1.z.object({
    competitorName: zod_1.z.string().min(2, 'Competitor name is required'),
    strengths: zod_1.z.string().optional().nullable(),
    weaknesses: zod_1.z.string().optional().nullable(),
    marketShare: zod_1.z.number().min(0).max(100).optional().nullable(),
});
exports.competitorsSchema = zod_1.z.object({
    competitors: zod_1.z.array(exports.competitorProfileItemSchema).default([]),
});
exports.goalItemSchema = zod_1.z.object({
    title: zod_1.z.string().min(2, 'Goal title is required'),
    description: zod_1.z.string().optional().nullable(),
    targetDate: zod_1.z.string().or(zod_1.z.date()).optional().nullable(),
    progress: zod_1.z.number().min(0).max(100).optional().nullable().default(0),
});
exports.goalsSchema = zod_1.z.object({
    goals: zod_1.z.array(exports.goalItemSchema).default([]),
});
exports.constraintItemSchema = zod_1.z.object({
    type: zod_1.z.string().min(2, 'Constraint type is required'),
    description: zod_1.z.string().optional().nullable(),
    limitValue: zod_1.z.string().optional().nullable(),
});
exports.constraintsSchema = zod_1.z.object({
    constraints: zod_1.z.array(exports.constraintItemSchema).default([]),
});
exports.riskItemSchema = zod_1.z.object({
    title: zod_1.z.string().min(2, 'Risk title is required'),
    description: zod_1.z.string().optional().nullable(),
    likelihood: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', '']).default(''),
    impact: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', '']).default(''),
    mitigation: zod_1.z.string().optional().nullable(),
});
exports.risksSchema = zod_1.z.object({
    risks: zod_1.z.array(exports.riskItemSchema).default([]),
});
exports.kpiItemSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'KPI name is required'),
    currentValue: zod_1.z.number(),
    targetValue: zod_1.z.number().optional().nullable(),
    unit: zod_1.z.string().optional().nullable(),
});
exports.kpisSchema = zod_1.z.object({
    kpis: zod_1.z.array(exports.kpiItemSchema).default([]),
});
exports.documentItemSchema = zod_1.z.object({
    fileName: zod_1.z.string().min(2, 'File name is required'),
    fileType: zod_1.z.string(),
    fileUrl: zod_1.z.string().url(),
    sizeBytes: zod_1.z.number().int().optional().nullable(),
});
exports.documentsSchema = zod_1.z.object({
    documents: zod_1.z.array(exports.documentItemSchema).default([]),
});
exports.websiteItemSchema = zod_1.z.object({
    url: zod_1.z.string().url('Please enter a valid website page URL'),
    title: zod_1.z.string().optional().nullable(),
    description: zod_1.z.string().optional().nullable(),
    crawledAt: zod_1.z.string().or(zod_1.z.date()).optional().nullable(),
});
exports.websiteSchema = zod_1.z.object({
    websites: zod_1.z.array(exports.websiteItemSchema).default([]),
});
// Map containing validator for each section
exports.sectionValidators = {
    'identity': exports.identitySchema,
    'model': exports.modelSchema,
    'products-services': exports.productsServicesSchema,
    'customers': exports.customersSchema,
    'marketing': exports.marketingSchema,
    'sales': exports.salesSchema,
    'operations': exports.operationsSchema,
    'finance': exports.financeSchema,
    'technology': exports.technologySchema,
    'organization': exports.organizationSchema,
    'partners-vendors': exports.partnersVendorsSchema,
    'competitors': exports.competitorsSchema,
    'goals': exports.goalsSchema,
    'constraints': exports.constraintsSchema,
    'risks': exports.risksSchema,
    'kpis': exports.kpisSchema,
    'documents': exports.documentsSchema,
    'website': exports.websiteSchema,
};
