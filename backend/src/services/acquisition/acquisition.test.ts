import { prisma } from '../../database/prisma';
import { WebsiteAnalysisService } from './WebsiteAnalysisService';
import { DocumentUploadService } from './DocumentUploadService';
import { ReviewService } from './ReviewService';
import { EvidenceService } from './EvidenceService';
import { DocumentCategory, JobStatus } from '@prisma/client';
import assert from 'assert';

async function runTests() {
  console.log('🚀 STARTING KNOWLEDGE ACQUISITION LAYER TESTS...\n');

  // Find or create a business in database to run tests against
  let business = await prisma.business.findFirst();
  
  if (!business) {
    console.log('No business found. Initializing a mock Organization and Business...');
    const org = await prisma.organization.create({
      data: {
        name: 'Test Hackathon Org'
      }
    });
    business = await prisma.business.create({
      data: {
        organizationId: org.id,
        name: 'Test Business Twin',
        status: 'DRAFT'
      }
    });
    // Create discovery progress
    await prisma.discoveryProgress.create({
      data: {
        businessId: business.id
      }
    });
  }
  
  const bizId = business.id;
  console.log(`Using Business ID: ${bizId}`);

  // Test 1: Multiple Website Analysis Runs
  console.log('🧪 Test 1: Website Analysis Runs...');
  const siteUrl = 'https://titanforge-demo.com';
  
  // Clean previous records
  await prisma.website.deleteMany({ where: { businessId: bizId } });

  // Create website record
  const site = await prisma.website.create({
    data: { businessId: bizId, url: siteUrl }
  });

  // Queue Run 1
  const run1 = await WebsiteAnalysisService.queueAnalysis(bizId, siteUrl);
  assert.equal(run1.status, 'PENDING', 'Run 1 should start as PENDING');

  // Queue Run 2 to test multiple runs
  const run2 = await WebsiteAnalysisService.queueAnalysis(bizId, siteUrl);
  assert.equal(run2.status, 'PENDING', 'Run 2 should start as PENDING');

  const siteWithRuns = await prisma.website.findUnique({
    where: { id: site.id },
    include: { analysisRuns: true }
  });

  assert.ok((siteWithRuns?.analysisRuns.length ?? 0) >= 2, 'Should support multiple crawl analysis runs');
  console.log('✔ Multiple website runs check passed.');

  // Test 2: Multiple Document Versions & Hashes
  console.log('🧪 Test 2: Document Upload & Versioning...');
  
  // Upload Version 1
  const doc1 = await DocumentUploadService.uploadDocument(
    bizId,
    'financials_q3.csv',
    'Revenues: 1200000, margin: 45%',
    DocumentCategory.FINANCIAL_REPORT,
    'Jai Ganesh'
  );
  assert.equal(doc1.version, 1, 'First upload version should be 1');

  // Upload same content to test hash match (should return version 1 again to prevent duplicate)
  const doc1Duplicate = await DocumentUploadService.uploadDocument(
    bizId,
    'financials_q3.csv',
    'Revenues: 1200000, margin: 45%',
    DocumentCategory.FINANCIAL_REPORT,
    'Jai Ganesh'
  );
  assert.equal(doc1Duplicate.version, 1, 'Duplicate hash upload should return same version');

  // Upload modified content with same filename to test version increment
  const doc2 = await DocumentUploadService.uploadDocument(
    bizId,
    'financials_q3.csv',
    'Revenues: 1450000, margin: 48%',
    DocumentCategory.FINANCIAL_REPORT,
    'Jai Ganesh'
  );
  assert.equal(doc2.version, 2, 'Modified file upload version should increment to 2');
  console.log('✔ Document versioning and duplicate hash checks passed.');

  // Sleep for 3 seconds to let asynchronous parser tasks finish writing candidates to DB
  console.log('⏳ Waiting 3 seconds for asynchronous crawlers & extraction parsers to finish...');
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Test 3: Review Candidates Queue Actions
  console.log('🧪 Test 3: Review Candidates & Evidences...');
  const pending = await ReviewService.getPendingCandidates(bizId);
  assert.ok(pending.length > 0, 'Candidate generator should output pending suggestions');

  const cand = pending[0];
  console.log(`Pending candidate found for field path: ${cand.fieldPath}`);

  // Accept candidate to check updates
  const stateReport = await ReviewService.acceptCandidate(cand.id, 'Jai Ganesh');
  assert.ok(stateReport.overallCoverage !== undefined, 'Accepting suggestion should return updated coverage report');

  const acceptedCand = await prisma.extractedCandidate.findUnique({
    where: { id: cand.id }
  });
  assert.equal(acceptedCand?.status, 'ACCEPTED', 'Candidate status should be ACCEPTED');

  // Check evidence traceability
  const evidences = await EvidenceService.getEvidences(bizId, cand.fieldPath);
  assert.ok(evidences.length > 0, 'Evidence tracing logs should be generated');
  assert.equal(evidences[0].reviewer, 'Jai Ganesh', 'Reviewer name should match');
  console.log('✔ Review workflow & evidence traceability checks passed.');

  console.log('\n🎉 ALL KNOWLEDGE ACQUISITION LAYER TESTS COMPLETED SUCCESSFULLY!');
}

runTests().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
