export class PromptBuilder {
  /**
   * Builds the system prompt for strategic reasoning, setting clear boundaries.
   */
  static buildSystemPrompt(): string {
    return `You are a world-class AI Business Strategy Consultant.
Your goal is to analyze business data, identify commercial gaps, evaluate market positioning, and recommend evidence-backed growth initiatives.

RULES FOR YOUR OUTPUT:
1. NEVER perform mathematical calculations or make up numerical facts. Use the deterministic numbers provided in the context directly.
2. ALWAYS ground every claim, strength, weakness, or threat on concrete facts from the provided context.
3. Keep your analysis professional, direct, and structured. Avoid buzzwords and empty prose.
4. You must format your final output strictly as JSON matching the schema requested. Do not wrap the JSON in Markdown formatting (e.g. do not write \`\`\`json ... \`\`\`), output raw JSON text only.`;
  }

  /**
   * Compiles the contextual facts of a business into a structured text context.
   */
  static buildContextPrompt(contextPackage: any): string {
    const { businessSummary, digitalTwinData, relevantKnowledge, evidence, constraints } = contextPackage;

    let text = `BUSINESS FACTS:\n`;
    text += `- Company Legal Name: ${businessSummary.legalName}\n`;
    text += `- Industry: ${businessSummary.industry}\n`;
    text += `- Description: ${businessSummary.description}\n`;
    
    if (digitalTwinData.model) {
      text += `- Model Type: ${digitalTwinData.model.type}\n`;
      text += `- Value Proposition: ${digitalTwinData.model.valueProposition || 'Not defined'}\n`;
    }

    text += `\nCONSTRAINTS:\n`;
    if (constraints && constraints.length > 0) {
      constraints.forEach((c: string) => {
        text += `- ${c}\n`;
      });
    } else {
      text += `- None specified\n`;
    }

    text += `\nEXTRACTED EVIDENCE TRACES:\n`;
    if (evidence && evidence.length > 0) {
      evidence.forEach((e: any) => {
        text += `- [Source: ${e.source}] ${e.factPath} = ${e.factValue} (Confidence: ${e.confidence}%)\n`;
      });
    } else {
      text += `- No direct evidence traces uploaded yet\n`;
    }

    text += `\nRAG CONTEXT (Indexed Knowledge Chunks):\n`;
    if (relevantKnowledge && relevantKnowledge.length > 0) {
      relevantKnowledge.forEach((c: any, index: number) => {
        text += `[Chunk #${index + 1} - Source: ${c.source || 'Unknown'}]\n${c.content}\n\n`;
      });
    } else {
      text += `- No relevant knowledge chunks found\n`;
    }

    return text;
  }

  /**
   * Compiles prompt for SWOT analysis.
   */
  static buildSwotPrompt(contextText: string): string {
    return `${contextText}

TASK:
Analyze the business facts, RAG context, and evidence traces above to generate a structured SWOT analysis.
Identify exactly 2 Strengths, 2 Weaknesses, 1 Opportunity, and 1 Threat.
For each item, cite the exact source/evidence, and output a confidence score (0.0 - 100.0).

OUTPUT SCHEMA (JSON):
{
  "strengths": [{ "item": "string", "evidence": "string", "confidence": number }],
  "weaknesses": [{ "item": "string", "evidence": "string", "confidence": number }],
  "opportunities": [{ "item": "string", "evidence": "string", "confidence": number }],
  "threats": [{ "item": "string", "evidence": "string", "confidence": number }]
}
`;
  }

  /**
   * Compiles prompt for competitor analysis.
   */
  static buildCompetitorPrompt(contextText: string, competitorData: any[]): string {
    return `${contextText}

COMPETITOR PROFILES IN TWIN:
${JSON.stringify(competitorData || [])}

TASK:
Perform competitor analysis. Output a structured JSON containing a list of evaluated competitors, detailing:
- Market Position
- Strengths and Weaknesses
- Differentiators
- Pricing Position (relative)
- Brand Position
- Competitive Risks

OUTPUT SCHEMA (JSON):
{
  "competitors": [
    {
      "name": "string",
      "marketPosition": "string",
      "strengths": ["string"],
      "weaknesses": ["string"],
      "differentiators": ["string"],
      "pricingPosition": "string",
      "brandPosition": "string",
      "competitiveRisks": ["string"]
    }
  ]
}
`;
  }

  /**
   * Compiles prompt for strategic recommendations.
   */
  static buildRecommendationsPrompt(contextText: string, sectorConfigText: string, gapAnalysisText: string): string {
    return `${contextText}

SECTOR STANDARDS / PLAYBOOK:
${sectorConfigText}

GAP ANALYSIS:
${gapAnalysisText}

TASK:
Generate exactly 1 high-leverage strategic recommendation to address the gaps identified.
Each recommendation must contain:
1. Title and Problem description.
2. Exact Evidence cited from BDT/RAG context.
3. Affected KPIs (select from: MRR, CAC, LTV, conversion_rate, aov, retention_rate, churn_rate, win_rate, pipeline_velocity, roas).
4. Business Risks and alternative strategies considered, explaining why the alternatives were rejected.
5. Strict explainability references (growth domains used, constraints checked, assumptions, why this was selected).

OUTPUT SCHEMA (JSON):
{
  "recommendations": [
    {
      "title": "string",
      "problem": "string",
      "evidence": "string",
      "businessContext": "string",
      "reasoning": "string",
      "expectedKpiImpact": "string",
      "affectedKpis": ["string"],
      "requiredData": ["string"],
      "dependencies": ["string"],
      "priority": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "confidence": number,
      "estimatedTimeline": "string",
      "expectedROI": "string",
      "businessRisks": "string",
      "alternativeStrategies": "string",
      "explainability": {
        "knowledgeSources": ["string"],
        "businessFactsUsed": ["string"],
        "growthDomainsUsed": ["string"],
        "reasoningSummary": "string",
        "assumptions": ["string"],
        "constraints": ["string"],
        "whySelected": "string",
        "whyAlternativesRejected": "string"
      }
    }
  ]
}
`;
  }
}
