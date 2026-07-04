"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebsiteAnalysisService = void 0;
const prisma_1 = require("../../database/prisma");
const errorMiddleware_1 = require("../../middleware/errorMiddleware");
const client_1 = require("@prisma/client");
class WebsiteAnalysisService {
    /**
     * Enqueues a new website crawl and initializes analysis records.
     */
    static async queueAnalysis(businessId, url) {
        // 1. Simple URL validation
        try {
            new URL(url);
        }
        catch {
            throw new errorMiddleware_1.AppError('Invalid website URL configuration.', 400, 'VALIDATION_ERROR');
        }
        // 2. Resolve Website record
        let website = await prisma_1.prisma.website.findFirst({
            where: { businessId, url }
        });
        if (!website) {
            website = await prisma_1.prisma.website.create({
                data: { businessId, url }
            });
        }
        // 3. Create WebsiteAnalysisRun job
        const run = await prisma_1.prisma.websiteAnalysisRun.create({
            data: {
                websiteId: website.id,
                status: client_1.WebsiteAnalysisStatus.PENDING
            }
        });
        // 4. Create mock crawled pages
        await prisma_1.prisma.websitePage.createMany({
            data: [
                { analysisRunId: run.id, url: `${url}/`, status: client_1.JobStatus.QUEUED },
                { analysisRunId: run.id, url: `${url}/about`, status: client_1.JobStatus.QUEUED },
                { analysisRunId: run.id, url: `${url}/pricing`, status: client_1.JobStatus.QUEUED }
            ]
        });
        // Trigger asynchronous mock execution pipeline in the background
        this.runMockCrawl(run.id, businessId, url).catch(console.error);
        return run;
    }
    /**
     * Simulates async background crawling and mock extraction.
     */
    static async runMockCrawl(runId, businessId, url) {
        // Wait to simulate crawler execution
        await new Promise((resolve) => setTimeout(resolve, 2000));
        // Update status to RUNNING
        await prisma_1.prisma.websiteAnalysisRun.update({
            where: { id: runId },
            data: { status: client_1.WebsiteAnalysisStatus.RUNNING }
        });
        // Update pages status
        const pages = await prisma_1.prisma.websitePage.findMany({ where: { analysisRunId: runId } });
        for (const p of pages) {
            await prisma_1.prisma.websitePage.update({
                where: { id: p.id },
                data: { status: client_1.JobStatus.COMPLETED, content: `Mock scraped content for page ${p.url}` }
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
        // Complete the website analysis job status
        await prisma_1.prisma.websiteAnalysisRun.update({
            where: { id: runId },
            data: { status: client_1.WebsiteAnalysisStatus.COMPLETED, completedAt: new Date() }
        });
    }
}
exports.WebsiteAnalysisService = WebsiteAnalysisService;
