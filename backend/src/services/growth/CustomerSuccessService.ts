import { prisma } from '../../database/prisma';
import { createMasterCustomerSuccessGraph } from './CustomerSuccessWorkflow';
import { CustomerValueRealizationService } from './CustomerValueRealizationService';

export class CustomerSuccessService {
  /**
   * Runs the complete Customer Success graph for a given customer digital twin.
   */
  static async runCustomerSuccessEngine(businessId: string, twinId?: string): Promise<string> {
    // 1. Resolve or initialize Customer Digital Twin
    let activeTwin = twinId ? await prisma.customerDigitalTwin.findUnique({ where: { id: twinId } }) : null;

    if (!activeTwin) {
      // Find first existing twin for this business, or create a mock enterprise customer
      activeTwin = await prisma.customerDigitalTwin.findFirst({ where: { businessId } });
      
      if (!activeTwin) {
        // Resolve lead profile if available to link
        const lead = await prisma.leadProfile.findFirst({ where: { businessId } });
        
        let session = await prisma.customerSuccessSession.findFirst({ where: { businessId } });
        if (!session) {
          session = await prisma.customerSuccessSession.create({
            data: {
              businessId,
              status: 'SUCCESS'
            }
          });
        }
        
        activeTwin = await prisma.customerDigitalTwin.create({
          data: {
            businessId,
            sessionId: session.id,
            name: lead ? lead.companyName : 'Global Logistics Ltd',
            leadProfileId: lead ? lead.id : undefined,
            profileData: JSON.stringify({ segment: 'Enterprise SaaS', tier: 'Gold' }),
            productsPurchased: JSON.stringify(['routing_api', 'dispatch_dashboard']),
            customerGoals: JSON.stringify(['Reduce route latency 15%', 'Integrate telemetry sensors']),
            businessOutcomes: JSON.stringify(['Staging latency drops achieved']),
            usagePatterns: JSON.stringify({ activeDaysPerWeek: 5, dailyQueries: 4500 }),
            featureAdoption: JSON.stringify({ telemetry: 88, routing: 45 }),
            relationHealth: 85.0,
            satisfactionScore: 82.0,
            revenueContribution: 120000.0,
            executiveSponsor: 'Sarah Jenkins (Director of IT)',
            riskRegister: JSON.stringify(['Slow legacy integrations compatibility'])
          }
        });
      }
    }

    // 2. Create Customer Success Session
    const session = await prisma.customerSuccessSession.create({
      data: {
        businessId,
        status: 'PENDING',
        contextVersion: activeTwin.version
      }
    });

    try {
      // 3. Compile and execute Master Customer Success Graph
      const graph = createMasterCustomerSuccessGraph();
      const initialState = {
        businessId,
        sessionId: session.id,
        contextVersion: activeTwin.version,
        kpis: {},
        gaps: {},
        readinessReport: null,
        contextPackage: null,
        reflectionAttempts: 0,
        confidenceScore: 90.0,
        logs: []
      };

      const finalState = await graph.execute(initialState);

      // 4. Save Customer Success outputs to Database
      
      // A. Customer Health Score
      const health = finalState.customerHealth || {};
      await prisma.customerHealth.create({
        data: {
          sessionId: session.id,
          businessId,
          twinId: activeTwin.id,
          overallHealth: health.overallHealth || 85.0,
          relationshipHealth: health.relationshipHealth || 82.0,
          productAdoption: health.productAdoption || 80.0,
          featureAdoption: health.featureAdoption || 75.0,
          supportHealth: health.supportHealth || 90.0,
          valueRealization: health.valueRealization || 88.0,
          execEngagement: health.execEngagement || 80.0,
          renewalReadiness: health.renewalReadiness || 85.0,
          expansionReadiness: health.expansionReadiness || 78.0,
          riskLevel: health.riskLevel || 15.0,
          healthTrend: health.healthTrend || 'UP',
          confidence: health.confidence || 90.0
        }
      });

      // B. Customer Journey Stage
      const journey = finalState.customerSuccessJourney || {};
      await prisma.customerJourney.create({
        data: {
          sessionId: session.id,
          businessId,
          twinId: activeTwin.id,
          currentStage: journey.currentStage || 'VALUE_REALIZATION',
          stageStatus: journey.stageStatus || 'On track. latency objectives delivered.',
          successCriteria: JSON.stringify(journey.successCriteria || ['latency drop verified']),
          risks: JSON.stringify(journey.risks || ['slow legacy redundancy']),
          recommendedActions: JSON.stringify(journey.recommendedActions || ['Upgrade API parameters'])
        }
      });

      // C. Customer Lifecycle
      const lifecycle = finalState.customerLifecycle || {};
      await prisma.customerLifecycle.create({
        data: {
          sessionId: session.id,
          businessId,
          twinId: activeTwin.id,
          lifecycleState: lifecycle.lifecycleState || 'ACTIVE',
          totalDaysActive: lifecycle.totalDaysActive || 45,
          onboardingDate: lifecycle.onboardingDate ? new Date(lifecycle.onboardingDate) : new Date(),
          lastActiveDate: lifecycle.lastActiveDate ? new Date(lifecycle.lastActiveDate) : new Date()
        }
      });

      // D. Support Intelligence
      const support = finalState.supportIntelligence || {};
      await prisma.customerSupportCase.create({
        data: {
          sessionId: session.id,
          businessId,
          twinId: activeTwin.id,
          ticketNumber: support.ticketNumber || 'TKT-' + Math.floor(Math.random() * 9000 + 1000),
          category: support.category || 'BUG',
          priority: support.priority || 'MEDIUM',
          status: support.status || 'RESOLVED',
          subject: support.subject || 'API Latency under high volume loads',
          description: support.description || 'Latency spikes detected during peak routing cycles.',
          rootCause: support.rootCause || 'API Edge cache parameters miss',
          resolution: support.resolution || 'Deploy Cloudflare edge rules configurations',
          expectedResolutionTime: support.expectedResolutionTime || '2 hours',
          customerImpact: support.customerImpact || 'High volume batch queues slowed',
          isRecurring: support.isRecurring || false
        }
      });

      // E. Customer Sentiment
      const sentiment = finalState.customerSentiment || {};
      await prisma.customerSentiment.create({
        data: {
          sessionId: session.id,
          businessId,
          twinId: activeTwin.id,
          sentimentScore: sentiment.sentimentScore || 85.0,
          sentimentTrend: sentiment.sentimentTrend || 'STABLE',
          confidence: sentiment.confidence || 90.0,
          businessImpact: sentiment.businessImpact || 'Client remains highly referenceable',
          relationshipRisk: sentiment.relationshipRisk || 'Low',
          executiveRisk: sentiment.executiveRisk || 'Low'
        }
      });

      // F. Renewal Forecasts & Plans
      const renewForecast = finalState.renewalForecast || {};
      await prisma.renewalForecast.create({
        data: {
          sessionId: session.id,
          businessId,
          twinId: activeTwin.id,
          renewalDate: renewForecast.renewalDate ? new Date(renewForecast.renewalDate) : new Date(Date.now() + 180 * 86400000),
          renewalProbability: renewForecast.renewalProbability || 92.0,
          expectedValue: renewForecast.expectedValue || 120000.0,
          confidence: renewForecast.confidence || 90.0
        }
      });

      const renewPlan = finalState.renewalPlan || {};
      await prisma.renewalPlan.create({
        data: {
          sessionId: session.id,
          businessId,
          twinId: activeTwin.id,
          planOwner: renewPlan.planOwner || 'Sarah Jenkins',
          renewalStrategy: renewPlan.renewalStrategy || 'Value realization justification presenting latency savings',
          executiveActions: JSON.stringify(renewPlan.executiveActions || ['Verify latency metrics', 'Conduct pricing alignment call']),
          keyRisks: JSON.stringify(renewPlan.keyRisks || ['budget alignment', 'competitor routing bids']),
          status: renewPlan.status || 'DRAFT'
        }
      });

      // G. Expansion Opportunities
      const expansion = finalState.expansionOpportunity || {};
      const expOp = await prisma.expansionOpportunity.create({
        data: {
          sessionId: session.id,
          businessId,
          twinId: activeTwin.id,
          title: expansion.title || 'Telemetry Integrations Cross-sell',
          type: expansion.type || 'CROSS_SELL',
          fitScore: expansion.fitScore || 85.0,
          expectedRevenue: expansion.expectedRevenue || 20000.0,
          businessJustification: expansion.businessJustification || 'Client wants cold-chain temp sensors mapping'
        }
      });

      await prisma.crossSellOpportunity.create({
        data: {
          sessionId: session.id,
          businessId,
          twinId: activeTwin.id,
          productName: 'IoT Temperature Sensor Telemetry Module',
          fitScore: 88.0,
          potentialArr: 20000.0
        }
      });

      await prisma.upsellOpportunity.create({
        data: {
          sessionId: session.id,
          businessId,
          twinId: activeTwin.id,
          currentPlan: 'Gold Routing Standard',
          targetPlan: 'Premium Enterprise Real-time routing API',
          upsellValue: 15000.0
        }
      });

      // H. Churn Risk & Mitigation
      const churn = finalState.churnRisk || {};
      await prisma.churnRisk.create({
        data: {
          sessionId: session.id,
          businessId,
          twinId: activeTwin.id,
          churnProbability: churn.churnProbability || 8.0,
          confidence: churn.confidence || 92.0,
          primaryRootCause: churn.primaryRootCause || 'SLA latency disputes',
          earlyWarningSignals: JSON.stringify(churn.earlyWarningSignals || ['API Latency spikes logs', 'support tickets category count']),
          severity: churn.severity || 'LOW'
        }
      });

      const retention = finalState.retentionStrategy || {};
      await prisma.retentionStrategy.create({
        data: {
          sessionId: session.id,
          businessId,
          twinId: activeTwin.id,
          strategyName: retention.strategyName || 'API Edge Caching deployment program',
          executionPlan: retention.executionPlan || 'Deploy cache rules within 30 days to resolve peak SLA concerns.',
          estimatedCost: retention.estimatedCost || 500.0,
          successProbability: retention.successProbability || 95.0
        }
      });

      // I. Value Realization Outcomes
      await CustomerValueRealizationService.evaluateValueRealization(businessId, activeTwin.id, session.id);

      // J. Advocacy predictions
      const advocacy = finalState.customerAdvocacy || {};
      await prisma.customerAdvocacy.create({
        data: {
          sessionId: session.id,
          businessId,
          twinId: activeTwin.id,
          advocacyScore: advocacy.advocacyScore || 86.0,
          referenceLikelihood: advocacy.referenceLikelihood || 90.0,
          testimonialProb: advocacy.testimonialProb || 85.0,
          caseStudyProb: advocacy.caseStudyProb || 75.0,
          npsScore: advocacy.npsScore || 9.0,
          advocacyStrategy: advocacy.advocacyStrategy || 'Leverage latency drop milestone to request testimonial quotes',
          executiveActions: JSON.stringify(advocacy.executiveActions || ['Send testimonial request email', 'Feature in Q3 Case Study list'])
        }
      });

      // K. Success Playbooks Assets
      const playbooks = finalState.successPlaybooks || {};
      await prisma.customerSuccessAsset.create({
        data: {
          sessionId: session.id,
          businessId,
          assetType: 'RETENTION_PLAYBOOK',
          payload: JSON.stringify(playbooks.playbooks || [])
        }
      });

      // L. Executive Summary
      const summary = finalState.executiveAccountSummary || {};
      await prisma.customerSuccessScore.create({
        data: {
          sessionId: session.id,
          businessId,
          twinId: activeTwin.id,
          healthScore: summary.currentHealth || 86.0,
          relationshipStrength: summary.relationshipStrength || 82.0,
          valueDelivered: summary.roiDelivered || 85.0,
          renewalConfidence: summary.renewalReadiness || 90.0,
          expansionPotential: summary.expansionPotential || 78.0,
          executiveSatisfaction: summary.confidence || 85.0,
          overallScore: summary.priorityScore || 84.0
        }
      });

      // M. Customer Recommendation Items
      const recommendations = finalState.customerRecommendations || [];
      for (const rec of recommendations) {
        await prisma.customerRecommendation.create({
          data: {
            sessionId: session.id,
            businessId,
            twinId: activeTwin.id,
            title: rec.title,
            description: rec.description,
            nextBestAction: rec.nextBestAction,
            expectedOutcome: rec.expectedOutcome,
            confidence: rec.confidence || 90.0
          }
        });
      }

      // N. Customer 360 Timeline Logs
      const timeline = finalState.customer360Timeline || [];
      for (const ev of timeline) {
        await prisma.customerHistory.create({
          data: {
            sessionId: session.id,
            businessId,
            twinId: activeTwin.id,
            eventName: ev.event,
            eventDetails: JSON.stringify(ev)
          }
        });
      }

      // O. Customer Portfolio metrics
      const portfolio = finalState.customerPortfolioIntelligence || {};
      await prisma.customerBenchmark.create({
        data: {
          sessionId: session.id,
          businessId,
          metricName: 'overallPortfolioHealth',
          cohortValue: 75.0,
          customerValue: portfolio.overallPortfolioHealth || 86.0,
          gap: (portfolio.overallPortfolioHealth || 86.0) - 75.0,
          rating: 'OUTPERFORMING'
        }
      });

      // P. Save versioned Snapshot
      await prisma.customerSuccessSnapshot.create({
        data: {
          sessionId: session.id,
          businessId,
          version: activeTwin.version,
          healthSummary: JSON.stringify(health),
          adoptionMetrics: JSON.stringify(finalState.customerAdoption || {}),
          riskSummary: JSON.stringify(churn),
          renewalSummary: JSON.stringify(renewForecast),
          expansionSummary: JSON.stringify(expansion),
          supportSummary: JSON.stringify(support),
          satisfactionSummary: JSON.stringify(sentiment)
        }
      });

      // Update Digital Twin version
      await prisma.customerDigitalTwin.update({
        where: { id: activeTwin.id },
        data: {
          version: { increment: 1 },
          sessionId: session.id
        }
      });

      // Update session status to success
      await prisma.customerSuccessSession.update({
        where: { id: session.id },
        data: { status: 'SUCCESS' }
      });

      // Synchronize playbooks to Customer Memory & Business context
      await prisma.customerMemory.create({
        data: {
          businessId,
          twinId: activeTwin.id,
          acceptedStrategies: '[]',
          rejectedStrategies: '[]',
          performanceLogs: JSON.stringify(finalState.logs)
        }
      });

      // Add CCO audit log trigger to AIOperatingContext
      const context = await prisma.aIOperatingContext.findUnique({
        where: { businessId }
      });
      if (context) {
        const currentGoals = JSON.parse(context.activeGoals || '[]');
        const twinGoals = JSON.parse(activeTwin.customerGoals || '[]');
        const updatedGoals = Array.from(new Set([...currentGoals, ...twinGoals]));
        await prisma.aIOperatingContext.update({
          where: { businessId },
          data: {
            activeGoals: JSON.stringify(updatedGoals),
            contextVersion: { increment: 1 },
            lastUpdatedBy: 'customer-success-engine'
          }
        });
      }

    } catch (error: any) {
      await prisma.customerSuccessSession.update({
        where: { id: session.id },
        data: { status: 'FAILED' }
      });
      throw error;
    }

    return session.id;
  }

  /**
   * Handles user ACCEPT/REJECT feedback audits for customer recommendations.
   */
  static async handleFeedback(
    businessId: string,
    sessionId: string,
    recommendationId: string,
    action: 'ACCEPT' | 'REJECT',
    feedbackText?: string
  ) {
    const feedback = await prisma.customerFeedbackItem.create({
      data: {
        recommendationId,
        action,
        feedbackText
      }
    });

    // Update recommendation status
    const rec = await prisma.customerRecommendation.update({
      where: { id: recommendationId },
      data: { status: action === 'ACCEPT' ? 'APPROVED' : 'REJECTED' }
    });

    // Create execution task logs if recommendation was approved
    if (action === 'ACCEPT') {
      await prisma.customerExecutionPlan.create({
        data: {
          sessionId,
          businessId,
          recommendationId,
          taskList: JSON.stringify([rec.nextBestAction]),
          status: 'PENDING',
          progress: 0.0
        }
      });

      // Add to Customer Memory approved list
      const memory = await prisma.customerMemory.findFirst({
        where: { businessId }
      });

      if (memory) {
        const approved = JSON.parse(memory.acceptedStrategies || '[]');
        approved.push(rec.title);
        await prisma.customerMemory.update({
          where: { id: memory.id },
          data: { acceptedStrategies: JSON.stringify(approved) }
        });
      }
    }

    return feedback;
  }
}
