import { prisma } from '../../database/prisma';
import { AppError } from '../../middleware/errorMiddleware';
import { WebsiteAnalysisStatus, JobStatus, SourceType, ExtractionStatus } from '@prisma/client';
import { jobQueue } from '../jobs/JobQueue';
import { eventBroker } from '../events/EventBroker';

export class WebsiteAnalysisService {
  /**
   * Enqueues a new website crawl in the background job queue.
   */
  static async queueAnalysis(businessId: string, url: string): Promise<any> {
    try {
      new URL(url);
    } catch {
      throw new AppError('Invalid website URL configuration.', 400, 'VALIDATION_ERROR');
    }

    let website = await prisma.website.findFirst({
      where: { businessId, url }
    });

    if (!website) {
      website = await prisma.website.create({
        data: { businessId, url }
      });
    }

    const run = await prisma.websiteAnalysisRun.create({
      data: {
        websiteId: website.id,
        status: WebsiteAnalysisStatus.PENDING
      }
    });

    await prisma.websitePage.createMany({
      data: [
        { analysisRunId: run.id, url: `${url}/`, status: JobStatus.QUEUED },
        { analysisRunId: run.id, url: `${url}/about`, status: JobStatus.QUEUED },
        { analysisRunId: run.id, url: `${url}/pricing`, status: JobStatus.QUEUED }
      ]
    });

    // Enqueue the background job using our decoupled JobQueue
    await jobQueue.enqueue('WEBSITE_CRAWL', {
      runId: run.id,
      businessId,
      url
    });

    return run;
  }

  /**
   * Simulates async background crawling and mock extraction.
   */
  static async runMockCrawl(runId: string, businessId: string, url: string) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    await prisma.websiteAnalysisRun.update({
      where: { id: runId },
      data: { status: WebsiteAnalysisStatus.RUNNING }
    });

    const pages = await prisma.websitePage.findMany({ where: { analysisRunId: runId } });
    for (const p of pages) {
      await prisma.websitePage.update({
        where: { id: p.id },
        data: { status: JobStatus.COMPLETED, content: `Mock scraped content for page ${p.url}` }
      });
    }

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

    await prisma.websiteAnalysisRun.update({
      where: { id: runId },
      data: { status: WebsiteAnalysisStatus.COMPLETED, completedAt: new Date() }
    });

    // Publish event upon crawl completion to decouple notification/subscribers
    console.log(`[WebsiteAnalysisService] Publishing WebsiteIndexed event for run: ${runId}`);
    await eventBroker.publish('WebsiteIndexed', { businessId, url, runId });
  }
}

// Register Job Queue worker
jobQueue.registerWorker('WEBSITE_CRAWL', async (payload: { runId: string; businessId: string; url: string }) => {
  await WebsiteAnalysisService.runMockCrawl(payload.runId, payload.businessId, payload.url);
});
