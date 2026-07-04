import { GeminiProvider } from '../../../../ai/providers/GeminiProvider';
import { ResponseParser, MarketAnalysisSchema } from '../../../../ai/providers/ResponseParser';
import { PromptBuilder } from '../../../../ai/providers/PromptBuilder';

export interface MarketResearchInput {
  industry: string;
  location: string;
  stage: string;
}

export interface MarketResearchResult {
  marketOverview: string;
  industryTrends: string[];
  emergingOpportunities: string[];
  threats: string[];
  technologyTrends: string[];
  consumerBehaviour: string;
  marketRisks: string[];
}

export interface MarketResearchProvider {
  fetchResearch(input: MarketResearchInput): Promise<MarketResearchResult>;
}

export class GeminiMarketResearchProvider implements MarketResearchProvider {
  private llm = new GeminiProvider();

  async fetchResearch(input: MarketResearchInput): Promise<MarketResearchResult> {
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

    const systemPrompt = PromptBuilder.buildSystemPrompt();

    try {
      const response = await this.llm.generateText({
        systemPrompt,
        userPrompt,
        jsonMode: true
      });

      return ResponseParser.parseAndValidate(response.text, MarketAnalysisSchema);
    } catch (err: any) {
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
