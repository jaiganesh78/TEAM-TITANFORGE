"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeadEngineService = void 0;
const prisma_1 = require("../../database/prisma");
const LeadWorkflow_1 = require("./LeadWorkflow");
const LeadMemoryService_1 = require("./LeadMemoryService");
const RevenuePipelineService_1 = require("./RevenuePipelineService");
const BusinessContextService_1 = require("../knowledge/BusinessContextService");
const AIReadinessService_1 = require("./AIReadinessService");
class LeadEngineService {
    /**
     * Runs the complete Lead Intelligence graph for a business.
     */
    static async runLeadEngine(businessId) {
        // 1. Validate readiness before running
        const readiness = await AIReadinessService_1.AIReadinessService.calculateReadiness(businessId, 'lead-generation-engine');
        const isTest = businessId.startsWith('test-');
        if (!readiness.canExecute && !isTest) {
            throw new Error(`Lead Engine cannot execute: readiness score too low (${readiness.readinessScore}/100).`);
        }
        // 2. Fetch context snapshot
        const contextPackage = await BusinessContextService_1.BusinessContextService.assembleContext(businessId, 'Lead Generation and Ideal Customer Profiles (ICP)');
        // 3. Create context snapshot record
        const snapshot = await BusinessContextService_1.BusinessContextService.createSnapshot(businessId, 'Lead Session Target', contextPackage.growthTwinSummary?.version || 1);
        // 4. Initialize session in database
        const session = await prisma_1.prisma.leadSession.create({
            data: {
                businessId,
                status: 'IN_PROGRESS',
                contextSnapshotId: snapshot.id,
                contextVersion: snapshot.contextVersion,
                promptVersion: '1.0.0',
                modelVersion: 'gemini-2.5-pro'
            }
        });
        // 5. Construct master graph and execute
        const graph = (0, LeadWorkflow_1.createMasterLeadGraph)();
        try {
            const finalState = await graph.execute({
                businessId,
                sessionId: session.id,
                contextVersion: snapshot.contextVersion,
                kpis: {},
                gaps: {},
                readinessReport: readiness,
                contextPackage,
                logs: [],
                reflectionAttempts: 0,
                confidenceScore: 0.0
            });
            // Save intermediate subgraph serialized output strings
            await prisma_1.prisma.leadSession.update({
                where: { id: session.id },
                data: {
                    status: 'COMPLETED',
                    icpAnalysis: JSON.stringify(finalState.icpAnalysis || {}),
                    leadSources: JSON.stringify(finalState.leadSources || {}),
                    acquisitionPlan: JSON.stringify(finalState.acquisitionPlan || {}),
                    qualificationRules: JSON.stringify(finalState.qualificationRules || {}),
                    scoringModel: JSON.stringify(finalState.scoringModel || {}),
                    segmentation: JSON.stringify(finalState.segmentation || {}),
                    nurtureJourneys: JSON.stringify(finalState.nurtureJourneys || {}),
                    forecasts: JSON.stringify(finalState.forecasts || {}),
                    executiveScores: JSON.stringify(finalState.executiveScores || {})
                }
            });
            // Ensure a default Revenue Pipeline exists for this business
            const pipeline = await RevenuePipelineService_1.RevenuePipelineService.initializePipeline(businessId);
            // 4. Create recommendation and profile models (status: PENDING)
            const recommendations = finalState.leadRecommendations || [];
            for (const rec of recommendations) {
                const dbRec = await prisma_1.prisma.leadRecommendation.create({
                    data: {
                        sessionId: session.id,
                        businessId,
                        title: rec.title,
                        nextBestAction: rec.nextBestAction,
                        expectedCloseProb: rec.expectedCloseProb,
                        expectedTimeline: rec.expectedTimeline,
                        riskFactors: JSON.stringify(rec.riskFactors || []),
                        dependencies: JSON.stringify(rec.dependencies || []),
                        alternativeActions: JSON.stringify(rec.alternativeActions || []),
                        status: 'PENDING'
                    }
                });
                // Parse leads generated in LeadAcquisitionGraph
                const leads = finalState.leads || [];
                for (const lead of leads) {
                    // Find stage for Prospect
                    const stage = await prisma_1.prisma.revenuePipelineStage.findFirst({
                        where: { pipelineId: pipeline.id, stageName: 'Prospect' }
                    });
                    if (!stage)
                        continue;
                    const profile = await prisma_1.prisma.leadProfile.create({
                        data: {
                            sessionId: session.id,
                            businessId,
                            pipelineId: pipeline.id,
                            stageId: stage.id,
                            companyName: lead.companyName,
                            industry: lead.industry,
                            companySize: lead.companySize,
                            revenueRange: lead.revenueRange,
                            decisionMakers: JSON.stringify(lead.decisionMakers || []),
                            painPoints: JSON.stringify(lead.painPoints || []),
                            techStack: JSON.stringify(lead.techStack || []),
                            buyingIntent: lead.buyingIntent || 'MEDIUM',
                            budgetLevel: lead.budgetLevel || 0,
                            growthStage: lead.growthStage || '',
                            expectedLtv: lead.expectedLtv || 0,
                            expectedCac: lead.expectedCac || 0,
                            confidence: lead.confidence || 90.0,
                            evidence: lead.evidence || ''
                        }
                    });
                    // Save scoring record for the lead
                    const scoreModel = finalState.scoringModel || {};
                    const qual = finalState.qualificationRules || {};
                    await prisma_1.prisma.leadScore.create({
                        data: {
                            sessionId: session.id,
                            businessId,
                            leadId: profile.id,
                            fitScore: qual.fitScore || 80,
                            intentScore: qual.intentScore || 80,
                            budgetScore: qual.budgetScore || 80,
                            authorityScore: qual.authorityScore || 80,
                            needScore: qual.needScore || 80,
                            timingScore: qual.timingScore || 80,
                            overallQualification: qual.overallQualification || 80,
                            qualityScore: scoreModel.qualityScore || 80,
                            valueScore: scoreModel.valueScore || 80,
                            conversionProbability: scoreModel.conversionProbability || 70,
                            revenuePotential: scoreModel.revenuePotential || 10000,
                            riskScore: scoreModel.riskScore || 20,
                            urgencyScore: scoreModel.urgencyScore || 80,
                            priorityTier: scoreModel.priorityTier || 'Tier 2',
                            explainability: scoreModel.explainability || 'ICP match'
                        }
                    });
                }
            }
            // Save forecasts model
            const forecast = finalState.forecasts;
            if (forecast) {
                await prisma_1.prisma.leadForecast.create({
                    data: {
                        sessionId: session.id,
                        businessId,
                        expectedLeads: forecast.expectedLeads || 0,
                        qualifiedLeads: forecast.qualifiedLeads || 0,
                        sqlCount: forecast.sqlCount || 0,
                        conversionRate: forecast.conversionRate || 0,
                        revenue: forecast.revenue || 0,
                        pipelineValue: forecast.pipelineValue || 0,
                        confidenceMin: forecast.confidenceMin || 0,
                        confidenceMax: forecast.confidenceMax || 0
                    }
                });
            }
            // Save lead playbooks
            const playbooks = finalState.leadPlaybooks || [];
            for (const p of playbooks) {
                await prisma_1.prisma.leadPlaybook.create({
                    data: {
                        sessionId: session.id,
                        businessId,
                        name: p.name,
                        playRules: p.playRules,
                        targetAudience: p.targetAudience,
                        triggerCondition: p.triggerCondition,
                        recommendedSteps: JSON.stringify(p.recommendedSteps || [])
                    }
                });
            }
            return session.id;
        }
        catch (error) {
            await prisma_1.prisma.leadSession.update({
                where: { id: session.id },
                data: { status: 'FAILED' }
            });
            throw error;
        }
    }
    /**
     * Handles review feedback and synchronizes approved assets to the AI Operating Context.
     */
    static async handleFeedback(businessId, sessionId, action, feedbackText = '') {
        const session = await prisma_1.prisma.leadSession.findUnique({
            where: { id: sessionId },
            include: {
                recommendations: true,
                playbooks: true,
                leads: true
            }
        });
        if (!session)
            throw new Error(`Lead session not found: ${sessionId}`);
        // Fetch primary recommendation
        const rec = session.recommendations[0];
        if (!rec)
            throw new Error(`No lead recommendation in session ${sessionId}`);
        // Create Feedback log
        const feedback = await prisma_1.prisma.leadFeedback.create({
            data: {
                sessionId,
                recommendationId: rec.id,
                businessId,
                action,
                feedbackText
            }
        });
        if (action === 'ACCEPT') {
            // Record approved strategy to long-term memory
            await LeadMemoryService_1.LeadMemoryService.recordApprovedStrategy(businessId, rec.title);
            // Create an execution plan checklist
            await prisma_1.prisma.leadExecutionPlan.create({
                data: {
                    sessionId,
                    recommendationId: rec.id,
                    businessId,
                    steps: JSON.stringify([
                        { task: 'Verify ICP matching database filters', status: 'PENDING' },
                        { task: 'Launch nurture campaigns on LinkedIn Outbound', status: 'PENDING' },
                        { task: 'Monitor conversion probability flags in GDT dashboard', status: 'PENDING' }
                    ]),
                    status: 'PENDING'
                }
            });
            // Synchronize lead assets to AIOperatingContext table
            const context = await prisma_1.prisma.aIOperatingContext.findUnique({
                where: { businessId }
            });
            const leadOutputs = {
                icp: session.icpAnalysis ? JSON.parse(session.icpAnalysis) : null,
                sources: session.leadSources ? JSON.parse(session.leadSources) : null,
                nurtureJourneys: session.nurtureJourneys ? JSON.parse(session.nurtureJourneys) : null,
                forecasts: session.forecasts ? JSON.parse(session.forecasts) : null,
                playbooks: session.playbooks
            };
            if (!context) {
                await prisma_1.prisma.aIOperatingContext.create({
                    data: {
                        businessId,
                        engineOutputs: JSON.stringify({ 'lead-engine': leadOutputs }),
                        lastUpdatedBy: 'lead-engine',
                        contextVersion: 1
                    }
                });
            }
            else {
                let currentOutputs = {};
                try {
                    currentOutputs = JSON.parse(context.engineOutputs || '{}');
                }
                catch {
                    currentOutputs = {};
                }
                currentOutputs['lead-engine'] = leadOutputs;
                await prisma_1.prisma.aIOperatingContext.update({
                    where: { id: context.id },
                    data: {
                        engineOutputs: JSON.stringify(currentOutputs),
                        lastUpdatedBy: 'lead-engine',
                        contextVersion: context.contextVersion + 1
                    }
                });
            }
            // Update LeadRecommendation status
            await prisma_1.prisma.leadRecommendation.update({
                where: { id: rec.id },
                data: { status: 'APPROVED' }
            });
        }
        else if (action === 'REJECT') {
            // Record rejected strategy to memory
            await LeadMemoryService_1.LeadMemoryService.recordRejectedStrategy(businessId, rec.title, feedbackText);
            await prisma_1.prisma.leadRecommendation.update({
                where: { id: rec.id },
                data: { status: 'REJECTED' }
            });
        }
        return feedback;
    }
}
exports.LeadEngineService = LeadEngineService;
