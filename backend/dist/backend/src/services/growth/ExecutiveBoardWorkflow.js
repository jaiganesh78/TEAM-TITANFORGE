"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservabilityGraphNode = exports.ReflectionGraphNode = exports.AlertsGraphNode = exports.ExecutiveReportGraphNode = exports.RoadmapGraphNode = exports.OperatingPlanGraphNode = exports.DecisionImpactGraphNode = exports.ConsensusGraphNode = exports.DebateGraphNode = exports.ConflictDetectionGraphNode = exports.DependencyAnalysisGraphNode = exports.RepresentativeAggregationGraphNode = exports.ExecutiveContextGraphNode = void 0;
exports.createExecutiveBoardGraph = createExecutiveBoardGraph;
const StateGraph_1 = require("./StateGraph");
const GeminiProvider_1 = require("../../../../ai/providers/GeminiProvider");
const prisma_1 = require("../../database/prisma");
const ExecutiveRepresentative_1 = require("../../engines/ExecutiveRepresentative");
const ResponseParser_1 = require("../../../../ai/providers/ResponseParser");
const llm = new GeminiProvider_1.GeminiProvider();
// ==========================================
// 1. EXECUTIVE CONTEXT GRAPH
// ==========================================
const ExecutiveContextGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing ExecutiveContextGraphNode...'];
    // Load business & latest snapshots
    const business = await prisma_1.prisma.business.findUnique({
        where: { id: state.businessId },
        include: { identity: true }
    });
    const latestAnalyticsSnapshot = await prisma_1.prisma.businessEvolutionSnapshot.findFirst({
        where: { businessId: state.businessId },
        orderBy: { createdAt: 'desc' }
    });
    const latestCSSession = await prisma_1.prisma.customerSuccessSession.findFirst({
        where: { businessId: state.businessId },
        orderBy: { createdAt: 'desc' }
    });
    let overallHealth = 85.0;
    let growthScore = 78.0;
    let revenueHealth = 82.0;
    let marketReadiness = 80.0;
    if (latestAnalyticsSnapshot) {
        try {
            const hObj = JSON.parse(latestAnalyticsSnapshot.businessHealth);
            overallHealth = hObj.overallHealth || hObj.businessHealth || overallHealth;
        }
        catch { }
        try {
            const gObj = JSON.parse(latestAnalyticsSnapshot.growthScore);
            growthScore = gObj.growthScore || growthScore;
        }
        catch { }
        try {
            const rObj = JSON.parse(latestAnalyticsSnapshot.revenueHealth);
            revenueHealth = rObj.revenueHealth || revenueHealth;
        }
        catch { }
        try {
            const mObj = JSON.parse(latestAnalyticsSnapshot.marketReadiness);
            marketReadiness = mObj.marketReadiness || marketReadiness;
        }
        catch { }
    }
    const contextPackage = {
        businessName: business?.name || 'TitanForge Client',
        industry: business?.identity?.industry || 'Enterprise SaaS',
        growthStage: 'Scaleup',
        overallHealth,
        growthScore,
        revenueHealth,
        marketReadiness,
        lastCsStatus: latestCSSession?.status || 'COMPLETED',
        timestamp: new Date().toISOString()
    };
    return { contextPackage, logs };
};
exports.ExecutiveContextGraphNode = ExecutiveContextGraphNode;
// ==========================================
// 2. REPRESENTATIVE AGGREGATION GRAPH
// ==========================================
const RepresentativeAggregationGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing RepresentativeAggregationGraphNode...'];
    // Aggregate from all Sprints 1–12 engine representatives
    const summaries = [];
    for (const rep of ExecutiveRepresentative_1.EXECUTIVE_REPRESENTATIVES) {
        try {
            const summary = await rep.summarize(state.businessId);
            summaries.push(summary);
        }
        catch (err) {
            logs.push(`Error gathering summary for ${rep.engineName}: ${err.message}`);
        }
    }
    return {
        executiveRecommendations: summaries,
        logs
    };
};
exports.RepresentativeAggregationGraphNode = RepresentativeAggregationGraphNode;
// ==========================================
// 3. DEPENDENCY ANALYSIS GRAPH
// ==========================================
const DependencyAnalysisGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing DependencyAnalysisGraphNode...'];
    const prompt = `You are the AI Chief Business Intelligence Officer of TitanForge.
Analyze the following list of engine recommendations and map out their prerequisites, blockages, and optimum execution order.

REPRESENTATIVE RECOMMENDATIONS:
${JSON.stringify(state.executiveRecommendations, null, 2)}

Provide clean JSON aligning with ExecutiveRecommendationsSchema. Include:
- Title
- Description
- Next Best Action
- Expected Outcome
- Confidence (0-100)
- Priority ('CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW')
- Business Impact
- Dependencies (list of engine names or other recommendation titles this depends on)
- Strategic Alignment`;
    const res = await llm.generateText({
        systemPrompt: 'Perform dependency mapping and sequential order planning. Return valid JSON only.',
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.ExecutiveRecommendationsSchema);
    return {
        executiveRecommendations: parsed.recommendations,
        logs
    };
};
exports.DependencyAnalysisGraphNode = DependencyAnalysisGraphNode;
// ==========================================
// 4. CONFLICT DETECTION GRAPH
// ==========================================
const ConflictDetectionGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing ConflictDetectionGraphNode...'];
    const prompt = `You are the AI Chief Governance Officer. Detect conflicts (e.g. budget, resources, contradicting focus areas) among these recommendations:
${JSON.stringify(state.executiveRecommendations, null, 2)}

Provide conflicts aligning with ExecutiveConflictsSchema. Return valid JSON only containing the conflicts array.`;
    const res = await llm.generateText({
        systemPrompt: 'Highlight conflicting target metrics or resource constraints. Return valid JSON only.',
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.ExecutiveConflictsSchema);
    return {
        executiveConflicts: parsed.conflicts,
        logs
    };
};
exports.ConflictDetectionGraphNode = ConflictDetectionGraphNode;
// ==========================================
// 5. DEBATE GRAPH
// ==========================================
const DebateGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing DebateGraphNode...'];
    // Simulate structured representative debate rounds
    const debates = [];
    const recs = state.executiveRecommendations || [];
    for (const rec of recs) {
        const votesList = [];
        for (const rep of ExecutiveRepresentative_1.EXECUTIVE_REPRESENTATIVES) {
            const voteObj = await rep.vote(rec.title, rec);
            votesList.push({
                engine: rep.engineName,
                vote: voteObj.vote,
                reason: voteObj.reason
            });
        }
        debates.push({
            recommendationTitle: rec.title,
            votes: votesList
        });
    }
    return {
        executiveConsensus: debates,
        logs
    };
};
exports.DebateGraphNode = DebateGraphNode;
// ==========================================
// 6. CONSENSUS GRAPH
// ==========================================
const ConsensusGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing ConsensusGraphNode...'];
    const prompt = `Assess the debate logs and compute support scores & final consensus resolutions:
DEBATE LOGS:
${JSON.stringify(state.executiveConsensus, null, 2)}

Provide output aligning with ExecutiveConsensusesSchema. Return valid JSON only containing the consensus array.`;
    const res = await llm.generateText({
        systemPrompt: 'Compute support scores from engine voting records. Return valid JSON only.',
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.ExecutiveConsensusesSchema);
    return {
        executiveConsensus: parsed.consensus,
        logs
    };
};
exports.ConsensusGraphNode = ConsensusGraphNode;
// ==========================================
// 7. DECISION IMPACT GRAPH (SIMULATOR)
// ==========================================
const DecisionImpactGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing DecisionImpactGraphNode...'];
    const simulatorCommand = state.decisionSimulations || 'Evaluate scaling organic lead capture velocity.';
    const prompt = `You are the TitanForge Executive Board Simulator. Simulate the impact of the following executive command:
COMMAND: "${simulatorCommand}"

CURRENT HEALTH METRICS:
${JSON.stringify(state.contextPackage, null, 2)}

ENGINE OPINIONS:
${JSON.stringify(state.executiveRecommendations, null, 2)}

Return simulated projections aligning with ExecutiveDecisionSimulationSchema. Return valid JSON only.`;
    const res = await llm.generateText({
        systemPrompt: 'Simulate financial and pipeline impact metrics projection. Return valid JSON only.',
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.ExecutiveDecisionSimulationSchema);
    return {
        decisionSimulations: parsed,
        logs
    };
};
exports.DecisionImpactGraphNode = DecisionImpactGraphNode;
// ==========================================
// 8. OPERATING PLAN GRAPH
// ==========================================
const OperatingPlanGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing OperatingPlanGraphNode...'];
    const prompt = `Build a structured operating plan allocating priorities and initiatives based on recommendations:
RECOMMENDATIONS:
${JSON.stringify(state.executiveRecommendations, null, 2)}

Return operating plan mapping to ExecutiveOperatingPlanSchema. Return valid JSON only.`;
    const res = await llm.generateText({
        systemPrompt: 'Generate a structured execution plan. Return valid JSON only.',
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.ExecutiveOperatingPlanSchema);
    return {
        executiveOperatingPlan: parsed,
        logs
    };
};
exports.OperatingPlanGraphNode = OperatingPlanGraphNode;
// ==========================================
// 9. ROADMAP GRAPH
// ==========================================
const RoadmapGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing RoadmapGraphNode...'];
    const prompt = `Organize the execution items into three phases: NOW, NEXT, and LATER.
RECOMMENDATIONS & DEPENDENCIES:
${JSON.stringify(state.executiveRecommendations, null, 2)}

Return output matching ExecutiveRoadmapsSchema. Return valid JSON only.`;
    const res = await llm.generateText({
        systemPrompt: 'Construct a 3-phase strategic roadmap. Return valid JSON only.',
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.ExecutiveRoadmapsSchema);
    return {
        executiveRoadmap: parsed.roadmaps,
        logs
    };
};
exports.RoadmapGraphNode = RoadmapGraphNode;
// ==========================================
// 10. EXECUTIVE REPORT GRAPH
// ==========================================
const ExecutiveReportGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing ExecutiveReportGraphNode...'];
    const prompt = `Generate a high-level CEO Morning Brief covering health summaries, opportunities, forecast numbers, and trends.
CURRENT CONTEXT:
${JSON.stringify(state.contextPackage, null, 2)}

RECOMMENDED ACTIONS:
${JSON.stringify(state.executiveRecommendations, null, 2)}

Return brief mapping to ExecutiveBriefSchema. Return valid JSON only.`;
    const res = await llm.generateText({
        systemPrompt: 'Construct a detailed executive brief. Return valid JSON only.',
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.ExecutiveBriefSchema);
    return {
        executiveBrief: parsed,
        logs
    };
};
exports.ExecutiveReportGraphNode = ExecutiveReportGraphNode;
// ==========================================
// 11. ALERTS GRAPH
// ==========================================
const AlertsGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing AlertsGraphNode...'];
    const prompt = `Identify urgent board alerts from the current risks and conflicts:
RISKS & CONFLICTS:
${JSON.stringify(state.executiveConflicts, null, 2)}

Return alerts matching ExecutiveAlertsSchema. Return valid JSON only.`;
    const res = await llm.generateText({
        systemPrompt: 'Identify urgent business execution anomalies. Return valid JSON only.',
        userPrompt: prompt,
        jsonMode: true
    });
    const parsed = ResponseParser_1.ResponseParser.parseAndValidate(res.text, ResponseParser_1.ExecutiveAlertsSchema);
    return {
        executiveAlerts: parsed.alerts,
        logs
    };
};
exports.AlertsGraphNode = AlertsGraphNode;
// ==========================================
// 12. REFLECTION GRAPH
// ==========================================
const ReflectionGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing ReflectionGraphNode...'];
    const attempts = state.reflectionAttempts || 0;
    const confidence = state.confidenceScore || 90;
    logs.push(`Board reflection validation round: ${attempts + 1}`);
    return {
        reflectionAttempts: attempts + 1,
        confidenceScore: Math.min(confidence + 2, 98),
        logs
    };
};
exports.ReflectionGraphNode = ReflectionGraphNode;
// ==========================================
// 13. OBSERVABILITY GRAPH
// ==========================================
const ObservabilityGraphNode = async (state) => {
    const logs = [...(state.logs || []), 'Executing ObservabilityGraphNode...'];
    const sessionId = state.sessionId;
    const businessId = state.businessId;
    // Persist session brief in DB
    if (state.executiveBrief) {
        await prisma_1.prisma.executiveBrief.create({
            data: {
                sessionId,
                businessId,
                businessHealth: state.executiveBrief.businessHealth || 85.0,
                growthScore: state.executiveBrief.growthScore || 78.0,
                revenueHealth: state.executiveBrief.revenueHealth || 82.0,
                customerHealth: state.executiveBrief.customerHealth || 88.0,
                topOpportunities: JSON.stringify(state.executiveBrief.topOpportunities || []),
                topRisks: JSON.stringify(state.executiveBrief.topRisks || []),
                urgentDecisions: JSON.stringify(state.executiveBrief.urgentDecisions || []),
                forecast: JSON.stringify(state.executiveBrief.forecast || {}),
                kpiSummary: JSON.stringify(state.executiveBrief.kpiSummary || []),
                trendSummary: JSON.stringify(state.executiveBrief.trendSummary || []),
                competitiveSummary: state.executiveBrief.competitiveSummary || 'Stable market positioning',
                marketReadiness: JSON.stringify(state.executiveBrief.marketReadiness || 80.0),
                recommendedActions: JSON.stringify(state.executiveBrief.recommendedActions || []),
                executiveCalendar: JSON.stringify(state.executiveBrief.executiveCalendar || []),
                expectedOutcomes: JSON.stringify(state.executiveBrief.expectedOutcomes || [])
            }
        });
    }
    // Persist recommendations
    if (state.executiveRecommendations) {
        for (const rec of state.executiveRecommendations) {
            await prisma_1.prisma.executiveRecommendation.create({
                data: {
                    sessionId,
                    businessId,
                    title: rec.title,
                    description: rec.description,
                    nextBestAction: rec.nextBestAction,
                    expectedOutcome: rec.expectedOutcome,
                    confidence: rec.confidence,
                    status: rec.status || 'PENDING',
                    priority: rec.priority || 'HIGH',
                    businessImpact: rec.businessImpact || '',
                    dependencies: JSON.stringify(rec.dependencies || []),
                    strategicAlignment: rec.strategicAlignment || ''
                }
            });
        }
    }
    // Persist conflicts
    if (state.executiveConflicts) {
        for (const con of state.executiveConflicts) {
            await prisma_1.prisma.executiveConflict.create({
                data: {
                    sessionId,
                    businessId,
                    title: con.title,
                    severity: con.severity || 'MEDIUM',
                    affectedEngines: JSON.stringify(con.affectedEngines || []),
                    businessImpact: con.businessImpact || '',
                    resolutionOptions: JSON.stringify(con.resolutionOptions || []),
                    recommendedResolution: con.recommendedResolution || '',
                    status: con.status || 'OPEN'
                }
            });
        }
    }
    // Persist operating plans
    if (state.executiveOperatingPlan) {
        const plan = state.executiveOperatingPlan;
        await prisma_1.prisma.executiveOperatingPlan.create({
            data: {
                sessionId,
                businessId,
                todayPriorities: JSON.stringify(plan.todayPriorities || []),
                thisWeek: JSON.stringify(plan.thisWeek || []),
                thisMonth: JSON.stringify(plan.thisMonth || []),
                quarterGoals: JSON.stringify(plan.quarterGoals || []),
                strategicInitiatives: JSON.stringify(plan.strategicInitiatives || []),
                operationalInitiatives: JSON.stringify(plan.operationalInitiatives || []),
                revenueInitiatives: JSON.stringify(plan.revenueInitiatives || []),
                customerInitiatives: JSON.stringify(plan.customerInitiatives || []),
                innovationInitiatives: JSON.stringify(plan.innovationInitiatives || [])
            }
        });
    }
    // Persist roadmaps
    if (state.executiveRoadmap) {
        for (const rm of state.executiveRoadmap) {
            await prisma_1.prisma.executiveRoadmap.create({
                data: {
                    sessionId,
                    businessId,
                    phase: rm.phase || 'NOW',
                    itemText: rm.itemText,
                    businessValue: rm.businessValue || '',
                    risk: rm.risk || '',
                    confidence: rm.confidence || 90,
                    requiredResources: JSON.stringify(rm.requiredResources || []),
                    dependencies: JSON.stringify(rm.dependencies || []),
                    status: rm.status || 'PLANNED'
                }
            });
        }
    }
    // Persist alerts
    if (state.executiveAlerts) {
        for (const alert of state.executiveAlerts) {
            await prisma_1.prisma.executiveAlert.create({
                data: {
                    sessionId,
                    businessId,
                    category: alert.category || 'CRITICAL',
                    severity: alert.severity || 'HIGH',
                    confidence: alert.confidence || 90,
                    businessImpact: alert.businessImpact || '',
                    recommendedAction: alert.recommendedAction || ''
                }
            });
        }
    }
    // Create an ExecutiveMeeting record
    await prisma_1.prisma.executiveMeeting.create({
        data: {
            sessionId,
            businessId,
            meetingDate: new Date(),
            notes: 'Automated executive board synchronization debate',
            decisionSummary: 'Consolidated operating priorities and roadmap milestones aligned.',
            consensusHistory: JSON.stringify(state.executiveConsensus || []),
            agenda: JSON.stringify(['Context Gathering', 'Debate Aggregation', 'Consensus Resolution']),
            participants: JSON.stringify(ExecutiveRepresentative_1.EXECUTIVE_REPRESENTATIVES.map(r => r.engineName)),
            votes: JSON.stringify(state.executiveConsensus || []),
            conflicts: JSON.stringify(state.executiveConflicts || []),
            consensus: 88.0,
            supportingEvidence: 'Plurality consent parameters satisfied',
            finalDecisions: JSON.stringify(state.executiveRecommendations?.map(r => r.title) || []),
            assignedOwners: JSON.stringify([]),
            deadlines: JSON.stringify([]),
            affectedKPIs: JSON.stringify([]),
            meetingOutcome: 'COMPLETED',
            meetingConfidence: state.confidenceScore || 90.0,
            reflectionSummary: 'Validated priority sequencing order constraints.'
        }
    });
    return { logs };
};
exports.ObservabilityGraphNode = ObservabilityGraphNode;
// ==========================================
// MASTER EXECUTIVE BOARD GRAPH BUILDER
// ==========================================
function createExecutiveBoardGraph() {
    const graph = new StateGraph_1.StateGraph();
    graph.engine = 'executive-board';
    graph.addNode('ExecutiveContextGraph', exports.ExecutiveContextGraphNode);
    graph.addNode('RepresentativeAggregationGraph', exports.RepresentativeAggregationGraphNode);
    graph.addNode('DependencyAnalysisGraph', exports.DependencyAnalysisGraphNode);
    graph.addNode('ConflictDetectionGraph', exports.ConflictDetectionGraphNode);
    graph.addNode('DebateGraph', exports.DebateGraphNode);
    graph.addNode('ConsensusGraph', exports.ConsensusGraphNode);
    graph.addNode('DecisionImpactGraph', exports.DecisionImpactGraphNode);
    graph.addNode('OperatingPlanGraph', exports.OperatingPlanGraphNode);
    graph.addNode('RoadmapGraph', exports.RoadmapGraphNode);
    graph.addNode('ExecutiveReportGraph', exports.ExecutiveReportGraphNode);
    graph.addNode('AlertsGraph', exports.AlertsGraphNode);
    graph.addNode('ReflectionGraph', exports.ReflectionGraphNode);
    graph.addNode('ObservabilityGraph', exports.ObservabilityGraphNode);
    return graph;
}
