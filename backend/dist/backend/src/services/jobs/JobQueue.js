"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobQueue = void 0;
const prisma_1 = require("../../database/prisma");
class JobQueue {
    workers = new Map();
    activeJobsCount = 0;
    maxConcurrentJobs = 3;
    /**
     * Registers a worker processor for a specific task type.
     */
    registerWorker(taskType, worker) {
        this.workers.set(taskType, worker);
        console.log(`[JobQueue] Registered worker for task type: "${taskType}"`);
    }
    /**
     * Enqueues a new background job.
     */
    async enqueue(taskType, payload) {
        const jobRecord = await prisma_1.prisma.discoveryJob.create({
            data: {
                taskType,
                payload: JSON.stringify(payload),
                status: 'PENDING',
            },
        });
        console.log(`[JobQueue] Enqueued job: "${taskType}" (ID: ${jobRecord.id})`);
        // Process next item asynchronously
        this.processQueue().catch(console.error);
        return {
            ...jobRecord,
            payload,
            status: jobRecord.status,
        };
    }
    /**
     * Polls the database for PENDING jobs and processes them with registered workers.
     */
    async processQueue() {
        if (this.activeJobsCount >= this.maxConcurrentJobs) {
            return;
        }
        // Find the next PENDING job in DB
        const nextJob = await prisma_1.prisma.discoveryJob.findFirst({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'asc' },
        });
        if (!nextJob) {
            return;
        }
        this.activeJobsCount++;
        // Mark job as PROCESSING in DB
        await prisma_1.prisma.discoveryJob.update({
            where: { id: nextJob.id },
            data: { status: 'PROCESSING' },
        });
        console.log(`[JobQueue] Processing job ${nextJob.id} ("${nextJob.taskType}")...`);
        // Run the worker asynchronously
        (async () => {
            try {
                const worker = this.workers.get(nextJob.taskType);
                if (!worker) {
                    throw new Error(`No worker registered for task type: ${nextJob.taskType}`);
                }
                const parsedPayload = JSON.parse(nextJob.payload);
                await worker(parsedPayload);
                // Mark as COMPLETED
                await prisma_1.prisma.discoveryJob.update({
                    where: { id: nextJob.id },
                    data: { status: 'COMPLETED' },
                });
                console.log(`[JobQueue] Job ${nextJob.id} completed successfully.`);
            }
            catch (err) {
                console.error(`[JobQueue] Job ${nextJob.id} failed:`, err);
                await prisma_1.prisma.discoveryJob.update({
                    where: { id: nextJob.id },
                    data: {
                        status: 'FAILED',
                        error: err?.message || String(err),
                    },
                });
            }
            finally {
                this.activeJobsCount--;
                // Check if there are other jobs to process
                this.processQueue().catch(console.error);
            }
        })();
    }
}
exports.jobQueue = new JobQueue();
