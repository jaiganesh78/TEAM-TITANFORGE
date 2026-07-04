"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SalesMemoryService = void 0;
const prisma_1 = require("../../database/prisma");
class SalesMemoryService {
    /**
     * Retrieves long-term Sales Memory context for RAG grounding.
     */
    static async getMemoryContext(businessId) {
        const memory = await prisma_1.prisma.salesMemory.findFirst({
            where: { businessId }
        });
        if (!memory) {
            return 'No historical sales performance memory recorded yet.';
        }
        let context = '### HISTORICAL SALES PERFORMANCE MEMORY:\n';
        try {
            const accepted = JSON.parse(memory.acceptedStrategies || '[]');
            if (accepted.length > 0) {
                context += `- Previously APPROVED sales recommendations:\n  ${accepted.map((s) => `* "${s}"`).join('\n  ')}\n`;
            }
            const rejected = JSON.parse(memory.rejectedStrategies || '[]');
            if (rejected.length > 0) {
                context += `- Previously REJECTED sales recommendations (DO NOT repeat these mistakes):\n  ${rejected.map((s) => `* "${s}"`).join('\n  ')}\n`;
            }
        }
        catch {
            context += 'Unable to parse historical sales recommendations memory.';
        }
        return context;
    }
    /**
     * Records an approved sales recommendation to long-term memory.
     */
    static async recordApprovedStrategy(businessId, strategyTitle) {
        const memory = await prisma_1.prisma.salesMemory.findFirst({
            where: { businessId }
        });
        const nowStr = new Date().toISOString();
        const entry = `${strategyTitle} (Approved at ${nowStr})`;
        if (!memory) {
            await prisma_1.prisma.salesMemory.create({
                data: {
                    businessId,
                    acceptedStrategies: JSON.stringify([entry]),
                    rejectedStrategies: '[]',
                    performanceLogs: '[]'
                }
            });
        }
        else {
            let current = [];
            try {
                current = JSON.parse(memory.acceptedStrategies || '[]');
            }
            catch {
                current = [];
            }
            current.push(entry);
            await prisma_1.prisma.salesMemory.update({
                where: { id: memory.id },
                data: {
                    acceptedStrategies: JSON.stringify(current)
                }
            });
        }
    }
    /**
     * Records a rejected sales recommendation to long-term memory to avoid repeats.
     */
    static async recordRejectedStrategy(businessId, strategyTitle, reason) {
        const memory = await prisma_1.prisma.salesMemory.findFirst({
            where: { businessId }
        });
        const entry = `${strategyTitle} (Rejected: ${reason})`;
        if (!memory) {
            await prisma_1.prisma.salesMemory.create({
                data: {
                    businessId,
                    acceptedStrategies: '[]',
                    rejectedStrategies: JSON.stringify([entry]),
                    performanceLogs: '[]'
                }
            });
        }
        else {
            let current = [];
            try {
                current = JSON.parse(memory.rejectedStrategies || '[]');
            }
            catch {
                current = [];
            }
            current.push(entry);
            await prisma_1.prisma.salesMemory.update({
                where: { id: memory.id },
                data: {
                    rejectedStrategies: JSON.stringify(current)
                }
            });
        }
    }
}
exports.SalesMemoryService = SalesMemoryService;
