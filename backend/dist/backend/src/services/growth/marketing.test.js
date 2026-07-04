"use strict";
/**
 * Sprint 8 — AI Marketing Engine Test Suite
 * Verification of MasterMarketingGraph, 13 subgraphs, multi-tier budget optimizer,
 * Customer Journey stages, Channel Readiness checklists, and previous Strategy session grounding.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const ResponseParser_1 = require("../../../../ai/providers/ResponseParser");
const MarketingWorkflow_1 = require("./MarketingWorkflow");
const MarketingEngineService_1 = require("./MarketingEngineService");
const MarketingMemoryService_1 = require("./MarketingMemoryService");
const AIReadinessService_1 = require("./AIReadinessService");
const BusinessContextService_1 = require("../knowledge/BusinessContextService");
const prisma_1 = require("../../database/prisma");
const TEST_BIZ_ID = 'test-marketing-biz-' + Date.now();
async function createTestEnvironment() {
    const org = await prisma_1.prisma.organization.create({ data: { name: 'Marketing Test Org' } });
    const biz = await prisma_1.prisma.business.create({
        data: {
            id: TEST_BIZ_ID,
            organizationId: org.id,
            name: 'Marketing Test Corp',
            status: 'IN_PROGRESS',
            identity: {
                create: { legalName: 'Marketing Test Corp Ltd', foundedYear: 2022, industry: 'SaaS', headquarters: 'San Francisco' }
            },
            model: {
                create: { type: 'SAAS', valueProposition: 'AI analytics for logistics operations' }
            },
            marketingProfile: { create: { adSpend: 8000, roi: 2.8, channelsUsed: JSON.stringify(['LinkedIn']) } },
            salesProfile: { create: { conversionRate: 12.0, pipelineValue: 300000, salesCycleDays: 45, leadsCount: 90 } },
            growthTwinSummary: {
                create: {
                    overallConfidence: 82.0,
                    coveredDomains: 7,
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
                    { domain: 'MARKETING', confidence: 90.0, currentState: '{"spend":8000}', gapSeverity: 'NONE' }
                ]
            }
        }
    });
    // Create a StrategySession and Recommendation to ground Strategic Assets
    const strategySession = await prisma_1.prisma.strategySession.create({
        data: {
            businessId: TEST_BIZ_ID,
            status: 'COMPLETED',
            contextVersion: 1,
            strategicAssets: JSON.stringify({
                strategicObjectives: ['Scale LTV:CAC Ratio to 3.5+', 'Optimize pricing strategy'],
                strategicPriorities: ['Mid-market client targeting'],
                knownRisks: ['Longer sales cycle friction']
            })
        }
    });
    await prisma_1.prisma.strategyRecommendation.create({
        data: {
            sessionId: strategySession.id,
            businessId: TEST_BIZ_ID,
            title: 'Mid-market seat expansion strategy',
            problem: 'High CAC from SMBs',
            businessContext: 'Stage is GROWTH',
            reasoning: 'LTV is higher in mid-market',
            expectedKpiImpact: '{"ltv_cac_ratio": 3.5}',
            affectedKpis: ['ltv_cac_ratio'],
            requiredData: ['Pricing metrics'],
            dependencies: [],
            priority: 'HIGH',
            confidence: 90.0,
            estimatedTimeline: '60 days',
            expectedROI: '3.5x',
            businessRisks: 'Longer cycle',
            alternativeStrategies: 'Paid ads to SMBs',
            status: 'APPROVED',
            knowledgeSources: [],
            businessFactsUsed: [],
            growthDomainsUsed: [],
            reasoningSummary: '',
            assumptions: [],
            constraints: [],
            whySelected: '',
            whyAlternativesRejected: ''
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
async function runMarketingTests() {
    console.log('\n🚀 Sprint 8 — AI Marketing Engine Integration Test Suite\n');
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
        // TEST 1: Strategy Asset Retrieval
        // ─────────────────────────────────────────────
        console.log('Test 1: Strategy Asset Retrieval');
        const context = await BusinessContextService_1.BusinessContextService.assembleContext(bizId, 'Marketing Plan Assembly');
        assert(context.businessSummary.legalName === 'Marketing Test Corp Ltd', 'BDT Identity details loaded');
        assert(context.engineContracts?.length === 6, 'All 6 Engine contracts present');
        // ─────────────────────────────────────────────
        // TEST 2: Zod Output Schema Validation
        // ─────────────────────────────────────────────
        console.log('\nTest 2: Zod Output Schema Validation');
        const mockJourneyJson = `
    {
      "awareness": { "objectives": ["CTR"], "painPoints": ["CAC"], "recommendedChannels": ["LinkedIn"], "recommendedContent": ["KPIs Guide"], "expectedKPIs": ["CTR"], "risks": ["Ad fatigue"], "opportunities": ["templates"] },
      "interest": { "objectives": [], "painPoints": [], "recommendedChannels": [], "recommendedContent": [], "expectedKPIs": [], "risks": [], "opportunities": [] },
      "consideration": { "objectives": [], "painPoints": [], "recommendedChannels": [], "recommendedContent": [], "expectedKPIs": [], "risks": [], "opportunities": [] },
      "purchase": { "objectives": [], "painPoints": [], "recommendedChannels": [], "recommendedContent": [], "expectedKPIs": [], "risks": [], "opportunities": [] },
      "onboarding": { "objectives": [], "painPoints": [], "recommendedChannels": [], "recommendedContent": [], "expectedKPIs": [], "risks": [], "opportunities": [] },
      "retention": { "objectives": [], "painPoints": [], "recommendedChannels": [], "recommendedContent": [], "expectedKPIs": [], "risks": [], "opportunities": [] },
      "advocacy": { "objectives": [], "painPoints": [], "recommendedChannels": [], "recommendedContent": [], "expectedKPIs": [], "risks": [], "opportunities": [] }
    }
    `;
        const parsedJourney = ResponseParser_1.ResponseParser.parseAndValidate(mockJourneyJson, ResponseParser_1.CustomerJourneySchema);
        assert(parsedJourney.awareness.objectives[0] === 'CTR', 'Customer Journey Stage validated successfully');
        // ─────────────────────────────────────────────
        // TEST 3: MasterMarketingGraph Execution Flow
        // ─────────────────────────────────────────────
        console.log('\nTest 3: Master Marketing Graph Execution');
        const graph = (0, MarketingWorkflow_1.createMasterMarketingGraph)();
        const session = await prisma_1.prisma.marketingSession.create({
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
            contextPackage: context,
            logs: [],
            reflectionAttempts: 0,
            confidenceScore: 0.0
        });
        assert(finalState.logs.length > 5, 'Master Graph logs captured workflow steps');
        assert(!!finalState.audienceAnalysis, 'AudienceAnalysisGraph node executed');
        assert(!!finalState.customerJourney, 'CustomerJourneyGraph node executed');
        assert(!!finalState.funnelAnalysis, 'FunnelAnalysisGraph node executed');
        assert(!!finalState.channelEvaluation, 'MarketingChannelGraph node executed');
        assert(!!finalState.creativeStrategy, 'CreativeStrategyGraph node executed');
        assert(!!finalState.budgetOptimizer, 'BudgetAllocationGraph node executed');
        assert(!!finalState.experimentPortfolio, 'ExperimentGraph node executed');
        assert(!!finalState.contentPlan, 'ContentPillarGraph node executed');
        assert(!!finalState.calendar, 'CalendarGraph node executed');
        assert((finalState.campaigns?.length ?? 0) > 0, 'CampaignStrategyGraph generated campaigns');
        // ─────────────────────────────────────────────
        // TEST 4: Marketing Engine Service Pipeline
        // ─────────────────────────────────────────────
        console.log('\nTest 4: MarketingEngineService Pipeline');
        const fullSession = await MarketingEngineService_1.MarketingEngineService.generateMarketingPlan(bizId);
        assert(fullSession.status === 'COMPLETED', 'Marketing session successfully generated and saved');
        assert(!!fullSession.audienceAnalysis, 'Saved Audience analysis text in MarketingSession record');
        assert(!!fullSession.customerJourney, 'Saved Customer journey mapping text in MarketingSession record');
        assert(!!fullSession.funnelAnalysis, 'Saved Funnel analysis text in MarketingSession record');
        assert(!!fullSession.creativeStrategy, 'Saved Creative strategy text in MarketingSession record');
        assert(!!fullSession.budgetOptimizer, 'Saved Budget Optimizer text in MarketingSession record');
        assert(!!fullSession.calendar, 'Saved Content Calendar text in MarketingSession record');
        // ─────────────────────────────────────────────
        // TEST 5: Marketing MemoryGROUNDING
        // ─────────────────────────────────────────────
        console.log('\nTest 5: Marketing Memory grounding');
        const memSummary = await MarketingMemoryService_1.MarketingMemoryService.getCampaignHistorySummary(bizId);
        assert(memSummary.includes('HISTORICAL CAMPAIGNS LOG'), 'Marketing memory initialized headers');
        assert(memSummary.includes('Predictable SaaS scaling LinkedIn Lead Gen'), 'Grounded past campaign logs');
        // ─────────────────────────────────────────────
        // TEST 6: Review Feedback & execution plans
        // ─────────────────────────────────────────────
        console.log('\nTest 6: Human Review Feedback Workflow');
        const camps = await prisma_1.prisma.marketingCampaign.findMany({ where: { businessId: bizId } });
        assert(camps.length > 0, 'Campaign records found');
        const targetCamp = camps[0];
        const approved = await MarketingEngineService_1.MarketingEngineService.submitFeedback(bizId, targetCamp.id, 'ACCEPT', 'Looks perfect, launch the LinkedIn budget ad campaign');
        assert(!!approved, 'Review feedback recorded');
        // Verify Execution Plan generated
        const execPlan = await prisma_1.prisma.marketingExecutionPlan.findFirst({ where: { campaignId: targetCamp.id } });
        assert(!!execPlan, 'MarketingExecutionPlan successfully generated');
        assert(execPlan.status === 'PENDING', 'Initial plan status set to PENDING');
        // ─────────────────────────────────────────────
        // TEST 7: Sprint 1-7 Regression compatibility
        // ─────────────────────────────────────────────
        console.log('\nTest 7: Previous Sprints Regressions');
        const readiness = await AIReadinessService_1.AIReadinessService.calculateReadiness(bizId, 'marketing-engine');
        assert(readiness.readinessScore > 30, `Readiness score checks out: ${readiness.readinessScore}`);
        console.log('\n' + '='.repeat(60));
        console.log(`Results: ${passed} passed, ${failures.length} failed`);
        if (failures.length === 0) {
            console.log('🎉 ALL MARKETING ENGINE TESTS PASSED');
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
runMarketingTests().catch(e => { console.error(e); process.exit(1); });
