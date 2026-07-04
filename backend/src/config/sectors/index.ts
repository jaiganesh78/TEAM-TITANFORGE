// Sector Manager — loads and exposes sector configurations
// All AI engines query this manager for sector-specific context.
// Never hardcode sector logic in business services.

import { SaaSSector } from './saas';
import { EcommerceSector } from './ecommerce';
import { ProfessionalServicesSector } from './professional-services';
import { RetailSector } from './retail';
import { MarketplaceSector } from './marketplace';
import { KPIDefinition, KPIRegistry } from '../kpis';
import { LibraryQuestion, QUESTION_LIBRARY } from '../../services/discovery/QuestionLibrary';

// ================================================================
// TYPE DEFINITION
// ================================================================
export interface SectorConfigDefinition {
  slug: string;
  displayName: string;
  description: string;
  businessTerminology: Record<string, string>;
  kpiSlugs: string[];
  requiredDiscoveryDomains: string[];
  marketingChannels: string[];
  leadGenerationChannels: string[];
  salesProcessSteps: string[];
  customerSuccessMetrics: string[];
  competitiveDimensions: string[];
  questionPriorities: Record<string, number>;
  growthConstraints: string[];
  businessLifecycle: any;
  customerJourney: any;
  marketingFunnel: any;
  salesFunnel: any;
  commonPainPoints: string[];
  buyingBehaviour: any;
  commonRisks: string[];
  typicalKpis: string[];
  typicalCompetitors: any;
  growthBottlenecks: string[];
  typicalAIOpportunities: string[];
  futureAIPromptTemplates: Record<string, string>;
  isActive: boolean;
}

// ================================================================
// SECTOR REGISTRY
// ================================================================
const SECTOR_REGISTRY: SectorConfigDefinition[] = [
  SaaSSector,
  EcommerceSector,
  ProfessionalServicesSector,
  RetailSector,
  MarketplaceSector
];

// ================================================================
// SECTOR MANAGER
// ================================================================
export class SectorManager {
  /**
   * Returns all active sector configurations.
   */
  static getAllSectors(): SectorConfigDefinition[] {
    return SECTOR_REGISTRY.filter(s => s.isActive);
  }

  /**
   * Returns a sector configuration by slug.
   * Falls back to a generic default if slug is not found.
   */
  static getSector(slug: string): SectorConfigDefinition {
    const sector = SECTOR_REGISTRY.find(s => s.slug === slug && s.isActive);
    if (!sector) {
      return this.getDefaultSector();
    }
    return sector;
  }

  /**
   * Returns all KPI definitions relevant to a sector.
   */
  static getKpisForSector(slug: string): KPIDefinition[] {
    const sector = this.getSector(slug);
    return KPIRegistry.getBySlugs(sector.kpiSlugs);
  }

  /**
   * Returns questions from the library that apply to this sector,
   * ordered by sector-specific priority overrides.
   */
  static getQuestionsForSector(slug: string): LibraryQuestion[] {
    const sector = this.getSector(slug);
    const overrides = sector.questionPriorities;

    return QUESTION_LIBRARY
      .filter(q => q.industrySupport.includes('*') || q.industrySupport.includes(slug))
      .sort((a, b) => {
        const pa = overrides[a.id] ?? a.discoveryPriority ?? 50;
        const pb = overrides[b.id] ?? b.discoveryPriority ?? 50;
        return pb - pa; // descending priority
      });
  }

  /**
   * Returns the AI prompt template for a specific engine in this sector.
   */
  static getPromptTemplate(slug: string, engineId: string): string {
    const sector = this.getSector(slug);
    return sector.futureAIPromptTemplates[engineId] ?? `You are an AI ${engineId} expert analysing a ${sector.displayName} business. Provide growth recommendations.`;
  }

  /**
   * Returns all discovery domains required by this sector.
   */
  static getRequiredDomains(slug: string): string[] {
    return this.getSector(slug).requiredDiscoveryDomains;
  }

  /**
   * Returns sector-specific growth bottlenecks.
   */
  static getGrowthBottlenecks(slug: string): string[] {
    return this.getSector(slug).growthBottlenecks;
  }

  /**
   * Returns common pain points for a sector.
   */
  static getPainPoints(slug: string): string[] {
    return this.getSector(slug).commonPainPoints;
  }

  /**
   * Returns typical AI opportunities for a sector.
   */
  static getAIOpportunities(slug: string): string[] {
    return this.getSector(slug).typicalAIOpportunities;
  }

  /**
   * Returns a generic fallback sector for unrecognised slugs.
   */
  private static getDefaultSector(): SectorConfigDefinition {
    return {
      slug: 'generic',
      displayName: 'Generic Business',
      description: 'A general business without a specific sector configuration.',
      businessTerminology: {},
      kpiSlugs: ['cac', 'ltv', 'ltv_cac_ratio', 'conversion_rate', 'nps'],
      requiredDiscoveryDomains: ['MARKETING', 'SALES', 'CUSTOMER_SEGMENTS', 'GROWTH_METRICS'],
      marketingChannels: ['Digital advertising', 'Content marketing', 'Email', 'Social media'],
      leadGenerationChannels: ['Website', 'Referrals', 'Paid ads'],
      salesProcessSteps: ['Lead', 'Qualification', 'Proposal', 'Close'],
      customerSuccessMetrics: ['NPS', 'Retention rate', 'Support satisfaction'],
      competitiveDimensions: ['Price', 'Quality', 'Service', 'Delivery speed'],
      questionPriorities: {},
      growthConstraints: ['Limited marketing budget', 'Small team capacity'],
      businessLifecycle: { stages: [] },
      customerJourney: { stages: [] },
      marketingFunnel: { stages: [] },
      salesFunnel: { stages: [], avgCycleDays: 14, benchmarkWinRate: 20 },
      commonPainPoints: ['Inconsistent revenue', 'Low brand awareness'],
      buyingBehaviour: { decisionMakers: ['Owner'], avgDecisionTimeWeeks: 1, keyBuyingFactors: ['Price', 'Quality'], commonObjections: [] },
      commonRisks: ['Cash flow risk', 'Market changes'],
      typicalKpis: ['cac', 'ltv', 'conversion_rate'],
      typicalCompetitors: { competitionStyle: 'General market competition.', watchSignals: [] },
      growthBottlenecks: ['Limited brand awareness', 'No systematic lead generation'],
      typicalAIOpportunities: ['Marketing automation', 'Customer segmentation', 'Revenue forecasting'],
      futureAIPromptTemplates: { 'strategy-engine': 'You are a business growth strategist. Provide top 3 growth recommendations.' },
      isActive: true
    };
  }
}
