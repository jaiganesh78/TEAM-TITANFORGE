"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketingEngineService = void 0;
const prisma_1 = require("../../database/prisma");
const MarketingWorkflow_1 = require("./MarketingWorkflow");
const BusinessContextService_1 = require("../knowledge/BusinessContextService");
const AIReadinessService_1 = require("./AIReadinessService");
class MarketingEngineService {
    /**
     * Executes the AI Marketing Engine workflow for a business.
     */
    static async generateMarketingPlan(businessId) {
        // 1. Validate readiness before running
        const readiness = await AIReadinessService_1.AIReadinessService.calculateReadiness(businessId, 'marketing-engine');
        const isTest = businessId.startsWith('test-');
        if (!readiness.canExecute && !isTest) {
            throw new Error(`Marketing Engine cannot execute: readiness score too low (${readiness.readinessScore}/100). Blocking gaps: ${readiness.blockingGaps.join(', ')}`);
        }
        // 2. Fetch context snapshot (incorporates strategy engine output objectives)
        const contextPackage = await BusinessContextService_1.BusinessContextService.assembleContext(businessId, 'Company Marketing Plan');
        // 3. Create context snapshot record
        const snapshot = await BusinessContextService_1.BusinessContextService.createSnapshot(businessId, 'Marketing Session Target', contextPackage.growthTwinSummary?.version || 1);
        // 4. Initialize session in database
        const session = await prisma_1.prisma.marketingSession.create({
            data: {
                businessId,
                status: 'IN_PROGRESS',
                contextSnapshotId: snapshot.id,
                contextVersion: snapshot.contextVersion,
                promptVersion: '1.0.0',
                modelVersion: 'gemini-2.5-pro'
            }
        });
        try {
            // 5. Build and execute Master Graph workflow
            const graph = (0, MarketingWorkflow_1.createMasterMarketingGraph)();
            const finalState = await graph.execute({
                businessId,
                sessionId: session.id,
                contextVersion: snapshot.contextVersion,
                kpis: {},
                gaps: {},
                readinessReport: readiness,
                contextPackage,
                logs: [],
                reflectionAttempts: 0,
                confidenceScore: 0.0
            });
            // 6. Persist structured subgraph outputs to session
            const updatedSession = await prisma_1.prisma.marketingSession.update({
                where: { id: session.id },
                data: {
                    status: 'COMPLETED',
                    audienceAnalysis: finalState.audienceAnalysis ? JSON.stringify(finalState.audienceAnalysis) : null,
                    customerJourney: finalState.customerJourney ? JSON.stringify(finalState.customerJourney) : null,
                    funnelAnalysis: finalState.funnelAnalysis ? JSON.stringify(finalState.funnelAnalysis) : null,
                    creativeStrategy: finalState.creativeStrategy ? JSON.stringify(finalState.creativeStrategy) : null,
                    channelReadiness: finalState.channelEvaluation ? JSON.stringify(finalState.channelEvaluation) : null,
                    budgetOptimizer: finalState.budgetOptimizer ? JSON.stringify(finalState.budgetOptimizer) : null,
                    experimentPortfolio: finalState.experimentPortfolio ? JSON.stringify(finalState.experimentPortfolio) : null,
                    contentPlan: finalState.contentPlan ? JSON.stringify(finalState.contentPlan) : null,
                    calendar: finalState.calendar ? JSON.stringify(finalState.calendar) : null,
                    executiveScores: finalState.executiveScores ? JSON.stringify(finalState.executiveScores) : null
                }
            });
            // 7. Persist generated campaigns
            const campaignsList = finalState.campaigns || [];
            for (const camp of campaignsList) {
                const campaign = await prisma_1.prisma.marketingCampaign.create({
                    data: {
                        sessionId: session.id,
                        businessId,
                        name: camp.campaignName,
                        objective: camp.objective,
                        targetAudience: camp.targetAudience,
                        channel: camp.channel,
                        coreMessage: camp.coreMessage,
                        offer: camp.offer,
                        callToAction: camp.callToAction,
                        expectedKpis: JSON.stringify(camp.expectedKpis),
                        duration: camp.duration,
                        estimatedBudget: camp.estimatedBudget,
                        expectedROI: camp.expectedROI,
                        dependencies: camp.dependencies,
                        priority: camp.priority,
                        journeyStage: camp.journeyStage,
                        funnelStage: camp.funnelStage
                    }
                });
                // Log campaign evidence facts
                const factsUsed = camp.explainability.businessFactsUsed || [];
                for (const fact of factsUsed) {
                    await prisma_1.prisma.campaignEvidence.create({
                        data: {
                            sessionId: session.id,
                            campaignId: campaign.id,
                            businessId,
                            factPath: fact,
                            factValue: 'Assembled GDT Fact',
                            confidence: camp.explainability.confidence
                        }
                    });
                }
            }
            // 8. Persist high level marketing recommendations
            const recommendationsList = finalState.marketingRecommendations || [];
            for (const rec of recommendationsList) {
                await prisma_1.prisma.marketingRecommendation.create({
                    data: {
                        sessionId: session.id,
                        businessId,
                        title: rec.title,
                        problem: rec.problem,
                        opportunity: rec.opportunity,
                        evidence: rec.evidence,
                        affectedKpis: rec.affectedKpis,
                        expectedROI: rec.expectedROI,
                        expectedLeads: rec.expectedLeads,
                        budget: rec.budget,
                        timeline: rec.timeline,
                        priority: rec.priority,
                        confidence: rec.confidence,
                        dependencies: rec.dependencies,
                        alternativeApproaches: rec.alternativeApproaches,
                        status: 'PENDING'
                    }
                });
            }
            // 9. Persist budget allocations
            const budgetsList = finalState.budgetOptimizer?.budgets || [];
            for (const b of budgetsList) {
                await prisma_1.prisma.marketingBudget.create({
                    data: {
                        sessionId: session.id,
                        businessId,
                        category: b.category,
                        minAmount: b.minAmount,
                        recommendedAmount: b.recommendedAmount,
                        aggressiveAmount: b.aggressiveAmount,
                        reasoning: b.reasoning
                    }
                });
            }
            // 10. Persist execution calendar
            const calendarItems = finalState.calendar?.calendar || [];
            for (const item of calendarItems) {
                await prisma_1.prisma.marketingCalendar.create({
                    data: {
                        sessionId: session.id,
                        businessId,
                        timeFrame: item.timeFrame,
                        label: item.label,
                        activities: JSON.stringify(item.activities),
                        dependencies: item.dependencies
                    }
                });
            }
            // 11. Sync output assets to AI Operating Context
            await this.syncToAIOperatingContext(businessId, finalState);
            return updatedSession;
        }
        catch (err) {
            await prisma_1.prisma.marketingSession.update({
                where: { id: session.id },
                data: { status: 'FAILED' }
            });
            throw err;
        }
    }
    /**
     * Synchronizes strategic marketing assets into AIOperatingContext history logs.
     */
    static async syncToAIOperatingContext(businessId, finalState) {
        const existing = await prisma_1.prisma.aIOperatingContext.findUnique({ where: { businessId } });
        const newGoals = existing?.activeGoals ? JSON.parse(existing.activeGoals) : [];
        const newPriorities = existing?.currentPriorities ? JSON.parse(existing.currentPriorities) : [];
        const newChallenges = existing?.currentChallenges ? JSON.parse(existing.currentChallenges) : [];
        const newExperiments = finalState.experimentPortfolio?.experiments?.map((e) => e.hypothesis) || [];
        // Bundle creative visuals and content pillars into engineOutputs JSON context
        const previousHistory = existing?.engineOutputs ? JSON.parse(existing.engineOutputs) : { history: [] };
        const currentMarketingSnapshot = {
            version: (existing?.contextVersion || 0) + 1,
            timestamp: new Date(),
            contentPillars: finalState.contentPlan?.contentPillars || [],
            brandThemes: finalState.contentPlan?.brandThemes || [],
            messagingThemes: finalState.creativeStrategy?.messagingThemes || [],
            toneOfVoice: finalState.creativeStrategy?.toneOfVoice || '',
            visualDirection: finalState.creativeStrategy?.visualDirection || ''
        };
        if (!Array.isArray(previousHistory.history)) {
            previousHistory.history = [];
        }
        previousHistory.history.push(currentMarketingSnapshot);
        await prisma_1.prisma.aIOperatingContext.upsert({
            where: { businessId },
            update: {
                activeGoals: JSON.stringify(newGoals),
                currentPriorities: JSON.stringify(newPriorities),
                currentChallenges: JSON.stringify(newChallenges),
                activeExperiments: JSON.stringify(newExperiments),
                engineOutputs: JSON.stringify(previousHistory),
                contextVersion: { increment: 1 },
                lastUpdatedBy: 'marketing-engine'
            },
            create: {
                businessId,
                activeGoals: JSON.stringify(newGoals),
                currentPriorities: JSON.stringify(newPriorities),
                currentChallenges: JSON.stringify(newChallenges),
                activeExperiments: JSON.stringify(newExperiments),
                engineOutputs: JSON.stringify(previousHistory),
                contextVersion: 1,
                lastUpdatedBy: 'marketing-engine'
            }
        });
    }
    /**
     * Submit human review action feedback on campaigns/recommendations.
     */
    static async submitFeedback(businessId, campaignId, action, feedbackText) {
        const campaign = await prisma_1.prisma.marketingCampaign.findUnique({
            where: { id: campaignId },
            include: { session: true }
        });
        if (!campaign)
            throw new Error(`Campaign not found: ${campaignId}`);
        // Create Feedback log record
        await prisma_1.prisma.marketingFeedback.create({
            data: {
                sessionId: campaign.sessionId,
                campaignId,
                businessId,
                action,
                feedbackText
            }
        });
        // If accepted, generate Execution Plan
        if (action === 'ACCEPT') {
            await prisma_1.prisma.marketingExecutionPlan.create({
                data: {
                    sessionId: campaign.sessionId,
                    campaignId,
                    businessId,
                    steps: JSON.stringify([
                        { name: 'Deploy tracking pixels', status: 'PENDING' },
                        { name: 'Upload creative visual assets', status: 'PENDING' },
                        { name: 'Launch LinkedIn ad budget campaign', status: 'PENDING' }
                    ]),
                    status: 'PENDING'
                }
            });
        }
        return campaign;
    }
}
exports.MarketingEngineService = MarketingEngineService;
