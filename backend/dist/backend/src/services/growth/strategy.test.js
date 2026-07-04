"use strict";
/**
 * Sprint 7 — AI Strategy Engine Test Suite
 * Verification of Gemini Providers, LangGraph subgraphs, structured Zod output validation,
 * strategy memory groundings, API session tracks, and Sprint 5-6 regressions.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const GeminiProvider_1 = require("../../../../ai/providers/GeminiProvider");
const ResponseParser_1 = require("../../../../ai/providers/ResponseParser");
const StrategyWorkflow_1 = require("./StrategyWorkflow");
const StrategyEngineService_1 = require("./StrategyEngineService");
const StrategyMemoryService_1 = require("./StrategyMemoryService");
const AIReadinessService_1 = require("./AIReadinessService");
const BusinessContextService_1 = require("../knowledge/BusinessContextService");
const prisma_1 = require("../../database/prisma");
const TEST_BIZ_ID = 'test-strategy-biz-' + Date.now();
async function createTestEnvironment() {
    const org = await prisma_1.prisma.organization.create({ data: { name: 'Strategy Test Org' } });
    const biz = await prisma_1.prisma.business.create({
        data: {
            id: TEST_BIZ_ID,
            organizationId: org.id,
            name: 'Strategy Test Corp',
            status: 'IN_PROGRESS',
            identity: {
                create: { legalName: 'Strategy Test Corp Ltd', foundedYear: 2022, industry: 'SaaS', headquarters: 'New York' }
            },
            model: {
                create: { type: 'SAAS', valueProposition: 'AI orchestration for B2B supply chains' }
            },
            marketingProfile: { create: { adSpend: 15000, roi: 3.5, channelsUsed: JSON.stringify(['Google', 'LinkedIn']) } },
            salesProfile: { create: { conversionRate: 15.0, pipelineValue: 500000, salesCycleDays: 30, leadsCount: 120 } },
            growthTwinSummary: {
                create: {
                    overallConfidence: 85.0,
                    coveredDomains: 8,
                    totalDomains: 17,
                    sectorSlug: 'saas',
                    businessStage: 'GROWTH',
                    businessModelType: 'SAAS'
                }
            },
            growthDomainStates: {
                create: [
                    { domain: 'BUSINESS_FOUNDATION', confidence: 90.0, currentState: '{"name":"Factual foundation"}', gapSeverity: 'NONE' },
                    { domain: 'MARKET_POSITION', confidence: 80.0, currentState: '{"market":"Growing SaaS"}', gapSeverity: 'LOW' },
                    { domain: 'BRAND_POSITIONING', confidence: 85.0, currentState: '{"brand":"Strong"}', gapSeverity: 'NONE' },
                    { domain: 'MARKETING', confidence: 90.0, currentState: '{"spend":15000}', gapSeverity: 'NONE' },
                    { domain: 'SALES', confidence: 85.0, currentState: '{"pipeline":500000}', gapSeverity: 'NONE' },
                    { domain: 'PRICING', confidence: 80.0, currentState: '{"price":99}', gapSeverity: 'LOW' },
                    { domain: 'GROWTH_METRICS', confidence: 90.0, currentState: '{"cac":200}', gapSeverity: 'NONE' },
                    { domain: 'BUSINESS_CONSTRAINTS', confidence: 75.0, currentState: '{"limits":"team size"}', gapSeverity: 'MEDIUM' }
                ]
            }
        }
    });
    return biz.id;
}
async function cleanup(bizId) {
    const biz = await prisma_1.prisma.business.findUnique({ where: { id: bizId }, include: { organization: true } });
    if (biz) {
        await prisma_1.prisma.organization.delete({ where: { id: biz.organizationId } });
    }
}
async function runStrategyTests() {
    console.log('\n🚀 Sprint 7 — AI Strategy Engine Integration Test Suite\n');
    console.log('='.repeat(60));
    let bizId = '';
    const failures = [];
    let passed = 0;
    function assert(condition, label) {
        if (!condition) {
            failures.push(label);
            console.log(`  ❌ FAIL: ${label}`);
        }
        else {
            passed++;
            console.log(`  ✔ ${label}`);
        }
    }
    try {
        bizId = await createTestEnvironment();
        console.log(`\n✔ Test environment initialized: ${bizId}\n`);
        // ─────────────────────────────────────────────
        // TEST 1: Gemini Provider Text Generation
        // ─────────────────────────────────────────────
        console.log('Test 1: Gemini Provider Text Generation (mock fallback check)');
        const provider = new GeminiProvider_1.GeminiProvider();
        const txtResponse = await provider.generateText({
            userPrompt: 'Tell me a strategic quick win'
        });
        assert(txtResponse.text.length > 5, 'Gemini text generation returned content');
        assert(txtResponse.usage.totalTokens > 0, 'Gemini usage stats tracked');
        // ─────────────────────────────────────────────
        // TEST 2: Structured Output Schema Validation
        // ─────────────────────────────────────────────
        console.log('\nTest 2: Structured Zod Output Schema Validation');
        const mockSwotJson = `
    {
      "strengths": [{ "item": "Strong SaaS core", "evidence": "digital twin model", "confidence": 95 }],
      "weaknesses": [{ "item": "Low capital runway", "evidence": "financial summary", "confidence": 85 }],
      "opportunities": [{ "item": "Market integration", "evidence": "retail sector trend", "confidence": 75 }],
      "threats": [{ "item": "VC funded rival", "evidence": "competitors profiling", "confidence": 90 }]
    }
    `;
        const parsedSwot = ResponseParser_1.ResponseParser.parseAndValidate(mockSwotJson, ResponseParser_1.SwotSchema);
        assert(parsedSwot.strengths.length === 1, 'SWOT schema parsed strengths correctly');
        assert(parsedSwot.weaknesses[0].confidence === 85, 'SWOT confidence bounds validated');
        // ─────────────────────────────────────────────
        // TEST 3: Context Retrieval Assembler
        // ─────────────────────────────────────────────
        console.log('\nTest 3: Context Retrieval — BusinessContextService extended');
        const ctxPackage = await BusinessContextService_1.BusinessContextService.assembleContext(bizId, 'Context mapping evaluation');
        assert(ctxPackage.businessSummary.legalName === 'Strategy Test Corp Ltd', 'Legal name resolved correctly');
        assert((ctxPackage.growthDomainStates?.length ?? 0) > 0, `Assembled ${ctxPackage.growthDomainStates?.length} GDT domains`);
        assert(!!ctxPackage.sectorConfig, 'SaaS Sector Config linked correctly');
        assert(ctxPackage.engineContracts?.length === 6, 'Linked all 6 AI Engine Contracts');
        // ─────────────────────────────────────────────
        // TEST 4: Master Graph Orchestration & Execution
        // ─────────────────────────────────────────────
        console.log('\nTest 4: Master Strategy Graph Execution Flow');
        const graph = (0, StrategyWorkflow_1.createMasterStrategyGraph)();
        const session = await prisma_1.prisma.strategySession.create({
            data: {
                businessId: bizId,
                status: 'IN_PROGRESS',
                contextVersion: 1
            }
        });
        const finalState = await graph.execute({
            businessId: bizId,
            sessionId: session.id,
            contextVersion: 1,
            kpis: {},
            gaps: {},
            readinessReport: { canExecute: true },
            contextPackage: ctxPackage,
            logs: [],
            reflectionAttempts: 0,
            confidenceScore: 0.0
        });
        assert(finalState.logs.length > 5, 'Master Graph logs captured step actions');
        assert(!!finalState.marketResearch, 'MarketResearchGraph node completed');
        assert(!!finalState.competitorAnalysis, 'CompetitorAnalysisGraph node completed');
        assert(!!finalState.swot, 'SWOTGraph node completed');
        assert(!!finalState.pricing, 'PricingGraph node completed');
        assert((finalState.recommendations?.length ?? 0) > 0, 'RecommendationGraph generated recommendations');
        assert(finalState.reflectionAttempts > 0, `ReflectionGraph node ran critique iterations: ${finalState.reflectionAttempts}`);
        // Verify Graph observability logs in database
        const nodeLogs = await prisma_1.prisma.graphNodeOutput.findMany({ where: { sessionId: session.id } });
        assert(nodeLogs.length > 0, `Recorded ${nodeLogs.length} GraphNodeOutput traces`);
        const runLogs = await prisma_1.prisma.graphExecutionLog.findMany({ where: { sessionId: session.id } });
        assert(runLogs[0].status === 'SUCCESS', 'GraphExecutionLog marked SUCCESS');
        assert(runLogs[0].totalDurationMs > 0, `Recorded total execution time: ${runLogs[0].totalDurationMs}ms`);
        // ─────────────────────────────────────────────
        // TEST 5: Strategy Engine Service Generator
        // ─────────────────────────────────────────────
        console.log('\nTest 5: StrategyEngineService Execution Pipeline');
        const fullSession = await StrategyEngineService_1.StrategyEngineService.generateStrategy(bizId);
        assert(fullSession.status === 'COMPLETED', 'Execution pipeline generated COMPLETED StrategySession');
        // Verify sync to AI Operating Context
        const aiCtx = await prisma_1.prisma.aIOperatingContext.findUnique({ where: { businessId: bizId } });
        assert(!!aiCtx, 'AI Operating Context created');
        assert(JSON.parse(aiCtx.activeGoals).length > 0, 'Synced strategic goals');
        assert(JSON.parse(aiCtx.currentPriorities).length > 0, 'Synced strategic priorities');
        assert(aiCtx.contextVersion > 0, `Context Version synchronized: V${aiCtx.contextVersion}`);
        // ─────────────────────────────────────────────
        // TEST 6: Memory Module grounding
        // ─────────────────────────────────────────────
        console.log('\nTest 6: Strategy Memory Grounding');
        const memorySummary = await StrategyMemoryService_1.StrategyMemoryService.getStrategyMemorySummary(bizId);
        assert(memorySummary.includes('HISTORICAL DECISION LOG'), 'Memory summary header resolved');
        assert(memorySummary.includes('Re-align SaaS ICP to mid-market accounts'), 'Memory grounded past recommendations');
        // ─────────────────────────────────────────────
        // TEST 7: Human Review Feedback Workflow
        // ─────────────────────────────────────────────
        console.log('\nTest 7: Human Review Actions');
        const dbRecs = await prisma_1.prisma.strategyRecommendation.findMany({ where: { businessId: bizId } });
        assert(dbRecs.length > 0, 'Fetched generated recommendations');
        const targetRec = dbRecs[0];
        const approved = await StrategyEngineService_1.StrategyEngineService.submitFeedback(bizId, targetRec.id, 'ACCEPT', 'This mid-market strategy looks great, let us launch next week');
        assert(approved.status === 'APPROVED', 'Recommendation marked APPROVED');
        // Verify Execution Plan generated
        const plan = await prisma_1.prisma.strategyExecutionPlan.findFirst({ where: { recommendationId: targetRec.id } });
        assert(!!plan, 'StrategyExecutionPlan generated upon approval');
        assert(plan.status === 'PENDING', 'Initial execution plan status marked PENDING');
        // ─────────────────────────────────────────────
        // TEST 8: Sprint 5 & 6 Regression Compatibility
        // ─────────────────────────────────────────────
        console.log('\nTest 8: Sprints 5 & 6 Regressions');
        const readiness = await AIReadinessService_1.AIReadinessService.calculateReadiness(bizId, 'strategy-engine');
        assert(readiness.readinessScore > 30, `Readiness score computed correctly: ${readiness.readinessScore}`);
        const { DiscoveryEngine } = await Promise.resolve().then(() => __importStar(require('../discovery/DiscoveryEngine')));
        const discoveryState = await DiscoveryEngine.evaluateState(bizId);
        assert(typeof discoveryState.overallCoverage === 'number', 'DiscoveryEngine evaluateState coverage checked');
        console.log('\n' + '='.repeat(60));
        console.log(`Results: ${passed} passed, ${failures.length} failed`);
        if (failures.length === 0) {
            console.log('🎉 ALL STRATEGY ENGINE TESTS PASSED');
        }
        else {
            console.log('⚠️  Failures detected:');
            failures.forEach(f => console.log(`  - ${f}`));
        }
        console.log('='.repeat(60));
    }
    catch (err) {
        console.error(`\n❌ TEST SUITE RUN EXCEPTION: ${err.message}`);
        console.error(err.stack);
        failures.push(err.message);
    }
    finally {
        if (bizId) {
            await cleanup(bizId);
            console.log('\n✔ Test environment cleaned up successfully');
        }
        await prisma_1.prisma.$disconnect();
    }
    process.exit(failures.length > 0 ? 1 : 0);
}
runStrategyTests().catch(e => { console.error(e); process.exit(1); });
