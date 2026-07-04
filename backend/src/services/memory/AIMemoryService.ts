import { prisma } from '../../database/prisma';

export type MemoryLayer = 'CONVERSATION' | 'WORKING' | 'BUSINESS' | 'DECISION' | 'LONG_TERM';

export class AIMemoryService {
  /**
   * Saves or updates a memory value for a specific business, layer, and key.
   */
  static async set(
    businessId: string,
    layer: MemoryLayer,
    key: string,
    value: any
  ): Promise<any> {
    const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
    
    return prisma.aIMemory.upsert({
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
  static async get(
    businessId: string,
    layer: MemoryLayer,
    key: string
  ): Promise<any> {
    const record = await prisma.aIMemory.findUnique({
      where: {
        businessId_layer_key: {
          businessId,
          layer,
          key,
        },
      },
    });

    if (!record) return null;

    try {
      return JSON.parse(record.value);
    } catch {
      return record.value;
    }
  }

  /**
   * Deletes a specific memory entry.
   */
  static async delete(
    businessId: string,
    layer: MemoryLayer,
    key: string
  ): Promise<void> {
    await prisma.aIMemory.deleteMany({
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
  static async clearLayer(businessId: string, layer: MemoryLayer): Promise<void> {
    await prisma.aIMemory.deleteMany({
      where: {
        businessId,
        layer,
      },
    });
  }
}
