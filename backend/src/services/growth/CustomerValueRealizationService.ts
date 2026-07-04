import { prisma } from '../../database/prisma';

export interface OutcomeValueResult {
  goals: string[];
  expectedOutcomes: string[];
  actualOutcomes: string[];
  goalAchievementRate: number;
  roiDelivered: number;
  valueDelivered: number;
  timeToValueDays: number;
  valueScore: number;
  valueTrend: 'IMPROVING' | 'DECLINING' | 'STABLE';
  valueRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendedActions: string[];
}

export class CustomerValueRealizationService {
  /**
   * Tracks and evaluates customer goal success parameters, actual ROI, and values.
   */
  static async evaluateValueRealization(
    businessId: string,
    twinId: string,
    sessionId: string
  ): Promise<OutcomeValueResult> {
    // Fetch Customer Digital Twin
    const twin = await prisma.customerDigitalTwin.findUnique({
      where: { id: twinId }
    });

    if (!twin) {
      throw new Error(`Customer Digital Twin not found: ${twinId}`);
    }

    // Parse twin details
    let goals: string[] = [];
    let outcomes: string[] = [];
    try {
      goals = JSON.parse(twin.customerGoals || '[]');
      outcomes = JSON.parse(twin.businessOutcomes || '[]');
    } catch {
      goals = ['Integrate API routing modules', 'Reduce route calculation processing latency'];
      outcomes = ['Staging latency reduced by 12%'];
    }

    // Default calculations
    const expectedOutcomes = goals.map(g => `Optimize: ${g}`);
    const actualOutcomes = outcomes.length > 0 ? outcomes : ['Latency drop achieved in core edge gateways'];
    
    // Achievement rate calculation
    const goalAchievementRate = goals.length > 0 ? Math.min(100, Math.round((actualOutcomes.length / goals.length) * 100)) : 80.0;
    
    // ROI calculation based on usage and revenue
    const roiDelivered = twin.revenueContribution > 0 ? Math.round((twin.revenueContribution * 2.8) / 1000) * 1000 : 25000;
    const valueDelivered = Math.min(100, Math.round(goalAchievementRate * 0.95));
    const timeToValueDays = 14; // Default staging cycle days

    // Value metrics
    const valueScore = Math.round((goalAchievementRate + (twin.relationHealth || 85)) / 2);
    const valueTrend = valueScore >= 80 ? 'IMPROVING' : valueScore >= 60 ? 'STABLE' : 'DECLINING';
    const valueRisk = valueScore >= 80 ? 'LOW' : valueScore >= 60 ? 'MEDIUM' : 'HIGH';

    const recommendedActions = [
      'Conduct custom ROI workshop showing compute optimization values',
      'Schedule quarterly executive QBR aligning on next phase cold-chain integration goals'
    ];

    // Log the realization event
    await prisma.customerValueRealization.create({
      data: {
        sessionId,
        businessId,
        twinId,
        goals: JSON.stringify(goals),
        expectedOutcomes: JSON.stringify(expectedOutcomes),
        actualOutcomes: JSON.stringify(actualOutcomes),
        goalAchievementRate,
        roiDelivered,
        valueDelivered: Number(valueDelivered),
        timeToValueDays,
        valueScore,
        valueTrend,
        valueRisk,
        recommendedActions: JSON.stringify(recommendedActions)
      }
    });

    return {
      goals,
      expectedOutcomes,
      actualOutcomes,
      goalAchievementRate,
      roiDelivered,
      valueDelivered,
      timeToValueDays,
      valueScore,
      valueTrend,
      valueRisk,
      recommendedActions
    };
  }
}
