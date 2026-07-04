import { z } from 'zod';

export const identitySchema = z.object({
  legalName: z.string().min(2, 'Legal name must be at least 2 characters'),
  tradeName: z.string().optional().nullable(),
  foundedYear: z.number().int().min(1700).max(new Date().getFullYear()).optional().nullable(),
  headquarters: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  websiteUrl: z.string().url().or(z.literal('')).optional().nullable(),
});

export const modelSchema = z.object({
  type: z.enum(['B2B', 'B2C', 'SaaS', 'MARKETPLACE', 'E_COMMERCE', 'HYBRID', '']).default(''),
  valueProposition: z.string().optional().nullable(),
  keyPartners: z.string().optional().nullable(),
  keyActivities: z.string().optional().nullable(),
  keyResources: z.string().optional().nullable(),
  costStructure: z.string().optional().nullable(),
  revenueStreams: z.string().optional().nullable(),
});

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().optional().nullable(),
  price: z.number().min(0),
  unitCost: z.number().min(0).optional().nullable(),
  salesVolume: z.number().int().min(0).optional().nullable(),
});

export const serviceSchema = z.object({
  name: z.string().min(2, 'Service name is required'),
  description: z.string().optional().nullable(),
  rate: z.number().min(0),
  capacity: z.number().int().min(0).optional().nullable(),
});

export const productsServicesSchema = z.object({
  products: z.array(productSchema).default([]),
  services: z.array(serviceSchema).default([]),
});

export const customerSegmentItemSchema = z.object({
  segmentName: z.string().min(2, 'Segment name is required'),
  cac: z.number().min(0).optional().nullable(),
  ltv: z.number().min(0).optional().nullable(),
  churnRate: z.number().min(0).max(100).optional().nullable(),
  description: z.string().optional().nullable(),
});

export const customerPersonaItemSchema = z.object({
  name: z.string().min(2, 'Persona name is required'),
  demographics: z.string().optional().nullable(),
  painPoints: z.string().optional().nullable(),
  coreBehaviors: z.string().optional().nullable(),
});

export const customersSchema = z.object({
  segments: z.array(customerSegmentItemSchema).default([]),
  personas: z.array(customerPersonaItemSchema).default([]),
});

export const marketingSchema = z.object({
  adSpend: z.number().min(0).optional().nullable(),
  roi: z.number().optional().nullable(),
  channelsUsed: z.string().optional().nullable(),
  conversions: z.string().optional().nullable(),
});

export const salesSchema = z.object({
  leadsCount: z.number().int().min(0).optional().nullable(),
  conversionRate: z.number().min(0).max(100).optional().nullable(),
  pipelineValue: z.number().min(0).optional().nullable(),
  salesCycleDays: z.number().int().min(0).optional().nullable(),
});

export const operationsSchema = z.object({
  infraCost: z.number().min(0).optional().nullable(),
  supportTicketsCount: z.number().int().min(0).optional().nullable(),
  avgResolutionTimeMs: z.number().int().min(0).optional().nullable(),
  bottlenecks: z.string().optional().nullable(),
});

export const revenueProfileItemSchema = z.object({
  period: z.string().min(2, 'Period name is required'),
  totalRevenue: z.number().min(0),
  mrr: z.number().min(0).optional().nullable(),
  arr: z.number().min(0).optional().nullable(),
  grossMargin: z.number().min(0).max(100).optional().nullable(),
  growthRate: z.number().optional().nullable(),
});

export const financeSchema = z.object({
  cashOnHand: z.number().min(0).optional().nullable(),
  burnRate: z.number().min(0).optional().nullable(),
  runwayMonths: z.number().min(0).optional().nullable(),
  revenues: z.array(revenueProfileItemSchema).default([]),
});

export const technologySchema = z.object({
  infraProvider: z.string().optional().nullable(),
  coreFrameworks: z.string().optional().nullable(),
  databases: z.string().optional().nullable(),
  integrations: z.string().optional().nullable(),
  securityCertification: z.string().optional().nullable(),
});

export const employeeProfileItemSchema = z.object({
  departmentName: z.string().min(2, 'Department name is required'),
  count: z.number().int().min(1),
  avgSalary: z.number().min(0).optional().nullable(),
  turnoverRate: z.number().min(0).max(100).optional().nullable(),
});

export const organizationSchema = z.object({
  headcount: z.number().int().min(0).optional().nullable(),
  orgChartLink: z.string().url().or(z.literal('')).optional().nullable(),
  employees: z.array(employeeProfileItemSchema).default([]),
});

export const vendorProfileItemSchema = z.object({
  vendorName: z.string().min(2, 'Vendor name is required'),
  serviceCategory: z.string().optional().nullable(),
  contractCost: z.number().min(0).optional().nullable(),
  contractEnd: z.string().or(z.date()).optional().nullable(),
});

export const partnerProfileItemSchema = z.object({
  partnerName: z.string().min(2, 'Partner name is required'),
  partnershipType: z.string().optional().nullable(),
  dependencyLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', '']).default(''),
});

export const partnersVendorsSchema = z.object({
  partners: z.array(partnerProfileItemSchema).default([]),
  vendors: z.array(vendorProfileItemSchema).default([]),
});

export const competitorProfileItemSchema = z.object({
  competitorName: z.string().min(2, 'Competitor name is required'),
  strengths: z.string().optional().nullable(),
  weaknesses: z.string().optional().nullable(),
  marketShare: z.number().min(0).max(100).optional().nullable(),
});

export const competitorsSchema = z.object({
  competitors: z.array(competitorProfileItemSchema).default([]),
});

export const goalItemSchema = z.object({
  title: z.string().min(2, 'Goal title is required'),
  description: z.string().optional().nullable(),
  targetDate: z.string().or(z.date()).optional().nullable(),
  progress: z.number().min(0).max(100).optional().nullable().default(0),
});

export const goalsSchema = z.object({
  goals: z.array(goalItemSchema).default([]),
});

export const constraintItemSchema = z.object({
  type: z.string().min(2, 'Constraint type is required'),
  description: z.string().optional().nullable(),
  limitValue: z.string().optional().nullable(),
});

export const constraintsSchema = z.object({
  constraints: z.array(constraintItemSchema).default([]),
});

export const riskItemSchema = z.object({
  title: z.string().min(2, 'Risk title is required'),
  description: z.string().optional().nullable(),
  likelihood: z.enum(['LOW', 'MEDIUM', 'HIGH', '']).default(''),
  impact: z.enum(['LOW', 'MEDIUM', 'HIGH', '']).default(''),
  mitigation: z.string().optional().nullable(),
});

export const risksSchema = z.object({
  risks: z.array(riskItemSchema).default([]),
});

export const kpiItemSchema = z.object({
  name: z.string().min(2, 'KPI name is required'),
  currentValue: z.number(),
  targetValue: z.number().optional().nullable(),
  unit: z.string().optional().nullable(),
});

export const kpisSchema = z.object({
  kpis: z.array(kpiItemSchema).default([]),
});

export const documentItemSchema = z.object({
  fileName: z.string().min(2, 'File name is required'),
  fileType: z.string(),
  fileUrl: z.string().url(),
  sizeBytes: z.number().int().optional().nullable(),
});

export const documentsSchema = z.object({
  documents: z.array(documentItemSchema).default([]),
});

export const websiteItemSchema = z.object({
  url: z.string().url('Please enter a valid website page URL'),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  crawledAt: z.string().or(z.date()).optional().nullable(),
});

export const websiteSchema = z.object({
  websites: z.array(websiteItemSchema).default([]),
});

// Map containing validator for each section
export const sectionValidators: Record<string, z.ZodSchema> = {
  'identity': identitySchema,
  'model': modelSchema,
  'products-services': productsServicesSchema,
  'customers': customersSchema,
  'marketing': marketingSchema,
  'sales': salesSchema,
  'operations': operationsSchema,
  'finance': financeSchema,
  'technology': technologySchema,
  'organization': organizationSchema,
  'partners-vendors': partnersVendorsSchema,
  'competitors': competitorsSchema,
  'goals': goalsSchema,
  'constraints': constraintsSchema,
  'risks': risksSchema,
  'kpis': kpisSchema,
  'documents': documentsSchema,
  'website': websiteSchema,
};
