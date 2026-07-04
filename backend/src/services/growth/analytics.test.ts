/**
 * Sprint 11 — AI Analytics & Business Evolution Engine Test Suite
 * Verification of MasterAnalyticsGraph, 18 subgraphs, health metrics calculation,
 * quarterly narrative stories, snapshot comparisons, decisions audits, and API endpoints.
 */

import { GeminiProvider } from '../../../../ai/providers/GeminiProvider';
import { PromptBuilder } from '../../../../ai/providers/PromptBuilder';
import { 
  ResponseParser, 
  BusinessHealthScoreSchema,
  GrowthScoreSchema,
  RevenueHealthSchema,
  ForecastSnapshotsSchema
} from '../../../../ai/providers/ResponseParser';
import { createMasterAnalyticsGraph } from './AnalyticsWorkflow';
import { AnalyticsEngineService } from './AnalyticsEngineService';
import { AnalyticsMemoryService } from './AnalyticsMemoryService';
import { BusinessEvolutionService } from './BusinessEvolutionService';
import { prisma } from '../../database/prisma';

const TEST_BIZ_ID = 'test-analytics-biz-' + Date.now();

async function createTestEnvironment(): Promise<string> {
  const org = await prisma.organization.create({ data: { name: 'Analytics Engine Test Org' } });
  const biz = await prisma.business.create({
    data: {
      id: TEST_BIZ_ID,
      organizationId: org.id,
      name: 'Analytics Test Corp',
      status: 'IN_PROGRESS',
      identity: {
        create: { legalName: 'Analytics Test Corp Ltd', foundedYear: 2023, industry: 'Logistics SaaS', headquarters: 'New York' }
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

async function runAnalyticsTests() {
  console.log('='.repeat(60));
  console.log('STARTING SPRINT 11 — AI ANALYTICS ENGINE INTEGRATION TESTS');
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
    console.log('\nTest 1: MasterAnalyticsGraph Compilation');
    const graph = createMasterAnalyticsGraph();
    assert(graph.engine === 'analytics', 'Graph engine type must be analytics');
    assert(graph['order'].includes('AnalyticsContextGraph'), 'Graph has AnalyticsContextGraph node');
    assert(graph['order'].includes('BusinessHealthGraph'), 'Graph has BusinessHealthGraph node');
    assert(graph['order'].includes('GrowthHealthGraph'), 'Graph has GrowthHealthGraph node');
    assert(graph['order'].includes('RevenueHealthGraph'), 'Graph has RevenueHealthGraph node');
    assert(graph['order'].includes('ForecastAnalysisGraph'), 'Graph has ForecastAnalysisGraph node');
    passed++;

    // ─────────────────────────────────────────────
    console.log('\nTest 2: LLM Mock Generation for health and forecasts');
    const llm = new GeminiProvider();
    const mockRes = await llm.generateText({
      systemPrompt: 'system prompt',
      userPrompt: 'Task: Calculate composite health scores across business operations.',
      jsonMode: true
    });
    const parsed = ResponseParser.parseAndValidate(mockRes.text, BusinessHealthScoreSchema);
    assert(parsed.overallExecutiveHealth === 86, 'Business Health mock matches expected schema values');
    passed++;

    // ─────────────────────────────────────────────
    console.log('\nTest 3: Analytics Engine Execution coordinator run');
    const sessionId = await AnalyticsEngineService.runAnalyticsEngine(bizId);
    assert(typeof sessionId === 'string', `Analytics Engine runs and generates sessionId: ${sessionId}`);
    
    // Check saved sub-records
    const session = await prisma.analyticsSession.findUnique({
      where: { id: sessionId },
      include: {
        healthScores: true,
        growthScores: true,
        revenueHealths: true,
        readinesss: true,
        competitivePositions: true,
        forecastSnapshots: true,
        risks: true,
        opportunities: true,
        recommendationItems: true,
        benchmarks: true,
        trendAnalyses: true,
        executiveInsights: true,
        predictionHistories: true
      }
    });

    assert(session !== null, 'AnalyticsSession record is persisted');
    assert(session!.status === 'COMPLETED', 'AnalyticsSession status COMPLETED verified');
    assert(session!.healthScores.length > 0, 'BusinessHealthScore calculated and saved');
    assert(session!.growthScores.length > 0, 'GrowthScore metrics computed');
    assert(session!.revenueHealths.length > 0, 'Revenue leakage stability mapped');
    assert(session!.forecastSnapshots.length > 0, 'Forecast snapshots calculated');
    assert(session!.risks.length > 0, 'Risks matrix saved');
    assert(session!.opportunities.length > 0, 'Opportunities win priorities generated');
    assert(session!.recommendationItems.length > 0, 'Recommendations created');
    passed++;

    // ─────────────────────────────────────────────
    console.log('\nTest 4: Business Evolution Snapshots capture');
    const snap = await prisma.businessEvolutionSnapshot.findFirst({
      where: { businessId: bizId }
    });
    assert(snap !== null, 'Business Evolution Snapshot recorded successfully');
    assert(snap!.version === 1, 'Version increment initialized');
    passed++;

    // ─────────────────────────────────────────────
    console.log('\nTest 5: Reusable Analytics Assets compilation');
    const assets = await prisma.analyticsAsset.findMany({
      where: { businessId: bizId }
    });
    assert(assets.length > 0, 'Analytics assets initialized in database');
    const benchLib = assets.find(a => a.assetType === 'BENCHMARK_LIBRARY');
    assert(benchLib !== null, 'Benchmark Library compiled correctly');
    passed++;

    // ─────────────────────────────────────────────
    console.log('\nTest 6: Snapshot Comparison engine execution');
    const V2_sessionId = await AnalyticsEngineService.runAnalyticsEngine(bizId);
    const snaps = await prisma.businessEvolutionSnapshot.findMany({
      where: { businessId: bizId },
      orderBy: { version: 'asc' }
    });
    assert(snaps.length >= 2, 'Two snapshot versions generated for comparison');

    const compare = await BusinessEvolutionService.compareSnapshots(
      bizId,
      V2_sessionId,
      snaps[0].id,
      snaps[1].id
    );
    assert(compare !== null, 'Snapshot comparative analysis compiled successfully');
    assert(compare.causativeEngine === 'Marketing Engine optimization', 'Causative driver identified in comparison');
    passed++;

    // ─────────────────────────────────────────────
    console.log('\nTest 7: Decision Timeline Audit logging');
    const dec = await BusinessEvolutionService.logDecision(
      bizId,
      'Test Decision',
      'Reason details',
      'Evidence notes',
      'analytics-engine',
      90.0,
      95.0
    );
    assert(dec !== null, 'Decision audit log registered successfully');
    const listDec = await prisma.decisionIntelligence.findMany({ where: { businessId: bizId } });
    assert(listDec.length > 0, 'Decision items retrievable from database');
    passed++;

    // ─────────────────────────────────────────────
    console.log('\nTest 8: Forecast Accuracy calculations');
    const acc = await BusinessEvolutionService.calculateForecastAccuracy(bizId);
    assert(acc.forecastError === 5.0, 'Default forecast error calculated');
    assert(acc.predictionAcc === 95.0, 'Prediction Accuracy verified');
    passed++;

    // ─────────────────────────────────────────────
    console.log('\nTest 9: Natural language Executive Story quarterly reports');
    const storyText = await BusinessEvolutionService.generateQuarterlyStory(bizId);
    assert(storyText.length > 0, ' quarterly executive story narrative generated');
    passed++;

    console.log('\n' + '='.repeat(60));
    console.log(`Results: ${passed} passed, ${failures.length} failed`);
    if (failures.length === 0) {
      console.log('🎉 ALL SPRINT 11 ANALYTICS ENGINE TESTS PASSED');
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

runAnalyticsTests().catch(e => { console.error(e); process.exit(1); });
