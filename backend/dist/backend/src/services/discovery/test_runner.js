"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const DiscoveryFlowEngine_1 = require("./DiscoveryFlowEngine");
const BusinessUnderstandingEngine_1 = require("./BusinessUnderstandingEngine");
const assert_1 = __importDefault(require("assert"));
async function runTests() {
    console.log('🚀 STARTING DYNAMIC DISCOVERY ENGINE TEST SUITE...\n');
    // Test 1: Dynamic Question Rendering & Filtering by Industry
    console.log('🧪 Test 1: Industry Filtering...');
    const saasQuestions = DiscoveryFlowEngine_1.DiscoveryFlowEngine.getActiveQuestions('SaaS', 'GROWTH', {});
    const restaurantQuestions = DiscoveryFlowEngine_1.DiscoveryFlowEngine.getActiveQuestions('Restaurant', 'GROWTH', {});
    assert_1.default.ok(saasQuestions.some(q => q.id === 'mkt_ad_spend'), 'SaaS questions should contain marketing ad spend');
    assert_1.default.ok(!restaurantQuestions.some(q => q.id === 'mkt_ad_spend'), 'Restaurant questions should NOT contain marketing ad spend');
    console.log('✔ Industry filtering tests passed.');
    // Test 2: Conditional Question Dependencies
    console.log('🧪 Test 2: Dependency Filtering...');
    // With no ad spend, ROI question should be hidden
    const questionsNoAdSpend = DiscoveryFlowEngine_1.DiscoveryFlowEngine.getActiveQuestions('SaaS', 'GROWTH', { mkt_ad_spend: 0 });
    assert_1.default.ok(!questionsNoAdSpend.some(q => q.id === 'mkt_roi'), 'ROI question should be hidden when ad spend is 0');
    // With ad spend > 0, ROI question should be visible
    const questionsWithAdSpend = DiscoveryFlowEngine_1.DiscoveryFlowEngine.getActiveQuestions('SaaS', 'GROWTH', { mkt_ad_spend: 1500 });
    assert_1.default.ok(questionsWithAdSpend.some(q => q.id === 'mkt_roi'), 'ROI question should be visible when ad spend is > 0');
    console.log('✔ Conditional dependency tests passed.');
    // Test 3: Coverage Calculations
    console.log('🧪 Test 3: Business Understanding & Coverage calculations...');
    // Mock category coverage metrics
    const mockCoverage = {
        identity: 100,
        model: 50,
        finance: 0,
        marketing: 0,
        sales: 0,
        operations: 0,
        technology: 0,
        'products-services': 0
    };
    const undReport = BusinessUnderstandingEngine_1.BusinessUnderstandingEngine.calculateUnderstanding('SaaS', mockCoverage);
    assert_1.default.ok(undReport.overallUnderstanding > 0, 'Understanding should be calculated correctly');
    assert_1.default.equal(undReport.categoryUnderstanding['identity'], 100, 'Identity category understanding should match coverage');
    console.log('✔ Business Understanding telemetry calculation tests passed.');
    console.log('\n🎉 ALL DISCOVERY ENGINE LOGIC TESTS COMPLETED SUCCESSFULLY!');
}
runTests().catch(err => {
    console.error('❌ Test suite failed:', err);
    process.exit(1);
});
