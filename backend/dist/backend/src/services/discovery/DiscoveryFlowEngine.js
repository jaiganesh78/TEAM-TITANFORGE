"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscoveryFlowEngine = void 0;
const QuestionLibrary_1 = require("./QuestionLibrary");
const KnowledgePackManager_1 = require("./KnowledgePackManager");
class DiscoveryFlowEngine {
    /**
     * Filters and returns the list of active questions for a business based on
     * its industry vertical, current stage, size, and dependency constraints.
     */
    static getActiveQuestions(industry, stage, answers) {
        // 1. Filter by industry vertical and stage support
        const filteredQuestions = QuestionLibrary_1.QUESTION_LIBRARY.filter((q) => {
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
    static getNextSection(industry, completedCategories) {
        const pack = KnowledgePackManager_1.KnowledgePackManager.getPack(industry);
        const order = pack.suggestedDiscoveryOrder;
        for (const category of order) {
            if (!completedCategories.includes(category)) {
                return category;
            }
        }
        return 'summary'; // All required sections are filled
    }
}
exports.DiscoveryFlowEngine = DiscoveryFlowEngine;
