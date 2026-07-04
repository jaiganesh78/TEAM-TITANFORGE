import { businessRepository } from '../repositories/businessRepository';
import { sectionValidators } from '../validators/twinValidators';
import { AppError } from '../middleware/errorMiddleware';
import { Business, BusinessStatus } from '@prisma/client';

export class BusinessService {
  async createInvestigation(organizationId: string, name: string): Promise<Business> {
    if (!name || name.trim().length < 2) {
      throw new AppError('Investigation name must be at least 2 characters', 400, 'VALIDATION_ERROR');
    }
    return businessRepository.create(organizationId, name.trim());
  }

  async listInvestigations(organizationId: string): Promise<Business[]> {
    return businessRepository.findByOrganization(organizationId);
  }

  async getBasicBusiness(id: string): Promise<Business | null> {
    return businessRepository.findBasicById(id);
  }

  async getTwinSummary(id: string): Promise<any | null> {
    const business = await businessRepository.findById(id);
    if (!business) {
      throw new AppError('Business Digital Twin not found', 404, 'NOT_FOUND');
    }
    const auditLogs = await businessRepository.findAuditLogs(id);
    return {
      business,
      auditLogs,
    };
  }

  async deleteInvestigation(id: string): Promise<Business> {
    const business = await businessRepository.findBasicById(id);
    if (!business) {
      throw new AppError('Business Digital Twin not found', 404, 'NOT_FOUND');
    }
    return businessRepository.softDelete(id);
  }

  async getSectionData(businessId: string, sectionName: string): Promise<any> {
    const business = await businessRepository.findById(businessId);
    if (!business) {
      throw new AppError('Business Digital Twin not found', 404, 'NOT_FOUND');
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
        throw new AppError(`Unknown section: ${sectionName}`, 400, 'INVALID_SECTION');
    }
  }

  async updateSectionData(businessId: string, userId: string, sectionName: string, rawData: any): Promise<any> {
    const business = await businessRepository.findById(businessId);
    if (!business) {
      throw new AppError('Business Digital Twin not found', 404, 'NOT_FOUND');
    }

    // 1. Get Validator
    const validator = sectionValidators[sectionName];
    if (!validator) {
      throw new AppError(`Unknown section: ${sectionName}`, 400, 'INVALID_SECTION');
    }

    // 2. Validate using Zod
    const validatedData = validator.parse(rawData);

    // 3. Get Previous Data (for Auditing)
    const previousData = await this.getSectionData(businessId, sectionName);

    // 4. Update specific section in DB
    switch (sectionName) {
      case 'identity':
        await businessRepository.upsertIdentity(businessId, validatedData);
        break;
      case 'model':
        await businessRepository.upsertModel(businessId, validatedData);
        break;
      case 'products-services':
        await businessRepository.updateProducts(businessId, validatedData.products || []);
        await businessRepository.updateServices(businessId, validatedData.services || []);
        break;
      case 'customers':
        await businessRepository.updateCustomerSegments(businessId, validatedData.segments || []);
        await businessRepository.updateCustomerPersonas(businessId, validatedData.personas || []);
        break;
      case 'marketing':
        await businessRepository.upsertMarketing(businessId, validatedData);
        break;
      case 'sales':
        await businessRepository.upsertSales(businessId, validatedData);
        break;
      case 'operations':
        await businessRepository.upsertOperations(businessId, validatedData);
        break;
      case 'finance':
        // Finance has 1-to-1 operational details and 1-to-many revenues
        const { revenues, ...financeInfo } = validatedData;
        // In this architecture, let's store operational variables in operationsProfile or custom model if desired, 
        // or update operationsProfile properties directly.
        await businessRepository.upsertOperations(businessId, financeInfo);
        await businessRepository.updateRevenueProfiles(businessId, revenues || []);
        break;
      case 'technology':
        await businessRepository.upsertTechnology(businessId, validatedData);
        break;
      case 'organization':
        const { employees, ...orgDetails } = validatedData;
        await businessRepository.upsertOrganizationStructure(businessId, orgDetails);
        await businessRepository.updateEmployees(businessId, employees || []);
        break;
      case 'partners-vendors':
        await businessRepository.updatePartners(businessId, validatedData.partners || []);
        await businessRepository.updateVendors(businessId, validatedData.vendors || []);
        break;
      case 'competitors':
        await businessRepository.updateCompetitors(businessId, validatedData.competitors || []);
        break;
      case 'goals':
        await businessRepository.updateGoals(businessId, validatedData.goals || []);
        break;
      case 'constraints':
        await businessRepository.updateConstraints(businessId, validatedData.constraints || []);
        break;
      case 'risks':
        await businessRepository.updateRisks(businessId, validatedData.risks || []);
        break;
      case 'kpis':
        await businessRepository.updateKPIs(businessId, validatedData.kpis || []);
        break;
      case 'documents':
        await businessRepository.updateDocuments(businessId, validatedData.documents || []);
        break;
      case 'website':
        await businessRepository.updateWebsites(businessId, validatedData.websites || []);
        break;
    }

    // 5. Audit Log Entry
    await businessRepository.writeAuditLog({
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
    await businessRepository.update(businessId, { lastUpdated: new Date() });

    return this.getSectionData(businessId, sectionName);
  }

  private async recalculateProgress(businessId: string): Promise<void> {
    const business = await businessRepository.findById(businessId);
    if (!business) return;

    // Evaluate completion state for each of the 18 sections
    const getStatus = (val: any, isEmptyArrayOrNull: boolean): string => {
      if (isEmptyArrayOrNull) return 'DRAFT';
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
    await businessRepository.updateDiscoveryProgress(businessId, {
      overallCoverage,
      ...progressData,
    });

    // Automatically promote general status to IN_PROGRESS if coverage > 0
    if (business.status === BusinessStatus.DRAFT && overallCoverage > 0) {
      await businessRepository.update(businessId, { status: BusinessStatus.IN_PROGRESS });
    }
  }
}
export const businessService = new BusinessService();
