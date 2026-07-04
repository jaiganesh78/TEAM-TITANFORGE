/**
 * Sprint 10 — AI Sales Engine & Revenue Intelligence Layer Test Suite
 * Verification of MasterSalesGraph, 14 subgraphs, deal qualification health scores,
 * playbooks, objection scripts, revenue benchmarks, snapshots, assets, and API routes.
 */

import { GeminiProvider } from '../../../../ai/providers/GeminiProvider';
import { PromptBuilder } from '../../../../ai/providers/PromptBuilder';
import { 
  ResponseParser, 
  OpportunityAnalysisSchema,
  DealQualificationsSchema,
  SalesForecastSchema
} from '../../../../ai/providers/ResponseParser';
import { createMasterSalesGraph } from './SalesWorkflow';
import { SalesEngineService } from './SalesEngineService';
import { SalesMemoryService } from './SalesMemoryService';
import { RevenueIntelligenceService } from './RevenueIntelligenceService';
import { RevenuePipelineService } from './RevenuePipelineService';
import { AIReadinessService } from './AIReadinessService';
import { prisma } from '../../database/prisma';

const TEST_BIZ_ID = 'test-sales-biz-' + Date.now();

async function createTestEnvironment(): Promise<string> {
  const org = await prisma.organization.create({ data: { name: 'Sales Engine Test Org' } });
  const biz = await prisma.business.create({
    data: {
      id: TEST_BIZ_ID,
      organizationId: org.id,
      name: 'Sales Test Corp',
      status: 'IN_PROGRESS',
      identity: {
        create: { legalName: 'Sales Test Corp Ltd', foundedYear: 2023, industry: 'Logistics SaaS', headquarters: 'New York' }
      },
      model: {
        create: { type: 'SAAS', valueProposition: 'AI-assisted routing algorithms' }
      },
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
          { domain: 'SALES', confidence: 90.0, currentState: '{"sales":"active"}', gapSeverity: 'NONE' },
          { domain: 'PRICING', confidence: 90.0, currentState: '{"pricing":"tiered"}', gapSeverity: 'NONE' },
          { domain: 'PRODUCT_PORTFOLIO', confidence: 90.0, currentState: '{"products":["routing_api"]}', gapSeverity: 'NONE' },
          { domain: 'CUSTOMER_SEGMENTS', confidence: 90.0, currentState: '{"segments":["tech"]}', gapSeverity: 'NONE' }
        ]
      }
    }
  });

  // Create required KPIs
  await prisma.businessKPI.createMany({
    data: [
      { businessId: biz.id, name: 'win_rate', currentValue: 25, targetValue: 35, unit: '%' },
      { businessId: biz.id, name: 'pipeline_velocity', currentValue: 100, targetValue: 150, unit: 'USD/day' },
      { businessId: biz.id, name: 'aov', currentValue: 1000, targetValue: 1500, unit: 'USD' }
    ]
  });

  // Create required knowledge chunks
  const chunkDomains = ['SALES', 'PRICING', 'PRODUCT_PORTFOLIO', 'CUSTOMER_SEGMENTS'];
  const chunkData = [];
  for (const domain of chunkDomains) {
    for (let i = 0; i < 10; i++) {
      chunkData.push({
        businessId: biz.id,
        source: 'mock_doc.pdf',
        sourceType: 'DOCUMENT' as any,
        tokenCount: 150,
        content: `Mock content for domain ${domain} index ${i}`,
        growthDomain: domain,
        status: 'ACTIVE' as any
      });
    }
  }
  await prisma.knowledgeChunk.createMany({ data: chunkData });

  // Create Strategy Session context
  await prisma.strategySession.create({
    data: {
      businessId: TEST_BIZ_ID,
      status: 'COMPLETED',
      contextVersion: 1,
      strategicAssets: JSON.stringify({
        strategicObjectives: ['Scale ARR to $2M', 'Optimize pricing'],
        strategicPriorities: ['Enterprise outbound expansion'],
        knownRisks: ['Slow decision maker approvals']
      })
    }
  });

  return biz.id;
}

async function cleanup(bizId: string) {
  // Find organizations associated with the business
  const biz = await prisma.business.findUnique({
    where: { id: bizId }
  });
  if (biz) {
    await prisma.organization.deleteMany({ where: { id: biz.organizationId } });
  }
  await prisma.business.deleteMany({ where: { id: bizId } });
}

function assert(condition: any, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✔ ${message}`);
}

async function runSalesTests() {
  console.log('='.repeat(60));
  console.log('STARTING SPRINT 10 — AI SALES ENGINE INTEGRATION TESTS');
  console.log('='.repeat(60));

  let bizId = '';
  const failures: string[] = [];
  let passed = 0;

  try {
    // ─────────────────────────────────────────────
    console.log('\nSetting up test environment...');
    bizId = await createTestEnvironment();
    console.log(`Test environment created: ${bizId}`);
    passed++;

    // ─────────────────────────────────────────────
    console.log('\nTest 1: MasterSalesGraph Compilation');
    const graph = createMasterSalesGraph();
    assert(graph.engine === 'sales', 'Graph engine type must be sales');
    assert(graph['order'].includes('SalesContextGraph'), 'Graph has SalesContextGraph node');
    assert(graph['order'].includes('OpportunityAnalysisGraph'), 'Graph has OpportunityAnalysisGraph node');
    assert(graph['order'].includes('ExplainabilityGraph'), 'Graph has ExplainabilityGraph node');
    passed++;

    // ─────────────────────────────────────────────
    console.log('\nTest 2: LLM Mock Generation for Sales subgraphs');
    const llm = new GeminiProvider();
    const mockRes = await llm.generateText({
      systemPrompt: 'system prompt',
      userPrompt: 'Task: opportunityname and revenuepotential expected',
      jsonMode: true
    });
    const parsed = ResponseParser.parseAndValidate(mockRes.text, OpportunityAnalysisSchema);
    assert(parsed.opportunities.length > 0, 'Opportunity mock schema parsing matches expectations');
    assert(parsed.opportunities[0].opportunityName === 'Global Logistics Expansion', 'Mock details populated');
    passed++;

    // ─────────────────────────────────────────────
    console.log('\nTest 3: Sales Engine Execution coordinator run');
    const sessionId = await SalesEngineService.runSalesEngine(bizId);
    assert(typeof sessionId === 'string', `Sales Engine runs and generates sessionId: ${sessionId}`);
    
    // Check saved sub-records
    const session = await prisma.salesSession.findUnique({
      where: { id: sessionId },
      include: {
        opportunities: {
          include: {
            dealHealths: true
          }
        },
        forecasts: true,
        playbooks: true
      }
    });

    assert(session !== null, 'SalesSession record is persisted');
    assert(session!.status === 'COMPLETED', 'SalesSession completed status verified');
    assert(session!.opportunities.length > 0, 'Opportunities successfully deserialized and mapped in DB');
    assert(session!.opportunities[0].dealHealths.length > 0, 'DealHealth qualifications populated');
    assert(session!.forecasts.length > 0, 'Forecast records mapped');
    assert(session!.playbooks.length > 0, 'Guided Playbooks successfully saved');
    passed++;

    // ─────────────────────────────────────────────
    console.log('\nTest 4: Revenue Intelligence snapshots creation');
    const snapshot = await prisma.revenueIntelligenceSnapshot.findFirst({
      where: { businessId: bizId }
    });
    assert(snapshot !== null, 'Revenue snapshot is recorded correctly');
    assert(JSON.parse(snapshot!.pipelineSummary).totalLeads === 0, 'Pipeline Summary total leads verified');
    passed++;

    // ─────────────────────────────────────────────
    console.log('\nTest 5: Reusable Revenue Assets serialization');
    const rAssets = await prisma.revenueAsset.findMany({
      where: { businessId: bizId }
    });
    assert(rAssets.length > 0, 'Revenue Assets recorded in database');
    const optAsset = rAssets.find(a => a.assetType === 'OPPORTUNITY_LIBRARY');
    assert(optAsset !== null, 'Opportunity Library asset initialized');
    passed++;

    // ─────────────────────────────────────────────
    console.log('\nTest 6: Performance benchmarks and velocity calculations');
    const benchmarks = await RevenueIntelligenceService.calculateBenchmarks(bizId);
    assert(benchmarks.averageDealSize === 50000, 'Default averageDealSize computed with empty pipeline');
    assert(benchmarks.averageSalesCycleDays === 35, 'Default sales cycle days calculated correctly');
    passed++;

    // ─────────────────────────────────────────────
    console.log('\nTest 7: Executive Revenue score ratings');
    const scores = await RevenueIntelligenceService.calculateExecutiveScores(bizId);
    assert(scores.overallExecutiveRevenueScore > 0, `Overall ratings computed: ${scores.overallExecutiveRevenueScore}`);
    passed++;

    // ─────────────────────────────────────────────
    console.log('\nTest 8: Sales Memory feedback accepted/rejected strategy tracking');
    const sessionRecs = await prisma.salesRecommendation.findMany({
      where: { sessionId }
    });
    assert(sessionRecs.length > 0, 'Session recommendations mapped');

    // Handle ACCEPT action
    await SalesEngineService.handleFeedback(bizId, sessionId, 'ACCEPT');
    const acceptedRec = await prisma.salesRecommendation.findFirst({
      where: { sessionId, status: 'APPROVED' }
    });
    assert(acceptedRec !== null, 'Recommendation APPROVED in database');

    const execPlan = await prisma.salesExecutionPlan.findFirst({
      where: { sessionId }
    });
    assert(execPlan !== null, 'Execution Plan created for accepted strategy');

    const acceptedMemory = await prisma.salesMemory.findFirst({
      where: { businessId: bizId }
    });
    assert(JSON.parse(acceptedMemory!.acceptedStrategies).length > 0, 'Approved strategy logged in long-term memory');
    passed++;

    console.log('\n' + '='.repeat(60));
    console.log(`Results: ${passed} passed, ${failures.length} failed`);
    if (failures.length === 0) {
      console.log('🎉 ALL SPRINT 10 SALES ENGINE TESTS PASSED');
    } else {
      console.log('⚠️ Failures detected:');
      failures.forEach(f => console.log(`  - ${f}`));
    }
    console.log('='.repeat(60));

  } catch (err: any) {
    console.error(`\n❌ TEST SUITE RUN EXCEPTION: ${err.message}`);
    console.error(err.stack);
    failures.push(err.message);
  } finally {
    if (bizId) {
      await cleanup(bizId);
      console.log('\n✔ Test environment cleaned up successfully');
    }
    await prisma.$disconnect();
  }

  process.exit(failures.length > 0 ? 1 : 0);
}

runSalesTests().catch(e => { console.error(e); process.exit(1); });
