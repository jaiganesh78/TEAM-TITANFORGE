import { prisma } from '../../database/prisma';

export class LeadMemoryService {
  /**
   * Retrieves long-term Lead Memory context for RAG grounding.
   */
  static async getMemoryContext(businessId: string): Promise<string> {
    const memory = await prisma.leadMemory.findFirst({
      where: { businessId }
    });

    if (!memory) {
      return 'No historical lead generation memory recorded yet.';
    }

    let context = '### HISTORICAL LEAD GENERATION PERFORMANCE MEMORY:\n';
    try {
      const accepted = JSON.parse(memory.acceptedStrategies || '[]');
      if (accepted.length > 0) {
        context += `- Previously APPROVED lead strategies:\n  ${accepted.map((s: string) => `* "${s}"`).join('\n  ')}\n`;
      }
      const rejected = JSON.parse(memory.rejectedStrategies || '[]');
      if (rejected.length > 0) {
        context += `- Previously REJECTED lead strategies (DO NOT repeat these mistakes):\n  ${rejected.map((s: string) => `* "${s}"`).join('\n  ')}\n`;
      }
    } catch {
      context += 'Unable to parse historical lead recommendations memory.';
    }
    return context;
  }

  /**
   * Records an approved lead strategy to long-term memory.
   */
  static async recordApprovedStrategy(businessId: string, strategyTitle: string): Promise<void> {
    const memory = await prisma.leadMemory.findFirst({
      where: { businessId }
    });

    const nowStr = new Date().toISOString();
    const entry = `${strategyTitle} (Approved at ${nowStr})`;

    if (!memory) {
      await prisma.leadMemory.create({
        data: {
          businessId,
          acceptedStrategies: JSON.stringify([entry]),
          rejectedStrategies: '[]',
          performanceLogs: '[]'
        }
      });
    } else {
      let current: string[] = [];
      try {
        current = JSON.parse(memory.acceptedStrategies || '[]');
      } catch {
        current = [];
      }
      current.push(entry);
      await prisma.leadMemory.update({
        where: { id: memory.id },
        data: {
          acceptedStrategies: JSON.stringify(current)
        }
      });
    }
  }

  /**
   * Records a rejected lead strategy to long-term memory to avoid repeats.
   */
  static async recordRejectedStrategy(businessId: string, strategyTitle: string, reason: string): Promise<void> {
    const memory = await prisma.leadMemory.findFirst({
      where: { businessId }
    });

    const entry = `${strategyTitle} (Rejected: ${reason})`;

    if (!memory) {
      await prisma.leadMemory.create({
        data: {
          businessId,
          acceptedStrategies: '[]',
          rejectedStrategies: JSON.stringify([entry]),
          performanceLogs: '[]'
        }
      });
    } else {
      let current: string[] = [];
      try {
        current = JSON.parse(memory.rejectedStrategies || '[]');
      } catch {
        current = [];
      }
      current.push(entry);
      await prisma.leadMemory.update({
        where: { id: memory.id },
        data: {
          rejectedStrategies: JSON.stringify(current)
        }
      });
    }
  }
}
