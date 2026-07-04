"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsiteAnalysisService = void 0;
const prisma_1 = require("../../database/prisma");
const errorMiddleware_1 = require("../../middleware/errorMiddleware");
const client_1 = require("@prisma/client");
const JobQueue_1 = require("../jobs/JobQueue");
const EventBroker_1 = require("../events/EventBroker");
class WebsiteAnalysisService {
    /**
     * Enqueues a new website crawl in the background job queue.
     */
    static async queueAnalysis(businessId, url) {
        try {
            new URL(url);
        }
        catch {
            throw new errorMiddleware_1.AppError('Invalid website URL configuration.', 400, 'VALIDATION_ERROR');
        }
        let website = await prisma_1.prisma.website.findFirst({
            where: { businessId, url }
        });
        if (!website) {
            website = await prisma_1.prisma.website.create({
                data: { businessId, url }
            });
        }
        const run = await prisma_1.prisma.websiteAnalysisRun.create({
            data: {
                websiteId: website.id,
                status: client_1.WebsiteAnalysisStatus.PENDING
            }
        });
        await prisma_1.prisma.websitePage.createMany({
            data: [
                { analysisRunId: run.id, url: `${url}/`, status: client_1.JobStatus.QUEUED },
                { analysisRunId: run.id, url: `${url}/about`, status: client_1.JobStatus.QUEUED },
                { analysisRunId: run.id, url: `${url}/pricing`, status: client_1.JobStatus.QUEUED }
            ]
        });
        // Enqueue the background job using our decoupled JobQueue
        await JobQueue_1.jobQueue.enqueue('WEBSITE_CRAWL', {
            runId: run.id,
            businessId,
            url
        });
        return run;
    }
    /**
     * Simulates async background crawling and mock extraction.
     */
    static async runMockCrawl(runId, businessId, url) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        await prisma_1.prisma.websiteAnalysisRun.update({
            where: { id: runId },
            data: { status: client_1.WebsiteAnalysisStatus.RUNNING }
        });
        const pages = await prisma_1.prisma.websitePage.findMany({ where: { analysisRunId: runId } });
        for (const p of pages) {
            await prisma_1.prisma.websitePage.update({
                where: { id: p.id },
                data: { status: client_1.JobStatus.COMPLETED, content: `Mock scraped content for page ${p.url}` }
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
            await prisma_1.prisma.extractedCandidate.create({
                data: {
                    businessId,
                    fieldPath: ent.fieldPath,
                    value: ent.value,
                    confidence: ent.confidence,
                    sourceType: client_1.SourceType.WEBSITE,
                    sourceId: runId,
                    status: client_1.ExtractionStatus.PENDING_REVIEW,
                    extractionMethod: 'URL_PARSER'
                }
            });
        }
        await prisma_1.prisma.websiteAnalysisRun.update({
            where: { id: runId },
            data: { status: client_1.WebsiteAnalysisStatus.COMPLETED, completedAt: new Date() }
        });
        // Publish event upon crawl completion to decouple notification/subscribers
        console.log(`[WebsiteAnalysisService] Publishing WebsiteIndexed event for run: ${runId}`);
        await EventBroker_1.eventBroker.publish('WebsiteIndexed', { businessId, url, runId });
    }
}
exports.WebsiteAnalysisService = WebsiteAnalysisService;
// Register Job Queue worker
JobQueue_1.jobQueue.registerWorker('WEBSITE_CRAWL', async (payload) => {
    await WebsiteAnalysisService.runMockCrawl(payload.runId, payload.businessId, payload.url);
});
