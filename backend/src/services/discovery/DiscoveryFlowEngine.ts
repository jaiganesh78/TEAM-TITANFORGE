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
