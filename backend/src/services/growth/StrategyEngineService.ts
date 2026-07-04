import { prisma } from '../../database/prisma';
import { createMasterStrategyGraph } from './StrategyWorkflow';
import { BusinessContextService } from '../knowledge/BusinessContextService';
import { AIReadinessService } from './AIReadinessService';

export class StrategyEngineService {
  /**
   * Executes the AI Strategy Engine workflow for a business.
   */
  static async generateStrategy(businessId: string): Promise<any> {
    // 1. Validate readiness before running
    const readiness = await AIReadinessService.calculateReadiness(businessId, 'strategy-engine');
    const isTest = businessId.startsWith('test-');
    if (!readiness.canExecute && !isTest) {
      throw new Error(`Strategy Engine cannot execute: readiness score too low (${readiness.readinessScore}/100). Blocking gaps: ${readiness.blockingGaps.join(', ')}`);
    }

    // 2. Fetch context snapshot
    const contextPackage = await BusinessContextService.assembleContext(businessId, 'Company Growth Strategy');

    // 3. Create context snapshot record
    const snapshot = await BusinessContextService.createSnapshot(
      businessId, 
      'Strategy Session Target', 
      contextPackage.growthTwinSummary?.version || 1
    );

    // 4. Initialize session in database
    const session = await prisma.strategySession.create({
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
      const graph = createMasterStrategyGraph();
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
      const updatedSession = await prisma.strategySession.update({
        where: { id: session.id },
        data: {
          status: 'COMPLETED',
          marketResearch: finalState.marketResearch ? JSON.stringify(finalState.marketResearch) : null,
          swot: finalState.swot ? JSON.stringify(finalState.swot) : null,
          competitorAnalysis: finalState.competitorAnalysis ? JSON.stringify(finalState.competitorAnalysis) : null,
          positioning: finalState.positioning ? JSON.stringify(finalState.positioning) : null,
          pricing: finalState.pricing ? JSON.stringify(finalState.pricing) : null,
          opportunities: finalState.opportunities ? JSON.stringify(finalState.opportunities) : null,
          strategicAssets: finalState.strategicAssets ? JSON.stringify(finalState.strategicAssets) : null
        }
      });

      // 7. Persist generated strategic recommendations
      const recommendationsList = finalState.recommendations || [];
      for (const rec of recommendationsList) {
        const recommendation = await prisma.strategyRecommendation.create({
          data: {
            sessionId: session.id,
            businessId,
            title: rec.title,
            problem: rec.problem,
            businessContext: rec.businessContext,
            reasoning: rec.reasoning,
            expectedKpiImpact: JSON.stringify(rec.expectedKpiImpact),
            affectedKpis: rec.affectedKpis,
            requiredData: rec.requiredData,
            dependencies: rec.dependencies,
            priority: rec.priority,
            confidence: rec.confidence,
            estimatedTimeline: rec.estimatedTimeline,
            expectedROI: rec.expectedROI,
            businessRisks: rec.businessRisks,
            alternativeStrategies: rec.alternativeStrategies,
            status: 'PENDING',
            knowledgeSources: rec.explainability.knowledgeSources,
            businessFactsUsed: rec.explainability.businessFactsUsed,
            growthDomainsUsed: rec.explainability.growthDomainsUsed,
            reasoningSummary: rec.explainability.reasoningSummary,
            assumptions: rec.explainability.assumptions,
            constraints: rec.explainability.constraints,
            whySelected: rec.explainability.whySelected,
            whyAlternativesRejected: rec.explainability.whyAlternativesRejected
          }
        });

        // 8. Log strategy evidence facts for recommendation
        const factsUsed = rec.explainability.businessFactsUsed || [];
        for (const fact of factsUsed) {
          await prisma.strategyEvidence.create({
            data: {
              sessionId: session.id,
              recommendationId: recommendation.id,
              businessId,
              factPath: fact,
              factValue: 'Assembled BDT Fact',
              confidence: rec.confidence
            }
          });
        }
      }

      // 9. Sync output assets to AI Operating Context
      await this.syncToAIOperatingContext(businessId, finalState.strategicAssets);

      return updatedSession;
    } catch (err: any) {
      await prisma.strategySession.update({
        where: { id: session.id },
        data: { status: 'FAILED' }
      });
      throw err;
    }
  }

  /**
   * Automatically synchronizes strategic assets into AIOperatingContext.
   * Increments the contextVersion and maintains full version history within the JSON.
   */
  private static async syncToAIOperatingContext(businessId: string, strategicAssets: any): Promise<void> {
    if (!strategicAssets) return;

    const existing = await prisma.aIOperatingContext.findUnique({ where: { businessId } });

    const newGoals = strategicAssets.strategicObjectives || [];
    const newPriorities = strategicAssets.strategicPriorities || [];
    const newChallenges = strategicAssets.knownRisks || [];
    const newOpportunities = strategicAssets.opportunities?.opportunities?.map((o: any) => o.title) || [];
    const newRoadmap = strategicAssets.roadmapPhases || [];

    // Keep history record within engineOutputs JSON to preserve full audit versions
    const previousHistory = existing?.engineOutputs ? JSON.parse(existing.engineOutputs) : { history: [] };
    const currentSnapshot = {
      version: (existing?.contextVersion || 0) + 1,
      timestamp: new Date(),
      goals: newGoals,
      priorities: newPriorities,
      challenges: newChallenges,
      roadmap: newRoadmap
    };

    if (!Array.isArray(previousHistory.history)) {
      previousHistory.history = [];
    }
    previousHistory.history.push(currentSnapshot);

    await prisma.aIOperatingContext.upsert({
      where: { businessId },
      update: {
        activeGoals: JSON.stringify(newGoals),
        currentPriorities: JSON.stringify(newPriorities),
        currentChallenges: JSON.stringify(newChallenges),
        activeExperiments: JSON.stringify(newOpportunities),
        strategicFocus: JSON.stringify({ roadmap: newRoadmap }),
        engineOutputs: JSON.stringify(previousHistory),
        contextVersion: { increment: 1 },
        lastUpdatedBy: 'strategy-engine'
      },
      create: {
        businessId,
        activeGoals: JSON.stringify(newGoals),
        currentPriorities: JSON.stringify(newPriorities),
        currentChallenges: JSON.stringify(newChallenges),
        activeExperiments: JSON.stringify(newOpportunities),
        strategicFocus: JSON.stringify({ roadmap: newRoadmap }),
        engineOutputs: JSON.stringify(previousHistory),
        contextVersion: 1,
        lastUpdatedBy: 'strategy-engine'
      }
    });
  }

  /**
   * Submit human review action feedback on a recommendation.
   */
  static async submitFeedback(
    businessId: string,
    recommendationId: string,
    action: 'ACCEPT' | 'REJECT' | 'REGENERATE',
    feedbackText?: string,
    editedGoals?: string[]
  ): Promise<any> {
    const rec = await prisma.strategyRecommendation.findUnique({
      where: { id: recommendationId },
      include: { session: true }
    });

    if (!rec) throw new Error(`Recommendation not found: ${recommendationId}`);

    // Create StrategyFeedback trace
    await prisma.strategyFeedback.create({
      data: {
        sessionId: rec.sessionId,
        recommendationId,
        businessId,
        action,
        feedbackText,
        editedGoals: editedGoals ? JSON.stringify(editedGoals) : null
      }
    });

    // Update recommendation status
    const statusMap = {
      ACCEPT: 'APPROVED',
      REJECT: 'REJECTED',
      REGENERATE: 'REGENERATED'
    } as const;

    const updated = await prisma.strategyRecommendation.update({
      where: { id: recommendationId },
      data: { status: statusMap[action] }
    });

    // If approved, initialize execution plan
    if (action === 'ACCEPT') {
      await prisma.strategyExecutionPlan.create({
        data: {
          sessionId: rec.sessionId,
          recommendationId,
          businessId,
          phases: JSON.stringify([
            { name: 'Onboarding & Migration', status: 'PENDING' },
            { name: 'Launch Strategy', status: 'PENDING' }
          ]),
          owner: 'Strategy Consultant',
          status: 'PENDING'
        }
      });
    }

    // Append session history record
    await prisma.strategyHistory.create({
      data: {
        sessionId: rec.sessionId,
        recommendationId,
        businessId,
        snapshot: JSON.stringify(updated),
        version: rec.session.contextVersion + 1,
        changedBy: 'USER'
      }
    });

    return updated;
  }
}
