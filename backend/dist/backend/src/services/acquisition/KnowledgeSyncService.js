"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeSyncService = void 0;
const businessRepository_1 = require("../../repositories/businessRepository");
const prisma_1 = require("../../database/prisma");
class KnowledgeSyncService {
    /**
     * Applies an approved knowledge parameter value directly into the corresponding digital twin model.
     * Path: e.g. "identity.legalName" => updates business identity legalName.
     */
    static async applyUpdate(businessId, fieldPath, value, source) {
        const parts = fieldPath.split('.');
        const profileKey = parts[0]; // e.g. "identity", "marketingProfile"
        const fieldName = parts[1]; // e.g. "legalName", "adSpend"
        // Parse the value according to standard types
        let parsedValue = value;
        if (fieldName === 'foundedYear' || fieldName === 'leadsCount') {
            parsedValue = Number(value);
        }
        else if (fieldName === 'adSpend' || fieldName === 'roi' || fieldName === 'conversionRate' || fieldName === 'infraCost') {
            parsedValue = parseFloat(value);
        }
        // 1. Update the target table via the businessRepository
        if (profileKey === 'identity') {
            await businessRepository_1.businessRepository.upsertIdentity(businessId, { [fieldName]: parsedValue });
        }
        else if (profileKey === 'model') {
            await businessRepository_1.businessRepository.upsertModel(businessId, { [fieldName]: parsedValue });
        }
        else if (profileKey === 'marketingProfile') {
            await businessRepository_1.businessRepository.upsertMarketing(businessId, { [fieldName]: parsedValue });
        }
        else if (profileKey === 'salesProfile') {
            await businessRepository_1.businessRepository.upsertSales(businessId, { [fieldName]: parsedValue });
        }
        else if (profileKey === 'operationsProfile') {
            await businessRepository_1.businessRepository.upsertOperations(businessId, { [fieldName]: parsedValue });
        }
        else if (profileKey === 'technologyProfile') {
            await businessRepository_1.businessRepository.upsertTechnology(businessId, { [fieldName]: parsedValue });
        }
        else if (profileKey === 'organizationStructure') {
            await businessRepository_1.businessRepository.upsertOrganizationStructure(businessId, { [fieldName]: parsedValue });
        }
        // 2. Sync corresponding AnswerMetadata
        await prisma_1.prisma.answerMetadata.upsert({
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
        await prisma_1.prisma.knowledgeEntity.create({
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
exports.KnowledgeSyncService = KnowledgeSyncService;
