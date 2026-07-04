import { Recommendation, RecommendationReflection } from '../../../../ai/contracts/recommendation';
import { DebateRound } from '../../../../ai/contracts/debate';
import { SimulationInput, SimulationResult } from '../../../../ai/contracts/simulator';
import { ExplanationTrace } from '../../../../ai/contracts/explainability';
import { BusinessDigitalTwin } from '../models/digitalTwin';

// Discovery DTOs
export interface DiscoveryFlowState {
  organizationId: string;
  industry: string;
  completedCategories: string[];
  currentCategory: string;
  answers: Record<string, any>;
  questionsAnsweredCount: number;
  totalQuestionsEstimated: number;
  coveragePercentage: number;
  understandingScore: number; // 0 to 100
}

export interface Question {
  id: string;
  category: 'IDENTITY' | 'MODEL' | 'FINANCE' | 'CUSTOMERS' | 'SALES' | 'MARKETING' | 'OPERATIONS' | 'TECHNOLOGY';
  text: string;
  inputType: 'text' | 'number' | 'select' | 'multiselect';
  options?: string[];
  required: boolean;
  dependentQuestionId?: string;
}

// Interfaces for Business Intelligence Core Modules
export interface IDiscoveryEngine {
  initializeFlow(organizationId: string): Promise<DiscoveryFlowState>;
  detectIndustry(description: string): Promise<string>;
  getNextQuestions(state: DiscoveryFlowState): Promise<Question[]>;
  submitAnswers(organizationId: string, answers: Record<string, any>): Promise<DiscoveryFlowState>;
  enrichFromWebsite(organizationId: string, url: string): Promise<Partial<BusinessDigitalTwin>>;
  enrichFromDocument(organizationId: string, documentId: string): Promise<Partial<BusinessDigitalTwin>>;
}

export interface IBusinessClassificationEngine {
  classifyBusiness(twin: BusinessDigitalTwin): Promise<{ primarySector: string; secondarySector: string; businessModel: string[] }>;
}

export interface ICoverageEngine {
  calculateCoverage(twin: BusinessDigitalTwin): Promise<{ overallCoverage: number; missingFields: string[]; categoryBreakdown: Record<string, number> }>;
}

export interface IQuestionEngine {
  generateDynamicQuestions(twin: BusinessDigitalTwin, count?: number): Promise<Question[]>;
}

export interface IWebsiteAnalysisEngine {
  analyzeUrl(url: string): Promise<{
    title: string;
    description: string;
    productsServices: string[];
    pricingModel: string;
    brandingVoice: string;
    technologiesDetected: string[];
  }>;
}

export interface IDocumentAnalysisEngine {
  parseDocument(filePath: string, fileType: string): Promise<{
    extractedText: string;
    metadata: Record<string, any>;
    keyFindings: string[];
  }>;
}

export interface IRecommendationEngine {
  generateRecommendations(twin: BusinessDigitalTwin): Promise<Recommendation[]>;
  getRecommendationById(id: string): Promise<Recommendation | null>;
}

export interface IReflectionEngine {
  reflectOnRecommendation(rec: Recommendation): Promise<RecommendationReflection>;
  evaluateDebate(rounds: DebateRound[]): Promise<{ consensusReached: boolean; recommendations: Recommendation[] }>;
}

export interface IHistoricalMemoryEngine {
  logDecisionOutcome(decisionId: string, observedKPIs: Record<string, number>): Promise<void>;
  querySimilarDecisions(context: string): Promise<any[]>;
}

export interface IDecisionSimulatorEngine {
  runSimulation(input: SimulationInput): Promise<SimulationResult>;
}

export interface IExplainabilityEngine {
  generateExplanationTrace(recId: string): Promise<ExplanationTrace>;
}

export interface ITimelineEngine {
  generateTimeline(organizationId: string): Promise<{ events: any[] }>;
}
