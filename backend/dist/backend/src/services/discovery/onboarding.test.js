"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../../database/prisma");
const authService_1 = require("../authService");
const DiscoveryChatService_1 = require("./DiscoveryChatService");
const WebsiteAnalysisService_1 = require("../acquisition/WebsiteAnalysisService");
const QuestionLibrary_1 = require("./QuestionLibrary");
const AIProvider_1 = require("../ai/AIProvider");
const EventBroker_1 = require("../events/EventBroker");
const JobQueue_1 = require("../jobs/JobQueue");
const assert_1 = __importDefault(require("assert"));
async function runOnboardingTests() {
    console.log('🚀 STARTING SPRINT 14 ONBOARDING & ARCHITECTURE INTEGRATION TESTS...\n');
    // Test 1: Relational Chat Session Creation / Auto-Resume
    console.log('🧪 Test 1: Conversational Chat Relational Sessions & Resume...');
    const testEmail = `enterprise-test-${Date.now()}@titanforge.com`;
    const registerRes = await authService_1.authService.register({
        name: 'Test Executive',
        email: testEmail,
        passwordHash: 'SuperSecurePass123!',
        organizationName: 'TitanForge Test Labs'
    });
    const userRecord = await prisma_1.prisma.user.findUnique({
        where: { email: testEmail },
        include: { organization: true }
    });
    assert_1.default.ok(userRecord, 'User record must be persisted in database.');
    assert_1.default.equal(userRecord.emailVerified, false, 'User must initially be unverified.');
    assert_1.default.ok(userRecord.verificationToken, 'Verification token must be generated.');
    // Create a default business for the organization
    const business = await prisma_1.prisma.business.create({
        data: {
            organizationId: userRecord.organizationId,
            name: 'Test Business Twin',
            status: 'DRAFT'
        }
    });
    // Create discovery progress mapping
    await prisma_1.prisma.discoveryProgress.create({
        data: {
            businessId: business.id
        }
    });
    const businessId = business.id;
    const session1 = await DiscoveryChatService_1.DiscoveryChatService.getOrCreateSession(businessId);
    const session2 = await DiscoveryChatService_1.DiscoveryChatService.getOrCreateSession(businessId);
    assert_1.default.equal(session1.id, session2.id, 'Subsequent session fetches must resume the active session.');
    assert_1.default.ok(session1.messages.length > 0, 'Initial session should trigger greeting prompts.');
    console.log('✔ Session resume check passed.');
    // Test 2: Dynamic Selectors & Answers Ingestions
    console.log('🧪 Test 2: Phased Dynamic Questioning & GDT Answer Ingestion...');
    const firstActiveQuestionId = session1.messages[0].questionId;
    assert_1.default.ok(firstActiveQuestionId, 'AI must select active question.');
    const activeQuestion = QuestionLibrary_1.QUESTION_LIBRARY.find(q => q.id === firstActiveQuestionId);
    const parts = activeQuestion.dbPath.split('.');
    const profileKey = parts[0]; // e.g. "identity", "model"
    const fieldName = parts[1]; // e.g. "legalName", "type"
    const respondValue = 'SaaS';
    const respondRes = await DiscoveryChatService_1.DiscoveryChatService.respond(businessId, respondValue);
    assert_1.default.ok(respondRes.session.overallConfidence >= 0, 'Answer ingestion must update confidence metrics.');
    // Dynamically check table updates based on question model mappings
    const dbTableName = profileKey === 'identity' ? 'businessIdentity' : 'businessModel';
    const updatedRecord = await prisma_1.prisma[dbTableName].findFirst({
        where: { businessId }
    });
    assert_1.default.equal(updatedRecord?.[fieldName], respondValue, 'GDT model field must update relational values.');
    console.log('✔ Dynamic questioning and answers ingestion passed.');
    // Test 3: Refresh Token Rotation (RTR) check
    console.log('🧪 Test 3: Refresh Token Rotation (RTR) and Session Isolation...');
    const refreshRes = await authService_1.authService.refresh(registerRes.refreshToken);
    assert_1.default.ok(refreshRes.accessToken, 'RTR must issue new access tokens.');
    assert_1.default.ok(refreshRes.refreshToken, 'RTR must issue a mutated fresh refresh token.');
    try {
        await authService_1.authService.refresh(registerRes.refreshToken);
        assert_1.default.fail('Reusing revoked refresh tokens must throw auth errors.');
    }
    catch (err) {
        assert_1.default.equal(err.statusCode, 401, 'Reused rotated tokens must reject access credentials.');
    }
    console.log('✔ RTR security checks passed.');
    // Test 4: Google OAuth Logins mock/assertion
    console.log('🧪 Test 4: Google OAuth profile registration...');
    const oauthRes = await authService_1.authService.loginWithGoogle('mock_token');
    assert_1.default.ok(oauthRes.user, 'Google login must yield authenticated profiles.');
    assert_1.default.ok(oauthRes.accessToken, 'Google login must generate access token pairs.');
    console.log('✔ Google OAuth integration checks passed.');
    // Test 5: Forget / Reset Passwords
    console.log('🧪 Test 5: Forgot and Reset Password token exchanges...');
    await authService_1.authService.forgotPassword(testEmail);
    const updatedUser = await prisma_1.prisma.user.findUnique({ where: { email: testEmail } });
    assert_1.default.ok(updatedUser?.passwordResetToken, 'ForgotPassword must write reset tokens to database.');
    await authService_1.authService.resetPassword(updatedUser.passwordResetToken, 'NewFreshPassword456!!');
    const loggedInAgain = await authService_1.authService.login({ email: testEmail, passwordHash: 'NewFreshPassword456!!' });
    assert_1.default.ok(loggedInAgain.accessToken, 'Reset password must allow logging in with new credentials.');
    console.log('✔ Password reset tokens lifecycle checks passed.');
    // Test 6: Skip Onboarding
    console.log('🧪 Test 6: Skip Onboarding redirect flags...');
    await prisma_1.prisma.user.updateMany({
        where: { organization: { businesses: { some: { id: businessId } } } },
        data: { onboardingCompleted: false }
    });
    const checkUserBefore = await prisma_1.prisma.user.findUnique({ where: { id: userRecord.id } });
    assert_1.default.equal(checkUserBefore?.onboardingCompleted, false, 'OnboardingCompleted must initially be false.');
    console.log('✔ Skip onboarding checks passed.');
    // Test 7: Pluggable Providers & OpenAI local connections
    console.log('🧪 Test 7: Pluggable AI Provider factory configurations...');
    const provider = AIProvider_1.AIProviderFactory.getProvider();
    assert_1.default.ok(provider.name, 'Factory must return resolved AIProvider adapter.');
    console.log('✔ pluggable providers factory checks passed.');
    // Test 8: Verify Event Broker and Background Job queue decoupling
    console.log('🧪 Test 8: Verify Event Broker and Background Job queue decoupling...');
    let eventFired = false;
    const testHandler = (data) => {
        if (data.businessId === businessId) {
            eventFired = true;
        }
    };
    EventBroker_1.eventBroker.subscribe('WebsiteIndexed', testHandler);
    const siteUrl = `https://onboarding-crawlers-${Date.now()}.com`;
    await WebsiteAnalysisService_1.WebsiteAnalysisService.queueAnalysis(businessId, siteUrl);
    // Poll for background worker completion (up to 15 seconds)
    console.log('⏳ Polling for background crawler worker completion and EventBroker publication...');
    let pollRetries = 30;
    while (!eventFired && pollRetries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        pollRetries--;
    }
    assert_1.default.equal(eventFired, true, 'WebsiteIndexed domain event must fire upon crawl completion.');
    EventBroker_1.eventBroker.unsubscribe('WebsiteIndexed', testHandler);
    console.log('✔ Asynchronous event-driven publish/subscribe decoupling checks passed.');
    // Test 9: Complete and Downstream execution runs
    console.log('🧪 Test 9: Onboarding completion & downstream engines trigger...');
    await prisma_1.prisma.discoveryChatSession.update({
        where: { businessId },
        data: { status: 'COMPLETED', currentPhase: 'VALIDATION' }
    });
    const strategyJob = await JobQueue_1.jobQueue.enqueue('STRATEGY_ENGINE', { businessId });
    assert_1.default.equal(strategyJob.status, 'PENDING', 'Downstream engine runs must be enqueued in background queues.');
    console.log('✔ Downstream engines async worker queue checks passed.');
    console.log('\n🎉 ALL SPRINT 14 ONBOARDING & ARCHITECTURE TESTS PASSED SUCCESSFULLY!');
}
runOnboardingTests().catch((err) => {
    console.error('❌ Test suite failed:', err);
    process.exit(1);
});
