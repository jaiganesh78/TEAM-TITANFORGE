"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RevenuePipelineService = void 0;
const prisma_1 = require("../../database/prisma");
class RevenuePipelineService {
    /**
     * Initializes a standard Revenue Pipeline and its stages for a business.
     */
    static async initializePipeline(businessId, pipelineName = 'Default Revenue Pipeline') {
        // Check if pipeline already exists
        const existing = await prisma_1.prisma.revenuePipeline.findFirst({
            where: { businessId }
        });
        if (existing)
            return existing;
        const pipeline = await prisma_1.prisma.revenuePipeline.create({
            data: {
                businessId,
                name: pipelineName
            }
        });
        const standardStages = [
            { stageName: 'Prospect', probability: 0.10, averageTimeDays: 7, responsibleEngine: 'lead-engine', entryCriteria: 'Identified as ICP fit', exitCriteria: 'Opt-in or initial positive intent response' },
            { stageName: 'Engaged', probability: 0.20, averageTimeDays: 14, responsibleEngine: 'marketing-engine', entryCriteria: 'Interaction registered', exitCriteria: 'Threshold score reached' },
            { stageName: 'MQL', probability: 0.35, averageTimeDays: 10, responsibleEngine: 'marketing-engine', entryCriteria: 'Ready for outbound/qual check', exitCriteria: 'Accepted by lead evaluation' },
            { stageName: 'SQL', probability: 0.50, averageTimeDays: 15, responsibleEngine: 'lead-engine', entryCriteria: 'BANT criteria verified', exitCriteria: 'Demo scheduled' },
            { stageName: 'Discovery', probability: 0.65, averageTimeDays: 14, responsibleEngine: 'sales-engine', entryCriteria: 'Discovery call completed', exitCriteria: 'Proposal requested' },
            { stageName: 'Proposal', probability: 0.75, averageTimeDays: 10, responsibleEngine: 'sales-engine', entryCriteria: 'Proposal sent', exitCriteria: 'Contract negotiation started' },
            { stageName: 'Negotiation', probability: 0.85, averageTimeDays: 7, responsibleEngine: 'sales-engine', entryCriteria: 'Redlines received', exitCriteria: 'Contract signed' },
            { stageName: 'Closed Won', probability: 1.00, averageTimeDays: 0, responsibleEngine: 'sales-engine', entryCriteria: 'First payment cleared', exitCriteria: 'CS onboarding checklist handed off' },
            { stageName: 'Customer Success', probability: 1.00, averageTimeDays: 0, responsibleEngine: 'customer-success', entryCriteria: 'Onboarding completed', exitCriteria: 'Ongoing client renewals' }
        ];
        for (const stage of standardStages) {
            await prisma_1.prisma.revenuePipelineStage.create({
                data: {
                    pipelineId: pipeline.id,
                    businessId,
                    stageName: stage.stageName,
                    probability: stage.probability,
                    averageTimeDays: stage.averageTimeDays,
                    responsibleEngine: stage.responsibleEngine,
                    entryCriteria: stage.entryCriteria,
                    exitCriteria: stage.exitCriteria,
                    bottlenecks: 'None',
                    risks: 'None',
                    requiredDocuments: '[]',
                    requiredActivities: '[]',
                    recommendedActions: '[]'
                }
            });
        }
        return pipeline;
    }
    /**
     * Transitions a lead to a new stage, logging transition history audits.
     */
    static async transitionLead(businessId, leadId, targetStageName, updatedBy = 'system') {
        const lead = await prisma_1.prisma.leadProfile.findUnique({
            where: { id: leadId },
            include: { stage: true }
        });
        if (!lead)
            throw new Error(`Lead profile not found: ${leadId}`);
        const targetStage = await prisma_1.prisma.revenuePipelineStage.findFirst({
            where: { businessId, stageName: targetStageName }
        });
        if (!targetStage)
            throw new Error(`Stage not found: ${targetStageName} for business ${businessId}`);
        // Update Lead Profile stage reference
        const updatedLead = await prisma_1.prisma.leadProfile.update({
            where: { id: leadId },
            data: {
                stageId: targetStage.id
            }
        });
        // Record transition history audit log
        const lastHistory = await prisma_1.prisma.revenuePipelineHistory.findFirst({
            where: { leadId, toStage: lead.stage.stageName },
            orderBy: { movedAt: 'desc' }
        });
        let durationDays = 0;
        if (lastHistory) {
            const diffMs = new Date().getTime() - lastHistory.movedAt.getTime();
            durationDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        }
        await prisma_1.prisma.revenuePipelineHistory.create({
            data: {
                pipelineId: lead.pipelineId,
                businessId,
                leadId,
                fromStage: lead.stage.stageName,
                toStage: targetStageName,
                durationDays
            }
        });
        // Also record general LeadHistory audit
        await prisma_1.prisma.leadHistory.create({
            data: {
                sessionId: lead.sessionId,
                businessId,
                leadId,
                oldStage: lead.stage.stageName,
                newStage: targetStageName,
                updatedBy
            }
        });
        return updatedLead;
    }
    /**
     * Calculates pipeline health metrics, counts, and predictions.
     */
    static async getPipelineHealth(businessId) {
        const pipeline = await prisma_1.prisma.revenuePipeline.findFirst({
            where: { businessId },
            include: {
                stages: {
                    include: {
                        leads: true
                    }
                }
            }
        });
        if (!pipeline)
            return { healthScore: 0, stages: [] };
        // Calculate overall health score based on active opportunities
        const totalLeads = pipeline.stages.reduce((acc, s) => acc + s.leads.length, 0);
        const wonCount = pipeline.stages.find(s => s.stageName === 'Closed Won')?.leads.length || 0;
        const conversionRate = totalLeads > 0 ? (wonCount / totalLeads) * 100 : 0;
        const healthScore = Math.min(100, Math.round(50 + conversionRate * 2.5));
        // Stuck opportunities detection (leads staying in a stage > averageTimeDays * 1.5)
        const stuckOpportunities = [];
        const now = new Date();
        for (const stage of pipeline.stages) {
            if (stage.averageTimeDays === 0)
                continue;
            const limitDays = stage.averageTimeDays * 1.5;
            for (const lead of stage.leads) {
                // Find how long they have been in this stage
                const history = await prisma_1.prisma.revenuePipelineHistory.findFirst({
                    where: { leadId: lead.id, toStage: stage.stageName },
                    orderBy: { movedAt: 'desc' }
                });
                const movedAt = history?.movedAt || lead.createdAt;
                const daysInStage = Math.ceil((now.getTime() - movedAt.getTime()) / (1000 * 60 * 60 * 24));
                if (daysInStage > limitDays) {
                    stuckOpportunities.push({
                        leadId: lead.id,
                        companyName: lead.companyName,
                        stageName: stage.stageName,
                        daysInStage,
                        limitDays
                    });
                }
            }
        }
        // Bottleneck detection (stages holding > 30% of total leads, or with high average stays)
        const bottlenecks = pipeline.stages
            .map(stage => {
            const leadCount = stage.leads.length;
            const ratio = totalLeads > 0 ? leadCount / totalLeads : 0;
            const isBottleneck = ratio > 0.35 && stage.stageName !== 'Closed Won' && stage.stageName !== 'Customer Success';
            return {
                stageName: stage.stageName,
                leadCount,
                ratio,
                isBottleneck,
                severity: isBottleneck ? 'HIGH' : 'LOW'
            };
        })
            .filter(b => b.isBottleneck);
        return {
            pipelineId: pipeline.id,
            name: pipeline.name,
            healthScore,
            totalLeads,
            conversionRate,
            bottlenecks,
            stuckOpportunities,
            stages: pipeline.stages.map(s => ({
                id: s.id,
                stageName: s.stageName,
                leadCount: s.leads.length,
                probability: s.probability,
                averageTimeDays: s.averageTimeDays,
                responsibleEngine: s.responsibleEngine
            }))
        };
    }
}
exports.RevenuePipelineService = RevenuePipelineService;
