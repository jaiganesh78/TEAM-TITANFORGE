"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessEvolutionService = void 0;
const prisma_1 = require("../../database/prisma");
const GeminiProvider_1 = require("../../../../ai/providers/GeminiProvider");
const ResponseParser_1 = require("../../../../ai/providers/ResponseParser");
class BusinessEvolutionService {
    /**
     * Captures an immutable performance snapshot of the business.
     */
    static async captureSnapshot(businessId, sessionId, payloads) {
        // Fetch KPI states
        const kpis = await prisma_1.prisma.businessKPI.findMany({ where: { businessId } });
        const majorKpiValues = kpis.reduce((acc, kpi) => {
            acc[kpi.name] = kpi.currentValue;
            return acc;
        }, {});
        // Fetch Revenue Pipeline stage details
        const pipeline = await prisma_1.prisma.revenuePipeline.findFirst({
            where: { businessId },
            include: { stages: true }
        });
        const pipelineState = pipeline ? {
            name: pipeline.name,
            stages: pipeline.stages.map(s => ({
                name: s.stageName,
                velocityDays: s.averageTimeDays,
                probability: s.probability
            }))
        } : { name: 'Default Pipeline', stages: [] };
        // Fetch Growth Twin Summary
        const twin = await prisma_1.prisma.growthTwinSummary.findFirst({ where: { businessId } });
        const twinConfidence = twin ? twin.overallConfidence : 80.0;
        // Fetch Knowledge Statistics
        const knowledgeStats = await prisma_1.prisma.knowledgeStatistics.findUnique({ where: { businessId } });
        const knowledgeHealth = knowledgeStats ? {
            freshness: knowledgeStats.freshnessScore,
            coverage: knowledgeStats.coverageScore,
            diversity: knowledgeStats.sourceDiversityScore
        } : { freshness: 100, coverage: 0, diversity: 0 };
        // Fetch Strategy recommendations accepted/rejected
        const strategyRecs = await prisma_1.prisma.strategyRecommendation.findMany({ where: { businessId } });
        const acceptedStrategy = strategyRecs.filter(r => r.status === 'APPROVED').map(r => r.title);
        const rejectedStrategy = strategyRecs.filter(r => r.status === 'REJECTED').map(r => r.title);
        // Fetch Marketing campaigns accepted/rejected
        const marketingCampaigns = await prisma_1.prisma.marketingCampaign.findMany({
            where: { businessId },
            include: { feedback: true }
        });
        const acceptedMarketing = marketingCampaigns
            .filter(c => c.feedback.some(f => f.action === 'ACCEPT'))
            .map(c => c.name);
        const rejectedMarketing = marketingCampaigns
            .filter(c => c.feedback.some(f => f.action === 'REJECT'))
            .map(c => c.name);
        const leadMemory = await prisma_1.prisma.leadMemory.findFirst({ where: { businessId } });
        const salesMemory = await prisma_1.prisma.salesMemory.findFirst({ where: { businessId } });
        const analyticsMemory = await prisma_1.prisma.analyticsMemory.findFirst({ where: { businessId } });
        const accepted = [
            ...acceptedStrategy,
            ...acceptedMarketing,
            ...(leadMemory ? JSON.parse(leadMemory.acceptedStrategies || '[]') : []),
            ...(salesMemory ? JSON.parse(salesMemory.acceptedStrategies || '[]') : []),
            ...(analyticsMemory ? JSON.parse(analyticsMemory.acceptedStrategies || '[]') : [])
        ];
        const rejected = [
            ...rejectedStrategy,
            ...rejectedMarketing,
            ...(leadMemory ? JSON.parse(leadMemory.rejectedStrategies || '[]') : []),
            ...(salesMemory ? JSON.parse(salesMemory.rejectedStrategies || '[]') : []),
            ...(analyticsMemory ? JSON.parse(analyticsMemory.rejectedStrategies || '[]') : [])
        ];
        // Find the latest version of snapshot for this business
        const latestSnapshot = await prisma_1.prisma.businessEvolutionSnapshot.findFirst({
            where: { businessId },
            orderBy: { version: 'desc' }
        });
        const nextVersion = latestSnapshot ? latestSnapshot.version + 1 : 1;
        // Create the snapshot record
        return prisma_1.prisma.businessEvolutionSnapshot.create({
            data: {
                sessionId,
                businessId,
                version: nextVersion,
                businessHealth: JSON.stringify(payloads.businessHealth),
                growthScore: JSON.stringify(payloads.growthScore),
                revenueHealth: JSON.stringify(payloads.revenueHealth),
                marketReadiness: JSON.stringify(payloads.marketReadiness),
                competitivePosition: JSON.stringify(payloads.competitivePosition),
                executiveScore: JSON.stringify(payloads.executiveScore),
                acceptedStrategies: JSON.stringify(accepted),
                rejectedStrategies: JSON.stringify(rejected),
                majorKpiValues: JSON.stringify(majorKpiValues),
                revenuePipelineState: JSON.stringify(pipelineState),
                digitalTwinConfidence: twinConfidence,
                knowledgeHealth: JSON.stringify(knowledgeHealth)
            }
        });
    }
    /**
     * Compares two snapshots and produces side-by-side comparative analysis.
     */
    static async compareSnapshots(businessId, sessionId, sourceSnapshotId, targetSnapshotId) {
        const source = await prisma_1.prisma.businessEvolutionSnapshot.findUnique({ where: { id: sourceSnapshotId } });
        const target = await prisma_1.prisma.businessEvolutionSnapshot.findUnique({ where: { id: targetSnapshotId } });
        if (!source || !target) {
            throw new Error(`Snapshot comparison failed: source or target snapshot not found`);
        }
        const llm = new GeminiProvider_1.GeminiProvider();
        const prompt = `
You are the AI Chief Business Intelligence Officer at TitanForge.
You are comparing two performance snapshots of the same business.

Source Snapshot (V${source.version}):
- Health metrics: ${source.businessHealth}
- Growth metrics: ${source.growthScore}
- Revenue health: ${source.revenueHealth}
- Major KPIs: ${source.majorKpiValues}

Target Snapshot (V${target.version}):
- Health metrics: ${target.businessHealth}
- Growth metrics: ${target.growthScore}
- Revenue health: ${target.revenueHealth}
- Major KPIs: ${target.majorKpiValues}

Task:
Compare the V${source.version} and V${target.version} snapshots. Identify:
1. What changed in the key metric indexes.
2. Why it changed (refer to KPI changes).
3. Which Engine (Strategy, Marketing, Lead, Sales) contributed to or caused this change.
4. Positive and negative impacts.
5. Overall Executive narrative summarizing the comparative trajectory.

Return a JSON strictly conforming to this Zod schema:
{
  "whatChanged": "Detailed description of metric index changes",
  "whyItChanged": "Explanation linking changes to KPI movements",
  "causativeEngine": "Engine responsible for the primary change (e.g. Marketing Engine for lead spikes)",
  "positiveImpact": "Positive developments",
  "negativeImpact": "Negative developments / risk increases",
  "metricsAffected": ["list of strings"],
  "forecastDiff": "Description of trend directions shifts",
  "confidenceDiff": "Confidence delta summary",
  "riskDiff": "Risk changes summary",
  "opportunityDiff": "Opportunity changes summary",
  "executiveSummary": " quarterly-level comparison narrative"
}
`;
        const res = await llm.generateText({
            systemPrompt: 'You are the TitanForge AI Chief Business Intelligence Officer.',
            userPrompt: prompt,
            jsonMode: true
        });
        const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.SnapshotComparisonSchema);
        // Save comparison to database
        return prisma_1.prisma.snapshotComparison.create({
            data: {
                sessionId,
                businessId,
                sourceSnapshotId,
                targetSnapshotId,
                whatChanged: parsed.whatChanged,
                whyItChanged: parsed.whyItChanged,
                causativeEngine: parsed.causativeEngine,
                positiveImpact: parsed.positiveImpact,
                negativeImpact: parsed.negativeImpact,
                metricsAffected: JSON.stringify(parsed.metricsAffected),
                forecastDiff: parsed.forecastDiff,
                confidenceDiff: parsed.confidenceDiff,
                riskDiff: parsed.riskDiff,
                opportunityDiff: parsed.opportunityDiff,
                executiveSummary: parsed.executiveSummary
            }
        });
    }
    /**
     * Tracks AI Recommendation Expected Outcomes vs Actual Outcomes.
     */
    static async recordRecommendationImpact(businessId, recommendationId, title, expectedOutcome, actualOutcome, effectiveness, improvement) {
        return prisma_1.prisma.aIImpactAnalysis.create({
            data: {
                businessId,
                recommendationId,
                title,
                expectedOutcome,
                actualOutcome,
                effectiveness,
                improvement
            }
        });
    }
    /**
     * Logs decision and evidence as part of the executive audit trail.
     */
    static async logDecision(businessId, decision, reason, evidence, engine, expectedImpact, confidence) {
        return prisma_1.prisma.decisionIntelligence.create({
            data: {
                businessId,
                decision,
                reason,
                evidence,
                engine,
                expectedImpact,
                confidence,
                status: 'APPROVED'
            }
        });
    }
    /**
     * Updates a decision audit with actual outcome metrics.
     */
    static async recordDecisionImpact(decisionId, actualImpact) {
        return prisma_1.prisma.decisionIntelligence.update({
            where: { id: decisionId },
            data: { actualImpact }
        });
    }
    /**
     * Evaluates historical forecast case accuracies.
     */
    static async calculateForecastAccuracy(businessId) {
        const historicalSnapshots = await prisma_1.prisma.forecastHistory.findMany({
            where: { businessId }
        });
        let totalError = 0;
        let counts = 0;
        let successfulTrendDirections = 0;
        for (const hist of historicalSnapshots) {
            if (hist.actualOutcome !== null) {
                const error = Math.abs(hist.expectedCase - hist.actualOutcome) / Math.max(1, hist.actualOutcome);
                totalError += error;
                counts++;
                // If forecast predicted growth and actual outcome grew, or vice-versa
                const forecastGrew = hist.expectedCase > 0;
                const actualGrew = hist.actualOutcome > 0;
                if (forecastGrew === actualGrew) {
                    successfulTrendDirections++;
                }
            }
        }
        const forecastError = counts > 0 ? (totalError / counts) * 100 : 5.0; // 5% default
        const predictionAcc = 100 - forecastError;
        const confidenceAcc = predictionAcc * 0.95;
        const trendReliab = counts > 0 ? (successfulTrendDirections / counts) * 100 : 85.0;
        const modelReliab = predictionAcc;
        return prisma_1.prisma.forecastAccuracy.create({
            data: {
                businessId,
                forecastError,
                predictionAcc,
                confidenceAcc,
                trendReliab,
                modelReliab
            }
        });
    }
    /**
     * Generates a quarterly natural-language executive quarterly story.
     */
    static async generateQuarterlyStory(businessId) {
        const snapshots = await prisma_1.prisma.businessEvolutionSnapshot.findMany({
            where: { businessId },
            orderBy: { version: 'asc' }
        });
        const decisions = await prisma_1.prisma.decisionIntelligence.findMany({
            where: { businessId },
            orderBy: { createdAt: 'asc' }
        });
        const llm = new GeminiProvider_1.GeminiProvider();
        const prompt = `
You are the AI Chief Business Intelligence Officer at TitanForge.
Write a comprehensive executive quarterly story describing the evolution of the business.

Business Snapshots Timeline:
${snapshots.map(s => `V${s.version} (Health: ${s.businessHealth}, KPIs: ${s.majorKpiValues})`).join('\n')}

Decisions Audited:
${decisions.map(d => `- Decision: ${d.decision} (Engine: ${d.engine}, Impact: ${d.actualImpact || 'Pending'})`).join('\n')}

TASK:
Write a narrative quarterly report that details:
1. How the business evolved across versions.
2. What key decisions improved performance.
3. What challenges or performance dips occurred and what caused them.
4. Which engine (Strategy, Marketing, Lead, Sales) contributed the most value.
5. Highlight strategic milestones, risks, and next steps.
`;
        const res = await llm.generateText({
            systemPrompt: 'You are the TitanForge AI Chief Business Intelligence Officer.',
            userPrompt: prompt
        });
        return res.text;
    }
}
exports.BusinessEvolutionService = BusinessEvolutionService;
