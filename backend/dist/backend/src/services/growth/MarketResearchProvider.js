"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiMarketResearchProvider = void 0;
const GeminiProvider_1 = require("../../../../ai/providers/GeminiProvider");
const ResponseParser_1 = require("../../../../ai/providers/ResponseParser");
const PromptBuilder_1 = require("../../../../ai/providers/PromptBuilder");
class GeminiMarketResearchProvider {
    llm = new GeminiProvider_1.GeminiProvider();
    async fetchResearch(input) {
        const userPrompt = `
Industry: ${input.industry}
Target Location: ${input.location}
Business Maturity Stage: ${input.stage}

TASK:
Perform market research on this segment.
Output a Zod-valid JSON structure detailing:
- marketOverview
- industryTrends (list)
- emergingOpportunities (list)
- threats (list)
- technologyTrends (list)
- consumerBehaviour
- marketRisks (list)
`;
        const systemPrompt = PromptBuilder_1.PromptBuilder.buildSystemPrompt();
        try {
            const response = await this.llm.generateText({
                systemPrompt,
                userPrompt,
                jsonMode: true
            });
            return ResponseParser_1.ResponseParser.parseAndValidate(response.text, ResponseParser_1.MarketAnalysisSchema);
        }
        catch (err) {
            console.warn(`GeminiMarketResearchProvider failed: ${err.message}. Returning default empty struct.`);
            return {
                marketOverview: `Market analysis for ${input.industry} in ${input.location}.`,
                industryTrends: ['Digitalization', 'Automated ops'],
                emergingOpportunities: ['Customer support automation'],
                threats: ['Local competition'],
                technologyTrends: ['Cloud hosting'],
                consumerBehaviour: 'Increasing digital transactions',
                marketRisks: ['Data security and privacy laws']
            };
        }
    }
}
exports.GeminiMarketResearchProvider = GeminiMarketResearchProvider;
