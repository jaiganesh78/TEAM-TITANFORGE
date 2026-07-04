/**
 * Sprint 13 — AI Executive Board & Governance Engine Test Suite
 * Validation of MasterExecutiveBoardGraph, Pluggable Representative aggregators,
 * Decision Impact simulations, drill-down KPI Trees, consensus vote auditing,
 * and meeting logging.
 */

import { ExecutiveBoardService } from './ExecutiveBoardService';
import { EXECUTIVE_REPRESENTATIVES } from '../../engines/ExecutiveRepresentative';
import { prisma } from '../../database/prisma';

const TEST_BIZ_ID = 'test-board-biz-' + Date.now();
const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
  console.log(`  ✔ [PASS] ${message}`);
};

async function createTestEnvironment(): Promise<string> {
  const org = await prisma.organization.create({ data: { name: 'Executive Board Test Org' } });
  const biz = await prisma.business.create({
    data: {
      id: TEST_BIZ_ID,
      organizationId: org.id,
      name: 'Executive Board Test Corp',
      status: 'IN_PROGRESS',
      identity: {
        create: { legalName: 'Board Test Corp Ltd', foundedYear: 2024, industry: 'Cold Chain Logistics SaaS', headquarters: 'Miami' }
      },
      model: {
        create: { type: 'SAAS', valueProposition: 'Real-time telemetry edge routing solutions' }
      }
    }
  });

  // 1. Analytics Session and Business Evolution Snapshot
  const analyticsSession = await prisma.analyticsSession.create({
    data: {
      businessId: TEST_BIZ_ID,
      status: 'COMPLETED'
    }
  });

  await prisma.businessEvolutionSnapshot.create({
    data: {
      sessionId: analyticsSession.id,
      businessId: TEST_BIZ_ID,
      version: 1,
      businessHealth: JSON.stringify({ overallHealth: 88 }),
      growthScore: JSON.stringify({ growthScore: 80 }),
      revenueHealth: JSON.stringify({ revenueHealth: 84 }),
      marketReadiness: JSON.stringify({ marketReadiness: 82 }),
      competitivePosition: '{}',
      executiveScore: '{}',
      acceptedStrategies: '[]',
      rejectedStrategies: '[]',
      majorKpiValues: '[]',
      revenuePipelineState: '[]',
      digitalTwinConfidence: 80.0,
      knowledgeHealth: '{}'
    }
  });

  // 2. Customer Success Session, Digital Twin and Health Score
  const csSession = await prisma.customerSuccessSession.create({
    data: {
      businessId: TEST_BIZ_ID,
      status: 'COMPLETED'
    }
  });

  const csTwin = await prisma.customerDigitalTwin.create({
    data: {
      sessionId: csSession.id,
      businessId: TEST_BIZ_ID,
      name: 'CS Test Corp Digital Twin',
      profileData: JSON.stringify({ companyName: 'CS Test Corp', industry: 'Cold Chain', stage: 'GROWTH' }),
      productsPurchased: JSON.stringify([]),
      customerGoals: JSON.stringify([]),
      businessOutcomes: JSON.stringify([]),
      usagePatterns: JSON.stringify([]),
      featureAdoption: JSON.stringify([]),
      relationHealth: 85,
      satisfactionScore: 90,
      revenueContribution: 120000,
      executiveSponsor: 'John Doe',
      riskRegister: JSON.stringify([]),
      version: 1
    }
  });

  await prisma.customerSuccessScore.create({
    data: {
      sessionId: csSession.id,
      businessId: TEST_BIZ_ID,
      twinId: csTwin.id,
      healthScore: 89.0,
      relationshipStrength: 86.0,
      valueDelivered: 88.0,
      renewalConfidence: 91.0,
      expansionPotential: 85.0,
      executiveSatisfaction: 90.0,
      overallScore: 88.0
    }
  });

  return biz.id;
}

async function cleanup(bizId: string) {
  // Cascades and cleans up test records
  const org = await prisma.business.findUnique({ where: { id: bizId } });
  if (org) {
    await prisma.business.delete({ where: { id: bizId } });
    await prisma.organization.delete({ where: { id: org.organizationId } });
  }
}

async function runExecutiveBoardTests() {
  console.log('='.repeat(60));
  console.log('🏁 STARTING SPRINT 13 EXECUTIVE AI BOARD TESTS');
  console.log('='.repeat(60) + '\n');

  let bizId = '';
  let passed = 0;
  const failures: string[] = [];

  try {
    // Setup
    console.log('Creating board environment...');
    bizId = await createTestEnvironment();
    console.log(`Test business initialized: ${bizId}\n`);

    const boardService = new ExecutiveBoardService();

    // ────────────────────────────────────────────────────────
    // 1. VALIDATE PLUGGABLE REPRESENTATIVE adapter contracts
    // ────────────────────────────────────────────────────────
    console.log('Test Case 1: Pluggable Representative Adapter Contract Aggregations');
    assert(EXECUTIVE_REPRESENTATIVES.length === 6, 'Six engine representatives registered');
    
    for (const rep of EXECUTIVE_REPRESENTATIVES) {
      const summary = await rep.summarize(bizId);
      assert(summary.engineName === rep.engineName, `Representative ${rep.engineName} summarize returned name`);
      assert(summary.confidence > 0 && summary.confidence <= 100, `Representative ${rep.engineName} summary confidence score valid`);
      assert(Array.isArray(summary.recommendedActions), `Representative ${rep.engineName} summary recommendedActions array valid`);
      assert(Array.isArray(summary.topRisks), `Representative ${rep.engineName} summary topRisks array valid`);
    }
    passed++;

    // ────────────────────────────────────────────────────────
    // 2. VALIDATE MASTER EXECUTIVE BOARD ORCHESTRATION GRAPH
    // ────────────────────────────────────────────────────────
    console.log('\nTest Case 2: Master Executive Board Orchestration Pipeline');
    const result = await boardService.runBoardOrchestration(bizId);
    
    assert(result.status === 'COMPLETED', 'Board session execution reports completed status');
    assert(result.sessionId !== undefined, 'Board session ID returned');
    assert(result.brief !== undefined, 'Executive Morning Brief returned');
    assert(result.brief.businessHealth === 86.5, 'Brief businessHealth matches mock index projections');
    assert(result.recommendations.length > 0, 'Orchestration produced recommendations list');
    assert(result.conflicts.length > 0, 'Orchestration detected conflicts list');
    assert(result.consensus.length > 0, 'Orchestration debate resolved consensus list');

    // Verify DB records persisted
    const dbBrief = await prisma.executiveBrief.findFirst({ where: { businessId: bizId } });
    assert(dbBrief !== null, 'ExecutiveBrief persisted in database');
    assert(JSON.parse(dbBrief!.topRisks).includes('SLA latency disputes'), 'Brief persisted topRisks correctly');

    const dbRecs = await prisma.executiveRecommendation.findMany({ where: { businessId: bizId } });
    assert(dbRecs.length > 0, 'ExecutiveRecommendation entries persisted in database');

    const dbConflicts = await prisma.executiveConflict.findMany({ where: { businessId: bizId } });
    assert(dbConflicts.length > 0, 'ExecutiveConflict entries persisted in database');

    const dbOperatingPlan = await prisma.executiveOperatingPlan.findFirst({ where: { businessId: bizId } });
    assert(dbOperatingPlan !== null, 'ExecutiveOperatingPlan persisted in database');

    const dbRoadmap = await prisma.executiveRoadmap.findMany({ where: { businessId: bizId } });
    assert(dbRoadmap.length > 0, 'ExecutiveRoadmap entries persisted in database');

    const dbMeeting = await prisma.executiveMeeting.findFirst({ where: { businessId: bizId } });
    assert(dbMeeting !== null, 'ExecutiveMeeting log persisted in database');
    passed++;

    // ────────────────────────────────────────────────────────
    // 3. VALIDATE EXECUTIVE DECISION SIMULATOR
    // ────────────────────────────────────────────────────────
    console.log('\nTest Case 3: Executive Decision Simulator Projections');
    const simResult = await boardService.simulateDecision(bizId, 'Increase marketing ad spend by 25%');
    
    assert(simResult !== undefined, 'Decision simulation projection returned');
    assert(simResult.confidence === 86.0, 'Simulated projection confidence score verified');
    assert(simResult.revenueImpact.includes('$45,000'), 'Revenue impact matches simulated projections');
    assert(simResult.engineDisagreements.length > 0, 'Engine disagreements recorded in simulation');

    const dbDecision = await prisma.executiveDecision.findFirst({ where: { businessId: bizId } });
    assert(dbDecision !== null, 'ExecutiveDecision trace persisted in database');
    passed++;

    // ────────────────────────────────────────────────────────
    // 4. VALIDATE KPI TREE BUILDERS
    // ────────────────────────────────────────────────────────
    console.log('\nTest Case 4: Hierarchical KPI Tree Builder');
    const tree = await boardService.getKPITree(bizId);
    
    assert(tree.name === 'Business Health Index', 'KPI tree root node name verified');
    assert(tree.metricKey === 'overall_health', 'KPI tree root key verified');
    assert(tree.value === '88%', 'Root value calculated from business snapshot overallHealth');
    assert(tree.children !== undefined && tree.children.length === 2, 'Root KPI tree has two primary categories');
    
    if (tree.children) {
      const growthCat = tree.children[0];
      assert(growthCat.name === 'Growth Performance', 'First category is Growth Performance');
      assert(growthCat.value === '80%', 'Growth Performance value matches snapshot metrics');
      assert(growthCat.children !== undefined && growthCat.children.length === 2, 'Growth Performance categories drill-down values valid');

      const csCat = tree.children[1];
      assert(csCat.name === 'Customer Success', 'Second category is Customer Success');
      assert(csCat.value === '88%', 'Customer Success value matches scores metrics');
    }
    passed++;

    console.log('\n' + '='.repeat(60));
    console.log(`Results: ${passed} passed, ${failures.length} failed`);
    if (failures.length === 0) {
      console.log('🎉 ALL SPRINT 13 EXECUTIVE BOARD TESTS PASSED');
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

runExecutiveBoardTests().catch(e => { console.error(e); process.exit(1); });
