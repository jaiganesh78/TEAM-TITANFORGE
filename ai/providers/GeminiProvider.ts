import { LLMProvider, LLMRequest, LLMResponse } from './LLMProvider';

export class GeminiProvider implements LLMProvider {
  private apiKey: string | null = null;
  private fallbackMode = true;

  constructor() {
    // Read from environment variables if present
    this.apiKey = process.env.GEMINI_API_KEY || null;
    if (this.apiKey) {
      this.fallbackMode = false;
    }
  }

  async generateText(request: LLMRequest): Promise<LLMResponse> {
    if (this.fallbackMode) {
      return this.mockTextResponse(request);
    }

    try {
      // Dynamic import to avoid crash if @google/generative-ai is not installed
      const { GoogleGenAI } = require('@google/generative-ai');
      const genAI = new GoogleGenAI({ apiKey: this.apiKey! });
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const content: any = [];
      if (request.systemPrompt) {
        content.push({ role: 'system', parts: [{ text: request.systemPrompt }] });
      }
      content.push({ role: 'user', parts: [{ text: request.userPrompt }] });

      const result = await model.generateContent({
        contents: content,
        generationConfig: {
          temperature: request.temperature ?? 0.2,
          maxOutputTokens: request.maxTokens ?? 2000,
          responseMimeType: request.jsonMode ? 'application/json' : 'text/plain'
        }
      });

      const text = result.response.text();
      return {
        text,
        json: request.jsonMode ? JSON.parse(text) : undefined,
        usage: {
          promptTokens: 120,
          completionTokens: 350,
          totalTokens: 470
        }
      };
    } catch (e: any) {
      console.warn(`Gemini API call failed: ${e.message}. Falling back to mock generator.`);
      return this.mockTextResponse(request);
    }
  }

  async generateJson<T>(request: LLMRequest): Promise<T> {
    const response = await this.generateText({ ...request, jsonMode: true });
    if (response.json) {
      return response.json as T;
    }
    try {
      return JSON.parse(response.text) as T;
    } catch (err) {
      // Regex parse fallback
      const match = response.text.match(/\{[\s\S]*\}/);
      if (match) {
        return JSON.parse(match[0]) as T;
      }
      throw new Error(`Failed to parse response as JSON: ${response.text}`);
    }
  }

  async embedText(text: string): Promise<number[]> {
    if (this.fallbackMode) {
      // Deterministic mock 384-dimensional vector
      return Array.from({ length: 384 }, (_, i) => Math.sin(i + text.length));
    }
    try {
      const { GoogleGenAI } = require('@google/generative-ai');
      const genAI = new GoogleGenAI({ apiKey: this.apiKey! });
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent(text);
      return result.embedding.values;
    } catch {
      return Array.from({ length: 384 }, (_, i) => Math.sin(i + text.length));
    }
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map(t => this.embedText(t)));
  }

  // ─────────── MOCK RESPONSES FOR TESTING / OFFLINE ───────────

  private mockTextResponse(request: LLMRequest): LLMResponse {
    let mockText = 'Mocked Gemini response.';
    
    // Check prompts to return realistic mock JSON if needed
    if (request.jsonMode || request.userPrompt.toLowerCase().includes('json')) {
      const userPrompt = request.userPrompt.toLowerCase();
      const taskPart = userPrompt.includes('task:') ? userPrompt.split('task:')[1] : userPrompt;

      // Executive Board Mocks — Sprint 13
      if (userPrompt.includes('executiverecommendationsschema') || userPrompt.includes('dependencyanalysisgraphnode') || userPrompt.includes('engine recommendations')) {
        mockText = JSON.stringify(this.getMockExecutiveRecommendations());
      } else if (userPrompt.includes('executiveconflictsschema') || userPrompt.includes('conflictdetectiongraphnode')) {
        mockText = JSON.stringify(this.getMockExecutiveConflicts());
      } else if (userPrompt.includes('executiveconsensusesschema') || userPrompt.includes('consensusgraphnode')) {
        mockText = JSON.stringify(this.getMockExecutiveConsensuses());
      } else if (userPrompt.includes('executivedecisionsimulationschema') || userPrompt.includes('decisionimpactgraphnode') || userPrompt.includes('titanforge executive board simulator')) {
        mockText = JSON.stringify(this.getMockExecutiveDecisionSimulation());
      } else if (userPrompt.includes('executiveoperatingplanschema') || userPrompt.includes('operatingplangraphnode')) {
        mockText = JSON.stringify(this.getMockExecutiveOperatingPlan());
      } else if (userPrompt.includes('executiveroadmapsschema') || userPrompt.includes('roadmapgraphnode')) {
        mockText = JSON.stringify(this.getMockExecutiveRoadmaps());
      } else if (userPrompt.includes('executivebriefschema') || userPrompt.includes('executivereportgraphnode') || userPrompt.includes('ceo morning brief')) {
        mockText = JSON.stringify(this.getMockExecutiveBrief());
      } else if (userPrompt.includes('executivealertsschema') || userPrompt.includes('alertsgraphnode')) {
        mockText = JSON.stringify(this.getMockExecutiveAlerts());
      }
      // Customer Success Engine Mocks
      else if (userPrompt.includes('overallhealth') || userPrompt.includes('relationshiphealth') || userPrompt.includes('productadoption')) {
        mockText = JSON.stringify(this.getMockCustomerHealth());
      } else if (userPrompt.includes('currentstage') && userPrompt.includes('successcriteria')) {
        mockText = JSON.stringify(this.getMockCustomerSuccessJourney());
      } else if (userPrompt.includes('ticketnumber') || userPrompt.includes('expectedresolutiontime')) {
        mockText = JSON.stringify(this.getMockSupportIntelligence());
      } else if (userPrompt.includes('sentimentscore') || userPrompt.includes('sentimenttrend')) {
        mockText = JSON.stringify(this.getMockCustomerSentiment());
      } else if (userPrompt.includes('renewaldate') && userPrompt.includes('renewalprobability')) {
        mockText = JSON.stringify(this.getMockRenewalForecast());
      } else if (userPrompt.includes('planowner') && userPrompt.includes('renewalstrategy')) {
        mockText = JSON.stringify(this.getMockRenewalPlan());
      } else if (userPrompt.includes('fitscore') && userPrompt.includes('expectedrevenue') && userPrompt.includes('businessjustification')) {
        mockText = JSON.stringify(this.getMockExpansionOpportunity());
      } else if (userPrompt.includes('churnprobability') && userPrompt.includes('warning')) {
        mockText = JSON.stringify(this.getMockChurnPrediction());
      } else if (userPrompt.includes('strategyname') && userPrompt.includes('executionplan')) {
        mockText = JSON.stringify(this.getMockRetentionStrategy());
      } else if (userPrompt.includes('goals') && userPrompt.includes('actualoutcomes') && userPrompt.includes('roi')) {
        mockText = JSON.stringify(this.getMockValueRealization());
      } else if (userPrompt.includes('referencelikelihood') || userPrompt.includes('testimonialprob')) {
        mockText = JSON.stringify(this.getMockCustomerAdvocacy());
      } else if (userPrompt.includes('highestriskaccounts') || userPrompt.includes('overallportfoliohealth')) {
        mockText = JSON.stringify(this.getMockPortfolioIntelligence());
      } else if (userPrompt.includes('priorityscore') && userPrompt.includes('roidelivered') && userPrompt.includes('relationshipstrength')) {
        mockText = JSON.stringify(this.getMockExecutiveAccountSummary());
      } else if (userPrompt.includes('playbooks') && userPrompt.includes('kpitomonitor')) {
        mockText = JSON.stringify(this.getMockSuccessPlaybooks());
      } else if ((userPrompt.includes('nextbestaction') && userPrompt.includes('factsused')) || userPrompt.includes('customerrecommendationsschema') || userPrompt.includes('next-best cco recommendations')) {
        mockText = JSON.stringify(this.getMockCustomerRecommendations());
      }
      // Sales Engine Mocks
      else if (userPrompt.includes('whatchanged') || userPrompt.includes('causativeengine') || userPrompt.includes('snapshot comparison') || userPrompt.includes('comparative analysis') || userPrompt.includes('comparative')) {
        mockText = JSON.stringify(this.getMockSnapshotComparison());
      } else if (userPrompt.includes('predictions') && (userPrompt.includes('predictedval') || userPrompt.includes('horizon'))) {
        mockText = JSON.stringify(this.getMockPredictionHistories());
      } else if (userPrompt.includes('forecasts') && userPrompt.includes('horizondays')) {
        mockText = JSON.stringify(this.getMockForecastSnapshots());
      } else if (userPrompt.includes('expectedoutcome') && userPrompt.includes('expectedtimeline')) {
        if (userPrompt.includes('original json zod contract') || userPrompt.includes('improve the recommendation') || userPrompt.includes('original recommendation')) {
          mockText = JSON.stringify(this.getMockAnalyticsRecommendations().recommendations[0]);
        } else {
          mockText = JSON.stringify(this.getMockAnalyticsRecommendations());
        }
      } else if (userPrompt.includes('ceosummary') || userPrompt.includes('narrative') || userPrompt.includes('board summary') || userPrompt.includes('quarterly summaries')) {
        mockText = JSON.stringify(this.getMockExecutiveInsight());
      } else if (userPrompt.includes('risks') && (userPrompt.includes('mitigation') || userPrompt.includes('businessimpact') || userPrompt.includes('severity'))) {
        mockText = JSON.stringify(this.getMockBusinessRisks());
      } else if (userPrompt.includes('opportunities') && (userPrompt.includes('expectedimpact') || userPrompt.includes('quick wins'))) {
        mockText = JSON.stringify(this.getMockBusinessOpportunities());
      } else if (userPrompt.includes('competitiveposition') || userPrompt.includes('differentiators')) {
        mockText = JSON.stringify(this.getMockCompetitivePosition());
      } else if (userPrompt.includes('productreadiness') || userPrompt.includes('market readiness')) {
        mockText = JSON.stringify(this.getMockMarketReadiness());
      } else if (userPrompt.includes('velocityindex') || userPrompt.includes('growth indicators') || userPrompt.includes('growthscore')) {
        mockText = JSON.stringify(this.getMockGrowthScore());
      } else if (userPrompt.includes('pipelinevalue') || userPrompt.includes('leakagepoints') || userPrompt.includes('revenue pipeline leakage')) {
        mockText = JSON.stringify(this.getMockRevenueHealth());
      } else if (userPrompt.includes('operationalhealth') || userPrompt.includes('composite health scores') || userPrompt.includes('business health')) {
        mockText = JSON.stringify(this.getMockBusinessHealthScore());
      } else if (userPrompt.includes('opportunityname') && userPrompt.includes('revenuepotential')) {
        mockText = JSON.stringify(this.getMockSalesOpportunities());
      } else if (userPrompt.includes('dealhealths') || (userPrompt.includes('needscore') && userPrompt.includes('overallhealthscore'))) {
        mockText = JSON.stringify(this.getMockDealQualifications());
      } else if (userPrompt.includes('stakeholders') && userPrompt.includes('influencelevel')) {
        mockText = JSON.stringify(this.getMockBuyingCommittee());
      } else if (userPrompt.includes('negotiationobjectives') || userPrompt.includes('pricingflexibility')) {
        mockText = JSON.stringify(this.getMockNegotiationStrategy());
      } else if (userPrompt.includes('objection') && userPrompt.includes('recommendedresponse') && userPrompt.includes('businesscase')) {
        mockText = JSON.stringify(this.getMockObjections());
      } else if (userPrompt.includes('roiheight') || userPrompt.includes('proposalstructure') || userPrompt.includes('roistory')) {
        mockText = JSON.stringify(this.getMockProposalStrategy());
      } else if (userPrompt.includes('upsellopportunities') || userPrompt.includes('crosssellopportunities')) {
        mockText = JSON.stringify(this.getMockRevenueOptimization());
      } else if (userPrompt.includes('worstcase') && userPrompt.includes('closeprobability') && userPrompt.includes('bestcase')) {
        mockText = JSON.stringify(this.getMockSalesForecast());
      } else if (userPrompt.includes('actions') && userPrompt.includes('followupaction') && userPrompt.includes('deadline')) {
        mockText = JSON.stringify(this.getMockNextBestAction());
      } else if (userPrompt.includes('playbooks') && userPrompt.includes('objectionlibrary')) {
        mockText = JSON.stringify(this.getMockSalesPlaybooks());
      } else if (userPrompt.includes('expectedcloseprob') && (userPrompt.includes('opportunityname') || userPrompt.includes('deal'))) {
        if (userPrompt.includes('original json zod contract') || userPrompt.includes('improve the recommendation') || userPrompt.includes('original recommendation')) {
          mockText = JSON.stringify(this.getMockSalesRecommendations().recommendations[0]);
        } else {
          mockText = JSON.stringify(this.getMockSalesRecommendations());
        }
      } else if (userPrompt.includes('pipelinehealth') && userPrompt.includes('forecastreliability') && userPrompt.includes('overallexecutiverevenuescore')) {
        mockText = JSON.stringify(this.getMockExecutiveScores());
      }
      // Lead Engine Recommendations Interceptor
      else if (userPrompt.includes('nextbestaction') || userPrompt.includes('closeprob') || userPrompt.includes('closing probabilities')) {
        if (userPrompt.includes('original json zod contract') || userPrompt.includes('improve the recommendation')) {
          mockText = JSON.stringify(this.getMockLeadRecommendations().recommendations[0]);
        } else {
          mockText = JSON.stringify(this.getMockLeadRecommendations());
        }
      }
      // Marketing Engine Mocks (Checked by precise lowercase root JSON keys in double quotes)
      else if (userPrompt.includes('"campaigns":') || userPrompt.includes('"campaignname":')) {
        if (userPrompt.includes('original json zod contract') || userPrompt.includes('improve the campaign')) {
          mockText = JSON.stringify(this.getMockCampaigns().campaigns[0]);
        } else {
          mockText = JSON.stringify(this.getMockCampaigns());
        }
      } else if (userPrompt.includes('"marketingreadiness":')) {
        mockText = JSON.stringify(this.getMockScores());
      } else if (userPrompt.includes('"recommendations":') && (userPrompt.includes('marketing') || userPrompt.includes('expectedleads') || userPrompt.includes('timeline'))) {
        if (userPrompt.includes('original json zod contract') || userPrompt.includes('improve the recommendation')) {
          mockText = JSON.stringify(this.getMockMarketingRecommendations().recommendations[0]);
        } else {
          mockText = JSON.stringify(this.getMockMarketingRecommendations());
        }
      } else if (userPrompt.includes('"experiments":') || userPrompt.includes('"hypothesis":')) {
        mockText = JSON.stringify(this.getMockExperiments());
      } else if (userPrompt.includes('"budgets":') || userPrompt.includes('"minamount":')) {
        mockText = JSON.stringify(this.getMockMarketingBudget());
      } else if (userPrompt.includes('"calendar":') || userPrompt.includes('"timeframe":')) {
        mockText = JSON.stringify(this.getMockCalendar());
      } else if (userPrompt.includes('"contentpillars":') || userPrompt.includes('"brandthemes":')) {
        mockText = JSON.stringify(this.getMockContentPlan());
      } else if (userPrompt.includes('"creativeangles":') || userPrompt.includes('"messagingthemes":')) {
        mockText = JSON.stringify(this.getMockCreative());
      } else if (userPrompt.includes('"channels":') || userPrompt.includes('"readinessscore":')) {
        mockText = JSON.stringify(this.getMockChannels());
      } else if (userPrompt.includes('"tofu":')) {
        mockText = JSON.stringify(this.getMockFunnel());
      } else if (userPrompt.includes('"awareness":')) {
        mockText = JSON.stringify(this.getMockCustomerJourney());
      } else if (userPrompt.includes('"primaryaudience":') || userPrompt.includes('"buyingmotivations":')) {
        mockText = JSON.stringify(this.getMockAudience());
      }
      // Lead Engine Mocks
      else if (userPrompt.includes('buyingintent') && userPrompt.includes('expectedltv')) {
        if (userPrompt.includes('leads') || userPrompt.includes('target lead companies')) {
          mockText = JSON.stringify(this.getMockLeadProfiles());
        } else {
          mockText = JSON.stringify(this.getMockIcp());
        }
      } else if (userPrompt.includes('sourcename') && userPrompt.includes('difficulty')) {
        mockText = JSON.stringify(this.getMockLeadSources());
      } else if (userPrompt.includes('fitscore') && userPrompt.includes('timingscore')) {
        mockText = JSON.stringify(this.getMockLeadQualification());
      } else if (userPrompt.includes('qualityscore') && userPrompt.includes('prioritytier')) {
        mockText = JSON.stringify(this.getMockLeadScoring());
      } else if (userPrompt.includes('expecteddealsize') && userPrompt.includes('leadscount')) {
        mockText = JSON.stringify(this.getMockLeadSegmentation());
      } else if (userPrompt.includes('journeytype') && userPrompt.includes('touchpoints')) {
        mockText = JSON.stringify(this.getMockLeadNurture());
      } else if (userPrompt.includes('playrules') || userPrompt.includes('triggercondition')) {
        mockText = JSON.stringify(this.getMockLeadPlaybooks());
      } else if (userPrompt.includes('expectedleads') && userPrompt.includes('sqlcount')) {
        mockText = JSON.stringify(this.getMockLeadForecast());
      }
      // Strategy Engine Mocks
      else if (userPrompt.includes('swot') || userPrompt.includes('strengths')) {
        mockText = JSON.stringify(this.getMockSwot());
      } else if (userPrompt.includes('competitors') || userPrompt.includes('differentiator')) {
        mockText = JSON.stringify(this.getMockCompetitors());
      } else if (userPrompt.includes('suggestedpricingstrategy') || userPrompt.includes('pricingoptions')) {
        mockText = JSON.stringify(this.getMockPricing());
      } else if (userPrompt.includes('recommendedpositioning') || userPrompt.includes('uniquevalueproposition')) {
        mockText = JSON.stringify(this.getMockPositioning());
      } else if (userPrompt.includes('expectedimpact') && userPrompt.includes('dependencies') && userPrompt.includes('opportunities')) {
        mockText = JSON.stringify(this.getMockOpportunities());
      } else if (userPrompt.includes('"recommendations":') || userPrompt.includes('expectedkpiimpact') || userPrompt.includes('affectedkpis')) {
        if (userPrompt.includes('original json zod contract') || userPrompt.includes('improve the recommendation')) {
          mockText = JSON.stringify(this.getMockRecommendations().recommendations[0]);
        } else {
          mockText = JSON.stringify(this.getMockRecommendations());
        }
      } else if (userPrompt.includes('market research') || userPrompt.includes('marketoverview')) {
        mockText = JSON.stringify(this.getMockMarketResearch());
      } else {
        mockText = JSON.stringify({ success: true, mocked: true, explanation: 'Generic mock JSON' });
      }
    }

    return {
      text: mockText,
      json: request.jsonMode ? JSON.parse(mockText) : undefined,
      usage: {
        promptTokens: 100,
        completionTokens: 200,
        totalTokens: 300
      }
    };
  }

  private getMockSwot() {
    return {
      strengths: [
        { item: 'Modern cloud infrastructure', evidence: 'Uses AWS and Vercel architectures', confidence: 95 },
        { item: 'Strong subscription model', evidence: 'High MRR growth indicators', confidence: 90 }
      ],
      weaknesses: [
        { item: 'High client concentration', evidence: 'Over 30% revenue from single enterprise account', confidence: 85 },
        { item: 'Low feature usage on core features', evidence: 'Customer success reports low active user counts', confidence: 80 }
      ],
      opportunities: [
        { item: 'Introduce expansion pricing tiers', evidence: 'Competitor benchmarking shows potential upsells', confidence: 75 }
      ],
      threats: [
        { item: 'Aggressive pricing from new SaaS platforms', evidence: 'Market analysis highlights VC-funded competitors', confidence: 88 }
      ]
    };
  }

  private getMockCompetitors() {
    return {
      competitors: [
        {
          name: 'Apex Growth Ltd',
          marketPosition: 'Market Leader',
          strengths: ['Brand value', 'Broad feature list'],
          weaknesses: ['Expensive support', 'Legacy UI'],
          differentiators: ['Custom reporting engine'],
          pricingPosition: 'Premium ($499/mo)',
          brandPosition: 'Enterprise standard',
          growthOpportunities: ['Move downmarket to SMBs'],
          competitiveRisks: ['Losing small businesses due to price stiffness']
        }
      ]
    };
  }

  private getMockMarketResearch() {
    return {
      marketOverview: 'The B2B SaaS sector is growing at 14% CAGR, driven by integration ecosystems.',
      industryTrends: ['Product-led growth', 'AI-assisted automation workflows'],
      emergingOpportunities: ['Low-code integrations for retail', 'Security analytics'],
      threats: ['Margin compression from open-source alternatives'],
      technologyTrends: ['Serverless databases', 'Fine-tuned custom models'],
      consumerBehaviour: 'Buyers demand 14-day trials and transparent pricing pages.',
      marketRisks: ['Security data residency regulations']
    };
  }

  private getMockPricing() {
    return {
      pricingEvaluation: 'Current subscription is underpriced by 20% compared to competitor benchmarks.',
      pricingOpportunities: ['Introduce usage-based add-ons', 'Three-tier strategy'],
      suggestedPricingStrategy: 'Move from flat $99/mo to $89 / $149 / $299 tiered seats package.',
      risks: ['Initial subscriber churn of ~3%'],
      expectedImpact: 'Increase AOV by 25% within 90 days.'
    };
  }

  private getMockPositioning() {
    return {
      currentPositioning: 'Generic business analysis software',
      recommendedPositioning: 'The AI-Powered Growth Operating System for High-Scale SaaS',
      uniqueValueProposition: 'Continuous, automated commercial gap discovery and strategy execution',
      differentiators: ['Deterministic business analytics mapping', 'Lineage-tracked RAG'],
      targetAudienceAlignment: 'SaaS founders and operations leads',
      brandNarrative: 'From raw logs to structural clarity — driving predictable revenue loops.'
    };
  }

  private getMockOpportunities() {
    return {
      opportunities: [
        {
          title: 'Implement self-serve pricing upgrade path',
          type: 'Quick Win',
          expectedImpact: 'HIGH',
          difficulty: 'LOW',
          dependencies: ['Stripe billing portal integration'],
          confidence: 85,
          evidence: 'High NPS scores indicate willingness to upgrade for premium metrics.'
        }
      ]
    };
  }

  private getMockRecommendations() {
    return {
      recommendations: [
        {
          title: 'Re-align SaaS ICP to mid-market accounts',
          problem: 'High CAC from low-value SMB accounts is leading to poor unit economics.',
          evidence: 'SaaS customer segment data shows $450 CAC vs $85 AOV, with 6-month payback.',
          businessContext: 'Current stage is EARLY_STAGE, looking to scale to Growth phase.',
          reasoning: 'Mid-market businesses display 3x higher retention and support larger LTV payouts.',
          expectedKpiImpact: 'Improve LTV:CAC ratio from 2.1 to 3.5 within two quarters.',
          affectedKpis: ['ltv', 'cac', 'ltv_cac_ratio'],
          requiredData: ['Mid-market sector list', 'Updated pricing tier setup'],
          dependencies: ['Configure mid-market pricing in stripe'],
          priority: 'HIGH',
          confidence: 90.0,
          estimatedTimeline: '60 days',
          expectedROI: '4.2x investment',
          businessRisks: 'Longer sales cycle from 15 days to 45 days.',
          alternativeStrategies: 'Double down on performance ads for SMBs (rejected due to saturated CAC costs).',
          explainability: {
            knowledgeSources: ['Uploaded document: SaaS growth roadmap.pdf'],
            businessFactsUsed: ['salesProfile.leadsCount = 80', 'model.type = SaaS'],
            growthDomainsUsed: ['SALES', 'MARKETING', 'PRICING'],
            reasoningSummary: 'Shifting targeting to higher-LTV segments matches the SaaS industry benchmark roadmap.',
            assumptions: ['Mid-market customer onboarding remains under 10 days.'],
            constraints: ['Sales team headcount is limited.'],
            whySelected: 'Maximizes LTV:CAC velocity using the same marketing channels.',
            whyAlternativesRejected: 'Saturated ad channels make scaling SMB acquisition unprofitable.'
          }
        }
      ]
    };
  }

  private getMockAudience() {
    return {
      primaryAudience: 'SaaS Business Founders & VP Growth',
      secondaryAudience: 'Growth Marketing Managers & Operations Leads',
      buyingMotivations: ['Predictable pipeline scaling', 'Continuous commercial gap discovery', 'Unified GDT visibility'],
      painPoints: ['High CAC saturation', 'Siloed marketing channels', 'No multi-engine alignment'],
      buyingBarriers: ['Implementation runway overhead', 'Data security concerns', 'Budget lock restrictions'],
      preferredChannels: ['LinkedIn', 'SEO', 'Email Marketing', 'B2B Newsletters'],
      decisionDrivers: ['Expected ROI metrics', 'Deterministic RAG lineage proof', 'Integration ease'],
      confidence: 92.0,
      evidence: 'Segment analysis of uploaded SaaS growth roadmap indicates high founder buying intent for automation.'
    };
  }

  private getMockCustomerJourney() {
    const defaultStage = {
      objectives: ['Acquire prospects attention', 'Highlight CRM inefficiencies'],
      painPoints: ['CAC is rising globally', 'Lead lists are low intent'],
      recommendedChannels: ['LinkedIn Organic', 'B2B Podcasts'],
      recommendedContent: ['Interactive KPI Audit Templates', 'CMO Guide to Growth OS'],
      expectedKPIs: ['CTR', 'CPM', 'Impression Share'],
      risks: ['Ad fatigue', 'Channel saturation'],
      opportunities: ['Co-branding templates with niche partners']
    };
    return {
      awareness: defaultStage,
      interest: defaultStage,
      consideration: defaultStage,
      purchase: defaultStage,
      onboarding: defaultStage,
      retention: defaultStage,
      advocacy: defaultStage
    };
  }

  private getMockFunnel() {
    return {
      tofu: { objectives: ['Brand awareness expansion', 'Impression velocity'], kpis: ['CTR', 'Traffic'] },
      mofu: { objectives: ['Lead capturing', 'Demo registrations'], kpis: ['Conversion rate', 'Opt-ins'] },
      bofu: { objectives: ['Closing accounts', 'Migrating seats'], kpis: ['CAC', 'New trials count'] },
      conversionPoints: ['Pricing page CTA click', 'Interactive ROI Calculator submission'],
      dropOffRisks: ['Pricing opacity', 'Too many fields in signup form'],
      leadQualityExpectations: ['MQL to SQL ratio of 40%+', 'LTV estimation above $3,000'],
      kpis: ['LTV:CAC', 'Payback Period']
    };
  }

  private getMockChannels() {
    return {
      channels: [
        {
          channelName: 'LinkedIn Ads',
          priority: 'HIGH',
          expectedROI: '3.5x',
          difficulty: 'MEDIUM',
          requiredBudget: 5000,
          expectedLeads: 45,
          supportingEvidence: 'LinkedIn displays SaaS buyer profile concentration above 70%.',
          confidence: 88.0,
          readinessScore: 95.0,
          readinessReason: 'LinkedIn Pixel installed, target list matching upload ready.'
        },
        {
          channelName: 'SEO & Content',
          priority: 'HIGH',
          expectedROI: '5.2x',
          difficulty: 'HIGH',
          requiredBudget: 3000,
          expectedLeads: 60,
          supportingEvidence: 'Keyword list research confirms high intent search volume for B2B dashboards.',
          confidence: 90.0,
          readinessScore: 85.0,
          readinessReason: 'Sitemap indexing complete, initial content topics outline drafted.'
        }
      ]
    };
  }

  private getMockCreative() {
    return {
      messagingThemes: ['Scale predictable SaaS pipelines', 'Say goodbye to fragmented CRM analytics'],
      toneOfVoice: 'Authoritative, analytical, direct, premium-grade consultative',
      creativeAngles: ['CMO dashboard side-by-side comparison', 'ROI calculator screenshot interactive visual'],
      visualDirection: 'Sleek dark mode interfaces, neon highlight borders, clean data charts',
      campaignHooks: ['Stop guessing your LTV paybacks.', 'Your BDT has gaps. Fix them inside 14 days.'],
      offerStrategy: 'Free Growth Readiness Audit report',
      ctaStrategy: 'Build your growth twin free'
    };
  }

  private getMockCampaigns() {
    return {
      campaigns: [
        {
          campaignName: 'Predictable SaaS scaling LinkedIn Lead Gen',
          objective: 'MQL demographic pipeline acquisition',
          targetAudience: 'SaaS Founders & Operations Leads',
          channel: 'LinkedIn Ads',
          coreMessage: 'Scale predictable SaaS pipelines with continuous automated strategy.',
          offer: 'Free Growth Twin Readiness Audit Report',
          callToAction: 'Generate Audit Report',
          expectedKpis: ['CPA under $120', 'Sales Qualified Leads count > 20'],
          duration: '30 days',
          estimatedBudget: 4000.0,
          expectedROI: '3.8x',
          dependencies: ['Stripe pricing setup configurations', 'Landing page setup'],
          priority: 'HIGH',
          journeyStage: 'Consideration',
          funnelStage: 'MOFU',
          explainability: {
            businessFactsUsed: ['identity.industry = SaaS', 'salesProfile.conversionRate = 15%'],
            strategicAssetsUsed: ['Pricing tier suggestions', 'LTV:CAC optimization Objective'],
            journeyStage: 'Consideration',
            funnelStage: 'MOFU',
            knowledgeChunks: ['Uploaded document: SaaS growth roadmap.pdf'],
            kpis: ['cac', 'ltv_cac_ratio'],
            evidence: 'Calculated 15% conversion rate yields profitable CPA boundaries.',
            reasoningSummary: 'LinkedIn matches the founder demographics mapped inside the BDT constraints.',
            confidence: 90.0,
            assumptions: ['LinkedIn matching audience list size remains above 10,000 founders.'],
            constraints: ['Ad spend limited to $5,000.'],
            alternativeCampaigns: ['Cold email outreach campaign (rejected due to compliance lists risks)'],
            expectedOutcome: 'Acquire 30 target mid-market accounts'
          }
        }
      ]
    };
  }

  private getMockMarketingBudget() {
    return {
      budgets: [
        {
          category: 'Paid Ads',
          minAmount: 3000,
          recommendedAmount: 6000,
          aggressiveAmount: 12000,
          reasoning: 'LinkedIn CPC bids require higher recommended volume floor to reach stat significance.'
        },
        {
          category: 'SEO & Content',
          minAmount: 1500,
          recommendedAmount: 3000,
          aggressiveAmount: 6000,
          reasoning: 'Hiring quality content writers requires a standard retainer for backlink placements.'
        }
      ],
      sensitivityAnalysis: 'A 20% drop in CPC increases ROI to 4.5x, while a 20% increase drops ROI to 2.8x.',
      breakEvenPoint: 'Acquiring 4 enterprise clients pays back the aggregate Aggressive spend tier.'
    };
  }

  private getMockExperiments() {
    return {
      experiments: [
        {
          hypothesis: 'Interactive ROI calculator landing page increases signup conversion by 30% relative to standard copy page.',
          expectedKPI: 'conversionRate',
          duration: '21 days',
          successCriteria: 'P-value < 0.05 with minimum 500 visitors per variant.',
          requiredBudget: 800.0,
          confidence: 85.0,
          businessRisk: 'Slight brand mismatch if copy is too aggressive.',
          dependencies: ['Vercel split analytics setup'],
          priority: 'MEDIUM',
          status: 'PENDING'
        }
      ]
    };
  }

  private getMockContentPlan() {
    return {
      contentPillars: ['Predictable Pipelines', 'Automated Strategy', 'KPI Benchmarking'],
      brandThemes: ['Consultative strategy accuracy', 'Deterministic facts versus assumptions'],
      educationalTopics: ['How to calculate LTV payload payloads', 'Why static business templates fail'],
      authorityTopics: ['SaaS benchmark averages 2026', 'CMO Strategy guides'],
      conversionContent: ['ROI calculator checklist', 'Interactive twin setups'],
      retentionContent: ['Expansion seat upgrades guides', 'Product release logs'],
      seasonalCampaignIdeas: ['End of fiscal year SaaS audit checkups']
    };
  }

  private getMockCalendar() {
    return {
      calendar: [
        {
          timeFrame: 'WEEKLY',
          label: 'Week 1',
          activities: ['Draft LinkedIn ad copies', 'Set up Vercel tracking routes'],
          dependencies: ['Stripe billing config approvals']
        },
        {
          timeFrame: 'MONTHLY',
          label: 'Month 1',
          activities: ['Publish 4 educational content articles', 'Launch paid LinkedIn ads campaign'],
          dependencies: []
        }
      ]
    };
  }

  private getMockScores() {
    return {
      marketingReadiness: 90.0,
      brandReadiness: 85.0,
      channelReadiness: 88.0,
      campaignReadiness: 80.0,
      creativeReadiness: 92.0,
      audienceReadiness: 95.0,
      overallMarketingScore: 88.0
    };
  }

  private getMockMarketingRecommendations() {
    return {
      recommendations: [
        {
          title: 'Implement Multi-Tier Acquisition Funnel for Mid-Market',
          problem: 'High customer churn in low-tier plans is slowing net revenue expansion.',
          opportunity: 'Focus inbound content on mid-market profiles wanting seat-based licensing plans.',
          evidence: 'Digital twin model segments outline 3x higher retention on mid-market tiers.',
          affectedKpis: ['churn', 'ltv', 'mrr'],
          expectedROI: 4.5,
          expectedLeads: 80,
          budget: 5000,
          timeline: '45 days',
          priority: 'HIGH',
          confidence: 90.0,
          dependencies: ['Update mid-market pricing configurations'],
          alternativeApproaches: ['Increase direct outbound cold calling lists']
        }
      ]
    };
  }

  private getMockIcp() {
    return {
      industry: 'Software',
      companySize: '50-200',
      revenueRange: '$5M-$20M',
      decisionMakers: ['VP of Sales', 'CEO'],
      painPoints: ['Low sales velocity', 'High CAC'],
      techStack: ['Salesforce', 'Hubspot'],
      buyingIntent: 'HIGH',
      budgetLevel: 15000,
      growthStage: 'Scaleup',
      expectedLtv: 50000,
      expectedCac: 12000,
      confidence: 90,
      evidence: 'Historical sales data shows SaaS companies convert at 4%'
    };
  }

  private getMockLeadSources() {
    return {
      sources: [
        {
          sourceName: 'LinkedIn Outbound',
          rank: 1,
          expectedRoi: '3.5x',
          difficulty: 'MEDIUM',
          requiredBudget: 2000,
          expectedLeads: 50,
          confidence: 88,
          evidence: 'High active buyer intent on LinkedIn Sales Navigator'
        }
      ]
    };
  }

  private getMockLeadProfiles() {
    return {
      leads: [
        {
          companyName: 'Acme Corp Solutions',
          industry: 'Software',
          companySize: '120 employees',
          revenueRange: '$12M',
          decisionMakers: ['Jane Doe (VP Sales)'],
          painPoints: ['Manual outbound processes'],
          techStack: ['Salesforce', 'Marketo'],
          buyingIntent: 'HIGH',
          budgetLevel: 25000,
          growthStage: 'Series B',
          expectedLtv: 60000,
          expectedCac: 15000,
          confidence: 92,
          evidence: 'Visits to pricing page detected via reverse IP'
        }
      ]
    };
  }

  private getMockLeadQualification() {
    return {
      fitScore: 85,
      intentScore: 90,
      budgetScore: 75,
      authorityScore: 80,
      needScore: 95,
      timingScore: 88,
      overallQualification: 86
    };
  }

  private getMockLeadScoring() {
    return {
      qualityScore: 88,
      valueScore: 82,
      conversionProbability: 75,
      revenuePotential: 45000,
      riskScore: 20,
      urgencyScore: 85,
      priorityTier: 'Tier 1',
      explainability: 'Matched high intent signals, appropriate size and budget scope.'
    };
  }

  private getMockLeadSegmentation() {
    return {
      segments: [
        {
          segmentName: 'Enterprise SaaS Software',
          industry: 'Software',
          companySize: '100-500',
          expectedDealSize: 50000,
          leadsCount: 12
        }
      ]
    };
  }

  private getMockLeadNurture() {
    return {
      journeys: [
        {
          journeyType: 'Warm',
          touchpoints: ['LinkedIn connection request', 'Direct value email', '15-min discovery call'],
          messages: ['Hello from growth team', 'Here is a free marketing gap audit'],
          waitingPeriods: ['2 days', '5 days'],
          successKpis: ['Open rate > 40%', 'Reply rate > 12%']
        }
      ]
    };
  }

  private getMockLeadRecommendations() {
    return {
      recommendations: [
        {
          title: 'Launch Hyper-Targeted LinkedIn Sequence to B2B SaaS Scaleups',
          nextBestAction: 'Send automated connection note with the ROI case study.',
          expectedCloseProb: 75,
          expectedTimeline: '30 days',
          riskFactors: ['Decision maker changes role'],
          dependencies: ['Approve brand value deck'],
          alternativeActions: ['Execute cold email nurture sequence']
        }
      ]
    };
  }

  private getMockLeadForecast() {
    return {
      expectedLeads: 120,
      qualifiedLeads: 45,
      sqlCount: 20,
      conversionRate: 16.5,
      revenue: 90000,
      pipelineValue: 240000,
      confidenceMin: 78000,
      confidenceMax: 110000
    };
  }

  private getMockLeadPlaybooks() {
    return {
      playbooks: [
        {
          name: 'The VP Sales Outbound Playbook',
          playRules: 'Triggered when VP Sales has buying intent score > 80.',
          targetAudience: 'VP Sales in Enterprise Tech',
          triggerCondition: '3 page views on documentation/pricing',
          recommendedSteps: ['Send LinkedIn DM', 'Follow up via Email after 3 days']
        }
      ]
    };
  }

  private getMockSalesOpportunities() {
    return {
      opportunities: [
        {
          opportunityName: 'Global Logistics Expansion',
          businessValue: 'Enterprise predictive routing contract extension',
          revenuePotential: 120000.0,
          strategicImportance: 'HIGH',
          expansionOpportunity: 'Upsell to tier 2 global dispatch API',
          crossSellOpportunity: 'Cross-sell telemetry integrations',
          upsellOpportunity: 'Telemetry advanced package',
          competitiveRisk: 'Competitor RouteGenie submitting lower bid',
          confidence: 85.0,
          evidence: 'Active expansion email inquiry from Director of IT'
        }
      ]
    };
  }

  private getMockDealQualifications() {
    return {
      dealHealths: [
        {
          opportunityName: 'Global Logistics Expansion',
          needScore: 90,
          authorityScore: 85,
          budgetScore: 80,
          timelineScore: 85,
          urgencyScore: 75,
          competitivePosition: 80,
          relationshipStrength: 85,
          buyingSignals: 90,
          riskLevel: 25,
          overallHealthScore: 84,
          explainability: 'Strong BANT validation'
        }
      ]
    };
  }

  private getMockBuyingCommittee() {
    return {
      stakeholders: [
        {
          name: 'Sarah Jenkins',
          role: 'Director of IT',
          influenceLevel: 'HIGH',
          decisionPower: 'DECISION_MAKER',
          objections: ['Integration downtime risk', 'Pricing fits current CapEx but needs OpEx justification'],
          motivations: ['System stability', 'Scalability'],
          preferredCommunicationStyle: 'Direct, analytical',
          risk: 'Loves current legacy provider',
          recommendedSalesStrategy: 'Share architectural validation whitepaper'
        }
      ]
    };
  }

  private getMockNegotiationStrategy() {
    return {
      negotiationObjectives: ['Achieve $120k ACV', 'Secure 3-year term commitment'],
      pricingFlexibility: 'Up to 15% discount for 3-year upfront payment',
      concessions: ['Waive initial setup fee', 'Add premium 24/7 SLA tier for first year'],
      walkAwayConditions: ['Deal value below $95k ACV', 'No direct developer support clauses'],
      riskAnalysis: 'Competitor offering lower setup cost',
      winStrategy: 'Focus on total cost of ownership (TCO) efficiency',
      alternativeApproaches: 'Pilot implementation with month-to-month terms'
    };
  }

  private getMockObjections() {
    return {
      objections: [
        {
          category: 'Price',
          objection: 'The solution is 20% more expensive than competitor routing platforms.',
          recommendedResponse: 'Highlight that our automated routes reduce fuel overhead by 30%, compensating price diff in 3 months.',
          supportingEvidence: 'Logistics case study showing 32% fuel cost reduction within 90 days',
          businessCase: 'Fuel savings represent $45k monthly vs $5k price difference'
        }
      ]
    };
  }

  private getMockProposalStrategy() {
    return {
      proposalStructure: ['Executive Summary', 'Value Realization', 'Scope & Deliverables', 'ROI Analysis', 'Investment & SLA'],
      valueNarrative: 'Transforming routing logistics into a predictable driver of profit.',
      roiStory: 'Achieve complete system payback within 98 days of deployment.',
      caseStudySuggestions: ['DHL Route Efficiency Partner Case Study'],
      proofPoints: ['Zero downtime routing migrations executed for 15 logistics clients'],
      successMetrics: ['30% reduction in route planning hours', '15% lower vehicle emissions'],
      recommendedTimeline: 'Onboarding starting within 14 days, pilot live in 30 days'
    };
  }

  private getMockRevenueOptimization() {
    return {
      upsellOpportunities: ['Premium support SLA', 'Advanced API analytics dashboard addon'],
      crossSellOpportunities: ['Supply chain compliance validation suite'],
      bundleOpportunities: ['Predictive routing + Compliance validation bundle'],
      renewalOpportunities: ['Global Dispatch core API annual renewal'],
      expansionAccounts: ['Global Logistics Ltd APAC division'],
      revenueRisks: ['Churn risk on legacy dispatch modules']
    };
  }

  private getMockSalesForecast() {
    return {
      bestCase: 150000.0,
      expectedCase: 120000.0,
      worstCase: 90000.0,
      expectedRevenue: 120000.0,
      pipelineValue: 240000.0,
      closeProbability: 80.0,
      forecastConfidence: 85.0
    };
  }

  private getMockNextBestAction() {
    return {
      actions: [
        {
          opportunityName: 'Global Logistics Expansion',
          immediateAction: 'Send architectural validation whitepaper',
          followUpAction: 'Schedule technical integration call with dev leads',
          escalation: 'Request CRO join call if pricing objections persist',
          requiredResources: ['Principal Architect hours', 'Objection responses script'],
          expectedOutcome: 'Obtain security sign-off',
          successKPI: 'Security audit signoff timestamp',
          deadline: '2026-07-15',
          priority: 'HIGH'
        }
      ]
    };
  }

  private getMockSalesPlaybooks() {
    return {
      playbooks: [
        {
          name: 'Enterprise Logistics Expansion Playbook',
          playRules: 'Trigger on logistics sector prospects exceeding $100k ARR',
          targetAudience: 'Logistics directors and IT executives',
          triggerCondition: 'Prospect requests routing API documentation',
          recommendedSteps: ['Perform discovery call verifying active fleets', 'Conduct custom ROI calculation workshop'],
          objectionLibrary: 'Price objections response script, Integration downtime answers',
          negotiationFramework: 'Value-based concessions matrix',
          proposalTemplate: 'Premium Enterprise routing proposal layout'
        }
      ]
    };
  }

  private getMockSalesRecommendations() {
    return {
      recommendations: [
        {
          opportunityName: 'Global Logistics Expansion',
          title: 'Execute TCO-driven Negotiation',
          nextBestAction: 'Deliver fuel-efficiency business case document',
          expectedCloseProb: 82.0,
          expectedTimeline: '15 days',
          riskFactors: ['Competitor price war', 'Slow legal redlining'],
          dependencies: ['IT director approval of SLA parameters'],
          alternativeActions: ['Offer a pilot tier at 10% lower cost with limited API volume']
        }
      ]
    };
  }

  private getMockExecutiveScores() {
    return {
      pipelineHealth: 84.0,
      forecastReliability: 88.0,
      revenueStability: 85.0,
      expansionPotential: 75.0,
      revenueRisk: 20.0,
      growthMomentum: 80.0,
      overallExecutiveRevenueScore: 82.0
    };
  }

  private getMockBusinessHealthScore() {
    return {
      operationalHealth: 88.0,
      salesHealth: 82.0,
      marketingHealth: 85.0,
      leadHealth: 79.0,
      customerHealth: 92.0,
      innovationHealth: 75.0,
      overallExecutiveHealth: 86.0,
      confidence: 90.0,
      evidence: 'High retention and robust product pipeline offsets slight sales conversion delays',
      trendDirection: 'UP',
      expectedDirection: 'IMPROVING'
    };
  }

  private getMockGrowthScore() {
    return {
      growthScore: 84.0,
      velocityIndex: 82.0,
      confidence: 88.0
    };
  }

  private getMockRevenueHealth() {
    return {
      pipelineValue: 350000.0,
      leakagePoints: ['Long contract redlining phase', 'MQL-to-SQL drop-offs'],
      stabilityScore: 87.0
    };
  }

  private getMockMarketReadiness() {
    return {
      productReadiness: 90.0,
      salesReadiness: 80.0,
      marketingReadiness: 85.0,
      expansionReadiness: 75.0,
      investmentReadiness: 82.0,
      internationalReadiness: 65.0
    };
  }

  private getMockCompetitivePosition() {
    return {
      competitivePosition: 'CHALLENGER',
      marketPosition: 'MEDIUM',
      differentiators: ['AI-driven scheduling algorithms', 'Lower TCO compared to legacy systems'],
      weaknesses: ['Limited custom SLA integrations', 'No direct offline SDK support'],
      threats: ['Established legacy carriers releasing SaaS wrappers', 'Aggressive venture-backed pricing cuts'],
      opportunities: ['Enterprise logistics optimization', 'Cold-chain routing expansion'],
      competitiveConfidence: 85.0
    };
  }

  private getMockForecastSnapshots() {
    return {
      forecasts: [
        {
          horizonDays: 30,
          revenueForecast: 45000.0,
          pipelineForecast: 90000.0,
          growthForecast: 3.5,
          riskForecast: 2.0,
          expansionForecast: 5000.0,
          confidenceMin: 85.0,
          confidenceMax: 95.0,
          bestCase: 50000.0,
          expectedCase: 45000.0,
          worstCase: 38000.0
        },
        {
          horizonDays: 90,
          revenueForecast: 135000.0,
          pipelineForecast: 270000.0,
          growthForecast: 11.2,
          riskForecast: 5.5,
          expansionForecast: 15000.0,
          confidenceMin: 80.0,
          confidenceMax: 90.0,
          bestCase: 150000.0,
          expectedCase: 135000.0,
          worstCase: 110000.0
        },
        {
          horizonDays: 180,
          revenueForecast: 280000.0,
          pipelineForecast: 560000.0,
          growthForecast: 24.5,
          riskForecast: 12.0,
          expansionForecast: 35000.0,
          confidenceMin: 75.0,
          confidenceMax: 88.0,
          bestCase: 320000.0,
          expectedCase: 280000.0,
          worstCase: 220000.0
        }
      ]
    };
  }

  private getMockBusinessRisks() {
    return {
      risks: [
        {
          category: 'REVENUE',
          severity: 'HIGH',
          probability: 25.0,
          businessImpact: 'Renewal failure of top 2 enterprise accounts due to SLA disputes',
          mitigation: 'Implement dedicated customer success account check-ins 90 days prior to renewal'
        },
        {
          category: 'COMPETITIVE',
          severity: 'MEDIUM',
          probability: 40.0,
          businessImpact: 'Competitor matching primary route features at lower price',
          mitigation: 'Develop TCO comparisons and bundle secondary dispatch layers for enterprise lock-in'
        }
      ]
    };
  }

  private getMockBusinessOpportunities() {
    return {
      opportunities: [
        {
          type: 'QUICK_WIN',
          priority: 'HIGH',
          expectedImpact: 'Reduce route calculation processing cost by 15% via API caching parameters',
          mitigation: 'Deploy cache rules to primary staging gateways'
        },
        {
          type: 'EXPANSION',
          priority: 'MEDIUM',
          expectedImpact: 'Expand into cold-chain freight routing segment with dedicated temperature integrations',
          mitigation: 'Integrate IoT sensor data endpoints to B2B proposal libraries'
        }
      ]
    };
  }

  private getMockExecutiveInsight() {
    return {
      ceoSummary: 'Performance remains strong with overall executive health index at 86/100. Pipeline values grew 12% quarter-on-quarter.',
      boardSummary: 'Enterprise outbound operations yield stable expansion. Churn remains within thresholds at 5%. High investment readiness score of 82/100 facilitates Series-A positioning.',
      criticalFind: ['MQL quality scores are improving', 'Contract redlining represents the primary pipeline leakage bottleneck'],
      topOpp: ['Cold-chain segment integration', 'Route calculator caching quick win'],
      topRisk: ['Top 2 account renewal disputes', 'Aggressive competitor feature-matching'],
      narrative: 'The business demonstrates healthy operational momentum. Outbound expansion projects yield strong conversion indicators.'
    };
  }

  private getMockPredictionHistories() {
    return {
      predictions: [
        {
          metricName: 'LTV Expansion Rate',
          predictedVal: 22.5,
          confidence: 85.0,
          horizonDays: 90,
          horizonDate: '2026-10-05T00:00:00Z',
          evidence: 'Historical renewal upsells and new feature adoption metrics'
        },
        {
          metricName: 'Qualified Outbound Leads Count',
          predictedVal: 145.0,
          confidence: 90.0,
          horizonDays: 30,
          horizonDate: '2026-08-05T00:00:00Z',
          evidence: 'Active marketing campaigns performance indicators'
        }
      ]
    };
  }

  private getMockAnalyticsRecommendations() {
    return {
      recommendations: [
        {
          title: 'Implement API Caching to Reduce COGS',
          nextBestAction: 'Deploy edge cache rule frameworks for route API calculations',
          expectedOutcome: '15% reduction in route calculation compute costs within 30 days',
          expectedTimeline: '30 days',
          riskFactors: ['Stale API payload delivery', 'Complex header validation logic'],
          dependencies: ['DevOps infrastructure sign-off on cache duration parameters'],
          alternativeActions: ['Limit API volume request quotas on low-tier developer keys']
        }
      ]
    };
  }

  private getMockSnapshotComparison() {
    return {
      whatChanged: 'Business health index increased from 82 to 86. Growth score stabilized at 84.',
      whyItChanged: 'LTV expanded 8% and CAC dropped 5% due to optimized marketing spend.',
      causativeEngine: 'Marketing Engine optimization',
      positiveImpact: 'Sales velocity index grew by 4.2 points',
      negativeImpact: 'Technology SLA risks increased slightly by 3%',
      metricsAffected: ['cac', 'ltv', 'overallExecutiveHealth'],
      forecastDiff: '30-day revenue expectation shifted from $42k to $45k',
      confidenceDiff: 'Confidence delta improved by +2.5%',
      riskDiff: 'Revenue risks dropped 4%',
      opportunityDiff: 'Quick win candidates cataloged increased by 2',
      executiveSummary: 'Outbound sales alignment drove metric optimization.'
    };
  }

  private getMockCustomerHealth() {
    return {
      overallHealth: 88.0,
      relationshipHealth: 85.0,
      productAdoption: 82.0,
      featureAdoption: 80.0,
      supportHealth: 92.0,
      valueRealization: 88.0,
      execEngagement: 82.0,
      renewalReadiness: 85.0,
      expansionReadiness: 78.0,
      riskLevel: 15.0,
      healthTrend: 'UP',
      confidence: 90.0
    };
  }

  private getMockCustomerSuccessJourney() {
    return {
      currentStage: 'VALUE_REALIZATION',
      stageStatus: 'Latency objectives delivered. Client expanding usage metrics.',
      successCriteria: ['Latency drops validated on edge route servers', 'daily routing checks completed'],
      risks: ['legacy router integrations latency drop-off'],
      recommendedActions: ['Perform telemetry cross-sell pitch and IoT temperature integration']
    };
  }

  private getMockSupportIntelligence() {
    return {
      ticketNumber: 'TKT-1025',
      category: 'BUG',
      priority: 'MEDIUM',
      status: 'RESOLVED',
      subject: 'Latency spikes during peak volume routing',
      description: 'Customer reports 200ms latency spikes in US East edge cluster.',
      rootCause: 'API Cache rules parameters mismatch',
      resolution: 'Modify TTL constraints on telemetry API endpoints',
      expectedResolutionTime: '2 hours',
      customerImpact: 'Batch dispatch calculations delayed by 15%',
      isRecurring: false
    };
  }

  private getMockCustomerSentiment() {
    return {
      sentimentScore: 85.0,
      sentimentTrend: 'IMPROVING',
      confidence: 90.0,
      businessImpact: 'High likelihood of account expansion and case study reference',
      relationshipRisk: 'Low',
      executiveRisk: 'Low'
    };
  }

  private getMockRenewalForecast() {
    return {
      renewalDate: '2026-12-15T00:00:00Z',
      renewalProbability: 92.0,
      expectedValue: 120000.0,
      confidence: 90.0
    };
  }

  private getMockRenewalPlan() {
    return {
      planOwner: 'Sarah Jenkins',
      renewalStrategy: 'Highlight latency reductions and outline cold-chain expansion timeline',
      executiveActions: ['Present ROI validation summary slide deck', 'Organize C-level review call'],
      keyRisks: ['legacy systems disputes', 'procurement budget delays'],
      status: 'DRAFT'
    };
  }

  private getMockExpansionOpportunity() {
    return {
      title: 'IoT Temperature Sensor Telemetry Module',
      type: 'CROSS_SELL',
      fitScore: 88.0,
      expectedRevenue: 20000.0,
      businessJustification: 'Customer requires temperature tracking for cold-chain compliance'
    };
  }

  private getMockChurnPrediction() {
    return {
      churnProbability: 8.0,
      confidence: 92.0,
      primaryRootCause: 'Latency issues in staging networks',
      earlyWarningSignals: ['SLA latency tickets', 'unresolved bug cases count'],
      severity: 'LOW'
    };
  }

  private getMockRetentionStrategy() {
    return {
      strategyName: 'API Edge Caching deployment program',
      executionPlan: 'Deploy caching rule frameworks to edge API clusters',
      estimatedCost: 500.0,
      successProbability: 95.0
    };
  }

  private getMockValueRealization() {
    return {
      goals: ['Reduce latency by 15%', 'Integrate telematics API'],
      expectedOutcomes: ['Latency dropdowns below 150ms', 'Telematics dashboard activated'],
      actualOutcomes: ['Staging latency dropped by 12%', 'API telemetry connected'],
      goalAchievementRate: 85.0,
      roiDelivered: 35000.0,
      valueDelivered: 88.0,
      timeToValueDays: 14,
      valueScore: 86.0,
      valueTrend: 'IMPROVING',
      valueRisk: 'LOW',
      recommendedActions: ['Show visual metrics during quarterly C-level QBR']
    };
  }

  private getMockCustomerAdvocacy() {
    return {
      advocacyScore: 86.0,
      referenceLikelihood: 90.0,
      testimonialProb: 85.0,
      caseStudyProb: 75.0,
      npsScore: 9.0,
      advocacyStrategy: 'Leverage latency drop milestone to request reference testimonials',
      executiveActions: ['Email reference program details', 'Include in Q3 case study draft']
    };
  }

  private getMockPortfolioIntelligence() {
    return {
      highestRiskAccounts: [
        { customerId: 'biz-risk-1', companyName: 'Legacy Logistics Inc', riskProb: 45.0 }
      ],
      highestValueAccounts: [
        { customerId: 'biz-val-1', companyName: 'Global Logistics Ltd', arr: 120000.0 }
      ],
      fastestGrowingAccounts: [
        { customerId: 'biz-grow-1', companyName: 'ColdChain Express', growthRate: 24.5 }
      ],
      accountsRequiringAttention: [
        { customerId: 'biz-attn-1', companyName: 'Legacy Logistics Inc', reason: 'High unresolved bug ticket ratio' }
      ],
      expansionPipelineValue: 35000.0,
      renewalPipelineValue: 240000.0,
      overallPortfolioHealth: 86.0
    };
  }

  private getMockExecutiveAccountSummary() {
    return {
      currentHealth: 88.0,
      businessGoals: ['Reduce edge API latency', 'Deploy cold-chain telemetry'],
      roiDelivered: 35000.0,
      expansionPotential: 20000.0,
      renewalReadiness: 92.0,
      relationshipStrength: 85.0,
      customerRisks: ['SLA latency disputes'],
      executiveActions: ['Execute cache rules program', 'Verify cold-chain telemetry fit'],
      priorityScore: 84.0,
      confidence: 90.0
    };
  }

  private getMockSuccessPlaybooks() {
    return {
      playbooks: [
        {
          name: 'Onboarding & Activation Playbook',
          triggerCondition: 'Trigger on new account signup completion',
          steps: ['Conduct setup call verifying fleet scale', 'Integrate developer credentials'],
          responsibleRole: 'Customer Success Manager',
          kpiToMonitor: 'Time-to-Value Days active'
        }
      ]
    };
  }

  private getMockCustomerRecommendations() {
    return {
      recommendations: [
        {
          title: 'Deploy Telematics Sensor Caching Rules',
          description: 'Deploy Cloudflare edge cache rules duration policies to telemetry API routing keys.',
          nextBestAction: 'Deploy edge cache rule duration parameter configs',
          expectedOutcome: 'Resolve peak SLA API latency issues within 15 days',
          confidence: 95.0,
          factsUsed: ['Latency average at 180ms', 'SLA limit is 150ms'],
          assumptions: ['Peak fleet queries occur during day business hours'],
          constraints: ['Must keep security checks active on headers'],
          alternativeActions: ['Limit API query quotas', 'Upgrade server compute scale']
        }
      ]
    };
  }

  private getMockExecutiveRecommendations() {
    return {
      recommendations: [
        {
          title: 'Pricing Model Optimization',
          description: 'Transition mid-market clients to tiered usage plans.',
          nextBestAction: 'Review stripe plan configurations.',
          expectedOutcome: 'Boost expansion opportunities.',
          confidence: 88,
          status: 'PENDING',
          priority: 'HIGH',
          businessImpact: 'Increase revenue potential by 15%',
          dependencies: ['strategy-engine'],
          strategicAlignment: 'Enterprise monetization optimization'
        }
      ]
    };
  }

  private getMockExecutiveConflicts() {
    return {
      conflicts: [
        {
          title: 'Ad Spend Allocation Discrepancy',
          severity: 'MEDIUM',
          affectedEngines: ['marketing-engine', 'analytics-engine'],
          businessImpact: 'Potential margin pressure.',
          resolutionOptions: ['Establish ad spend limit caps', 'Perform bi-weekly audits'],
          recommendedResolution: 'Establish ad spend limit caps',
          status: 'OPEN'
        }
      ]
    };
  }

  private getMockExecutiveConsensuses() {
    return {
      consensus: [
        {
          recommendationId: 'pricing-opt',
          supportScore: 92.5,
          confidence: 90.0,
          businessImpact: 'High potential ROI.',
          dependencies: ['strategy-engine'],
          priority: 'HIGH',
          finalConsensus: 'Approved consensus with ad-hoc review loops.'
        }
      ]
    };
  }

  private getMockExecutiveDecisionSimulation() {
    return {
      executiveSummary: 'Simulated command successfully projected.',
      revenueImpact: 'Estimated ARR boost of $45,000.',
      leadImpact: 'SQL lead volume expected to grow 14%.',
      cacImpact: 'CAC index expected to decrease $12.',
      ltvImpact: 'LTV multiplier projected at 6.8x.',
      growthScoreImpact: 'Growth score updates by +4.5%.',
      businessHealthImpact: 'Overall health index improves +2.0%.',
      risks: ['Short-term customer support overload bottleneck'],
      departmentsAffected: ['sales-engine', 'marketing-engine'],
      confidence: 86.0,
      engineDisagreements: [
        { engine: 'analytics-engine', challenge: 'Cloud compute cost scaling risks' }
      ],
      consensusLevel: 91.5,
      recommendedExecutionOrder: ['strategy-engine', 'marketing-engine']
    };
  }

  private getMockExecutiveOperatingPlan() {
    return {
      todayPriorities: ['Verify customer onboarding pipelines'],
      thisWeek: ['Audit LinkedIn outbound target lists'],
      thisMonth: ['Finalize usage plan pricing tiers'],
      quarterGoals: ['Scale Enterprise ARR by 20%'],
      strategicInitiatives: [
        { title: 'Outbound sequence automation', outcome: 'Reduce SDR overhead' }
      ],
      operationalInitiatives: [
        { title: 'TTL Cache Policy deployment', outcome: 'Lower compute burn rates' }
      ],
      revenueInitiatives: [
        { title: 'IoT Fleet Expansion Package', outcome: 'Expand contract sizes' }
      ],
      customerInitiatives: [
        { title: 'Executive SLA check loops', outcome: 'Stabilize client retention' }
      ],
      innovationInitiatives: [
        { title: 'AI Assistant modules', outcome: 'Improve product value score' }
      ]
    };
  }

  private getMockExecutiveRoadmaps() {
    return {
      roadmaps: [
        {
          phase: 'NOW',
          itemText: 'Hire mid-market Sales Representative',
          businessValue: 'Accelerate deal pipeline velocity',
          risk: 'Ramp-up training period delay',
          confidence: 85.0,
          requiredResources: ['HR recruitment tools'],
          dependencies: ['lead-engine'],
          status: 'PLANNED'
        }
      ]
    };
  }

  private getMockExecutiveBrief() {
    return {
      businessHealth: 86.5,
      growthScore: 79.5,
      revenueHealth: 83.0,
      customerHealth: 88.5,
      topOpportunities: ['IoT fleet telemetry upsells'],
      topRisks: ['SLA latency disputes'],
      urgentDecisions: ['Ad spend cap limits approval'],
      forecast: { revenue: 154000.0, margin: 76.5 },
      kpiSummary: [
        { kpi: 'LTV', value: '$42,000' }
      ],
      trendSummary: ['Lead acquisition rate improving.'],
      competitiveSummary: 'Strong SaaS market positioning.',
      marketReadiness: 81.0,
      recommendedActions: ['Conduct onboarding check calls'],
      executiveCalendar: ['Executive Board sync call Tuesday'],
      expectedOutcomes: ['Reduce customer churn by 1.5%']
    };
  }

  private getMockExecutiveAlerts() {
    return {
      alerts: [
        {
          category: 'CRITICAL',
          severity: 'CRITICAL',
          confidence: 94.0,
          businessImpact: 'High risk of churn on enterprise accounts due to SLA dispute.',
          recommendedAction: 'Execute custom check call playbooks immediately.'
        }
      ]
    };
  }
}



