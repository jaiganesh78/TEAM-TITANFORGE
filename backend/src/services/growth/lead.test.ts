/**
 * Sprint 9 — AI Lead Intelligence & Lead Generation Engine Test Suite
 * Verification of MasterLeadGraph, 13 subgraphs, ICP profiling, Lead scoring & qualification,
 * forecasting, Revenue Pipeline stage transitions, and AI Operating Context sync.
 */

import { GeminiProvider } from '../../../../ai/providers/GeminiProvider';
import { PromptBuilder } from '../../../../ai/providers/PromptBuilder';
import { 
  ResponseParser, 
  IdealCustomerProfileSchema,
  LeadProfilesSchema,
  LeadSourcesSchema
} from '../../../../ai/providers/ResponseParser';
import { createMasterLeadGraph } from './LeadWorkflow';
import { LeadEngineService } from './LeadEngineService';
import { LeadMemoryService } from './LeadMemoryService';
import { RevenuePipelineService } from './RevenuePipelineService';
import { AIReadinessService } from './AIReadinessService';
import { prisma } from '../../database/prisma';

const TEST_BIZ_ID = 'test-lead-biz-' + Date.now();

async function createTestEnvironment(): Promise<string> {
  const org = await prisma.organization.create({ data: { name: 'Lead Engine Test Org' } });
  const biz = await prisma.business.create({
    data: {
      id: TEST_BIZ_ID,
      organizationId: org.id,
      name: 'Lead Test Corp',
      status: 'IN_PROGRESS',
      identity: {
        create: { legalName: 'Lead Test Corp Ltd', foundedYear: 2023, industry: 'Logistics SaaS', headquarters: 'New York' }
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
          { domain: 'MARKETING', confidence: 90.0, currentState: '{"spend":8000}', gapSeverity: 'NONE' },
          { domain: 'LEAD_GENERATION', confidence: 90.0, currentState: '{"leadgen":"active"}', gapSeverity: 'NONE' },
          { domain: 'CUSTOMER_PERSONAS', confidence: 90.0, currentState: '{"personas":["developer"]}', gapSeverity: 'NONE' },
          { domain: 'CUSTOMER_SEGMENTS', confidence: 90.0, currentState: '{"segments":["tech"]}', gapSeverity: 'NONE' }
        ]
      }
    }
  });

  // Create required KPIs
  await prisma.businessKPI.createMany({
    data: [
      { businessId: biz.id, name: 'lead_quality_score', currentValue: 75, targetValue: 90, unit: '%' },
      { businessId: biz.id, name: 'cac', currentValue: 150, targetValue: 100, unit: 'USD' },
      { businessId: biz.id, name: 'conversion_rate', currentValue: 3.5, targetValue: 5.0, unit: '%' }
    ]
  });

  // Create required knowledge chunks (10 for each domain: LEAD_GENERATION, CUSTOMER_PERSONAS, CUSTOMER_SEGMENTS)
  const chunkDomains = ['LEAD_GENERATION', 'CUSTOMER_PERSONAS', 'CUSTOMER_SEGMENTS'];
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

  // Create a StrategySession to ground Strategic Assets
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

  // Create a MarketingSession to ground Marketing Assets
  await prisma.marketingSession.create({
    data: {
      businessId: TEST_BIZ_ID,
      status: 'COMPLETED',
      contextVersion: 1,
      audienceAnalysis: JSON.stringify({ primaryAudience: 'VP Supply Chain', painPoints: ['Late shipping delays'] }),
      funnelAnalysis: JSON.stringify({ tofu: 'LinkedIn campaigns', mofu: 'ROI calculators' }),
      channelReadiness: JSON.stringify({ readinessScore: 85 })
    }
  });

  return biz.id;
}

async function cleanup(bizId: string) {
  // Clean records cascaded or direct
  await prisma.leadHistory.deleteMany({ where: { businessId: bizId } });
  await prisma.leadFeedback.deleteMany({ where: { businessId: bizId } });
  await prisma.leadExecutionPlan.deleteMany({ where: { businessId: bizId } });
  await prisma.leadEvidence.deleteMany({ where: { businessId: bizId } });
  await prisma.leadScore.deleteMany({ where: { businessId: bizId } });
  await prisma.leadProfile.deleteMany({ where: { businessId: bizId } });
  await prisma.leadSource.deleteMany({ where: { businessId: bizId } });
  await prisma.leadJourney.deleteMany({ where: { businessId: bizId } });
  await prisma.leadRecommendation.deleteMany({ where: { businessId: bizId } });
  await prisma.leadForecast.deleteMany({ where: { businessId: bizId } });
  await prisma.leadPlaybook.deleteMany({ where: { businessId: bizId } });
  await prisma.leadMemory.deleteMany({ where: { businessId: bizId } });
  await prisma.leadSession.deleteMany({ where: { businessId: bizId } });
  await prisma.revenuePipelineHistory.deleteMany({ where: { businessId: bizId } });
  await prisma.revenuePipelineStage.deleteMany({ where: { businessId: bizId } });
  await prisma.revenuePipeline.deleteMany({ where: { businessId: bizId } });
  
  await prisma.strategySession.deleteMany({ where: { businessId: bizId } });
  await prisma.marketingSession.deleteMany({ where: { businessId: bizId } });
  
  const biz = await prisma.business.findUnique({ where: { id: bizId } });
  if (biz) {
    await prisma.business.delete({ where: { id: bizId } });
    await prisma.organization.delete({ where: { id: biz.organizationId } });
  }
}

async function runLeadTests() {
  console.log('='.repeat(60));
  console.log('STARTING SPRINT 9 AI LEAD INTELLIGENCE ENGINE INTEGRATION TESTS');
  console.log('='.repeat(60));

  let passed = 0;
  const failures: string[] = [];

  const assert = (condition: boolean, msg: string) => {
    if (!condition) {
      console.log(`❌ FAIL: ${msg}`);
      failures.push(msg);
      throw new Error(msg);
    }
    console.log(`✔ PASS: ${msg}`);
    passed++;
  };

  let bizId = '';

  try {
    // ─────────────────────────────────────────────
    // TEST 1: Setup Environment
    // ─────────────────────────────────────────────
    console.log('\nTest 1: Setting up mock BDT, Strategy, and Marketing snapshots');
    bizId = await createTestEnvironment();
    assert(!!bizId, 'Test business environment generated successfully');

    // ─────────────────────────────────────────────
    // TEST 2: Revenue Pipeline Initialization
    // ─────────────────────────────────────────────
    console.log('\nTest 2: Initializing Revenue Operating Layer pipeline & stages');
    const pipeline = await RevenuePipelineService.initializePipeline(bizId, 'B2B Enterprise Pipeline');
    assert(!!pipeline, 'Revenue Pipeline initialized successfully');
    assert(pipeline.name === 'B2B Enterprise Pipeline', 'Revenue Pipeline name matches input');

    const stages = await prisma.revenuePipelineStage.findMany({ where: { pipelineId: pipeline.id } });
    assert(stages.length === 9, 'All 9 B2B revenue pipeline stages successfully created');

    const prospectStage = stages.find(s => s.stageName === 'Prospect');
    assert(prospectStage!.probability === 0.10, 'Prospect stage transition probability matches criteria');
    assert(prospectStage!.responsibleEngine === 'lead-engine', 'Responsible engine is lead-engine');

    // ─────────────────────────────────────────────
    // TEST 3: Master Lead Graph Subgraph Compilation
    // ─────────────────────────────────────────────
    console.log('\nTest 3: Compiling MasterLeadGraph and executing subgraphs');
    const graph = createMasterLeadGraph();
    assert(graph.engine === 'lead', 'Compiled graph engine ID is lead');

    const sessionId = await LeadEngineService.runLeadEngine(bizId);
    assert(!!sessionId, 'Lead session successfully generated and graph run complete');

    const session = await prisma.leadSession.findUnique({
      where: { id: sessionId },
      include: {
        leads: { include: { scores: true } },
        leadSourcesList: true,
        recommendations: true,
        forecastsList: true,
        playbooks: true
      }
    });

    assert(session!.status === 'COMPLETED', 'Lead graph session execution is COMPLETED');
    assert(!!session!.icpAnalysis, 'Saved ICP profiling data to LeadSession record');
    assert(!!session!.leadSources, 'Saved Lead Sources evaluation to LeadSession record');
    assert(!!session!.segmentation, 'Saved Lead Segmentation to LeadSession record');
    assert(!!session!.nurtureJourneys, 'Saved Nurture Journeys to LeadSession record');
    assert(!!session!.forecasts, 'Saved Forecasts outputs to LeadSession record');

    // ─────────────────────────────────────────────
    // TEST 4: Lead Profile & Scoring Grounding
    // ─────────────────────────────────────────────
    console.log('\nTest 4: Validating lead profiles and scoring assignments');
    assert(session!.leads.length > 0, 'Discovered target lead profiles created');
    const firstLead = session!.leads[0];
    assert(firstLead.companyName === 'Acme Corp Solutions', 'First lead companyName matches LLM mock outputs');
    assert(firstLead.scores.length > 0, 'Scoring models assigned to the lead profile');
    assert(firstLead.scores[0].fitScore === 85, 'Lead qualification Fit Score is correctly evaluated');
    assert(firstLead.scores[0].qualityScore === 88, 'Lead quality score matches mock output');

    // ─────────────────────────────────────────────
    // TEST 5: Pipeline Transitions & Health Bottleneck Detection
    // ─────────────────────────────────────────────
    console.log('\nTest 5: Operating pipeline stage transitions & health diagnostics');
    // Move lead to Engaged stage
    const transitioned = await RevenuePipelineService.transitionLead(bizId, firstLead.id, 'Engaged', 'Test Runner');
    
    // Verify stage update
    const leadAfterTransition = await prisma.leadProfile.findUnique({
      where: { id: firstLead.id },
      include: { stage: true }
    });
    assert(leadAfterTransition!.stage.stageName === 'Engaged', 'Lead successfully transitioned to Engaged stage');

    // Verify stage history log recorded
    const historyLogs = await prisma.revenuePipelineHistory.findMany({ where: { leadId: firstLead.id } });
    assert(historyLogs.length > 0, 'RevenuePipelineHistory audit transition recorded');
    assert(historyLogs[0].fromStage === 'Prospect', 'Transition starting stage recorded');
    assert(historyLogs[0].toStage === 'Engaged', 'Transition target stage recorded');

    // Health diagnostics
    const health = await RevenuePipelineService.getPipelineHealth(bizId);
    assert(health.totalLeads === 1, 'Pipeline health totals matches active leads count');
    assert(health.healthScore > 0, `Pipeline overall health score calculated: ${health.healthScore}`);

    // ─────────────────────────────────────────────
    // TEST 6: Feedback Loop & AI Operating Context Sync
    // ─────────────────────────────────────────────
    console.log('\nTest 6: Executing human review feedback approvals and syncs');
    const feedback = await LeadEngineService.handleFeedback(
      bizId,
      sessionId,
      'ACCEPT',
      'This outbound sequence meets target CAC goals'
    );
    assert(!!feedback, 'Feedback log recorded successfully');
    assert(feedback.action === 'ACCEPT', 'Action recorded as ACCEPT');

    // Verify strategy status updated
    const recAfterFeedback = await prisma.leadRecommendation.findFirst({ where: { sessionId } });
    assert(recAfterFeedback!.status === 'APPROVED', 'Recommendation status updated to APPROVED');

    // Verify Execution Plan checklist generated
    const execPlan = await prisma.leadExecutionPlan.findFirst({ where: { sessionId } });
    assert(!!execPlan, 'LeadExecutionPlan generated successfully');
    assert(execPlan!.status === 'PENDING', 'Initial lead execution status is PENDING');

    // Verify sync to AI Operating Context
    const opContext = await prisma.aIOperatingContext.findUnique({ where: { businessId: bizId } });
    assert(!!opContext, 'AIOperatingContext found for business');
    assert(opContext!.lastUpdatedBy === 'lead-engine', 'Context lastUpdatedBy is lead-engine');
    assert(opContext!.engineOutputs!.includes('lead-engine'), 'Synced Lead Engine assets inside AIOperatingContext outputs');

    // ─────────────────────────────────────────────
    // TEST 7: Lead Memory Service Grounding
    // ─────────────────────────────────────────────
    console.log('\nTest 7: Validating long term memory loops');
    const memoryCtx = await LeadMemoryService.getMemoryContext(bizId);
    assert(memoryCtx.includes('Launch Hyper-Targeted LinkedIn Sequence'), 'Grounding includes approved strategy titles');

    // ─────────────────────────────────────────────
    // TEST 8: Regression Compatibility
    // ─────────────────────────────────────────────
    console.log('\nTest 8: Running readiness checks and sprint regressions');
    const readiness = await AIReadinessService.calculateReadiness(bizId, 'lead-generation-engine');
    assert(readiness.readinessScore > 50, `Lead Engine readiness calculation succeeds: ${readiness.readinessScore}`);

    console.log('\n' + '='.repeat(60));
    console.log(`Results: ${passed} passed, ${failures.length} failed`);
    if (failures.length === 0) {
      console.log('🎉 ALL LEAD INTELLIGENCE ENGINE TESTS PASSED');
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

runLeadTests().catch(e => { console.error(e); process.exit(1); });
