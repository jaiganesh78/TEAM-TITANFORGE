"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessUnderstandingEngine = void 0;
const KnowledgePackManager_1 = require("./KnowledgePackManager");
class BusinessUnderstandingEngine {
    /**
     * Computes the weighted business understanding percentage scores based on
     * individual category coverage and the industry vertical's configuration weights.
     */
    static calculateUnderstanding(industry, categoryCoverage) {
        const pack = KnowledgePackManager_1.KnowledgePackManager.getPack(industry);
        const weights = pack.coverageWeights;
        const categoryUnderstanding = {};
        let totalScore = 0;
        let sumWeights = 0;
        // We compute understanding scores for each required category in the pack
        for (const cat of pack.requiredCategories) {
            const coverage = categoryCoverage[cat] || 0;
            categoryUnderstanding[cat] = coverage; // Inside a category, understanding matches completeness
            const weight = weights[cat] ?? 0;
            totalScore += coverage * weight;
            sumWeights += weight;
        }
        const overallUnderstanding = sumWeights > 0 ? Math.round(totalScore / sumWeights) : 0;
        return {
            overallUnderstanding,
            categoryUnderstanding
        };
    }
}
exports.BusinessUnderstandingEngine = BusinessUnderstandingEngine;
