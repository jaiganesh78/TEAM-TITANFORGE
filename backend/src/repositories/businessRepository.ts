import { prisma } from '../database/prisma';
import { Business, BusinessStatus, Prisma } from '@prisma/client';

export class BusinessRepository {
  // Initialize a new investigation
  async create(organizationId: string, name: string): Promise<Business> {
    return prisma.$transaction(async (tx) => {
      // 1. Create Business
      const business = await tx.business.create({
        data: {
          organizationId,
          name,
          status: BusinessStatus.DRAFT,
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
  async findById(id: string): Promise<any | null> {
    return prisma.business.findUnique({
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
  async findBasicById(id: string): Promise<Business | null> {
    return prisma.business.findFirst({
      where: { id, deleted: false },
    });
  }

  // List investigations for organization
  async findByOrganization(organizationId: string): Promise<Business[]> {
    return prisma.business.findMany({
      where: { organizationId, deleted: false },
      orderBy: { lastUpdated: 'desc' },
      include: {
        discoveryProgress: true,
      }
    });
  }

  // Soft delete
  async softDelete(id: string): Promise<Business> {
    return prisma.business.update({
      where: { id },
      data: { deleted: true, status: BusinessStatus.ARCHIVED },
    });
  }

  // Update business properties (like status, name, etc.)
  async update(id: string, data: Prisma.BusinessUpdateInput): Promise<Business> {
    return prisma.business.update({
      where: { id },
      data,
    });
  }

  // ==========================================
  // SECTION UPSERT MUTATORS
  // ==========================================

  // 1-to-1: Identity
  async upsertIdentity(businessId: string, data: any) {
    return prisma.businessIdentity.upsert({
      where: { businessId },
      create: { businessId, ...data },
      update: data,
    });
  }

  // 1-to-1: Business Model
  async upsertModel(businessId: string, data: any) {
    return prisma.businessModel.upsert({
      where: { businessId },
      create: { businessId, ...data },
      update: data,
    });
  }

  // 1-to-1: Marketing
  async upsertMarketing(businessId: string, data: any) {
    return prisma.marketingProfile.upsert({
      where: { businessId },
      create: { businessId, ...data },
      update: data,
    });
  }

  // 1-to-1: Sales
  async upsertSales(businessId: string, data: any) {
    return prisma.salesProfile.upsert({
      where: { businessId },
      create: { businessId, ...data },
      update: data,
    });
  }

  // 1-to-1: Operations
  async upsertOperations(businessId: string, data: any) {
    return prisma.operationsProfile.upsert({
      where: { businessId },
      create: { businessId, ...data },
      update: data,
    });
  }

  // 1-to-1: Technology
  async upsertTechnology(businessId: string, data: any) {
    return prisma.technologyProfile.upsert({
      where: { businessId },
      create: { businessId, ...data },
      update: data,
    });
  }

  // 1-to-1: Organization Structure
  async upsertOrganizationStructure(businessId: string, data: any) {
    return prisma.organizationStructure.upsert({
      where: { businessId },
      create: { businessId, ...data },
      update: data,
    });
  }

  // 1-to-many arrays: Products & Services (Products)
  async updateProducts(businessId: string, products: any[]) {
    return prisma.$transaction(async (tx) => {
      await tx.productPortfolio.deleteMany({ where: { businessId } });
      if (products.length > 0) {
        await tx.productPortfolio.createMany({
          data: products.map(p => ({ businessId, ...p })),
        });
      }
    });
  }

  // 1-to-many arrays: Products & Services (Services)
  async updateServices(businessId: string, services: any[]) {
    return prisma.$transaction(async (tx) => {
      await tx.servicePortfolio.deleteMany({ where: { businessId } });
      if (services.length > 0) {
        await tx.servicePortfolio.createMany({
          data: services.map(s => ({ businessId, ...s })),
        });
      }
    });
  }

  // 1-to-many arrays: Customer Segments
  async updateCustomerSegments(businessId: string, segments: any[]) {
    return prisma.$transaction(async (tx) => {
      await tx.customerSegment.deleteMany({ where: { businessId } });
      if (segments.length > 0) {
        await tx.customerSegment.createMany({
          data: segments.map(s => ({ businessId, ...s })),
        });
      }
    });
  }

  // 1-to-many arrays: Customer Personas
  async updateCustomerPersonas(businessId: string, personas: any[]) {
    return prisma.$transaction(async (tx) => {
      await tx.customerPersona.deleteMany({ where: { businessId } });
      if (personas.length > 0) {
        await tx.customerPersona.createMany({
          data: personas.map(p => ({ businessId, ...p })),
        });
      }
    });
  }

  // 1-to-many arrays: Revenue profiles (Finance table items)
  async updateRevenueProfiles(businessId: string, revenues: any[]) {
    return prisma.$transaction(async (tx) => {
      await tx.revenueProfile.deleteMany({ where: { businessId } });
      if (revenues.length > 0) {
        await tx.revenueProfile.createMany({
          data: revenues.map(r => ({ businessId, ...r })),
        });
      }
    });
  }

  // 1-to-many arrays: Employees (Organization table items)
  async updateEmployees(businessId: string, employees: any[]) {
    return prisma.$transaction(async (tx) => {
      await tx.employeeProfile.deleteMany({ where: { businessId } });
      if (employees.length > 0) {
        await tx.employeeProfile.createMany({
          data: employees.map(e => ({ businessId, ...e })),
        });
      }
    });
  }

  // 1-to-many arrays: Vendors (Partners & Vendors table items)
  async updateVendors(businessId: string, vendors: any[]) {
    return prisma.$transaction(async (tx) => {
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
  async updatePartners(businessId: string, partners: any[]) {
    return prisma.$transaction(async (tx) => {
      await tx.partnerProfile.deleteMany({ where: { businessId } });
      if (partners.length > 0) {
        await tx.partnerProfile.createMany({
          data: partners.map(p => ({ businessId, ...p })),
        });
      }
    });
  }

  // 1-to-many arrays: Competitors
  async updateCompetitors(businessId: string, competitors: any[]) {
    return prisma.$transaction(async (tx) => {
      await tx.competitorProfile.deleteMany({ where: { businessId } });
      if (competitors.length > 0) {
        await tx.competitorProfile.createMany({
          data: competitors.map(c => ({ businessId, ...c })),
        });
      }
    });
  }

  // 1-to-many arrays: Goals
  async updateGoals(businessId: string, goals: any[]) {
    return prisma.$transaction(async (tx) => {
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
  async updateConstraints(businessId: string, constraints: any[]) {
    return prisma.$transaction(async (tx) => {
      await tx.businessConstraint.deleteMany({ where: { businessId } });
      if (constraints.length > 0) {
        await tx.businessConstraint.createMany({
          data: constraints.map(c => ({ businessId, ...c })),
        });
      }
    });
  }

  // 1-to-many arrays: Risks
  async updateRisks(businessId: string, risks: any[]) {
    return prisma.$transaction(async (tx) => {
      await tx.businessRisk.deleteMany({ where: { businessId } });
      if (risks.length > 0) {
        await tx.businessRisk.createMany({
          data: risks.map(r => ({ businessId, ...r })),
        });
      }
    });
  }

  // 1-to-many arrays: KPIs
  async updateKPIs(businessId: string, kpis: any[]) {
    return prisma.$transaction(async (tx) => {
      await tx.businessKPI.deleteMany({ where: { businessId } });
      if (kpis.length > 0) {
        await tx.businessKPI.createMany({
          data: kpis.map(k => ({ businessId, ...k })),
        });
      }
    });
  }

  // 1-to-many arrays: Documents Reference
  async updateDocuments(businessId: string, docs: any[]) {
    return prisma.$transaction(async (tx) => {
      await tx.businessDocumentReference.deleteMany({ where: { businessId } });
      if (docs.length > 0) {
        await tx.businessDocumentReference.createMany({
          data: docs.map(d => ({ businessId, ...d })),
        });
      }
    });
  }

  // 1-to-many arrays: Website References
  async updateWebsites(businessId: string, websites: any[]) {
    return prisma.$transaction(async (tx) => {
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
  async updateDiscoveryProgress(businessId: string, data: any) {
    return prisma.discoveryProgress.upsert({
      where: { businessId },
      create: { businessId, ...data },
      update: data,
    });
  }

  // Twin Audit Logger Write
  async writeAuditLog(data: { userId: string; businessId: string; section: string; operation: string; previousValue?: string; newValue?: string }) {
    return prisma.twinAuditLog.create({
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
  async findAuditLogs(businessId: string): Promise<any[]> {
    return prisma.twinAuditLog.findMany({
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
export const businessRepository = new BusinessRepository();
