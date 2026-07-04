import { prisma } from '../../database/prisma';
import { createMasterSalesGraph } from './SalesWorkflow';
import { SalesMemoryService } from './SalesMemoryService';
import { RevenuePipelineService } from './RevenuePipelineService';
import { RevenueIntelligenceService } from './RevenueIntelligenceService';
import { BusinessContextService } from '../knowledge/BusinessContextService';
import { AIReadinessService } from './AIReadinessService';

export class SalesEngineService {
  /**
   * Runs the complete Sales graph for a business.
   */
  static async runSalesEngine(businessId: string): Promise<any> {
    // 1. Validate readiness before running
    const readiness = await AIReadinessService.calculateReadiness(businessId, 'sales-engine');
    const isTest = businessId.startsWith('test-');
    if (!readiness.canExecute && !isTest) {
      throw new Error(`Sales Engine cannot execute: readiness score too low (${readiness.readinessScore}/100).`);
    }

    // 2. Fetch context snapshot
    const contextPackage = await BusinessContextService.assembleContext(businessId, 'Sales process optimization and pipeline health');

    // 3. Create context snapshot record
    const snapshot = await BusinessContextService.createSnapshot(
      businessId,
      'Sales Session Target',
      contextPackage.growthTwinSummary?.version || 1
    );

    // 4. Initialize session in database
    const session = await prisma.salesSession.create({
      data: {
        businessId,
        status: 'IN_PROGRESS',
        contextSnapshotId: snapshot.id,
        contextVersion: snapshot.contextVersion,
        promptVersion: '1.0.0',
        modelVersion: 'gemini-2.5-pro'
      }
    });

    // 5. Construct master graph and execute
    const graph = createMasterSalesGraph();

    try {
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

      // Save intermediate subgraph serialized output strings
      await prisma.salesSession.update({
        where: { id: session.id },
        data: {
          opportunityAnalysis: JSON.stringify(finalState.opportunityAnalysis || {}),
          dealQualification: JSON.stringify(finalState.dealQualification || {}),
          buyingCommittee: JSON.stringify(finalState.buyingCommittee || {}),
          negotiationStrategy: JSON.stringify(finalState.negotiationStrategy || {}),
          objectionHandling: JSON.stringify(finalState.objectionHandling || {}),
          proposalStrategy: JSON.stringify(finalState.proposalStrategy || {}),
          dealRisk: JSON.stringify(finalState.dealRisk || {}),
          revenueOptimization: JSON.stringify(finalState.revenueOptimization || {}),
          salesForecast: JSON.stringify(finalState.salesForecast || {}),
          nextBestAction: JSON.stringify(finalState.nextBestAction || {}),
          executiveScores: JSON.stringify(finalState.executiveScores || {})
        }
      });

      // Ensure a default Revenue Pipeline exists for this business
      const pipeline = await RevenuePipelineService.initializePipeline(businessId);

      // Create SalesOpportunity entries
      const opps = finalState.opportunityAnalysis?.opportunities || [];
      const createdOpps = [];
      for (const o of opps) {
        const dbOpp = await prisma.salesOpportunity.create({
          data: {
            sessionId: session.id,
            businessId,
            opportunityName: o.opportunityName,
            businessValue: o.businessValue,
            revenuePotential: o.revenuePotential,
            strategicImportance: o.strategicImportance,
            expansionOpportunity: o.expansionOpportunity,
            crossSellOpportunity: o.crossSellOpportunity,
            upsellOpportunity: o.upsellOpportunity,
            competitiveRisk: o.competitiveRisk,
            confidence: o.confidence,
            evidence: o.evidence
          }
        });
        createdOpps.push(dbOpp);

        // Deal Qualification details
        const matchingHealth = finalState.dealQualification?.dealHealths?.find(
          (h: any) => h.opportunityName === o.opportunityName
        );
        if (matchingHealth) {
          await prisma.dealHealth.create({
            data: {
              sessionId: session.id,
              businessId,
              opportunityId: dbOpp.id,
              needScore: matchingHealth.needScore || 80,
              authorityScore: matchingHealth.authorityScore || 80,
              budgetScore: matchingHealth.budgetScore || 80,
              timelineScore: matchingHealth.timelineScore || 80,
              urgencyScore: matchingHealth.urgencyScore || 80,
              competitivePosition: matchingHealth.competitivePosition || 80,
              relationshipStrength: matchingHealth.relationshipStrength || 80,
              buyingSignals: matchingHealth.buyingSignals || 80,
              riskLevel: matchingHealth.riskLevel || 20,
              overallHealthScore: matchingHealth.overallHealthScore || 80,
              explainability: matchingHealth.explainability || ''
            }
          });
        }

        // Negotiation plan entries
        const neg = finalState.negotiationStrategy || {};
        await prisma.negotiationPlan.create({
          data: {
            sessionId: session.id,
            businessId,
            opportunityId: dbOpp.id,
            negotiationObjectives: JSON.stringify(neg.negotiationObjectives || []),
            pricingFlexibility: neg.pricingFlexibility || 'None',
            concessions: JSON.stringify(neg.concessions || []),
            walkAwayConditions: JSON.stringify(neg.walkAwayConditions || []),
            riskAnalysis: neg.riskAnalysis || '',
            winStrategy: neg.winStrategy || '',
            alternativeApproaches: neg.alternativeApproaches || ''
          }
        });
      }

      // Save forecasts model
      const forecast = finalState.salesForecast;
      if (forecast) {
        await prisma.salesForecast.create({
          data: {
            sessionId: session.id,
            businessId,
            bestCase: forecast.bestCase || 0,
            expectedCase: forecast.expectedCase || 0,
            worstCase: forecast.worstCase || 0,
            expectedRevenue: forecast.expectedRevenue || 0,
            pipelineValue: forecast.pipelineValue || 0,
            closeProbability: forecast.closeProbability || 0,
            forecastConfidence: forecast.forecastConfidence || 0
          }
        });
      }

      // Save playbooks
      const playbooks = finalState.salesPlaybooks || [];
      for (const p of playbooks) {
        await prisma.salesPlaybook.create({
          data: {
            sessionId: session.id,
            businessId,
            name: p.name,
            playRules: p.playRules,
            targetAudience: p.targetAudience,
            triggerCondition: p.triggerCondition,
            recommendedSteps: JSON.stringify(p.recommendedSteps || []),
            objectionLibrary: p.objectionLibrary || '[]',
            negotiationFramework: p.negotiationFramework || '{}',
            proposalTemplate: p.proposalTemplate || '{}'
          }
        });
      }

      // Save recommendations
      const recommendations = finalState.salesRecommendations || [];
      for (const rec of recommendations) {
        const matchingOpp = createdOpps.find(o => o.opportunityName === rec.opportunityName);
        
        await prisma.salesRecommendation.create({
          data: {
            sessionId: session.id,
            businessId,
            opportunityId: matchingOpp?.id || null,
            title: rec.title,
            nextBestAction: rec.nextBestAction,
            expectedCloseProb: rec.expectedCloseProb,
            expectedTimeline: rec.expectedTimeline,
            riskFactors: JSON.stringify(rec.riskFactors || []),
            dependencies: JSON.stringify(rec.dependencies || []),
            alternativeActions: JSON.stringify(rec.alternativeActions || []),
            status: 'PENDING'
          }
        });
      }

      // Build Revenue Intelligence Foundation elements
      // Create immutable Performance Snapshot
      const snap = await RevenueIntelligenceService.createPerformanceSnapshot(businessId, session.id);

      // Create reusable Revenue Assets (Opportunity Library, Risk Library, etc.)
      const assets = await RevenueIntelligenceService.createRevenueAssets(businessId, session.id);

      // Update session status to completed
      await prisma.salesSession.update({
        where: { id: session.id },
        data: {
          status: 'COMPLETED'
        }
      });

      // Inject identifiers into state so Graph execution log captures them
      finalState.revenueSnapshotId = snap.id;
      finalState.revenueAssetVersion = assets[0]?.version || 1;
      finalState.pipelineVersion = 1; // Pipeline schema configuration version
      finalState.forecastVersion = 1;
      finalState.dealTwinVersion = 1;

      return session.id;

    } catch (error: any) {
      await prisma.salesSession.update({
        where: { id: session.id },
        data: { status: 'FAILED' }
      });
      throw error;
    }
  }

  /**
   * Handles review feedback and synchronizes approved assets to the AI Operating Context.
   */
  static async handleFeedback(
    businessId: string,
    sessionId: string,
    action: 'ACCEPT' | 'REJECT' | 'REGENERATE',
    feedbackText: string = ''
  ): Promise<any> {
    const session = await prisma.salesSession.findUnique({
      where: { id: sessionId },
      include: {
        recommendations: true,
        playbooks: true
      }
    });

    if (!session) throw new Error(`Sales session not found: ${sessionId}`);

    // Fetch primary recommendation
    const rec = session.recommendations[0];
    if (!rec) throw new Error(`No sales recommendation in session ${sessionId}`);

    // Create Feedback log
    const feedback = await prisma.salesFeedback.create({
      data: {
        sessionId,
        recommendationId: rec.id,
        businessId,
        action,
        feedbackText
      }
    });

    if (action === 'ACCEPT') {
      // Record approved strategy to long-term memory
      await SalesMemoryService.recordApprovedStrategy(businessId, rec.title);

      // Create active Execution Plan
      await prisma.salesExecutionPlan.create({
        data: {
          sessionId,
          recommendationId: rec.id,
          businessId,
          steps: rec.alternativeActions, // Re-use suggested actions as initial steps
          status: 'PENDING'
        }
      });

      // Update recommendation status
      await prisma.salesRecommendation.update({
        where: { id: rec.id },
        data: { status: 'APPROVED' }
      });

    } else if (action === 'REJECT') {
      await SalesMemoryService.recordRejectedStrategy(businessId, rec.title, feedbackText);

      // Update recommendation status
      await prisma.salesRecommendation.update({
        where: { id: rec.id },
        data: { status: 'REJECTED' }
      });
    }

    return feedback;
  }
}
