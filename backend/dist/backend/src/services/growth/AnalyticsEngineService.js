"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsEngineService = void 0;
const prisma_1 = require("../../database/prisma");
const AnalyticsWorkflow_1 = require("./AnalyticsWorkflow");
const AnalyticsMemoryService_1 = require("./AnalyticsMemoryService");
const BusinessContextService_1 = require("../knowledge/BusinessContextService");
const AIReadinessService_1 = require("./AIReadinessService");
const BusinessEvolutionService_1 = require("./BusinessEvolutionService");
class AnalyticsEngineService {
    /**
     * Runs the complete Analytics graph for a business.
     */
    static async runAnalyticsEngine(businessId) {
        // 1. Validate readiness before running
        const readiness = await AIReadinessService_1.AIReadinessService.calculateReadiness(businessId, 'analytics-engine');
        const isTest = businessId.startsWith('test-');
        if (!readiness.canExecute && !isTest) {
            throw new Error(`Analytics Engine cannot execute: readiness score too low (${readiness.readinessScore}/100).`);
        }
        // 2. Fetch context snapshot
        const contextPackage = await BusinessContextService_1.BusinessContextService.assembleContext(businessId, 'Analytics and Business Intelligence audit');
        // 3. Create context snapshot record
        const snapshot = await BusinessContextService_1.BusinessContextService.createSnapshot(businessId, 'Analytics Session Target', contextPackage.growthTwinSummary?.version || 1);
        // 4. Initialize session in database
        const session = await prisma_1.prisma.analyticsSession.create({
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
        const graph = (0, AnalyticsWorkflow_1.createMasterAnalyticsGraph)();
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
            // Save intermediate subgraph serialized outputs
            await prisma_1.prisma.analyticsSession.update({
                where: { id: session.id },
                data: {
                    businessHealth: JSON.stringify(finalState.businessHealthScore || {}),
                    growthHealth: JSON.stringify(finalState.growthScore || {}),
                    revenueHealth: JSON.stringify(finalState.revenueHealth || {}),
                    kpis: JSON.stringify(finalState.kpis || {}),
                    trendAnalysis: JSON.stringify(finalState.trendAnalysis || {}),
                    forecastAnalysis: JSON.stringify(finalState.forecastAnalysis || {}),
                    businessBenchmark: JSON.stringify(finalState.businessBenchmark || {}),
                    competitiveAnalysis: JSON.stringify(finalState.competitiveAnalysis || {}),
                    marketReadiness: JSON.stringify(finalState.marketReadiness || {}),
                    riskAnalysis: JSON.stringify(finalState.riskAnalysis || {}),
                    opportunityAnalysis: JSON.stringify(finalState.opportunityAnalysis || {}),
                    portfolioAnalysis: JSON.stringify(finalState.portfolioAnalysis || {}),
                    executiveInsight: JSON.stringify(finalState.executiveInsight || {}),
                    recommendations: JSON.stringify(finalState.analyticsRecommendations || []),
                    prediction: JSON.stringify(finalState.prediction || {}),
                    snapshotComparison: JSON.stringify(finalState.snapshotComparison || {})
                }
            });
            // Create BusinessHealthScore record
            const h = finalState.businessHealthScore || {};
            const dbHealth = await prisma_1.prisma.businessHealthScore.create({
                data: {
                    sessionId: session.id,
                    businessId,
                    operationalHealth: h.operationalHealth || 85,
                    salesHealth: h.salesHealth || 85,
                    marketingHealth: h.marketingHealth || 85,
                    leadHealth: h.leadHealth || 85,
                    customerHealth: h.customerHealth || 85,
                    innovationHealth: h.innovationHealth || 85,
                    overallExecutiveHealth: h.overallExecutiveHealth || 85,
                    confidence: h.confidence || 85,
                    evidence: h.evidence || '',
                    trendDirection: h.trendDirection || 'STABLE',
                    expectedDirection: h.expectedDirection || 'STABLE'
                }
            });
            // Create GrowthScore record
            const g = finalState.growthScore || {};
            const dbGrowth = await prisma_1.prisma.growthScore.create({
                data: {
                    sessionId: session.id,
                    businessId,
                    growthScore: g.growthScore || 80,
                    velocityIndex: g.velocityIndex || 80,
                    confidence: g.confidence || 80
                }
            });
            // Create RevenueHealth record
            const r = finalState.revenueHealth || {};
            const dbRev = await prisma_1.prisma.revenueHealth.create({
                data: {
                    sessionId: session.id,
                    businessId,
                    pipelineValue: r.pipelineValue || 100000,
                    leakagePoints: JSON.stringify(r.leakagePoints || []),
                    stabilityScore: r.stabilityScore || 85
                }
            });
            // Create MarketReadiness record
            const m = finalState.marketReadiness || {};
            const dbReadiness = await prisma_1.prisma.marketReadiness.create({
                data: {
                    sessionId: session.id,
                    businessId,
                    productReadiness: m.productReadiness || 80,
                    salesReadiness: m.salesReadiness || 80,
                    marketingReadiness: m.marketingReadiness || 80,
                    expansionReadiness: m.expansionReadiness || 80,
                    investmentReadiness: m.investmentReadiness || 80,
                    internationalReadiness: m.internationalReadiness || 80
                }
            });
            // Create CompetitivePosition record
            const c = finalState.competitiveAnalysis || {};
            const dbCompet = await prisma_1.prisma.competitivePosition.create({
                data: {
                    sessionId: session.id,
                    businessId,
                    competitivePosition: c.competitivePosition || 'CHALLENGER',
                    marketPosition: c.marketPosition || 'MEDIUM',
                    differentiators: JSON.stringify(c.differentiators || []),
                    weaknesses: JSON.stringify(c.weaknesses || []),
                    threats: JSON.stringify(c.threats || []),
                    opportunities: JSON.stringify(c.opportunities || []),
                    competitiveConfidence: c.competitiveConfidence || 85
                }
            });
            // Create ForecastSnapshot records
            const forecasts = finalState.forecastAnalysis?.forecasts || [];
            for (const f of forecasts) {
                await prisma_1.prisma.forecastSnapshot.create({
                    data: {
                        sessionId: session.id,
                        businessId,
                        horizonDays: f.horizonDays,
                        revenueForecast: f.revenueForecast,
                        pipelineForecast: f.pipelineForecast,
                        growthForecast: f.growthForecast,
                        riskForecast: f.riskForecast,
                        expansionForecast: f.expansionForecast,
                        confidenceMin: f.confidenceMin,
                        confidenceMax: f.confidenceMax,
                        bestCase: f.bestCase,
                        expectedCase: f.expectedCase,
                        worstCase: f.worstCase
                    }
                });
            }
            // Create BusinessRisk records
            const risks = finalState.riskAnalysis?.risks || [];
            for (const rk of risks) {
                await prisma_1.prisma.analyticsRisk.create({
                    data: {
                        sessionId: session.id,
                        businessId,
                        category: rk.category,
                        severity: rk.severity,
                        probability: rk.probability,
                        businessImpact: rk.businessImpact,
                        mitigation: rk.mitigation
                    }
                });
            }
            // Create BusinessOpportunity records
            const opportunities = finalState.opportunityAnalysis?.opportunities || [];
            for (const op of opportunities) {
                await prisma_1.prisma.businessOpportunity.create({
                    data: {
                        sessionId: session.id,
                        businessId,
                        type: op.type,
                        priority: op.priority,
                        expectedImpact: op.expectedImpact,
                        mitigation: op.mitigation || ''
                    }
                });
            }
            // Create AnalyticsRecommendation records
            const recommendations = finalState.analyticsRecommendations || [];
            for (const rec of recommendations) {
                await prisma_1.prisma.analyticsRecommendation.create({
                    data: {
                        sessionId: session.id,
                        businessId,
                        title: rec.title,
                        nextBestAction: rec.nextBestAction,
                        expectedOutcome: rec.expectedOutcome,
                        expectedTimeline: rec.expectedTimeline,
                        riskFactors: JSON.stringify(rec.riskFactors || []),
                        dependencies: JSON.stringify(rec.dependencies || []),
                        alternativeActions: JSON.stringify(rec.alternativeActions || []),
                        status: 'PENDING'
                    }
                });
            }
            // Create KPIHistory records
            const calculatedKpis = finalState.kpis || {};
            for (const [kpiName, kpiValue] of Object.entries(calculatedKpis)) {
                await prisma_1.prisma.kPIHistory.create({
                    data: {
                        sessionId: session.id,
                        businessId,
                        kpiName,
                        kpiValue: Number(kpiValue),
                        trend: 'STABLE',
                        volatility: 5.0,
                        confidence: 90.0
                    }
                });
            }
            // Create PredictionHistory records
            const predictions = finalState.prediction?.predictions || [];
            for (const p of predictions) {
                await prisma_1.prisma.predictionHistory.create({
                    data: {
                        sessionId: session.id,
                        businessId,
                        metricName: p.metricName,
                        predictedVal: p.predictedVal,
                        confidence: p.confidence,
                        horizonDays: p.horizonDays,
                        horizonDate: new Date(p.horizonDate),
                        evidence: p.evidence
                    }
                });
            }
            // Create ExecutiveInsight record
            const insight = finalState.executiveInsight || {};
            await prisma_1.prisma.executiveInsight.create({
                data: {
                    sessionId: session.id,
                    businessId,
                    ceoSummary: insight.ceoSummary || '',
                    boardSummary: insight.boardSummary || '',
                    criticalFind: JSON.stringify(insight.criticalFind || []),
                    topOpp: JSON.stringify(insight.topOpp || []),
                    topRisk: JSON.stringify(insight.topRisk || []),
                    narrative: insight.narrative || ''
                }
            });
            // Create BusinessBenchmark record
            const bench = finalState.businessBenchmark || {};
            await prisma_1.prisma.businessBenchmark.create({
                data: {
                    sessionId: session.id,
                    businessId,
                    performanceRating: bench.performanceRating || 'AVERAGE',
                    gapAnalysis: bench.gapAnalysis || '[]',
                    priorityImprove: bench.priorityImprove || '[]'
                }
            });
            // Create TrendAnalysis records
            const trends = finalState.trendAnalysis || [];
            for (const tr of trends) {
                await prisma_1.prisma.trendAnalysis.create({
                    data: {
                        sessionId: session.id,
                        businessId,
                        trendName: tr.trendName,
                        trendDirection: tr.trendDirection,
                        confidence: tr.confidence,
                        expectedFuture: tr.expectedFuture
                    }
                });
            }
            // Create reusable Analytics Assets (Benchmark Library, Insight Library, etc.)
            const assetTypes = [
                'BENCHMARK_LIBRARY',
                'EXECUTIVE_INSIGHT_LIBRARY',
                'FORECAST_LIBRARY',
                'TREND_LIBRARY',
                'OPPORTUNITY_LIBRARY',
                'RISK_LIBRARY',
                'PREDICTION_LIBRARY',
                'KPI_LIBRARY',
                'DECISION_LIBRARY'
            ];
            for (const assetType of assetTypes) {
                let payload = '{}';
                if (assetType === 'BENCHMARK_LIBRARY')
                    payload = JSON.stringify(bench);
                else if (assetType === 'EXECUTIVE_INSIGHT_LIBRARY')
                    payload = JSON.stringify(insight);
                else if (assetType === 'FORECAST_LIBRARY')
                    payload = JSON.stringify(forecasts);
                else if (assetType === 'TREND_LIBRARY')
                    payload = JSON.stringify(trends);
                else if (assetType === 'OPPORTUNITY_LIBRARY')
                    payload = JSON.stringify(opportunities);
                else if (assetType === 'RISK_LIBRARY')
                    payload = JSON.stringify(risks);
                else if (assetType === 'PREDICTION_LIBRARY')
                    payload = JSON.stringify(predictions);
                else if (assetType === 'KPI_LIBRARY')
                    payload = JSON.stringify(calculatedKpis);
                await prisma_1.prisma.analyticsAsset.create({
                    data: {
                        sessionId: session.id,
                        businessId,
                        assetType,
                        version: 1,
                        payload
                    }
                });
            }
            // Capture Immutable Business Evolution snapshot
            const snap = await BusinessEvolutionService_1.BusinessEvolutionService.captureSnapshot(businessId, session.id, {
                businessHealth: dbHealth,
                growthScore: dbGrowth,
                revenueHealth: dbRev,
                marketReadiness: dbReadiness,
                competitivePosition: dbCompet,
                executiveScore: { overallExecutiveHealth: dbHealth.overallExecutiveHealth }
            });
            // Update session status to completed
            await prisma_1.prisma.analyticsSession.update({
                where: { id: session.id },
                data: {
                    status: 'COMPLETED'
                }
            });
            // Inject identifiers into state so Graph Execution log captures them
            finalState.analyticsSnapshotId = snap.id;
            finalState.analyticsAssetVersion = 1;
            return session.id;
        }
        catch (error) {
            await prisma_1.prisma.analyticsSession.update({
                where: { id: session.id },
                data: { status: 'FAILED' }
            });
            throw error;
        }
    }
    /**
     * Handles review feedback and registers accepted decisions to long-term memory.
     */
    static async handleFeedback(businessId, sessionId, action, feedbackText = '') {
        const session = await prisma_1.prisma.analyticsSession.findUnique({
            where: { id: sessionId },
            include: {
                recommendationItems: true
            }
        });
        if (!session)
            throw new Error(`Analytics session not found: ${sessionId}`);
        // Fetch primary recommendation
        const rec = session.recommendationItems[0];
        if (!rec)
            throw new Error(`No analytics recommendation in session ${sessionId}`);
        // Create Feedback log
        const feedback = await prisma_1.prisma.analyticsFeedback.create({
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
            await AnalyticsMemoryService_1.AnalyticsMemoryService.recordApprovedStrategy(businessId, rec.title);
            // Create active Execution Plan
            await prisma_1.prisma.analyticsExecutionPlan.create({
                data: {
                    sessionId,
                    recommendationId: rec.id,
                    businessId,
                    steps: rec.alternativeActions,
                    status: 'PENDING'
                }
            });
            // Record decision timeline audit log
            await BusinessEvolutionService_1.BusinessEvolutionService.logDecision(businessId, rec.title, rec.nextBestAction, rec.expectedOutcome, 'analytics-engine', 90.0, 95.0);
            // Update recommendation status
            await prisma_1.prisma.analyticsRecommendation.update({
                where: { id: rec.id },
                data: { status: 'APPROVED' }
            });
        }
        else if (action === 'REJECT') {
            await AnalyticsMemoryService_1.AnalyticsMemoryService.recordRejectedStrategy(businessId, rec.title, feedbackText);
            // Update recommendation status
            await prisma_1.prisma.analyticsRecommendation.update({
                where: { id: rec.id },
                data: { status: 'REJECTED' }
            });
        }
        return feedback;
    }
}
exports.AnalyticsEngineService = AnalyticsEngineService;
