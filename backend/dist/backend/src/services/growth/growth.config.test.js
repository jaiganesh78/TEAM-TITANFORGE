"use strict";
/**
 * Sprint 6 — Growth Architecture Pure Config Tests (No DB Required)
 * Tests all config-layer functionality independently of the database.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const sectors_1 = require("../../config/sectors");
const kpis_1 = require("../../config/kpis");
const contracts_1 = require("../../engines/contracts");
const DiscoveryFlowEngine_1 = require("../discovery/DiscoveryFlowEngine");
const QuestionLibrary_1 = require("../discovery/QuestionLibrary");
async function runConfigTests() {
    console.log('\n🚀 Sprint 6 — Config Layer Tests (No DB)\n');
    console.log('='.repeat(60));
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
    // ─────────────────────────────────────────────
    // TEST 1: Sector Configuration
    // ─────────────────────────────────────────────
    console.log('\nTest 1: Sector Configuration');
    const sectors = sectors_1.SectorManager.getAllSectors();
    assert(sectors.length >= 5, `${sectors.length} sectors loaded (need 5+)`);
    const saas = sectors_1.SectorManager.getSector('saas');
    assert(saas.slug === 'saas', 'SaaS sector found by slug');
    assert(saas.marketingChannels.length > 0, `SaaS has ${saas.marketingChannels.length} marketing channels`);
    assert(Object.keys(saas.futureAIPromptTemplates).length >= 4, 'SaaS has 4+ AI prompt templates');
    assert(saas.businessLifecycle.stages.length > 0, 'SaaS has lifecycle stages');
    assert(saas.customerJourney.stages.length > 0, 'SaaS has customer journey stages');
    assert(saas.marketingFunnel.stages.length > 0, 'SaaS has marketing funnel stages');
    assert(saas.commonPainPoints.length > 0, `SaaS has ${saas.commonPainPoints.length} common pain points`);
    assert(saas.typicalAIOpportunities.length > 0, 'SaaS has AI opportunity definitions');
    const ecom = sectors_1.SectorManager.getSector('ecommerce');
    assert(ecom.slug === 'ecommerce', 'eCommerce sector found');
    const ps = sectors_1.SectorManager.getSector('professional-services');
    assert(ps.slug === 'professional-services', 'Professional Services sector found');
    const retail = sectors_1.SectorManager.getSector('retail');
    assert(retail.slug === 'retail', 'Retail sector found');
    const mkt = sectors_1.SectorManager.getSector('marketplace');
    assert(mkt.slug === 'marketplace', 'Marketplace sector found');
    const generic = sectors_1.SectorManager.getSector('unknown-sector');
    assert(generic.slug === 'generic', 'Unknown sector falls back to generic');
    const saasKpis = sectors_1.SectorManager.getKpisForSector('saas');
    assert(saasKpis.length > 0, `SaaS KPIs resolved: ${saasKpis.length}`);
    const prompt = sectors_1.SectorManager.getPromptTemplate('saas', 'strategy-engine');
    assert(prompt.length > 20, 'SaaS strategy-engine prompt template found');
    const saasQuestions = sectors_1.SectorManager.getQuestionsForSector('saas');
    assert(saasQuestions.length > 0, `SaaS questions resolved: ${saasQuestions.length}`);
    // ─────────────────────────────────────────────
    // TEST 2: KPI Registry
    // ─────────────────────────────────────────────
    console.log('\nTest 2: KPI Registry');
    const kpis = kpis_1.KPIRegistry.getAll();
    assert(kpis.length >= 15, `${kpis.length} KPIs defined (need 15+)`);
    const cac = kpis_1.KPIRegistry.getBySlug('cac');
    assert(!!cac, 'CAC KPI found');
    assert(!!cac?.healthyRange, 'CAC has healthy range');
    assert(!!cac?.warningRange, 'CAC has warning range');
    assert(!!cac?.criticalRange, 'CAC has critical range');
    assert(!!cac?.formula, 'CAC has formula');
    assert(!!cac?.industryBenchmark, 'CAC has industry benchmark');
    assert(kpis_1.KPIRegistry.getHealthStatus('cac', 200) === 'HEALTHY', 'CAC health: 200 → HEALTHY');
    assert(kpis_1.KPIRegistry.getHealthStatus('cac', 500) === 'WARNING', 'CAC health: 500 → WARNING');
    assert(kpis_1.KPIRegistry.getHealthStatus('cac', 1000) === 'CRITICAL', 'CAC health: 1000 → CRITICAL');
    assert(kpis_1.KPIRegistry.getBenchmark('cac', 'saas') > 0, 'CAC SaaS benchmark > 0');
    const ltv = kpis_1.KPIRegistry.getBySlug('ltv');
    assert(!!ltv, 'LTV KPI found');
    const marketingKpis = kpis_1.KPIRegistry.getByEngine('marketing-engine');
    assert(marketingKpis.length > 0, `${marketingKpis.length} Marketing Engine KPIs`);
    const analyticsKpis = kpis_1.KPIRegistry.getByEngine('analytics-engine');
    assert(analyticsKpis.length > 0, `${analyticsKpis.length} Analytics Engine KPIs`);
    // ─────────────────────────────────────────────
    // TEST 3: Engine Contracts
    // ─────────────────────────────────────────────
    console.log('\nTest 3: Engine Contracts');
    assert(contracts_1.ALL_ENGINE_CONTRACTS.length === 6, '6 engine contracts defined');
    const engines = ['strategy-engine', 'marketing-engine', 'lead-generation-engine', 'sales-engine', 'analytics-engine', 'customer-success-engine'];
    for (const id of engines) {
        const contract = (0, contracts_1.getEngineContract)(id);
        assert(!!contract, `${id}: contract found`);
        assert((contract?.failureConditions.length ?? 0) > 0, `${id}: has failure conditions`);
        assert((contract?.escalationRules.length ?? 0) > 0, `${id}: has escalation rules`);
        assert((contract?.futureDebateParticipants.length ?? 0) > 0, `${id}: has debate participants`);
        assert((contract?.requiredInputs.length ?? 0) > 0, `${id}: has required inputs`);
        assert((contract?.produces.length ?? 0) > 0, `${id}: has produces list`);
        assert(typeof contract?.confidenceRequirements.minimum === 'number', `${id}: has confidence requirements`);
    }
    // ─────────────────────────────────────────────
    // TEST 4: Question Library Backward Compatibility
    // ─────────────────────────────────────────────
    console.log('\nTest 4: Question Library — Backward Compatibility');
    assert(QuestionLibrary_1.QUESTION_LIBRARY.length >= 10, `${QuestionLibrary_1.QUESTION_LIBRARY.length} questions in library`);
    const q0 = QuestionLibrary_1.QUESTION_LIBRARY[0];
    assert(!!q0.id, 'Question has id');
    assert(!!q0.title, 'Question has title');
    assert(!!q0.dbPath, 'Question has dbPath');
    assert(!!q0.category, 'Question has category');
    assert(!!q0.priority, 'Question has priority');
    assert(!!q0.type, 'Question has type');
    const withGrowthDomain = QuestionLibrary_1.QUESTION_LIBRARY.filter(q => q.growthDomain);
    assert(withGrowthDomain.length > 0, `${withGrowthDomain.length} questions have growthDomain`);
    const withEngine = QuestionLibrary_1.QUESTION_LIBRARY.filter(q => q.relatedEngine);
    console.log(`  ℹ ${withEngine.length} questions have relatedEngine (optional)`);
    // ─────────────────────────────────────────────
    // TEST 5: Discovery Explainer
    // ─────────────────────────────────────────────
    console.log('\nTest 5: Discovery Explainer');
    const explained = DiscoveryFlowEngine_1.DiscoveryExplainer.computeNextQuestions({
        businessId: 'test-id',
        sectorSlug: 'saas',
        businessStage: 'GROWTH',
        answeredQuestionIds: []
    }, 5);
    assert(explained.length > 0, `${explained.length} explained questions returned`);
    if (explained.length > 0) {
        const eq = explained[0];
        assert(!!eq.question, 'ExplainedQuestion has question');
        assert(typeof eq.whyItMatters === 'string', 'ExplainedQuestion has whyItMatters');
        assert(typeof eq.whichEngineNeedsIt === 'string', 'ExplainedQuestion has whichEngineNeedsIt');
        assert(Array.isArray(eq.whichKpiDependsOnIt), 'ExplainedQuestion has whichKpiDependsOnIt array');
        assert(typeof eq.expectedConfidenceImprovement === 'number', 'ExplainedQuestion has confidence improvement');
        assert(typeof eq.businessImpact === 'string', 'ExplainedQuestion has businessImpact');
        assert(typeof eq.discoveryPriority === 'number', 'ExplainedQuestion has discoveryPriority');
        console.log(`  ℹ First question: "${eq.question.title}" → ${eq.whichEngineNeedsIt}`);
    }
    // Answered questions are excluded
    const answered = QuestionLibrary_1.QUESTION_LIBRARY.slice(0, 5).map(q => q.id);
    const withAnswered = DiscoveryFlowEngine_1.DiscoveryExplainer.computeNextQuestions({
        businessId: 'test-id',
        sectorSlug: 'saas',
        businessStage: 'GROWTH',
        answeredQuestionIds: answered
    }, 5);
    const noOverlap = withAnswered.every(eq => !answered.includes(eq.question.id));
    assert(noOverlap, 'Answered questions are excluded from explained list');
    console.log('\n' + '='.repeat(60));
    console.log(`Results: ${passed} passed, ${failures.length} failed`);
    if (failures.length === 0) {
        console.log('🎉 ALL CONFIG TESTS PASSED');
    }
    else {
        console.log('⚠️  Failures:');
        failures.forEach(f => console.log(`  - ${f}`));
    }
    console.log('='.repeat(60));
    process.exit(failures.length > 0 ? 1 : 0);
}
runConfigTests().catch(e => { console.error(e); process.exit(1); });
