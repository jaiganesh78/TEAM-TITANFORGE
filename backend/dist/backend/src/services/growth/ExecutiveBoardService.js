"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutiveBoardService = void 0;
const prisma_1 = require("../../database/prisma");
const ExecutiveBoardWorkflow_1 = require("./ExecutiveBoardWorkflow");
class ExecutiveBoardService {
    /**
     * Run the full Sprints 13 Executive Board Orchestration graph.
     */
    async runBoardOrchestration(businessId) {
        // 1. Create a session record
        const session = await prisma_1.prisma.executiveBoardSession.create({
            data: {
                businessId,
                status: 'IN_PROGRESS'
            }
        });
        // 2. Initialize State
        const initialState = {
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
            const graph = (0, ExecutiveBoardWorkflow_1.createExecutiveBoardGraph)();
            const finalState = await graph.execute(initialState);
            // 4. Update session status
            await prisma_1.prisma.executiveBoardSession.update({
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
        }
        catch (err) {
            await prisma_1.prisma.executiveBoardSession.update({
                where: { id: session.id },
                data: { status: 'FAILED' }
            });
            throw err;
        }
    }
    /**
     * Executive Decision Impact Simulator.
     */
    async simulateDecision(businessId, command) {
        const session = await prisma_1.prisma.executiveBoardSession.create({
            data: {
                businessId,
                status: 'IN_PROGRESS'
            }
        });
        const graph = (0, ExecutiveBoardWorkflow_1.createExecutiveBoardGraph)();
        const initialState = {
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
            await prisma_1.prisma.executiveDecision.create({
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
        await prisma_1.prisma.executiveBoardSession.update({
            where: { id: session.id },
            data: { status: 'COMPLETED' }
        });
        return finalState.decisionSimulations;
    }
    /**
     * Drill-down Executive KPI Tree Generator.
     */
    async getKPITree(businessId) {
        const latestSnapshot = await prisma_1.prisma.businessEvolutionSnapshot.findFirst({
            where: { businessId },
            orderBy: { createdAt: 'desc' }
        });
        const scores = await prisma_1.prisma.customerSuccessScore.findFirst({
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
            }
            catch { }
            try {
                const gObj = JSON.parse(latestSnapshot.growthScore);
                growth = gObj.growthScore || growth;
            }
            catch { }
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
    async getLatestBrief(businessId) {
        return prisma_1.prisma.executiveBrief.findFirst({
            where: { businessId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getLatestOperatingPlan(businessId) {
        return prisma_1.prisma.executiveOperatingPlan.findFirst({
            where: { businessId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getLatestRoadmap(businessId) {
        return prisma_1.prisma.executiveRoadmap.findMany({
            where: { businessId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getAlerts(businessId) {
        return prisma_1.prisma.executiveAlert.findMany({
            where: { businessId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getMeetings(businessId) {
        return prisma_1.prisma.executiveMeeting.findMany({
            where: { businessId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async getDecisions(businessId) {
        return prisma_1.prisma.executiveDecision.findMany({
            where: { businessId },
            orderBy: { createdAt: 'desc' }
        });
    }
}
exports.ExecutiveBoardService = ExecutiveBoardService;
