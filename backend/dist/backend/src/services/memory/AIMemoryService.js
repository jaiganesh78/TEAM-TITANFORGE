"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIMemoryService = void 0;
const prisma_1 = require("../../database/prisma");
class AIMemoryService {
    /**
     * Saves or updates a memory value for a specific business, layer, and key.
     */
    static async set(businessId, layer, key, value) {
        const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
        return prisma_1.prisma.aIMemory.upsert({
            where: {
                businessId_layer_key: {
                    businessId,
                    layer,
                    key,
                },
            },
            create: {
                businessId,
                layer,
                key,
                value: serializedValue,
            },
            update: {
                value: serializedValue,
            },
        });
    }
    /**
     * Retrieves a memory value, parsing it from JSON if applicable.
     */
    static async get(businessId, layer, key) {
        const record = await prisma_1.prisma.aIMemory.findUnique({
            where: {
                businessId_layer_key: {
                    businessId,
                    layer,
                    key,
                },
            },
        });
        if (!record)
            return null;
        try {
            return JSON.parse(record.value);
        }
        catch {
            return record.value;
        }
    }
    /**
     * Deletes a specific memory entry.
     */
    static async delete(businessId, layer, key) {
        await prisma_1.prisma.aIMemory.deleteMany({
            where: {
                businessId,
                layer,
                key,
            },
        });
    }
    /**
     * Clears all memory entries for a specific business and layer.
     */
    static async clearLayer(businessId, layer) {
        await prisma_1.prisma.aIMemory.deleteMany({
            where: {
                businessId,
                layer,
            },
        });
    }
}
exports.AIMemoryService = AIMemoryService;
