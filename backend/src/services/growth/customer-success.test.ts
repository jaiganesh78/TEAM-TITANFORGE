/**
 * Sprint 12 — AI Customer Success Engine & Value Realization Layer Test Suite
 * Validation of MasterCustomerSuccessGraph, 20 subgraphs, Customer Digital Twins,
 * Value Realization outcomes, 360 Customer timelines, playbooks synchronization,
 * and portfolio benchmarks.
 */

import { GeminiProvider } from '../../../../ai/providers/GeminiProvider';
import { 
  ResponseParser, 
  CustomerHealthSchema,
  RenewalForecastSchema,
  ChurnPredictionSchema,
  CustomerValueRealizationSchema
} from '../../../../ai/providers/ResponseParser';
import { createMasterCustomerSuccessGraph } from './CustomerSuccessWorkflow';
import { CustomerSuccessService } from './CustomerSuccessService';
import { CustomerValueRealizationService } from './CustomerValueRealizationService';
import { RevenuePipelineService } from './RevenuePipelineService';
import { prisma } from '../../database/prisma';

const TEST_BIZ_ID = 'test-cs-biz-' + Date.now();
const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
  console.log(`  ✔ [PASS] ${message}`);
};

async function createTestEnvironment(): Promise<string> {
  const org = await prisma.organization.create({ data: { name: 'Customer Success Test Org' } });
  const biz = await prisma.business.create({
    data: {
      id: TEST_BIZ_ID,
      organizationId: org.id,
      name: 'Customer Success Test Corp',
      status: 'IN_PROGRESS',
      identity: {
        create: { legalName: 'CS Test Corp Ltd', foundedYear: 2024, industry: 'Cold Chain Logistics SaaS', headquarters: 'Miami' }
      },
      model: {
        create: { type: 'SAAS', valueProposition: 'Real-time telemetry edge routing solutions' }
      }
    }
  });

  // Create Strategy Session context
  await prisma.strategySession.create({
    data: {
      businessId: biz.id,
      status: 'COMPLETED',
      contextVersion: 1,
      strategicAssets: JSON.stringify({
        strategicObjectives: ['Reduce latency by 15%', 'Integrate telematics API'],
        strategicPriorities: ['Enterprise outbound expansion'],
        knownRisks: ['SLA latency disputes']
      })
    }
  });

  // Initialize Revenue Operating Layer pipeline & stages
  const pipeline = await RevenuePipelineService.initializePipeline(biz.id, 'B2B Enterprise Pipeline');
  const stages = await prisma.revenuePipelineStage.findMany({ where: { pipelineId: pipeline.id } });
  const prospectStage = stages.find(s => s.stageName === 'Prospect') || stages[0];

  // Create Lead Session
  const leadSession = await prisma.leadSession.create({
    data: {
      businessId: biz.id,
      status: 'COMPLETED'
    }
  });

  // Create Lead Profile to verify closed-won link
  await prisma.leadProfile.create({
    data: {
      sessionId: leadSession.id,
      businessId: biz.id,
      pipelineId: pipeline.id,
      stageId: prospectStage.id,
      companyName: 'ColdChain Express Logistics',
      industry: 'Logistics',
      companySize: '300 employees',
      revenueRange: '$10M-$50M ARR',
      decisionMakers: '[]',
      painPoints: '[]',
      techStack: '[]',
      buyingIntent: 'HIGH',
      budgetLevel: 30000,
      growthStage: 'Growth',
      expectedLtv: 120000.0,
      expectedCac: 30000.0,
      confidence: 90.0,
      evidence: 'Consistent telematics enquiries'
    }
  });

  // Create Customer Success Session
  await prisma.customerSuccessSession.create({
    data: {
      id: 'initial-run-setup',
      businessId: biz.id,
      status: 'SUCCESS'
    }
  });

  // Setup initial Customer Digital Twin
  await prisma.customerDigitalTwin.create({
    data: {
      businessId: biz.id,
      sessionId: 'initial-run-setup',
      name: 'ColdChain Express Logistics',
      profileData: JSON.stringify({ segment: 'Cold-chain Distribution', tier: 'Gold' }),
      productsPurchased: JSON.stringify(['routing_api', 'dispatch_dashboard']),
      customerGoals: JSON.stringify(['Reduce latency by 15%', 'Integrate telematics API']),
      businessOutcomes: JSON.stringify(['Staging latency dropped 12%']),
      usagePatterns: JSON.stringify({ activeDaysPerWeek: 7, dailyQueries: 4800, monthlyActiveUsers: 36 }),
      featureAdoption: JSON.stringify({ telemetry: 90.0, edge_routing: 45.0 }),
      relationHealth: 88.0,
      satisfactionScore: 84.0,
      revenueContribution: 120000.0,
      executiveSponsor: 'Sarah Jenkins (VP IT Operations)',
      riskRegister: JSON.stringify(['Slow legacy integrations compatibility'])
    }
  });

  return biz.id;
}

async function cleanup(bizId: string) {
  // Cascading deletes clean up database tables cleanly
  const biz = await prisma.business.findUnique({ where: { id: bizId } });
  if (biz) {
    await prisma.business.delete({ where: { id: bizId } });
    await prisma.organization.delete({ where: { id: biz.organizationId } });
  }
}

async function runCustomerSuccessTests() {
  console.log('='.repeat(60));
  console.log('STARTING SPRINT 12 — CUSTOMER SUCCESS ENGINE INTEGRATION TESTS');
  console.log('='.repeat(60));

  let passed = 0;
  const failures: string[] = [];
  let bizId = '';

  try {
    // Setup environment
    bizId = await createTestEnvironment();
    console.log(`\n✔ Test environment initialized with business ID: ${bizId}`);

    // ─────────────────────────────────────────────
    console.log('\nTest 1: MasterCustomerSuccessGraph compiling and loading');
    const graph = createMasterCustomerSuccessGraph();
    assert(graph !== null, 'Customer Success Graph compiled successfully');
    assert(graph.engine === 'customer-success', 'Correct engine configuration mapped');
    passed++;

    // ─────────────────────────────────────────────
    console.log('\nTest 2: Graph execute state execution');
    const twin = await prisma.customerDigitalTwin.findFirst({ where: { businessId: bizId } });
    assert(twin !== null, 'Initial digital twin retrieved');

    const sessionId = await CustomerSuccessService.runCustomerSuccessEngine(bizId, twin!.id);
    assert(sessionId !== null, 'Master engine ran successfully, Session registered');
    passed++;

    // ─────────────────────────────────────────────
    console.log('\nTest 3: Customer Success Session Verification');
    const session = await prisma.customerSuccessSession.findUnique({
      where: { id: sessionId },
      include: {
        snapshots: true,
        healthScores: true,
        journeys: true,
        supportCases: true,
        recommendations: true
      }
    });
    assert(session !== null, 'Session retrieved correctly');
    assert(session!.status === 'SUCCESS', 'Status updated SUCCESS');
    assert(session!.healthScores.length > 0, 'Health score created correctly');
    assert(session!.snapshots.length > 0, 'Versioned snapshot captured correctly');
    passed++;

    // ─────────────────────────────────────────────
    console.log('\nTest 4: Customer Health & Journey analysis');
    const health = session!.healthScores[0];
    const parseHealth = CustomerHealthSchema.safeParse({
      overallHealth: health.overallHealth,
      relationshipHealth: health.relationshipHealth,
      productAdoption: health.productAdoption,
      featureAdoption: health.featureAdoption,
      supportHealth: health.supportHealth,
      valueRealization: health.valueRealization,
      execEngagement: health.execEngagement,
      renewalReadiness: health.renewalReadiness,
      expansionReadiness: health.expansionReadiness,
      riskLevel: health.riskLevel,
      healthTrend: health.healthTrend,
      confidence: health.confidence
    });
    assert(parseHealth.success === true, 'Overall CustomerHealth matches Zod schema');
    passed++;

    // ─────────────────────────────────────────────
    console.log('\nTest 5: Support Intelligence Cases & Recurring Detectors');
    const support = session!.supportCases[0];
    assert(support.ticketNumber !== null, 'Ticket number generated');
    assert(support.priority === 'MEDIUM', 'Priority tier mapped');
    assert(support.category === 'BUG', 'Bug category mapped');
    passed++;

    // ─────────────────────────────────────────────
    console.log('\nTest 6: Customer Value Realization outcomes & ROI tracking');
    const valRealization = await prisma.customerValueRealization.findFirst({
      where: { twinId: twin!.id }
    });
    assert(valRealization !== null, 'Value realization outcomes evaluated');
    assert(valRealization!.goalAchievementRate === 50.0, 'Goal achievement rate matches metrics expectations');
    assert(valRealization!.roiDelivered === 336000.0, 'ROI Delivered computed');
    passed++;

    // ─────────────────────────────────────────────
    console.log('\nTest 7: Chronological Customer 360 Timeline compilation');
    const history = await prisma.customerHistory.findMany({
      where: { twinId: twin!.id }
    });
    assert(history.length > 0, 'Chronological history events recorded');
    passed++;

    // ─────────────────────────────────────────────
    console.log('\nTest 8: Success Playbooks Catalog sync');
    const asset = await prisma.customerSuccessAsset.findFirst({
      where: { sessionId }
    });
    assert(asset !== null, 'Success assets synchronized');
    assert(asset!.assetType === 'RETENTION_PLAYBOOK', 'Success playbooks catalog compiled');
    passed++;

    // ─────────────────────────────────────────────
    console.log('\nTest 9: Recommendation Feedback loops ACCEPT / APPROVED audit');
    const rec = session!.recommendations[0];
    assert(rec.status === 'PENDING', 'Initial recommendation status is PENDING');

    const audit = await CustomerSuccessService.handleFeedback(
      bizId,
      sessionId,
      rec.id,
      'ACCEPT',
      'Deploying telemetry cache rules verified on staging.'
    );
    assert(audit.action === 'ACCEPT', 'Action ACCEPT logged');
    
    const updatedRec = await prisma.customerRecommendation.findUnique({
      where: { id: rec.id }
    });
    assert(updatedRec!.status === 'APPROVED', 'Recommendation status updated to APPROVED');

    const execPlan = await prisma.customerExecutionPlan.findFirst({
      where: { recommendationId: rec.id }
    });
    assert(execPlan !== null, 'Approved action items logged to Execution Plan');
    passed++;

    // ─────────────────────────────────────────────
    console.log('\nTest 10: Portfolio level Benchmark checks');
    const bench = await prisma.customerBenchmark.findFirst({
      where: { sessionId }
    });
    assert(bench !== null, 'Customer benchmark metrics recorded');
    assert(bench!.gap > 0, 'Benchmark comparison gap calculation verified');
    passed++;

    console.log('\n' + '='.repeat(60));
    console.log(`Results: ${passed} passed, ${failures.length} failed`);
    if (failures.length === 0) {
      console.log('🎉 ALL SPRINT 12 CUSTOMER SUCCESS TESTS PASSED');
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

runCustomerSuccessTests().catch(e => { console.error(e); process.exit(1); });
