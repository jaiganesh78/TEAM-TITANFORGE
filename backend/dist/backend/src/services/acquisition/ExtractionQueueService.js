"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtractionQueueService = void 0;
const prisma_1 = require("../../database/prisma");
const client_1 = require("@prisma/client");
class ExtractionQueueService {
    /**
     * Initializes a tracked background extraction job.
     */
    static async startJob(businessId, type) {
        return prisma_1.prisma.extractionJob.create({
            data: {
                businessId,
                type,
                status: client_1.JobStatus.RUNNING,
                progress: 10.0
            }
        });
    }
    /**
     * Updates progress telemetry for a running extraction job.
     */
    static async updateProgress(jobId, progress) {
        await prisma_1.prisma.extractionJob.update({
            where: { id: jobId },
            data: { progress }
        });
    }
    /**
     * Marks a job complete with performance time logs.
     */
    static async completeJob(jobId, executionTimeMs) {
        await prisma_1.prisma.extractionJob.update({
            where: { id: jobId },
            data: {
                status: client_1.JobStatus.COMPLETED,
                progress: 100.0,
                executionTimeMs
            }
        });
    }
    /**
     * Logs job failures.
     */
    static async failJob(jobId, errorLogs) {
        await prisma_1.prisma.extractionJob.update({
            where: { id: jobId },
            data: {
                status: client_1.JobStatus.FAILED,
                progress: 100.0,
                errorLogs
            }
        });
    }
}
exports.ExtractionQueueService = ExtractionQueueService;
