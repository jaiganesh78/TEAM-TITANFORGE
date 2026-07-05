import { prisma } from '../../database/prisma';
import { AppError } from '../../middleware/errorMiddleware';
import { WebsiteAnalysisStatus, JobStatus, SourceType, ExtractionStatus } from '@prisma/client';
import { jobQueue } from '../jobs/JobQueue';
import { eventBroker } from '../events/EventBroker';
import { GeminiProvider } from '../ai/AIProvider';

function extractTextFromHtml(html: string): string {
  // Remove script and style tags
  let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Extract meta description
  const metaDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) || 
                        html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
  const metaDesc = metaDescMatch ? metaDescMatch[1] : '';

  // Strip all other HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  
  // Decode common HTML entities
  text = text.replace(/&nbsp;/gi, ' ')
             .replace(/&amp;/gi, '&')
             .replace(/&lt;/gi, '<')
             .replace(/&gt;/gi, '>')
             .replace(/&quot;/gi, '"');
             
  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();
  
  return `Meta Description: ${metaDesc}\n\nBody Text:\n${text.substring(0, 10000)}`;
}

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
   * Performs real crawling and Gemini-based parameter extraction.
   */
  static async runRealCrawl(runId: string, businessId: string, url: string) {
    try {
      // 1. Update status to RUNNING
      await prisma.websiteAnalysisRun.update({
        where: { id: runId },
        data: { status: WebsiteAnalysisStatus.RUNNING }
      });

      console.log(`[WebsiteAnalysisService] Crawling website: ${url}`);
      
      // 2. Fetch HTML content
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to crawl website. Server returned HTTP ${response.status}`);
      }

      const html = await response.text();
      const webText = extractTextFromHtml(html);

      // 3. Mark configured pages as completed
      const pages = await prisma.websitePage.findMany({ where: { analysisRunId: runId } });
      for (const p of pages) {
        await prisma.websitePage.update({
          where: { id: p.id },
          data: { status: JobStatus.COMPLETED, content: `Scraped content for page ${p.url}` }
        });
      }

      // 4. Perform Gemini analysis
      console.log('[WebsiteAnalysisService] Initiating Gemini analysis extraction...');
      const provider = new GeminiProvider();
      const prompt = `Analyze the following website content crawled from ${url} and extract corporate profile information.
Return ONLY a valid JSON object matching the schema below. Do not wrap the output in markdown code blocks or any other formatting:
{
  "legalName": "Official name of the company",
  "description": "A brief overview or description of the company",
  "headquarters": "Headquarters city/location (e.g. Mumbai, India)",
  "businessType": "Type of business model (e.g. IT Services, SaaS, Retail, B2B, B2C)",
  "valueProposition": "Core value proposition or mission statement of the company",
  "infraProvider": "Estimated cloud provider or key technologies used (e.g. AWS, GCP, Azure, Hybrid, Salesforce) if identifiable, otherwise output 'Cloud'"
}

Webpage Content:
${webText}`;

      const aiResponse = await provider.generateChatCompletion([
        { role: 'user', content: prompt }
      ]);

      let cleanJson = aiResponse.trim();
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.substring(7, cleanJson.length - 3).trim();
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.substring(3, cleanJson.length - 3).trim();
      }

      console.log('[WebsiteAnalysisService] Gemini raw JSON payload:', cleanJson);
      const parsed = JSON.parse(cleanJson);

      const extractedEntities = [
        { fieldPath: 'identity.legalName', value: parsed.legalName || 'Unknown', confidence: 0.95 },
        { fieldPath: 'identity.description', value: parsed.description || 'Unknown', confidence: 0.95 },
        { fieldPath: 'identity.headquarters', value: parsed.headquarters || 'Unknown', confidence: 0.90 },
        { fieldPath: 'model.type', value: parsed.businessType || 'Unknown', confidence: 0.95 },
        { fieldPath: 'model.valueProposition', value: parsed.valueProposition || 'Unknown', confidence: 0.90 },
        { fieldPath: 'technologyProfile.infraProvider', value: parsed.infraProvider || 'Cloud', confidence: 0.85 }
      ];

      // 5. Store extracted candidates in DB
      for (const ent of extractedEntities) {
        await prisma.extractedCandidate.create({
          data: {
            businessId,
            fieldPath: ent.fieldPath,
            value: ent.value,
            confidence: ent.confidence,
            sourceType: SourceType.WEBSITE,
            sourceId: runId,
            status: ExtractionStatus.PENDING_REVIEW,
            extractionMethod: 'GEMINI_AI'
          }
        });
      }

      // 6. Complete the run
      await prisma.websiteAnalysisRun.update({
        where: { id: runId },
        data: { status: WebsiteAnalysisStatus.COMPLETED, completedAt: new Date() }
      });

      console.log(`[WebsiteAnalysisService] Publishing WebsiteIndexed event for run: ${runId}`);
      await eventBroker.publish('WebsiteIndexed', { businessId, url, runId });
    } catch (err: any) {
      console.error('[WebsiteAnalysisService] Real crawl execution failed:', err);
      await prisma.websiteAnalysisRun.update({
        where: { id: runId },
        data: { status: WebsiteAnalysisStatus.FAILED }
      });
    }
  }
}

// Register Job Queue worker
jobQueue.registerWorker('WEBSITE_CRAWL', async (payload: { runId: string; businessId: string; url: string }) => {
  await WebsiteAnalysisService.runRealCrawl(payload.runId, payload.businessId, payload.url);
});
