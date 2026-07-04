import { prisma } from '../../database/prisma';
import { JobStatus } from '@prisma/client';

export class ExtractionQueueService {
  /**
   * Initializes a tracked background extraction job.
   */
  static async startJob(businessId: string, type: 'WEBSITE' | 'DOCUMENT'): Promise<any> {
    return prisma.extractionJob.create({
      data: {
        businessId,
        type,
        status: JobStatus.RUNNING,
        progress: 10.0
      }
    });
  }

  /**
   * Updates progress telemetry for a running extraction job.
   */
  static async updateProgress(jobId: string, progress: number): Promise<void> {
    await prisma.extractionJob.update({
      where: { id: jobId },
      data: { progress }
    });
  }

  /**
   * Marks a job complete with performance time logs.
   */
  static async completeJob(jobId: string, executionTimeMs: number): Promise<void> {
    await prisma.extractionJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.COMPLETED,
        progress: 100.0,
        executionTimeMs
      }
    });
  }

  /**
   * Logs job failures.
   */
  static async failJob(jobId: string, errorLogs: string): Promise<void> {
    await prisma.extractionJob.update({
      where: { id: jobId },
      data: {
        status: JobStatus.FAILED,
        progress: 100.0,
        errorLogs
      }
    });
  }
}
