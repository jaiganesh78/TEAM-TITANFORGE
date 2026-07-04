/**
 * Sprint 6 — Growth Digital Twin Architecture Test Suite
 * Tests: Growth Twin sync, AI Readiness, Sector Config, Engine Contracts,
 *        KPI Registry, Knowledge Tagging, Discovery Explanation
 *        + Regression: Sprint 4 & 5 compatibility
 */

import { GrowthTwinService } from './GrowthTwinService';
import { AIReadinessService } from './AIReadinessService';
import { SectorManager } from '../../config/sectors';
import { KPIRegistry } from '../../config/kpis';
import { ALL_ENGINE_CONTRACTS, getEngineContract } from '../../engines/contracts';
import { DiscoveryExplainer } from '../discovery/DiscoveryFlowEngine';
import { QUESTION_LIBRARY } from '../discovery/QuestionLibrary';
import { prisma } from '../../database/prisma';

const TEST_BUSINESS_ID = 'test-growth-business-' + Date.now();

async function createTestBusiness(): Promise<string> {
  const org = await prisma.organization.create({ data: { name: 'Growth Test Org' } });
  const biz = await prisma.business.create({
    data: {
      organizationId: org.id,
      name: 'Growth Test Business',
      status: 'IN_PROGRESS',
      identity: {
        create: { legalName: 'Growth Test Ltd', foundedYear: 2021, industry: 'SaaS', headquarters: 'London' }
      },
      marketingProfile: { create: { adSpend: 10000, roi: 3.2, channelsUsed: JSON.stringify(['LinkedIn', 'SEO']) } },
      salesProfile: { create: { conversionRate: 12.5, pipelineValue: 250000, salesCycleDays: 45, leadsCount: 80 } },
      goals: { create: [{ title: 'Reach $100K MRR', description: 'Grow ARR to $1.2M within 18 months', progress: 0.3 }] },
      risks: { create: [{ title: 'Churn risk', likelihood: 'MEDIUM', impact: 'HIGH' }] },
      kpis: { create: [{ name: 'MRR', currentValue: 45000, targetValue: 100000, unit: 'USD' }] }
    }
  });
  return biz.id;
}

async function cleanup(businessId: string) {
  const biz = await prisma.business.findUnique({ where: { id: businessId }, include: { organization: true } });
  if (biz) {
    await prisma.organization.delete({ where: { id: biz.organizationId } });
  }
}

async function runTests() {
  console.log('\n🚀 Sprint 6 — Growth Digital Twin Architecture Test Suite\n');
  console.log('='.repeat(60));

  let businessId: string = '';
  const failures: string[] = [];

  try {
    businessId = await createTestBusiness();
    console.log(`\n✔ Created test business: ${businessId}\n`);

    // ─────────────────────────────────────────────
    // TEST 1: Growth Domain State Initialization
    // ─────────────────────────────────────────────
    console.log('Test 1: Growth Domain State Initialization');
    await GrowthTwinService.initDomains(businessId);
    const domains = await GrowthTwinService.getDomains(businessId);
    if (domains.length !== 17) {
      throw new Error(`Expected 17 domains, got ${domains.length}`);
    }
    console.log(`  ✔ All 17 Growth Domains initialized`);

    // ─────────────────────────────────────────────
    // TEST 2: Growth Twin Sync from Business Digital Twin
    // ─────────────────────────────────────────────
    console.log('Test 2: Growth Twin Sync from Business Digital Twin');
    await GrowthTwinService.syncFromBusinessTwin(businessId);
    const summary = await GrowthTwinService.getSummary(businessId);
    if (!summary) throw new Error('Summary not created');
    if (summary.coveredDomains === 0) throw new Error('No domains covered after sync');
    console.log(`  ✔ Synced — covered domains: ${summary.coveredDomains}/17`);
    console.log(`  ✔ Overall confidence: ${summary.overallConfidence}%`);

    // ─────────────────────────────────────────────
    // TEST 3: Gap Computation
    // ─────────────────────────────────────────────
    console.log('Test 3: Gap Computation — currentState vs desiredState');
    await GrowthTwinService.syncDomain(businessId, 'MARKETING', {
      currentState: { adSpend: 10000, roas: 2.1 },
      desiredState: { adSpend: 10000, roas: 4.0, channels: ['LinkedIn', 'Google'] },
      changedBy: 'USER'
    });
    const marketingDomain = (await GrowthTwinService.getDomains(businessId)).find(d => d.domain === 'MARKETING');
    if (!marketingDomain?.gap) throw new Error('Gap not computed');
    const gap = JSON.parse(marketingDomain.gap);
    if (!Array.isArray(gap) || gap.length === 0) throw new Error('Gap array empty');
    console.log(`  ✔ Gap computed: ${gap.length} items detected`);
    console.log(`  ✔ Gap severity: ${marketingDomain.gapSeverity}`);

    // ─────────────────────────────────────────────
    // TEST 4: Domain History
    // ─────────────────────────────────────────────
    console.log('Test 4: Domain History — append-only audit trail');
    const history = await GrowthTwinService.getHistory(businessId, 'MARKETING');
    if (history.length === 0) throw new Error('No history recorded');
    console.log(`  ✔ ${history.length} history record(s) for MARKETING domain`);

    // ─────────────────────────────────────────────
    // TEST 5: AI Operating Context
    // ─────────────────────────────────────────────
    console.log('Test 5: AI Operating Context — layer isolation');
    const context = await GrowthTwinService.getAIOperatingContext(businessId);
    if (!context || !context.id) throw new Error('AI Operating Context not created');
    console.log(`  ✔ AI Operating Context created: ${context.id}`);
    console.log(`  ✔ Context version: ${context.contextVersion}`);

    // ─────────────────────────────────────────────
    // TEST 6: Sector Configuration
    // ─────────────────────────────────────────────
    console.log('Test 6: Sector Configuration — SectorManager');
    const sectors = SectorManager.getAllSectors();
    if (sectors.length < 5) throw new Error(`Expected 5+ sectors, got ${sectors.length}`);
    const saas = SectorManager.getSector('saas');
    if (!saas || saas.slug !== 'saas') throw new Error('SaaS sector not found');
    if (!saas.futureAIPromptTemplates['strategy-engine']) throw new Error('SaaS has no strategy engine prompt template');
    if (saas.marketingChannels.length === 0) throw new Error('SaaS has no marketing channels');
    console.log(`  ✔ ${sectors.length} sectors loaded`);
    console.log(`  ✔ SaaS marketing channels: ${saas.marketingChannels.length}`);
    console.log(`  ✔ SaaS AI prompt templates: ${Object.keys(saas.futureAIPromptTemplates).length}`);

    // ─────────────────────────────────────────────
    // TEST 7: KPI Registry
    // ─────────────────────────────────────────────
    console.log('Test 7: KPI Registry — definitions and health ranges');
    const kpis = KPIRegistry.getAll();
    if (kpis.length < 15) throw new Error(`Expected 15 KPIs, got ${kpis.length}`);
    const cac = KPIRegistry.getBySlug('cac');
    if (!cac) throw new Error('CAC KPI not found');
    if (!cac.healthyRange || !cac.warningRange || !cac.criticalRange) throw new Error('CAC ranges missing');
    const health = KPIRegistry.getHealthStatus('cac', 200);
    if (health !== 'HEALTHY') throw new Error(`Expected HEALTHY, got ${health}`);
    const critical = KPIRegistry.getHealthStatus('cac', 1000);
    if (critical !== 'CRITICAL') throw new Error(`Expected CRITICAL, got ${critical}`);
    console.log(`  ✔ ${kpis.length} KPIs in registry`);
    console.log(`  ✔ Health status check: 200 → ${health}, 1000 → ${critical}`);

    // ─────────────────────────────────────────────
    // TEST 8: Engine Contracts
    // ─────────────────────────────────────────────
    console.log('Test 8: Engine Contracts — 6 engines defined');
    if (ALL_ENGINE_CONTRACTS.length !== 6) throw new Error(`Expected 6 contracts, got ${ALL_ENGINE_CONTRACTS.length}`);
    const strategyContract = getEngineContract('strategy-engine');
    if (!strategyContract) throw new Error('Strategy Engine contract not found');
    if (strategyContract.futureDebateParticipants.length === 0) throw new Error('No debate participants defined');
    if (!strategyContract.confidenceRequirements.minimum) throw new Error('No confidence requirement');
    for (const contract of ALL_ENGINE_CONTRACTS) {
      if (!contract.failureConditions.length) throw new Error(`${contract.id} has no failure conditions`);
    }
    console.log(`  ✔ ${ALL_ENGINE_CONTRACTS.length} engine contracts loaded`);
    console.log(`  ✔ Strategy Engine debate participants: ${strategyContract.futureDebateParticipants.join(', ')}`);
    console.log(`  ✔ All engines have failure conditions`);

    // ─────────────────────────────────────────────
    // TEST 9: AI Readiness Service
    // ─────────────────────────────────────────────
    console.log('Test 9: AI Readiness Service — per-engine scores');
    const readinessReports = await AIReadinessService.calculateAllReadiness(businessId);
    if (readinessReports.length !== 6) throw new Error(`Expected 6 reports, got ${readinessReports.length}`);
    for (const report of readinessReports) {
      if (report.readinessScore < 0 || report.readinessScore > 100) {
        throw new Error(`Invalid readiness score for ${report.engineId}: ${report.readinessScore}`);
      }
      if (!Array.isArray(report.recommendations)) throw new Error(`No recommendations for ${report.engineId}`);
    }
    console.log(`  ✔ All 6 engine readiness reports computed`);
    readinessReports.forEach(r => {
      console.log(`  ✔ ${r.engineName}: ${r.readinessScore}/100 (${r.canExecute ? 'READY' : 'NOT READY'})`);
    });

    // ─────────────────────────────────────────────
    // TEST 10: Discovery Explanation
    // ─────────────────────────────────────────────
    console.log('Test 10: Discovery Explanation — ExplainedQuestion generation');
    const explained = DiscoveryExplainer.computeNextQuestions({
      businessId,
      sectorSlug: 'saas',
      businessStage: 'GROWTH',
      answeredQuestionIds: []
    }, 5);
    if (explained.length === 0) throw new Error('No explained questions returned');
    const firstQ = explained[0];
    if (!firstQ.whyItMatters) throw new Error('whyItMatters missing');
    if (!firstQ.whichEngineNeedsIt) throw new Error('whichEngineNeedsIt missing');
    if (firstQ.expectedConfidenceImprovement < 0) throw new Error('Invalid confidence improvement');
    console.log(`  ✔ ${explained.length} explained questions returned`);
    console.log(`  ✔ First question: "${firstQ.question.title}"`);
    console.log(`  ✔ Engine: ${firstQ.whichEngineNeedsIt}`);

    // ─────────────────────────────────────────────
    // TEST 11: Question Library Backward Compatibility
    // ─────────────────────────────────────────────
    console.log('Test 11: QuestionLibrary — backward compatibility');
    const allQuestions = QUESTION_LIBRARY;
    if (allQuestions.length < 10) throw new Error(`Question library too small: ${allQuestions.length}`);
    const firstQuestion = allQuestions[0];
    if (!firstQuestion.id || !firstQuestion.title || !firstQuestion.dbPath) {
      throw new Error('Required question fields missing');
    }
    console.log(`  ✔ ${allQuestions.length} questions in library`);
    console.log(`  ✔ Backward-compatible fields present`);
    const withGrowthMeta = allQuestions.filter(q => q.growthDomain !== undefined);
    console.log(`  ✔ ${withGrowthMeta.length} questions enriched with growth metadata`);

    // ─────────────────────────────────────────────
    // TEST 12: Regression — Discovery Engine evaluateState
    // ─────────────────────────────────────────────
    console.log('Test 12: Regression — DiscoveryEngine.evaluateState()');
    const { DiscoveryEngine } = await import('../discovery/DiscoveryEngine');
    const state = await DiscoveryEngine.evaluateState(businessId);
    if (typeof state.overallCoverage !== 'number') throw new Error('overallCoverage missing');
    if (!Array.isArray(state.activeQuestions)) throw new Error('activeQuestions missing');
    console.log(`  ✔ Discovery state evaluated: coverage=${state.overallCoverage}%`);
    console.log(`  ✔ Active questions: ${state.activeQuestions.length}`);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 ALL 12 TESTS PASSED — Sprint 6 Growth Architecture Verified');
    console.log('='.repeat(60));

  } catch (err: any) {
    failures.push(err.message);
    console.error(`\n❌ TEST FAILED: ${err.message}`);
    console.error(err.stack);
  } finally {
    if (businessId) {
      await cleanup(businessId);
      console.log('\n✔ Test data cleaned up');
    }
    await prisma.$disconnect();
  }

  if (failures.length > 0) {
    console.log(`\n⚠️  ${failures.length} test(s) failed:`);
    failures.forEach(f => console.log(`  - ${f}`));
    process.exit(1);
  }
}

runTests().catch(e => {
  console.error(e);
  process.exit(1);
});
