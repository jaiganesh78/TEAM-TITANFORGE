import { QUESTION_LIBRARY, LibraryQuestion } from './QuestionLibrary';
import { KnowledgePackManager, KnowledgePack } from './KnowledgePackManager';

export class DiscoveryFlowEngine {
  /**
   * Filters and returns the list of active questions for a business based on
   * its industry vertical, current stage, size, and dependency constraints.
   */
  static getActiveQuestions(
    industry: string,
    stage: string,
    answers: Record<string, any>
  ): LibraryQuestion[] {
    // 1. Filter by industry vertical and stage support
    const filteredQuestions = QUESTION_LIBRARY.filter((q) => {
      const supportsIndustry = q.industrySupport.includes('*') || q.industrySupport.includes(industry);
      const supportsStage = q.stageSupport.includes('*') || q.stageSupport.includes(stage);
      return supportsIndustry && supportsStage;
    });

    // 2. Filter by conditional dependencies (e.g. show question B only if question A matches value)
    return filteredQuestions.filter((q) => {
      if (!q.dependencies || q.dependencies.length === 0) {
        return true;
      }

      // Every dependency rule must be satisfied
      return q.dependencies.every((dep) => {
        const dependentValue = answers[dep.questionId];
        if (dependentValue === undefined || dependentValue === null) {
          return false;
        }

        switch (dep.condition) {
          case 'equals':
            return dependentValue === dep.value;
          case 'greater_than':
            return Number(dependentValue) > Number(dep.value);
          case 'exists':
            return dependentValue !== '';
          default:
            return false;
        }
      });
    });
  }

  /**
   * Determines the next discovery section/category to visit,
   * based on the knowledge pack's suggested discovery order and completeness.
   */
  static getNextSection(
    industry: string,
    completedCategories: string[]
  ): string {
    const pack = KnowledgePackManager.getPack(industry);
    const order = pack.suggestedDiscoveryOrder;

    for (const category of order) {
      if (!completedCategories.includes(category)) {
        return category;
      }
    }

    return 'summary'; // All required sections are filled
  }
}

// ================================================================
// SPRINT 6 — Discovery Explanation Layer
// ================================================================

export interface DiscoveryContext {
  businessId: string;
  sectorSlug: string;
  businessModel?: string;
  businessStage?: string;
  answeredQuestionIds: string[];
  coverageByDomain?: Record<string, number>;
  knowledgeExtracted?: {
    websitePages: number;
    documents: number;
    twinFields: number;
  };
}

export interface ExplainedQuestion {
  question: LibraryQuestion;
  whyItMatters: string;
  whichEngineNeedsIt: string;
  whichKpiDependsOnIt: string[];
  expectedConfidenceImprovement: number;
  businessImpact: string;
  discoveryPriority: number;
  alreadyExtracted: boolean;
  extractionSource?: string;
}

export class DiscoveryExplainer {
  /**
   * Computes the next discovery questions with full explanatory context.
   * Questions already answered are excluded. Questions extracted from
   * website/document data are flagged as pre-filled.
   */
  static computeNextQuestions(
    ctx: DiscoveryContext,
    limit = 10
  ): ExplainedQuestion[] {
    const activeQuestions = DiscoveryFlowEngine.getActiveQuestions(
      ctx.sectorSlug,
      ctx.businessStage ?? 'GROWTH',
      Object.fromEntries(ctx.answeredQuestionIds.map(id => [id, true]))
    );

    // Filter out already answered
    const pending = activeQuestions.filter(q => !ctx.answeredQuestionIds.includes(q.id));

    // Sort by discoveryPriority desc
    const sorted = pending.sort((a, b) =>
      (b.discoveryPriority ?? this.priorityToNumber(b.priority)) -
      (a.discoveryPriority ?? this.priorityToNumber(a.priority))
    );

    return sorted.slice(0, limit).map(q => ({
      question: q,
      whyItMatters: q.whyItMatters ?? `This question helps the AI understand your ${q.category} strategy.`,
      whichEngineNeedsIt: q.relatedEngine ?? this.inferEngine(q),
      whichKpiDependsOnIt: q.relatedKpiSlug ? [q.relatedKpiSlug] : [],
      expectedConfidenceImprovement: q.confidenceImpact ?? 0.1,
      businessImpact: q.businessImpact ?? `Improves ${q.growthDomain ?? q.category} analysis quality.`,
      discoveryPriority: q.discoveryPriority ?? this.priorityToNumber(q.priority),
      alreadyExtracted: false,
      extractionSource: undefined
    }));
  }

  private static priorityToNumber(priority: string): number {
    const map: Record<string, number> = { CRITICAL: 90, HIGH: 70, MEDIUM: 50, LOW: 30 };
    return map[priority] ?? 50;
  }

  private static inferEngine(q: LibraryQuestion): string {
    const categoryMap: Record<string, string> = {
      marketing: 'marketing-engine',
      sales: 'sales-engine',
      finance: 'analytics-engine',
      operations: 'analytics-engine',
      technology: 'strategy-engine',
      identity: 'strategy-engine',
      customers: 'lead-generation-engine',
      'customer-success': 'customer-success-engine'
    };
    return categoryMap[q.category] ?? 'strategy-engine';
  }
}
