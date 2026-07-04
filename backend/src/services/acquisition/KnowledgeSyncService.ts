import { businessRepository } from '../../repositories/businessRepository';
import { prisma } from '../../database/prisma';
import { SourceType } from '@prisma/client';

export class KnowledgeSyncService {
  /**
   * Applies an approved knowledge parameter value directly into the corresponding digital twin model.
   * Path: e.g. "identity.legalName" => updates business identity legalName.
   */
  static async applyUpdate(
    businessId: string,
    fieldPath: string,
    value: any,
    source: SourceType
  ): Promise<void> {
    const parts = fieldPath.split('.');
    const profileKey = parts[0]; // e.g. "identity", "marketingProfile"
    const fieldName = parts[1];  // e.g. "legalName", "adSpend"

    // Parse the value according to standard types
    let parsedValue = value;
    if (fieldName === 'foundedYear' || fieldName === 'leadsCount') {
      parsedValue = Number(value);
    } else if (fieldName === 'adSpend' || fieldName === 'roi' || fieldName === 'conversionRate' || fieldName === 'infraCost') {
      parsedValue = parseFloat(value);
    }

    // 1. Update the target table via the businessRepository
    if (profileKey === 'identity') {
      await businessRepository.upsertIdentity(businessId, { [fieldName]: parsedValue });
    } else if (profileKey === 'model') {
      await businessRepository.upsertModel(businessId, { [fieldName]: parsedValue });
    } else if (profileKey === 'marketingProfile') {
      await businessRepository.upsertMarketing(businessId, { [fieldName]: parsedValue });
    } else if (profileKey === 'salesProfile') {
      await businessRepository.upsertSales(businessId, { [fieldName]: parsedValue });
    } else if (profileKey === 'operationsProfile') {
      await businessRepository.upsertOperations(businessId, { [fieldName]: parsedValue });
    } else if (profileKey === 'technologyProfile') {
      await businessRepository.upsertTechnology(businessId, { [fieldName]: parsedValue });
    } else if (profileKey === 'organizationStructure') {
      await businessRepository.upsertOrganizationStructure(businessId, { [fieldName]: parsedValue });
    }

    // 2. Sync corresponding AnswerMetadata
    await prisma.answerMetadata.upsert({
      where: {
        businessId_fieldPath: {
          businessId,
          fieldPath
        }
      },
      create: {
        businessId,
        fieldPath,
        status: 'KNOWN',
        source: source.toString()
      },
      update: {
        status: 'KNOWN',
        source: source.toString()
      }
    });

    // 3. Create a Knowledge Entity entry for RAG compatibility and auditing
    await prisma.knowledgeEntity.create({
      data: {
        businessId,
        entityType: profileKey.toUpperCase(),
        fieldPath,
        value: String(value),
        confidence: 0.95,
        sourceType: source,
        sourceId: 'APPROVED',
        extractionMethod: 'MANUAL_REVIEW',
        reviewStatus: 'REVIEWED'
      }
    });
  }
}
