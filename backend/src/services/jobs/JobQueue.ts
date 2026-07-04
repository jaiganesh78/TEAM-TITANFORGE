import { prisma } from '../../database/prisma';

export interface Job {
  id: string;
  taskType: string;
  payload: any;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  error?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type JobWorker = (payload: any) => Promise<any>;

class JobQueue {
  private workers: Map<string, JobWorker> = new Map();
  private activeJobsCount = 0;
  private maxConcurrentJobs = 3;

  /**
   * Registers a worker processor for a specific task type.
   */
  registerWorker(taskType: string, worker: JobWorker): void {
    this.workers.set(taskType, worker);
    console.log(`[JobQueue] Registered worker for task type: "${taskType}"`);
  }

  /**
   * Enqueues a new background job.
   */
  async enqueue(taskType: string, payload: any): Promise<Job> {
    const jobRecord = await prisma.discoveryJob.create({
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
      status: jobRecord.status as any,
    };
  }

  /**
   * Polls the database for PENDING jobs and processes them with registered workers.
   */
  private async processQueue(): Promise<void> {
    if (this.activeJobsCount >= this.maxConcurrentJobs) {
      return;
    }

    // Find the next PENDING job in DB
    const nextJob = await prisma.discoveryJob.findFirst({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
    });

    if (!nextJob) {
      return;
    }

    this.activeJobsCount++;
    
    // Mark job as PROCESSING in DB
    await prisma.discoveryJob.update({
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
        await prisma.discoveryJob.update({
          where: { id: nextJob.id },
          data: { status: 'COMPLETED' },
        });
        console.log(`[JobQueue] Job ${nextJob.id} completed successfully.`);
      } catch (err: any) {
        console.error(`[JobQueue] Job ${nextJob.id} failed:`, err);
        await prisma.discoveryJob.update({
          where: { id: nextJob.id },
          data: {
            status: 'FAILED',
            error: err?.message || String(err),
          },
        });
      } finally {
        this.activeJobsCount--;
        // Check if there are other jobs to process
        this.processQueue().catch(console.error);
      }
    })();
  }
}

export const jobQueue = new JobQueue();
