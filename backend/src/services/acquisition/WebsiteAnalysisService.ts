import { prisma } from '../../database/prisma';
import { AppError } from '../../middleware/errorMiddleware';
import { WebsiteAnalysisStatus, JobStatus, SourceType, ExtractionStatus } from '@prisma/client';

export class WebsiteAnalysisService {
  /**
   * Enqueues a new website crawl and initializes analysis records.
   */
  static async queueAnalysis(businessId: string, url: string): Promise<any> {
    // 1. Simple URL validation
    try {
      new URL(url);
    } catch {
      throw new AppError('Invalid website URL configuration.', 400, 'VALIDATION_ERROR');
    }

    // 2. Resolve Website record
    let website = await prisma.website.findFirst({
      where: { businessId, url }
    });

    if (!website) {
      website = await prisma.website.create({
        data: { businessId, url }
      });
    }

    // 3. Create WebsiteAnalysisRun job
    const run = await prisma.websiteAnalysisRun.create({
      data: {
        websiteId: website.id,
        status: WebsiteAnalysisStatus.PENDING
      }
    });

    // 4. Create mock crawled pages
    await prisma.websitePage.createMany({
      data: [
        { analysisRunId: run.id, url: `${url}/`, status: JobStatus.QUEUED },
        { analysisRunId: run.id, url: `${url}/about`, status: JobStatus.QUEUED },
        { analysisRunId: run.id, url: `${url}/pricing`, status: JobStatus.QUEUED }
      ]
    });

    // Trigger asynchronous mock execution pipeline in the background
    this.runMockCrawl(run.id, businessId, url).catch(console.error);

    return run;
  }

  /**
   * Simulates async background crawling and mock extraction.
   */
  private static async runMockCrawl(runId: string, businessId: string, url: string) {
    // Wait to simulate crawler execution
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Update status to RUNNING
    await prisma.websiteAnalysisRun.update({
      where: { id: runId },
      data: { status: WebsiteAnalysisStatus.RUNNING }
    });

    // Update pages status
    const pages = await prisma.websitePage.findMany({ where: { analysisRunId: runId } });
    for (const p of pages) {
      await prisma.websitePage.update({
        where: { id: p.id },
        data: { status: JobStatus.COMPLETED, content: `Mock scraped content for page ${p.url}` }
      });
    }

    // Generate mock Extracted Candidates mapping to Digital Twin schema paths
    const domain = new URL(url).hostname.replace('www.', '').split('.')[0];
    const cleanName = domain.charAt(0).toUpperCase() + domain.slice(1);

    const mockEntities = [
      { fieldPath: 'identity.legalName', value: cleanName, confidence: 0.90 },
      { fieldPath: 'identity.description', value: `Innovative enterprise offerings by ${cleanName}.`, confidence: 0.90 },
      { fieldPath: 'identity.headquarters', value: 'New York, USA', confidence: 0.85 },
      { fieldPath: 'model.type', value: 'SaaS', confidence: 0.90 },
      { fieldPath: 'model.valueProposition', value: 'Automate business intelligence seamlessly.', confidence: 0.85 },
      { fieldPath: 'technologyProfile.infraProvider', value: 'AWS / GCP Cloud', confidence: 0.80 }
    ];

    for (const ent of mockEntities) {
      await prisma.extractedCandidate.create({
        data: {
          businessId,
          fieldPath: ent.fieldPath,
          value: ent.value,
          confidence: ent.confidence,
          sourceType: SourceType.WEBSITE,
          sourceId: runId,
          status: ExtractionStatus.PENDING_REVIEW,
          extractionMethod: 'URL_PARSER'
        }
      });
    }

    // Complete the website analysis job status
    await prisma.websiteAnalysisRun.update({
      where: { id: runId },
      data: { status: WebsiteAnalysisStatus.COMPLETED, completedAt: new Date() }
    });
  }
}
