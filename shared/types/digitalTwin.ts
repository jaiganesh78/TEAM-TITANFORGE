export interface BusinessIdentity {
  id?: string;
  legalName: string;
  tradeName?: string | null;
  foundedYear?: number | null;
  headquarters?: string | null;
  description?: string | null;
  industry?: string | null;
  websiteUrl?: string | null;
  organizationId?: string;
}

export interface BusinessModel {
  type?: string | null;
  valueProposition?: string | null;
  keyPartners?: string | null;
  keyActivities?: string | null;
  keyResources?: string | null;
  costStructure?: string | null;
  revenueStreams?: string | null;
}

export interface RevenueProfile {
  id?: string;
  period: string;
  totalRevenue: number;
  mrr?: number | null;
  arr?: number | null;
  grossMargin?: number | null;
  growthRate?: number | null;
}

export interface ProductPortfolio {
  id?: string;
  name: string;
  description?: string | null;
  price: number;
  unitCost?: number | null;
  salesVolume?: number | null;
}

export interface ServicePortfolio {
  id?: string;
  name: string;
  description?: string | null;
  rate: number;
  capacity?: number | null;
}

export interface CustomerSegment {
  id?: string;
  segmentName: string;
  cac?: number | null;
  ltv?: number | null;
  churnRate?: number | null;
  description?: string | null;
}

export interface CustomerPersona {
  id?: string;
  name: string;
  demographics?: string | null;
  painPoints?: string | null;
  coreBehaviors?: string | null;
}

export interface MarketingProfile {
  adSpend?: number | null;
  roi?: number | null;
  channelsUsed?: string | null;
  conversions?: string | null;
}

export interface SalesProfile {
  leadsCount?: number | null;
  conversionRate?: number | null;
  pipelineValue?: number | null;
  salesCycleDays?: number | null;
}

export interface OperationsProfile {
  infraCost?: number | null;
  supportTicketsCount?: number | null;
  avgResolutionTimeMs?: number | null;
  bottlenecks?: string | null;
}

export interface FinancialProfile {
  cashOnHand?: number | null;
  burnRate?: number | null;
  runwayMonths?: number | null;
  ebitda?: number | null;
}

export interface TechnologyProfile {
  infraProvider?: string | null;
  coreFrameworks?: string | null;
  databases?: string | null;
  integrations?: string | null;
  securityCertification?: string | null;
}

export interface OrganizationStructure {
  headcount?: number | null;
  orgChartLink?: string | null;
}

export interface EmployeeProfile {
  id?: string;
  departmentName: string;
  count: number;
  avgSalary?: number | null;
  turnoverRate?: number | null;
}

export interface VendorProfile {
  id?: string;
  vendorName: string;
  serviceCategory?: string | null;
  contractCost?: number | null;
  contractEnd?: string | Date | null;
}

export interface PartnerProfile {
  id?: string;
  partnerName: string;
  partnershipType?: string | null;
  dependencyLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | '';
}

export interface CompetitorProfile {
  id?: string;
  competitorName: string;
  strengths?: string | null;
  weaknesses?: string | null;
  marketShare?: number | null;
}

export interface BusinessGoal {
  id?: string;
  title: string;
  description?: string | null;
  targetDate?: string | Date | null;
  progress?: number | null;
}

export interface BusinessConstraint {
  id?: string;
  type: string;
  description?: string | null;
  limitValue?: string | null;
}

export interface BusinessRisk {
  id?: string;
  title: string;
  description?: string | null;
  likelihood?: 'LOW' | 'MEDIUM' | 'HIGH' | '';
  impact?: 'LOW' | 'MEDIUM' | 'HIGH' | '';
  mitigation?: string | null;
}

export interface BusinessKPI {
  id?: string;
  name: string;
  currentValue: number;
  targetValue?: number | null;
  unit?: string | null;
}

export interface BusinessDocumentReference {
  id?: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  sizeBytes?: number | null;
}

export interface WebsiteReference {
  id?: string;
  url: string;
  title?: string | null;
  description?: string | null;
  crawledAt?: string | Date | null;
}

export interface DiscoveryProgress {
  overallCoverage: number;
  identityStatus: string;
  modelStatus: string;
  productsStatus: string;
  customersStatus: string;
  marketingStatus: string;
  salesStatus: string;
  operationsStatus: string;
  financeStatus: string;
  technologyStatus: string;
  organizationStatus: string;
  partnersStatus: string;
  competitorsStatus: string;
  goalsStatus: string;
  constraintsStatus: string;
  risksStatus: string;
  kpisStatus: string;
  documentsStatus: string;
  websiteStatus: string;
}

export interface BusinessDigitalTwin {
  id: string;
  name: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  startedAt: string | Date;
  lastUpdated: string | Date;
  completedAt?: string | Date | null;
  identity?: BusinessIdentity | null;
  model?: BusinessModel | null;
  marketingProfile?: MarketingProfile | null;
  salesProfile?: SalesProfile | null;
  operationsProfile?: OperationsProfile | null;
  finance?: FinancialProfile | null;
  technologyProfile?: TechnologyProfile | null;
  organizationStructure?: OrganizationStructure | null;
  revenueProfiles?: RevenueProfile[];
  products?: ProductPortfolio[];
  services?: ServicePortfolio[];
  customerSegments?: CustomerSegment[];
  customerPersonas?: CustomerPersona[];
  employees?: EmployeeProfile[];
  vendors?: VendorProfile[];
  partners?: PartnerProfile[];
  competitors?: CompetitorProfile[];
  goals?: BusinessGoal[];
  constraints?: BusinessConstraint[];
  risks?: BusinessRisk[];
  kpis?: BusinessKPI[];
  documents?: BusinessDocumentReference[];
  websites?: WebsiteReference[];
  discoveryProgress?: DiscoveryProgress | null;
}
