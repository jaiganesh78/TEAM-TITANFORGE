import { prisma } from '../../database/prisma';
import { createExecutiveBoardGraph } from './ExecutiveBoardWorkflow';
import { GraphState } from './StateGraph';

export interface KPITreeNode {
  name: string;
  value: string;
  metricKey: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  children?: KPITreeNode[];
}

export class ExecutiveBoardService {
  /**
   * Run the full Sprints 13 Executive Board Orchestration graph.
   */
  async runBoardOrchestration(businessId: string): Promise<any> {
    // 1. Create a session record
    const session = await prisma.executiveBoardSession.create({
      data: {
        businessId,
        status: 'IN_PROGRESS'
      }
    });

    // 2. Initialize State
    const initialState: GraphState = {
      sessionId: session.id,
      businessId,
      contextVersion: 1,
      kpis: {},
      gaps: {},
      readinessReport: {},
      contextPackage: {},
      reflectionAttempts: 0,
      confidenceScore: 90,
      logs: []
    };

    try {
      // 3. Execute StateGraph
      const graph = createExecutiveBoardGraph();
      const finalState = await graph.execute(initialState);

      // 4. Update session status
      await prisma.executiveBoardSession.update({
        where: { id: session.id },
        data: { status: 'COMPLETED' }
      });

      return {
        sessionId: session.id,
        status: 'COMPLETED',
        brief: finalState.executiveBrief,
        recommendations: finalState.executiveRecommendations,
        conflicts: finalState.executiveConflicts,
        consensus: finalState.executiveConsensus
      };
    } catch (err: any) {
      await prisma.executiveBoardSession.update({
        where: { id: session.id },
        data: { status: 'FAILED' }
      });
      throw err;
    }
  }

  /**
   * Executive Decision Impact Simulator.
   */
  async simulateDecision(businessId: string, command: string): Promise<any> {
    const session = await prisma.executiveBoardSession.create({
      data: {
        businessId,
        status: 'IN_PROGRESS'
      }
    });

    const graph = createExecutiveBoardGraph();
    const initialState: GraphState = {
      sessionId: session.id,
      businessId,
      contextVersion: 1,
      kpis: {},
      gaps: {},
      readinessReport: {},
      contextPackage: {},
      decisionSimulations: command,
      reflectionAttempts: 0,
      confidenceScore: 90,
      logs: []
    };

    const finalState = await graph.execute(initialState);

    // Persist simulated decision
    if (finalState.decisionSimulations) {
      await prisma.executiveDecision.create({
        data: {
          sessionId: session.id,
          businessId,
          title: `Simulated Decision: ${command.substring(0, 40)}...`,
          choice: command,
          logic: finalState.decisionSimulations.executiveSummary || 'Simulation logical projection completed.',
          status: 'PENDING',
          expectedOutcome: finalState.decisionSimulations.revenueImpact || '',
          confidence: finalState.decisionSimulations.confidence || 85.0,
          evidenceUsed: JSON.stringify(finalState.decisionSimulations.departmentsAffected || []),
          assumptions: JSON.stringify(finalState.decisionSimulations.risks || []),
          constraints: JSON.stringify([]),
          alternativeDecisions: JSON.stringify(finalState.decisionSimulations.recommendedExecutionOrder || []),
          participatingEngines: JSON.stringify(finalState.decisionSimulations.departmentsAffected || []),
          businessFacts: JSON.stringify([]),
          knowledgeChunks: JSON.stringify([]),
          historicalContext: JSON.stringify([])
        }
      });
    }

    await prisma.executiveBoardSession.update({
      where: { id: session.id },
      data: { status: 'COMPLETED' }
    });

    return finalState.decisionSimulations;
  }

  /**
   * Drill-down Executive KPI Tree Generator.
   */
  async getKPITree(businessId: string): Promise<KPITreeNode> {
    const latestSnapshot = await prisma.businessEvolutionSnapshot.findFirst({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    });

    const scores = await prisma.customerSuccessScore.findFirst({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    });

    let health = 85;
    let growth = 78;
    const csVal = scores?.overallScore || 86;

    if (latestSnapshot) {
      try {
        const hObj = JSON.parse(latestSnapshot.businessHealth);
        health = hObj.overallHealth || hObj.businessHealth || health;
      } catch {}
      try {
        const gObj = JSON.parse(latestSnapshot.growthScore);
        growth = gObj.growthScore || growth;
      } catch {}
    }

    // Build the hierarchical tree structure
    return {
      name: 'Business Health Index',
      value: `${health}%`,
      metricKey: 'overall_health',
      trend: 'UP',
      status: health >= 80 ? 'HEALTHY' : health >= 60 ? 'WARNING' : 'CRITICAL',
      children: [
        {
          name: 'Growth Performance',
          value: `${growth}%`,
          metricKey: 'growth_score',
          trend: 'UP',
          status: growth >= 75 ? 'HEALTHY' : 'WARNING',
          children: [
            {
              name: 'Lead Generation Volume',
              value: '180 leads',
              metricKey: 'lead_volume',
              trend: 'UP',
              status: 'HEALTHY'
            },
            {
              name: 'Conversion Win Rate',
              value: '12%',
              metricKey: 'sales_win_rate',
              trend: 'STABLE',
              status: 'HEALTHY'
            }
          ]
        },
        {
          name: 'Customer Success',
          value: `${csVal}%`,
          metricKey: 'customer_health',
          trend: 'UP',
          status: csVal >= 80 ? 'HEALTHY' : 'WARNING',
          children: [
            {
              name: 'LTV Metric Projection',
              value: '$42,000',
              metricKey: 'customer_ltv',
              trend: 'UP',
              status: 'HEALTHY'
            },
            {
              name: 'Customer Retention Rate',
              value: '94%',
              metricKey: 'customer_retention',
              trend: 'STABLE',
              status: 'HEALTHY'
            }
          ]
        }
      ]
    };
  }

  /**
   * Board Asset Retrieval Methods.
   */
  async getLatestBrief(businessId: string): Promise<any> {
    return prisma.executiveBrief.findFirst({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getLatestOperatingPlan(businessId: string): Promise<any> {
    return prisma.executiveOperatingPlan.findFirst({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getLatestRoadmap(businessId: string): Promise<any[]> {
    return prisma.executiveRoadmap.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAlerts(businessId: string): Promise<any[]> {
    return prisma.executiveAlert.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getMeetings(businessId: string): Promise<any[]> {
    return prisma.executiveMeeting.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getDecisions(businessId: string): Promise<any[]> {
    return prisma.executiveDecision.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
